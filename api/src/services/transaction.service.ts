import { prisma } from "@/lib/prisma";
import { Prisma, type TransactionType } from "@prisma/client";

export type TransactionDto = {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description: string | null;
  occurredAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type ListFilters = {
  type?: TransactionType;
  startDate?: Date;
  endDate?: Date;
};

export type TransactionListMeta = {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type PaginatedTransactions = {
  data: TransactionDto[];
  meta: TransactionListMeta;
};

function mapTransaction(row: {
  id: string;
  userId: string;
  type: TransactionType;
  amount: Prisma.Decimal;
  description: string | null;
  occurredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}): TransactionDto {
  return {
    ...row,
    amount: Number(row.amount),
  };
}

function buildTransactionWhere(
  userId: string,
  filters: ListFilters
): Prisma.TransactionWhereInput {
  const where: Prisma.TransactionWhereInput = { userId };

  if (filters.type) {
    where.type = filters.type;
  }
  if (filters.startDate || filters.endDate) {
    where.occurredAt = {};
    if (filters.startDate) {
      where.occurredAt.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.occurredAt.lte = filters.endDate;
    }
  }

  return where;
}

export class TransactionService {
  async list(
    userId: string,
    filters: ListFilters & { page: number; pageSize: number }
  ): Promise<PaginatedTransactions> {
    const where = buildTransactionWhere(userId, filters);

    const total = await prisma.transaction.count({ where });
    const pageSize = filters.pageSize;
    const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
    const page = Math.min(Math.max(1, filters.page), totalPages);
    const skip = (page - 1) * pageSize;

    const rows = await prisma.transaction.findMany({
      where,
      orderBy: { occurredAt: "desc" },
      skip,
      take: pageSize,
    });

    return {
      data: rows.map(mapTransaction),
      meta: {
        total,
        page,
        pageSize,
        totalPages,
      },
    };
  }

  async getById(userId: string, id: string): Promise<TransactionDto | null> {
    const row = await prisma.transaction.findFirst({
      where: { id, userId },
    });
    return row ? mapTransaction(row) : null;
  }

  async create(
    userId: string,
    data: {
      type: TransactionType;
      amount: number;
      description?: string | null;
      occurredAt: Date;
    }
  ): Promise<TransactionDto> {
    const row = await prisma.transaction.create({
      data: {
        userId,
        type: data.type,
        amount: new Prisma.Decimal(data.amount.toFixed(2)),
        description: data.description ?? null,
        occurredAt: data.occurredAt,
      },
    });
    return mapTransaction(row);
  }

  async update(
    userId: string,
    id: string,
    data: {
      type?: TransactionType;
      amount?: number;
      description?: string | null;
      occurredAt?: Date;
    }
  ): Promise<TransactionDto | null> {
    const existing = await prisma.transaction.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      return null;
    }

    const row = await prisma.transaction.update({
      where: { id },
      data: {
        ...(data.type !== undefined && { type: data.type }),
        ...(data.amount !== undefined && {
          amount: new Prisma.Decimal(data.amount.toFixed(2)),
        }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.occurredAt !== undefined && { occurredAt: data.occurredAt }),
      },
    });
    return mapTransaction(row);
  }

  async delete(userId: string, id: string): Promise<boolean> {
    const existing = await prisma.transaction.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      return false;
    }
    await prisma.transaction.delete({ where: { id } });
    return true;
  }

  async summary(
    userId: string,
    month: number,
    year: number
  ): Promise<{
    income: number;
    expenses: number;
    balance: number;
  }> {
    const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const [incomeAgg, expenseAgg] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          userId,
          type: "INCOME",
          occurredAt: { gte: start, lte: end },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          userId,
          type: "EXPENSE",
          occurredAt: { gte: start, lte: end },
        },
        _sum: { amount: true },
      }),
    ]);

    const income = Number(incomeAgg._sum.amount ?? 0);
    const expenses = Number(expenseAgg._sum.amount ?? 0);

    return {
      income,
      expenses,
      balance: income - expenses,
    };
  }
}
