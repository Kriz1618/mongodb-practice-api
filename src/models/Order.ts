import { Schema, model, Document, Types } from "mongoose";

export interface IOrderItem {
  productId: Types.ObjectId;
  productName: string;   // Snapshot
  unitPrice: number;     // Snapshot
  quantity: number;
  subtotal: number;
}

export interface IOrder extends Document {
  _id: Types.ObjectId;
  orderNumber: string;
  user: Types.ObjectId;
  items: IOrderItem[];
  total: number;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  createdAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], required: true, validate: (v: IOrderItem[]) => v.length > 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// 🔹 ESR indexes for orders
// Equality (user) + Sort (createdAt) + Range (status)
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 }, { unique: true });

export const Order = model<IOrder>("Order", orderSchema);
