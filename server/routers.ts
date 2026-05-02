import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { storagePut, storageGetSignedUrl } from "./storage";
import * as db from "./db";

// Helper function to safely extract text from LLM response
function extractTextFromContent(content: any): string {
  try {
    console.log("[LLM] Extracting text from content, type:", typeof content);
    
    // If content is already a string, return it
    if (typeof content === "string") {
      console.log("[LLM] Content is string");
      return content;
    }

    // If content is an array, find the text part
    if (Array.isArray(content)) {
      console.log("[LLM] Content is array, length:", content.length);
      for (const part of content) {
        if (part && typeof part === "object") {
          if (part.type === "text" && typeof part.text === "string") {
            console.log("[LLM] Found text in array");
            return part.text;
          }
        }
      }
    }

    // If content is an object with text property
    if (typeof content === "object" && content !== null) {
      if ("text" in content && typeof content.text === "string") {
        console.log("[LLM] Found text in object");
        return content.text;
      }
    }

    // Fallback: stringify
    console.log("[LLM] Fallback: stringifying");
    const stringified = JSON.stringify(content);
    return stringified;
  } catch (err) {
    console.error("[LLM] Error extracting text:", err);
    return "";
  }
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Food inventory management
  foodItems: router({
    // Get all food items for the current user (anonymous users supported)
    list: publicProcedure.query(({ ctx }) => {
      // Use anonymous user ID if not authenticated
      const userId = ctx.user?.id || 0;
      return db.getUserFoodItems(userId);
    }),

    // Create a new food item
    create: publicProcedure
      .input(
        z.object({
          productName: z.string().min(1).max(255),
          expirationDate: z.string().or(z.date()),
          imageUrl: z.string().optional(),
          category: z.string().max(100).optional(),
          quantity: z.string().max(100).optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(({ ctx, input }) => {
        const expirationDate = typeof input.expirationDate === "string"
          ? new Date(input.expirationDate)
          : input.expirationDate;
        const userId = ctx.user?.id || 0; // Use 0 for anonymous users

        return db.createFoodItem({
          userId: userId as number,
          productName: input.productName,
          expirationDate,
          imageUrl: input.imageUrl,
          category: input.category,
          quantity: input.quantity,
          notes: input.notes,
        });
      }),

    // Update a food item
    update: publicProcedure
      .input(
        z.object({
          id: z.number(),
          productName: z.string().min(1).max(255).optional(),
          expirationDate: z.string().or(z.date()).optional(),
          imageUrl: z.string().optional(),
          category: z.string().max(100).optional(),
          quantity: z.string().max(100).optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const updateData: any = {};
        if (input.productName !== undefined) updateData.productName = input.productName;
        if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl;
        if (input.category !== undefined) updateData.category = input.category;
        if (input.quantity !== undefined) updateData.quantity = input.quantity;
        if (input.notes !== undefined) updateData.notes = input.notes;
        if (input.expirationDate !== undefined) {
          updateData.expirationDate = typeof input.expirationDate === "string"
            ? new Date(input.expirationDate)
            : input.expirationDate;
        }

        await db.updateFoodItem(input.id, updateData);
        return { success: true };
      }),

    // Delete a food item
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        console.log("[Delete] Attempting to delete food item:", input.id);
        try {
          await db.deleteFoodItem(input.id);
          console.log("[Delete] Successfully deleted food item:", input.id);
          return { success: true };
        } catch (error) {
          console.error("[Delete] Failed to delete food item:", error);
          throw error;
        }
      }),

    // Get a single food item
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getFoodItem(input.id)),
  }),

  // AI image recognition endpoint
  recognition: router({
    // Upload image and recognize food from it
    recognize: publicProcedure
      .input(
        z.object({
          imageBase64: z.string(), // Base64 encoded image
          mimeType: z.string().default("image/jpeg"),
        })
      )
      .mutation(async ({ input }) => {
        try {
          console.log("[Recognition] Starting recognition process");
          
          // 1. Upload image to S3
          const buffer = Buffer.from(input.imageBase64, "base64");
          const fileName = `food-recognition/${Date.now()}.jpg`;
          const { key, url: relativeUrl } = await storagePut(fileName, buffer, input.mimeType);
          
          // Get signed absolute URL for LLM
          const imageUrl = await storageGetSignedUrl(key);

          console.log("[Recognition] Image uploaded to:", imageUrl);

          // 2. Call LLM with the uploaded image URL
          const systemPrompt = `당신은 한국 식품 인식 전문가입니다. 사용자가 보낸 식품 이미지를 분석하여 다음 정보를 추출하세요.

반드시 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요.

응답 형식:
{
  "productName": "제품의 정확한 이름",
  "expirationDate": "YYYY-MM-DD 형식의 유통기한",
  "category": "채소|과일|육류|유제품|음료|냉동식품|기타 중 하나",
  "confidence": 0.0부터 1.0 사이의 숫자
}

주의사항:
- productName: 제품의 정확한 이름만 입력 (예: 우유, 계란, 요구르트, 치즈, 두유)
- expirationDate: 반드시 YYYY-MM-DD 형식. 이미지에 보이지 않으면 해당 제품의 일반적인 유통기한으로 추정
- category: 정확히 하나만 선택
- confidence: 인식 신뢰도 (0.0=확신 없음, 1.0=매우 확신)

JSON만 반환하세요.`;

          const userPrompt = `이 식품 이미지를 분석하고 제품명, 유통기한, 분류, 신뢰도를 JSON으로 추출해주세요.`;

          console.log("[Recognition] Calling LLM with image URL:", imageUrl);

          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: systemPrompt,
              },
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: userPrompt,
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: imageUrl,
                      detail: "auto",
                    },
                  },
                ] as any,
              } as any,
            ] as any,
          } as any);

          console.log("[Recognition] LLM response received");
          
          // Check if response has choices
          if (!response || !response.choices || response.choices.length === 0) {
            console.error("[Recognition] No choices in response");
            throw new Error("LLM 응답에 choices가 없습니다");
          }

          // 3. Extract and parse the response
          const message = response.choices[0]?.message;
          if (!message) {
            console.error("[Recognition] No message in first choice");
            throw new Error("LLM 응답에 message가 없습니다");
          }

          const content = message.content;
          console.log("[Recognition] Raw content type:", typeof content);
          
          const textContent = extractTextFromContent(content);
          if (!textContent) {
            console.error("[Recognition] Could not extract text from content");
            throw new Error("LLM 응답에서 텍스트를 추출할 수 없습니다");
          }

          console.log("[Recognition] Extracted text (first 300 chars):", textContent.substring(0, 300));

          // Try to extract JSON from the text
          let jsonText = textContent.trim();
          
          // If the text contains JSON but not as the whole string, try to extract it
          if (!jsonText.startsWith("{")) {
            console.log("[Recognition] Text doesn't start with {, trying to extract JSON");
            const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              jsonText = jsonMatch[0];
              console.log("[Recognition] Extracted JSON from text");
            } else {
              console.error("[Recognition] Could not find JSON in text");
              throw new Error("응답에서 JSON을 찾을 수 없습니다");
            }
          }

          console.log("[Recognition] JSON to parse (first 300 chars):", jsonText.substring(0, 300));
          
          let result;
          try {
            result = JSON.parse(jsonText);
            console.log("[Recognition] Successfully parsed JSON");
          } catch (parseError) {
            console.error("[Recognition] JSON parse error:", parseError);
            console.error("[Recognition] Failed to parse:", jsonText.substring(0, 200));
            throw new Error(`JSON 파싱 실패: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
          }

          // Validate and clean the result
          const productName = String(result.productName || result.name || result.product_name || "").trim();
          const expirationDate = String(result.expirationDate || result.expiration_date || result.expiry_date || "").trim();
          const category = String(result.category || result.type || "기타").trim();
          const confidence = typeof result.confidence === "number" ? result.confidence : 0.7;

          console.log("[Recognition] Extracted values:", { productName, expirationDate, category, confidence });

          // Validate date format
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          let validatedDate = expirationDate;
          if (!dateRegex.test(expirationDate)) {
            console.log("[Recognition] Invalid date format:", expirationDate, "using default");
            validatedDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
          }

          const finalResult = {
            productName: productName || "미확인 제품",
            expirationDate: validatedDate,
            category: category,
            confidence: Math.min(Math.max(confidence, 0), 1),
            imageUrl,
          };

          console.log("[Recognition] Final result:", finalResult);
          return finalResult;
        } catch (error) {
          console.error("[Recognition] Error:", error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error("[Recognition] Error message:", errorMessage);
          
          // Return error response
          return {
            productName: "",
            expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            category: "기타",
            confidence: 0,
            imageUrl: "",
            error: errorMessage,
          };
        }
      }),

    // Recognize food from receipt image
    recognizeReceipt: publicProcedure
      .input(
        z.object({
          imageBase64: z.string(),
          mimeType: z.string().default("image/jpeg"),
        })
      )
      .mutation(async ({ input }) => {
        try {
          // 1. Upload image to S3
          const buffer = Buffer.from(input.imageBase64, "base64");
          const fileName = `receipt-recognition/${Date.now()}.jpg`;
          const { key, url: relativeUrl } = await storagePut(fileName, buffer, input.mimeType);
          
          // Get signed absolute URL for LLM
          const imageUrl = await storageGetSignedUrl(key);

          console.log("[Receipt Recognition] Image uploaded to:", imageUrl);

          // 2. Call LLM to extract products from receipt
          const systemPrompt = `당신은 한국 영수증 인식 전문가입니다. 영수증 이미지에서 구매한 식품 목록을 추출하세요.

반드시 다음 JSON 형식으로만 응답하세요:
{
  "products": [
    {"productName": "제품명", "quantity": "수량", "price": "가격"},
    {"productName": "제품명2", "quantity": "수량2", "price": "가격2"}
  ]
}

주의사항:
- 식품만 추출 (음료, 유제품, 육류, 채소, 과일 등)
- 제품명은 정확하게 추출
- 수량이 없으면 "1"로 설정
- 가격이 없으면 빈 문자열로 설정
- JSON만 반환하세요.`;

          const userPrompt = `이 영수증에서 구매한 식품 목록을 JSON 형식으로 추출해주세요.`;

          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: systemPrompt,
              },
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: userPrompt,
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: imageUrl,
                      detail: "auto",
                    },
                  },
                ] as any,
              } as any,
            ] as any,
          } as any);

          const message = response.choices[0]?.message;
          const content = message?.content;
          const textContent = extractTextFromContent(content);

          let jsonText = textContent.trim();
          if (!jsonText.startsWith("{")) {
            const jsonMatch = textContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              jsonText = jsonMatch[0];
            }
          }

          const result = JSON.parse(jsonText);

          // Extract products array
          const products = Array.isArray(result) 
            ? result 
            : (result.products && Array.isArray(result.products) ? result.products : []);

          return {
            products: products.map((p: any) => ({
              productName: String(p.productName || p.name || p.product_name || "미확인").trim(),
              quantity: String(p.quantity || "1").trim(),
              price: String(p.price || "").trim(),
            })),
            imageUrl,
          };
        } catch (error) {
          console.error("[Receipt Recognition] Error:", error);
          return {
            products: [],
            imageUrl: "",
            error: error instanceof Error ? error.message : String(error),
          };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
