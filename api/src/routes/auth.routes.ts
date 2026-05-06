import { Router } from "express";
import {
  login,
  logout,
  me,
  refresh,
  register,
} from "@/controllers/auth.controller";
import { requireAuth } from "@/middlewares/auth.middleware";
import { asyncWrapper } from "@/utils/async-wrapper";

export const authRouter = Router();

authRouter.post("/register", asyncWrapper(register));
authRouter.post("/login", asyncWrapper(login));
authRouter.post("/refresh", asyncWrapper(refresh));
authRouter.post("/logout", asyncWrapper(logout));
authRouter.get("/me", requireAuth, asyncWrapper(me));
