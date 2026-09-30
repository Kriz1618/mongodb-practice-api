import { ErrorRequestHandler } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";
import { AppError } from "../errors/AppError";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ error: error.message });
  }

  if (error instanceof ZodError) {
    return res.status(400).json({ error: "Request validation failed", details: error.issues });
  }

  if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
    return res.status(400).json({ error: error.message });
  }

  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({ error: "Malformed JSON request body" });
  }

  if (error?.code === 11000) {
    return res.status(409).json({ error: "A resource with this value already exists" });
  }

  console.error(error);
  return res.status(500).json({ error: "Internal server error" });
};
