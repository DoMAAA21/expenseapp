import { AddTransaction } from './_components/add-transaction';
import { TransactionList, type TransactionRow } from './_components/transaction-list';
import http from '@/lib/http';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { Modal } from '@/components/modal';
import { useSearchParams } from 'react-router-dom';

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

export default function TransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromUrl = useMemo(() => Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1), [searchParams]);

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Transactions</h2>
        <p className="text-sm text-muted-foreground">
          View and manage your income and expenses.
        </p>
      </div>

      <TransactionList
        transactions={rows}
        meta={meta}
        isInitialLoading={isLoading && !listPayload}
        isFetching={isFetching && !!listPayload}
        error={listError}
        onPageChange={setPage}
      />

      <Modal isOpen={modalOpen} onClose={closeModal} align="center" size="md">
        <AddTransaction onClose={closeModal} defaultType={defaultType} />
      </Modal>
    </div>
  );
}
