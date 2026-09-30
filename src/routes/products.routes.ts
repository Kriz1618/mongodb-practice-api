// src/routes/products.routes.ts
import { Router } from "express";
import {
  getProducts, searchProducts, getProductById, createProduct, addReview,
} from "../controllers/products.controller";
import { validateRequest } from "../middleware/validateRequest";
import {
  addReviewBodySchema,
  createProductBodySchema,
  productIdParamsSchema,
  productListQuerySchema,
  productSearchQuerySchema,
} from "../validation/requestSchemas";

const router = Router();
router.get("/", validateRequest("query", productListQuerySchema), getProducts);
router.get("/search", validateRequest("query", productSearchQuerySchema), searchProducts);
router.get("/:id", validateRequest("params", productIdParamsSchema), getProductById);
router.post("/", validateRequest("body", createProductBodySchema), createProduct);
router.post("/:id/reviews", validateRequest("params", productIdParamsSchema), validateRequest("body", addReviewBodySchema), addReview);
export default router;
