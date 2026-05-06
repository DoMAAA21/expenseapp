import { type Request, type Response } from "express";
import { TransactionService } from "@/services/transaction.service";
import { AppError } from "@/utils/app-error";
import { getAuthUser } from "@/utils/request-user";
import { z } from "zod";

const transactionService = new TransactionService();

const transactionTypeSchema = z.enum(["INCOME", "EXPENSE"]);

const createBodySchema = z.object({
  type: transactionTypeSchema,
  amount: z.number().positive().finite(),
  description: z.string().max(500).optional().nullable(),
  occurredAt: z.coerce.date(),
});

const updateBodySchema = z.object({
  type: transactionTypeSchema.optional(),
  amount: z.number().positive().finite().optional(),
  description: z.string().max(500).optional().nullable(),
  occurredAt: z.coerce.date().optional(),
});

const listQuerySchema = z.object({
  type: transactionTypeSchema.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

const summaryQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(1970).max(2100),
});

function routeParamId(req: Request): string {
  const raw = req.params.id;
  const id = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined;
  if (!id) {
    throw new AppError(400, "Missing transaction id");
  }
  return id;
}

export async function listTransactions(req: Request, res: Response): Promise<void> {
  const userId = getAuthUser(req).id;
  const filters = listQuerySchema.parse(req.query);
  const data = await transactionService.list(userId, filters);
  res.status(200).json({ data });
}

export async function getTransaction(req: Request, res: Response): Promise<void> {
  const userId = getAuthUser(req).id;
  const id = routeParamId(req);
  const row = await transactionService.getById(userId, id);
  if (!row) {
    throw new AppError(404, "Transaction not found");
  }
  res.status(200).json({ data: row });
}

export async function createTransaction(req: Request, res: Response): Promise<void> {
  const userId = getAuthUser(req).id;
  const body = createBodySchema.parse(req.body);
  const data = await transactionService.create(userId, body);
  res.status(201).json({ message: "Transaction created", data });
}

export async function updateTransaction(req: Request, res: Response): Promise<void> {
  const userId = getAuthUser(req).id;
  const id = routeParamId(req);
  const body = updateBodySchema.parse(req.body);
  const data = await transactionService.update(userId, id, body);
  if (!data) {
    throw new AppError(404, "Transaction not found");
  }
  res.status(200).json({ message: "Transaction updated", data });
}

export async function deleteTransaction(req: Request, res: Response): Promise<void> {
  const userId = getAuthUser(req).id;
  const id = routeParamId(req);
  const ok = await transactionService.delete(userId, id);
  if (!ok) {
    throw new AppError(404, "Transaction not found");
  }
  res.status(200).json({ message: "Transaction deleted" });
}

export async function summaryTransactions(req: Request, res: Response): Promise<void> {
  const userId = getAuthUser(req).id;
  const { month, year } = summaryQuerySchema.parse(req.query);
  const data = await transactionService.summary(userId, month, year);
  res.status(200).json({ data: { month, year, ...data } });
}
