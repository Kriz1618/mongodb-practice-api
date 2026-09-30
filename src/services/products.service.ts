import { Product } from "../models/Product";
import { Category } from "../models/Category";
import { User } from "../models/User";
import { AppError } from "../errors/AppError";
import { AddReviewBody, CreateProductBody, ProductListQuery } from "../validation/requestSchemas";

export const listProducts = async ({ category, minPrice, maxPrice, tag, sort, page, limit }: ProductListQuery) => {
  const filter: Record<string, unknown> = { isActive: true };
  if (category) filter.category = category;
  if (tag) filter.tags = tag;
  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceRange: { $gte?: number; $lte?: number } = {};
    if (minPrice !== undefined) priceRange.$gte = minPrice;
    if (maxPrice !== undefined) priceRange.$lte = maxPrice;
    filter.price = priceRange;
  }

  const skip = (page - 1) * limit;
  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return { total, page, limit, data: products };
};

export const searchProducts = async (query: string) =>
  Product.find({ $text: { $search: query } }, { score: { $meta: "textScore" } })
    .sort({ score: { $meta: "textScore" } })
    .limit(20)
    .lean();

export const findProductById = async (id: string) =>
  Product.findById(id).populate("category", "name slug").lean();

export const createProduct = async (data: CreateProductBody) => {
  if (!(await Category.exists({ _id: data.category }))) {
    throw new AppError("Category not found", 404);
  }
  return Product.create(data);
};

export const addProductReview = async (id: string, { userId, rating, comment }: AddReviewBody) => {
  if (!(await User.exists({ _id: userId }))) throw new AppError("User not found", 404);
  return Product.findByIdAndUpdate(
    id,
    { $push: { reviews: { userId, rating, comment, createdAt: new Date() } } },
    { new: true, runValidators: true }
  );
};
