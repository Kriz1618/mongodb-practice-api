import { Request, Response } from "express";
import {
  getAverageOrderValuePerUser,
  getLowStockReport,
  getMonthlySales,
  getProductRatingStats,
  getRevenueByCategory,
  getTopProducts,
} from "../services/analytics.service";

// 📊 1. Total revenue by category ($lookup + $unwind + $group)
export const revenueByCategory = async (_req: Request, res: Response) => {
  const result = await getRevenueByCategory();
  res.json(result);
};

// 📊 2. Top 5 best-selling products
export const topProducts = async (_req: Request, res: Response) => {
  const result = await getTopProducts();
  res.json(result);
};

// 📊 3. Average order value per user (filtered to recurring customers)
export const avgOrderValuePerUser = async (_req: Request, res: Response) => {
  const result = await getAverageOrderValuePerUser();
  res.json(result);
};

// 📊 4. Embedded review analysis ($unwind on an embedded array)
export const productRatingStats = async (_req: Request, res: Response) => {
  const result = await getProductRatingStats();
  res.json(result);
};

// 📊 5. Monthly sales analysis ($group with date operators)
export const monthlySales = async (_req: Request, res: Response) => {
  const result = await getMonthlySales();
  res.json(result);
};

// 📊 6. Find low-stock products (using lookups and filters)
export const lowStockReport = async (_req: Request, res: Response) => {
  const result = await getLowStockReport();
  res.json(result);
};
