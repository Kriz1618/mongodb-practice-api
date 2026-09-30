import { Request, Response } from "express";
import {
  addProductReview,
  createProduct as createProductService,
  findProductById,
  listProducts,
  searchProducts as searchProductsService,
} from "../services/products.service";
import {
  AddReviewBody,
  CreateProductBody,
  ProductListQuery,
} from "../validation/requestSchemas";

export const getProducts = async (req: Request, res: Response) => {
  const query = res.locals.validated?.query as ProductListQuery;
  const result = await listProducts(query);
  res.json(result);
};

export const searchProducts = async (req: Request, res: Response) => {
  const { q } = res.locals.validated?.query as { q: string };
  const products = await searchProductsService(q as string);
  res.json(products);
};

export const getProductById = async (req: Request, res: Response) => {
  const product = await findProductById(String(req.params.id));
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
};

export const createProduct = async (req: Request, res: Response) => {
  const body = res.locals.validated?.body as CreateProductBody;
  const product = await createProductService(body);
  res.status(201).json(product);
};

export const addReview = async (req: Request, res: Response) => {
  const body = res.locals.validated?.body as AddReviewBody;
  const product = await addProductReview(String(req.params.id), body);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
};
