import { faker } from "@faker-js/faker";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDB } from "../config/db";
import { User } from "../models/User";
import { Category } from "../models/Category";
import { Product } from "../models/Product";
import { Order } from "../models/Order";

dotenv.config();
faker.seed(process.env.SEED_VALUE ? Number(process.env.SEED_VALUE) : Date.now());

const countFromEnv = (key: string, fallback: number, maximum: number): number => {
  const value = Number(process.env[key] ?? fallback);
  if (!Number.isInteger(value) || value < 1 || value > maximum) {
    throw new Error(`${key} must be an integer between 1 and ${maximum}`);
  }
  return value;
};

const seed = async () => {
  if (process.env.SEED_RESET !== "true") {
    throw new Error("Seed clears all collections. Set SEED_RESET=true to confirm.");
  }

  const userCount = countFromEnv("SEED_USERS", 30, 5000);
  const productCount = countFromEnv("SEED_PRODUCTS", 100, 10000);
  const orderCount = countFromEnv("SEED_ORDERS", 200, 50000);

  await connectDB();

  try {
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Order.deleteMany({}),
    ]);

    const categoryData = [
      ["Electrónica", "electronica"],
      ["Ropa", "ropa"],
      ["Hogar", "hogar"],
      ["Deportes", "deportes"],
      ["Libros", "libros"],
      ["Belleza", "belleza"],
      ["Juguetes", "juguetes"],
      ["Accesorios", "accesorios"],
    ];
    const categories = await Category.insertMany(
      categoryData.map(([name, slug]) => ({ name, slug }))
    );

    const users = await User.insertMany(
      Array.from({ length: userCount }, (_, index) => {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        return {
          name: `${firstName} ${lastName}`,
          email: `customer-${index + 1}-${faker.string.alphanumeric(6).toLowerCase()}@example.com`,
          role: index === 0 ? "admin" : "customer",
        };
      })
    );

    const products = await Product.insertMany(
      Array.from({ length: productCount }, (_, index) => {
        const category = faker.helpers.arrayElement(categories);
        const name = faker.commerce.productName();
        const reviewCount = faker.number.int({ min: 0, max: 8 });
        return {
          name,
          description: `${faker.commerce.productDescription()} ${faker.lorem.sentence()}`,
          price: Number(faker.commerce.price({ min: 5, max: 2500, dec: 2 })),
          stock: faker.number.int({ min: 30, max: 250 }),
          category: category._id,
          tags: faker.helpers.uniqueArray(
            [
              faker.commerce.department().toLowerCase(),
              faker.commerce.productAdjective().toLowerCase(),
              faker.commerce.productMaterial().toLowerCase(),
              category.slug,
            ],
            faker.number.int({ min: 1, max: 4 })
          ),
          reviews: Array.from({ length: reviewCount }, () => ({
            userId: faker.helpers.arrayElement(users)._id,
            rating: faker.number.int({ min: 1, max: 5 }),
            comment: faker.lorem.sentence(),
            createdAt: faker.date.recent({ days: 365 }),
          })),
          isActive: index === 0 || faker.number.int({ min: 1, max: 100 }) > 5,
        };
      })
    );

    const availableStock = new Map(products.map((product) => [product._id.toString(), product.stock]));
    const purchasableProducts = products.filter((product) => product.isActive);
    const statuses = ["pending", "paid", "shipped", "delivered", "cancelled"] as const;
    const orders = [];

    for (let index = 0; index < orderCount; index += 1) {
      const status = faker.helpers.arrayElement(statuses);
      const candidates = faker.helpers.shuffle(purchasableProducts)
        .filter((product) => (availableStock.get(product._id.toString()) ?? 0) > 0)
        .slice(0, faker.number.int({ min: 1, max: Math.min(4, purchasableProducts.length) }));

      if (candidates.length === 0) break;

      const items = candidates.map((product) => {
        const key = product._id.toString();
        const remaining = availableStock.get(key) ?? 0;
        const quantity = faker.number.int({ min: 1, max: Math.min(4, remaining) });
        if (status !== "cancelled") availableStock.set(key, remaining - quantity);
        return {
          productId: product._id,
          productName: product.name,
          unitPrice: product.price,
          quantity,
          subtotal: Number((product.price * quantity).toFixed(2)),
        };
      });

      orders.push({
        orderNumber: `SEED-${index + 1}-${faker.string.alphanumeric(10).toUpperCase()}`,
        user: faker.helpers.arrayElement(users)._id,
        items,
        total: Number(items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2)),
        status,
        createdAt: faker.date.recent({ days: 365 }),
      });
    }

    await Product.bulkWrite(products.map((product) => ({
      updateOne: {
        filter: { _id: product._id },
        update: { $set: { stock: availableStock.get(product._id.toString()) } },
      },
    })));
    await Order.insertMany(orders);

    console.log(`Seed completado: ${users.length} usuarios, ${categories.length} categorías, ${products.length} productos y ${orders.length} órdenes.`);
  } finally {
    await mongoose.disconnect();
  }
};

seed().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
