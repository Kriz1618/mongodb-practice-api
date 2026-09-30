import { randomUUID } from "node:crypto";
import { Order } from "../models/Order";
import { Product } from "../models/Product";
import { User } from "../models/User";
import { AppError } from "../errors/AppError";
import { CreateOrderBody } from "../validation/requestSchemas";

export const createOrder = async (userId: string, items: CreateOrderBody["items"]) => {
  if (!(await User.exists({ _id: userId }))) throw new AppError("User not found", 404);

  const productIds = items.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: productIds } });
  const productsById = new Map(products.map((product) => [product._id.toString(), product]));
  const orderItems = items.map((item) => {
    const product = productsById.get(item.productId);
    if (!product) throw new AppError(`Product ${item.productId} not found`, 404);
    if (!product.isActive) throw new AppError(`Product ${item.productId} is inactive`, 409);
    return {
      productId: product._id,
      productName: product.name,
      unitPrice: product.price,
      quantity: item.quantity,
      subtotal: product.price * item.quantity,
    };
  });

  const reserved: Array<{ productId: string; quantity: number }> = [];
  try {
    for (const item of items) {
      const result = await Product.updateOne(
        { _id: item.productId, isActive: true, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } }
      );
      if (result.modifiedCount !== 1) {
        throw new AppError(`Insufficient stock for product ${item.productId}`, 409);
      }
      reserved.push(item);
    }

    const total = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    return await Order.create({
      orderNumber: `ORD-${randomUUID()}`,
      user: userId,
      items: orderItems,
      total,
    });
  } catch (error) {
    const rollbackResults = await Promise.allSettled(reserved.map(({ productId, quantity }) =>
      Product.updateOne({ _id: productId }, { $inc: { stock: quantity } })
    ));
    if (rollbackResults.some((result) => result.status === "rejected")) {
      console.error("Failed to restore inventory after order creation failure", rollbackResults);
    }
    throw error;
  }
};

export const listUserOrders = async (userId: string) =>
  Order.find({ user: userId }).sort({ createdAt: -1 }).lean();
