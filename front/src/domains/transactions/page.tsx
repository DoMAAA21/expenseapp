import { AddTransaction } from './_components/add-transaction';
import { TransactionMonthSummary } from './_components/transaction-month-summary';
import { TransactionList, type TransactionRow } from './_components/transaction-list';
import { showConfirmationPopup } from '@/components/confirmation-popup';
import http from '@/lib/http';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { Modal } from '@/components/modal';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

const PAGE_SIZE = 10;

type ListResponse = {
  data: TransactionRow[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
};

type SummaryResponse = {
  data: {
    month: number;
    year: number;
    income: number;
    expenses: number;
    balance: number;
  };
};

export default function TransactionsPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromUrl = useMemo(() => Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1), [searchParams]);

  const now = new Date();
  const summaryMonth = now.getMonth() + 1;
  const summaryYear = now.getFullYear();
  const summaryPeriodLabel = new Date(summaryYear, summaryMonth - 1, 1).toLocaleString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  const { modalOpen, defaultType } = useMemo(() => {
    const add = searchParams.get('add');
    if (add === 'income') {
      return { modalOpen: true, defaultType: 'INCOME' as const };
    }
    if (add === 'expense') {
      return { modalOpen: true, defaultType: 'EXPENSE' as const };
    }
    return { modalOpen: false, defaultType: 'EXPENSE' as const };
  }, [searchParams]);

  const {
    data: listPayload,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ['transactions', pageFromUrl, PAGE_SIZE],
    queryFn: async () => {
      const res = await http.get<ListResponse>('/transactions', {
        params: { page: pageFromUrl, pageSize: PAGE_SIZE },
      });
      return res.data;
    },
  });

  const {
    data: monthSummary,
    isLoading: summaryLoading,
    error: summaryError,
  } = useQuery({
    queryKey: ['transactions', 'summary', summaryMonth, summaryYear],
    queryFn: async () => {
      const res = await http.get<SummaryResponse>('/transactions/summary', {
        params: { month: summaryMonth, year: summaryYear },
      });
      return res.data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await http.delete(`/transactions/${encodeURIComponent(id)}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction deleted');
    },
    onError: (err: unknown) => {
      const message = axios.isAxiosError(err)
        ? typeof err.response?.data === 'object' &&
            err.response.data !== null &&
            'message' in err.response.data &&
            typeof (err.response.data as { message?: string }).message === 'string'
          ? (err.response.data as { message: string }).message
          : err.message
        : 'Could not delete transaction';
      toast.error(message);
    },
  });

  function handleDeleteTransaction(id: string) {
    void showConfirmationPopup({
      title: 'Delete transaction',
      message: 'Delete this transaction? This cannot be undone.',
      confirmButton: 'Delete',
      cancelButton: 'Cancel',
      onSuccess: () => {
        deleteMutation.mutate(id);
      },
    });
  }

  useEffect(() => {
    const p = listPayload?.meta?.page;
    if (p === undefined) return;
    if (p !== pageFromUrl) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('page', String(p));
          return next;
        },
        { replace: true },
      );
    }
  }, [listPayload?.meta?.page, pageFromUrl, setSearchParams]);

  function closeModal() {
    const next = new URLSearchParams(searchParams);
    next.delete('add');
    setSearchParams(next, { replace: true });
  }

  function setPage(nextPage: number) {
    const next = new URLSearchParams(searchParams);
    if (nextPage <= 1) {
      next.delete('page');
    } else {
      next.set('page', String(nextPage));
    }
    setSearchParams(next, { replace: true });
  }

  const rows = listPayload?.data ?? [];
  const meta = listPayload?.meta ?? null;
  const listError = error instanceof Error ? error : error ? new Error('Failed to load transactions') : null;
  const summaryErr =
    summaryError instanceof Error
      ? summaryError
      : summaryError
        ? new Error('Failed to load monthly totals')
        : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Transactions</h2>
        <p className="text-sm text-muted-foreground">
          View and manage your income and expenses.
        </p>
      </div>

      <TransactionMonthSummary
        periodLabel={summaryPeriodLabel}
        income={monthSummary?.income ?? 0}
        expenses={monthSummary?.expenses ?? 0}
        balance={monthSummary?.balance ?? 0}
        isLoading={summaryLoading}
        error={summaryErr}
      />

      <TransactionList
        transactions={rows}
        meta={meta}
        isInitialLoading={isLoading && !listPayload}
        isFetching={isFetching && !!listPayload}
        error={listError}
        onPageChange={setPage}
        onDeleteTransaction={handleDeleteTransaction}
        deletingTransactionId={
          deleteMutation.isPending ? deleteMutation.variables ?? null : null
        }
      />

      <Modal isOpen={modalOpen} onClose={closeModal} align="center" size="md">
        <AddTransaction onClose={closeModal} defaultType={defaultType} />
      </Modal>
    </div>
  );
}
