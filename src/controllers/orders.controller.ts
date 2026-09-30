import { Request, Response } from "express";
import { createOrder as createOrderService, listUserOrders } from "../services/orders.service";
import { CreateOrderBody } from "../validation/requestSchemas";

// POST /orders
export const createOrder = async (req: Request, res: Response) => {
  const { userId, items } = res.locals.validated?.body as CreateOrderBody;
  const order = await createOrderService(userId, items);
  res.status(201).json(order);
};

// GET /orders/:userId
export const getUserOrders = async (req: Request, res: Response) => {
  const orders = await listUserOrders(String(req.params.userId));
  res.json(orders);
};
