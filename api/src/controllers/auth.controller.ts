import { type Request, type Response } from "express";
import { z } from "zod";
import { AuthService } from "@/services/auth.service";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "@/utils/jwt";
import { AppError } from "@/utils/app-error";
import { getAuthUser } from "@/utils/request-user";

const authService = new AuthService();

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.email(),
  password: z.string().min(8).max(72),
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(72),
});

function cookieOptions(maxAgeMs: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeMs,
  };
}

function setAuthCookies(res: Response, user: { id: string; email: string }) {
  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
  });
  const refreshToken = signRefreshToken({
    sub: user.id,
    email: user.email,
  });

  res.cookie("access_token", accessToken, cookieOptions(15 * 60 * 1000));
  res.cookie("refresh_token", refreshToken, cookieOptions(7 * 24 * 60 * 60 * 1000));
}

function clearAuthCookies(res: Response) {
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  res.clearCookie("refresh_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function register(req: Request, res: Response): Promise<void> {
  const payload = registerSchema.parse(req.body);
  try {
    const user = await authService.register(payload);
    setAuthCookies(res, user);
    res.status(201).json({
      message: "User registered successfully",
      data: { user },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("already registered")) {
      throw new AppError(409, error.message);
    }
    throw error;
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const payload = loginSchema.parse(req.body);
  try {
    const user = await authService.login(payload);
    setAuthCookies(res, user);
    res.status(200).json({
      message: "Login successful",
      data: { user },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes("Invalid email or password") ||
        error.message.includes("inactive"))
    ) {
      throw new AppError(401, error.message);
    }
    throw error;
  }
}

export async function me(req: Request, res: Response): Promise<void> {
  const authUser = getAuthUser(req);
  const user = await authService.getUserById(authUser.id);
  if (!user) {
    throw new AppError(404, "User not found");
  }
  res.status(200).json({ data: user });
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const refreshToken = req.cookies?.refresh_token as string | undefined;
  if (!refreshToken) {
    throw new AppError(401, "Missing refresh token");
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    const user = await authService.getUserById(payload.sub);
    if (!user || !user.isActive) {
      clearAuthCookies(res);
      throw new AppError(401, "Invalid refresh session");
    }
    setAuthCookies(res, user);
    res.status(200).json({ message: "Session refreshed" });
  } catch (error) {
    clearAuthCookies(res);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(401, "Invalid refresh token");
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  clearAuthCookies(res);
  res.status(200).json({ message: "Logged out successfully" });
}
