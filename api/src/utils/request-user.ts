import type { Request } from "express";
import { AppError } from "@/utils/app-error";

export function getAuthUser(req: Request): NonNullable<Request["authUser"]> {
  if (!req.authUser) {
    throw new AppError(401, "Unauthorized");
  }
  return req.authUser;
}
