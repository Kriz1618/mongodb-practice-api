import { NextFunction, Request, RequestHandler, Response } from "express";
import { z } from "zod";

type RequestPart = "body" | "params" | "query";

declare global {
  namespace Express {
    interface Locals {
      validated?: Partial<Record<RequestPart, unknown>>;
    }
  }
}

export const validateRequest = (part: RequestPart, schema: z.ZodType): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[part]);
    if (!result.success) return next(result.error);

    res.locals.validated ??= {};
    res.locals.validated[part] = result.data;
    next();
  };
