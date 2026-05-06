import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express, { type Request, type Response } from "express";
import { errorHandler } from "@/middlewares/error-handler.middleware";
import { authRouter } from "@/routes/auth.routes";
import { transactionRouter } from "@/routes/transaction.routes";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4000);
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
  })
);
app.use(cookieParser());
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", service: "api" });
});

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({ message: "TypeScript API is running." });
});

app.use("/api/auth", authRouter);
app.use("/api/transactions", transactionRouter);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});
