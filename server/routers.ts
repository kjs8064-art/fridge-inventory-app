import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";
import * as db from "./db";

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
      .mutation(({ input }) => {
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

        return db.updateFoodItem(input.id, updateData);
      }),

    // Delete a food item
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteFoodItem(input.id)),

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
          // 1. Upload image to S3
          const buffer = Buffer.from(input.imageBase64, "base64");
          const fileName = `food-recognition/${Date.now()}.jpg`;
          const { url: imageUrl } = await storagePut(fileName, buffer, input.mimeType);

          console.log("[Recognition] Image uploaded to:", imageUrl);

          // 2. Call LLM with the uploaded image URL
          const systemPrompt = `당신은 한국 식품 인식 전문가입니다. 식품 이미지를 분석하고 다음 정보를 추출하세요:

1. 제품명 (productName): 정확한 제품 이름 (예: 우유, 계란, 요구르트, 치즈 등)
2. 유통기한 (expirationDate): YYYY-MM-DD 형식. 보이지 않으면 일반적인 유통기한으로 추정
3. 분류 (category): 채소, 과일, 육류, 유제품, 음료, 냉동식품, 기타 중 하나
4. 신뢰도 (confidence): 0.0~1.0 사이의 숫자

반드시 JSON 형식으로 응답하세요. 예시:
{"productName": "우유", "expirationDate": "2026-05-15", "category": "유제품", "confidence": 0.95}`;

          const userPrompt = `이 식품 이미지를 분석하고 제품명, 유통기한, 분류를 추출해주세요.`;

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
            response_format: {
              type: "json_object",
            },
          } as any);

          console.log("[Recognition] LLM response:", response);

          // 3. Parse the response
          const content = response.choices[0]?.message?.content;
          console.log("[Recognition] Response content:", content);

          if (!content) {
            throw new Error("LLM에서 응답이 없습니다");
          }

          const jsonContent = typeof content === 'string' ? content : JSON.stringify(content);
          console.log("[Recognition] Parsed JSON content:", jsonContent);

          const result = JSON.parse(jsonContent);
          console.log("[Recognition] Parsed result:", result);

          const finalResult = {
            productName: result.productName?.trim() || "미확인 제품",
            expirationDate: result.expirationDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            category: result.category?.trim() || "기타",
            confidence: result.confidence || 0.7,
            imageUrl,
          };

          console.log("[Recognition] Final result:", finalResult);
          return finalResult;
        } catch (error) {
          console.error("[Recognition] Error:", error);
          // Return default values on error
          return {
            productName: "미확인 제품",
            expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            category: "기타",
            confidence: 0.3,
            imageUrl: "",
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
          const { url: imageUrl } = await storagePut(fileName, buffer, input.mimeType);

          console.log("[Receipt Recognition] Image uploaded to:", imageUrl);

          // 2. Call LLM to extract products from receipt
          const systemPrompt = `당신은 한국 영수증 인식 전문가입니다. 영수증 이미지에서 구매한 식품 목록을 추출하세요.

다음 형식으로 JSON 배열을 반환하세요:
[
  {"productName": "제품명", "quantity": "수량", "price": "가격"},
  ...
]

주의사항:
- 식품만 추출 (음료, 유제품, 육류, 채소, 과일 등)
- 제품명은 정확하게 추출
- 수량이 없으면 "1"로 설정
- 가격이 없으면 빈 문자열로 설정`;

          const userPrompt = `이 영수증에서 구매한 식품 목록을 추출해주세요.`;

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
            response_format: {
              type: "json_object",
            },
          } as any);

          const content = response.choices[0]?.message?.content;
          if (!content) {
            throw new Error("LLM에서 응답이 없습니다");
          }

          const jsonContent = typeof content === 'string' ? content : JSON.stringify(content);
          const result = JSON.parse(jsonContent);

          // Extract products array
          const products = Array.isArray(result) ? result : result.products || [];

          return {
            products: products.map((p: any) => ({
              productName: p.productName?.trim() || "미확인",
              quantity: p.quantity?.trim() || "1",
              price: p.price?.trim() || "",
            })),
            imageUrl,
          };
        } catch (error) {
          console.error("[Receipt Recognition] Error:", error);
          return {
            products: [],
            imageUrl: "",
          };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
