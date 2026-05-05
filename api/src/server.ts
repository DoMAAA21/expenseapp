import cors from "cors";
import dotenv from "dotenv";
import express, { type Request, type Response } from "express";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", service: "api" });
});

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({ message: "TypeScript API is running." });
});

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});
