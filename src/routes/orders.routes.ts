// src/routes/orders.routes.ts
import { Router } from "express";
import { createOrder, getUserOrders } from "../controllers/orders.controller";
import { validateRequest } from "../middleware/validateRequest";
import { createOrderBodySchema, userIdParamsSchema } from "../validation/requestSchemas";

const router = Router();
router.post("/", validateRequest("body", createOrderBodySchema), createOrder);
router.get("/user/:userId", validateRequest("params", userIdParamsSchema), getUserOrders);
export default router;
