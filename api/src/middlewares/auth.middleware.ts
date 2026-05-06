import { AppError } from "@/utils/app-error";
import { verifyAccessToken } from "@/utils/jwt";
import { type NextFunction, type Request, type Response } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const cookieToken = req.cookies?.access_token as string | undefined;
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : undefined;
  const token = cookieToken ?? bearerToken;

  if (!token) {
    next(new AppError(401, "Missing access token"));
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.authUser = {
      id: payload.sub,
      email: payload.email,
    };
    next();
  } catch {
    next(new AppError(401, "Invalid or expired access token"));
  }
}
