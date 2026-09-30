import { Order } from "../models/Order";
import { Product } from "../models/Product";

export const getRevenueByCategory = () =>
  Order.aggregate([
    { $match: { status: { $in: ["paid", "shipped", "delivered"] } } },
    { $unwind: "$items" },
    {
      $lookup: {
        from: "products",
        localField: "items.productId",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $group: {
        _id: "$product.category",
        revenue: { $sum: "$items.subtotal" },
        unitsSold: { $sum: "$items.quantity" },
        orderCount: { $addToSet: "$_id" },
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: "$category" },
    {
      $project: {
        _id: 0,
        category: "$category.name",
        revenue: 1,
        unitsSold: 1,
        orderCount: { $size: "$orderCount" },
      },
    },
    { $sort: { revenue: -1 } },
  ]);

export const getTopProducts = () =>
  Order.aggregate([
    { $match: { status: { $ne: "cancelled" } } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.productId",
        name: { $first: "$items.productName" },
        totalSold: { $sum: "$items.quantity" },
        revenue: { $sum: "$items.subtotal" },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
  ]);

export const getAverageOrderValuePerUser = () =>
  Order.aggregate([
    { $match: { status: { $in: ["paid", "shipped", "delivered"] } } },
    {
      $group: {
        _id: "$user",
        totalSpent: { $sum: "$total" },
        orderCount: { $sum: 1 },
        avgTicket: { $avg: "$total" },
      },
    },
    { $match: { orderCount: { $gte: 2 } } },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        _id: 0,
        user: "$user.name",
        email: "$user.email",
        totalSpent: 1,
        orderCount: 1,
        avgTicket: { $round: ["$avgTicket", 2] },
      },
    },
    { $sort: { totalSpent: -1 } },
  ]);

export const getProductRatingStats = () =>
  Product.aggregate([
    { $match: { "reviews.0": { $exists: true } } },
    { $unwind: "$reviews" },
    {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        avgRating: { $avg: "$reviews.rating" },
        reviewCount: { $sum: 1 },
        fiveStars: {
          $sum: { $cond: [{ $eq: ["$reviews.rating", 5] }, 1, 0] },
        },
      },
    },
    { $sort: { avgRating: -1, reviewCount: -1 } },
    { $limit: 10 },
    {
      $project: {
        _id: 0,
        name: 1,
        avgRating: { $round: ["$avgRating", 2] },
        reviewCount: 1,
        fiveStars: 1,
      },
    },
  ]);

export const getMonthlySales = () =>
  Order.aggregate([
    { $match: { status: { $in: ["paid", "shipped", "delivered"] } } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        revenue: { $sum: "$total" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
    {
      $project: {
        _id: 0,
        year: "$_id.year",
        month: "$_id.month",
        revenue: 1,
        orders: 1,
      },
    },
  ]);

export const getLowStockReport = () =>
  Product.aggregate([
    { $match: { isActive: true, stock: { $lt: 10 } } },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: "$category" },
    {
      $project: {
        _id: 0,
        name: 1,
        stock: 1,
        price: 1,
        category: "$category.name",
        reviewCount: { $size: "$reviews" },
        avgRating: {
          $cond: [
            { $gt: [{ $size: "$reviews" }, 0] },
            { $round: [{ $avg: "$reviews.rating" }, 2] },
            null,
          ],
        },
      },
    },
    { $sort: { stock: 1 } },
  ]);
