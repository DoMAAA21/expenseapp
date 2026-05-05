import { type Request, type Response } from "express";
import { z } from "zod";
import { AuthService } from "../services/auth.service";
import { signAccessToken } from "../utils/jwt";

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

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const payload = registerSchema.parse(req.body);
    const user = await authService.register(payload);

    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
    });

    res.status(201).json({
      message: "User registered successfully",
      data: { user, accessToken },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid request body", issues: error.issues });
      return;
    }

    const message =
      error instanceof Error ? error.message : "Failed to register user";
    const statusCode = message.includes("already registered") ? 409 : 500;

    res.status(statusCode).json({ message });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const payload = loginSchema.parse(req.body);
    const user = await authService.login(payload);

    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
    });

    res.status(200).json({
      message: "Login successful",
      data: { user, accessToken },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid request body", issues: error.issues });
      return;
    }

    const message = error instanceof Error ? error.message : "Login failed";
    const statusCode =
      message.includes("Invalid email or password") || message.includes("inactive")
        ? 401
        : 500;

    res.status(statusCode).json({ message });
  }
}

export async function me(req: Request, res: Response): Promise<void> {
  try {
    if (!req.authUser) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await authService.getUserById(req.authUser.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ data: user });
  } catch (_error) {
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
}
