import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
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
      const userId = ctx.user?.id || "anonymous";
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
    // Recognize food from image URL
    recognize: publicProcedure
      .input(
        z.object({
          imageUrl: z.string().url(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          // TODO: Implement actual AI image recognition using invokeLLM
          // For now, return placeholder values
          return {
            productName: "Recognized Product",
            expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            category: "기타",
            confidence: 0.7,
          };
        } catch (error) {
          console.error("AI recognition error:", error);
          return {
            productName: "Unknown Product",
            expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            category: "기타",
            confidence: 0.3,
          };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
