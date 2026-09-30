import { z } from "zod";

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Must be a valid MongoDB ObjectId");
const numericQuery = (schema: z.ZodNumber) =>
  z.preprocess((value) => {
    if (typeof value !== "string" || value.trim() === "") return Number.NaN;
    return Number(value);
  }, schema);

export const productListQuerySchema = z.object({
  category: objectIdSchema.optional(),
  minPrice: numericQuery(z.number().finite().nonnegative()).optional(),
  maxPrice: numericQuery(z.number().finite().nonnegative()).optional(),
  tag: z.string().trim().min(1).max(50).optional(),
  sort: z.enum(["createdAt", "-createdAt", "price", "-price", "name", "-name"]).default("-createdAt"),
  page: numericQuery(z.number().int().min(1)).default(1),
  limit: numericQuery(z.number().int().min(1).max(100)).default(10),
}).superRefine((query, context) => {
  if (query.minPrice !== undefined && query.maxPrice !== undefined && query.minPrice > query.maxPrice) {
    context.addIssue({ code: "custom", message: "minPrice must be less than or equal to maxPrice", path: ["minPrice"] });
  }
});

export const productSearchQuerySchema = z.object({ q: z.string().trim().min(1).max(100) });
export const productIdParamsSchema = z.object({ id: objectIdSchema });

export const createProductBodySchema = z.object({
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(5000),
  price: z.number().finite().nonnegative(),
  stock: z.number().int().nonnegative().default(0),
  category: objectIdSchema,
  tags: z.array(z.string().trim().min(1).max(50)).max(20).default([]),
  isActive: z.boolean().default(true),
}).strict();

export const addReviewBodySchema = z.object({
  userId: objectIdSchema,
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).default(""),
}).strict();

export const createOrderBodySchema = z.object({
  userId: objectIdSchema,
  items: z.array(z.object({
    productId: objectIdSchema,
    quantity: z.number().int().min(1).max(1000),
  }).strict()).min(1).max(50),
}).strict();

export const userIdParamsSchema = z.object({ userId: objectIdSchema });

export type ProductListQuery = z.infer<typeof productListQuerySchema>;
export type CreateProductBody = z.infer<typeof createProductBodySchema>;
export type AddReviewBody = z.infer<typeof addReviewBodySchema>;
export type CreateOrderBody = z.infer<typeof createOrderBodySchema>;
