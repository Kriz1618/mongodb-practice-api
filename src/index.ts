import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import productsRoutes from "./routes/products.routes";
import ordersRoutes from "./routes/orders.routes";
import analyticsRoutes from "./routes/analytics.routes";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/api/products", productsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/analytics", analyticsRoutes);

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

(async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));
})();
