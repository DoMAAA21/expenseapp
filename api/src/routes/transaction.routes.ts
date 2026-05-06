import { Router } from "express";
import {
  createTransaction,
  deleteTransaction,
  getTransaction,
  listTransactions,
  summaryTransactions,
  updateTransaction,
} from "@/controllers/transaction.controller";
import { requireAuth } from "@/middlewares/auth.middleware";
import { asyncWrapper } from "@/utils/async-wrapper";

export const transactionRouter = Router();

transactionRouter.use(requireAuth);

transactionRouter.get("/", asyncWrapper(listTransactions));
transactionRouter.get("/summary", asyncWrapper(summaryTransactions));
transactionRouter.get("/:id", asyncWrapper(getTransaction));
transactionRouter.post("/", asyncWrapper(createTransaction));
transactionRouter.put("/:id", asyncWrapper(updateTransaction));
transactionRouter.delete("/:id", asyncWrapper(deleteTransaction));
