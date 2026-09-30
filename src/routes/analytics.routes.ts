// src/routes/analytics.routes.ts
import { Router } from "express";
import {
  revenueByCategory, topProducts, avgOrderValuePerUser,
  productRatingStats, monthlySales, lowStockReport,
} from "../controllers/analytics.controller";

const router = Router();
router.get("/revenue-by-category", revenueByCategory);
router.get("/top-products", topProducts);
router.get("/avg-order-value", avgOrderValuePerUser);
router.get("/product-ratings", productRatingStats);
router.get("/monthly-sales", monthlySales);
router.get("/low-stock", lowStockReport);
export default router;
