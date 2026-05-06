import {
  DataTable,
  DataTableContainer,
  DataTablePagination,
  type DataTableColumn,
  type PaginationMeta,
} from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Pencil, Trash2 } from 'lucide-react';
import { useMemo } from 'react';

export type TransactionRow = {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string | null;
  occurredAt: string;
};

type TransactionListProps = {
  transactions: TransactionRow[];
  meta: PaginationMeta | null;
  isInitialLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  onPageChange: (page: number) => void;
  onEditTransaction: (id: string) => void;
  onDeleteTransaction: (id: string) => void;
  deletingTransactionId: string | null;
};

const money = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'USD',
});

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export function TransactionList({
  transactions,
  meta,
  isInitialLoading,
  isFetching,
  error,
  onPageChange,
  onEditTransaction,
  onDeleteTransaction,
  deletingTransactionId,
}: TransactionListProps) {
  const columns = useMemo<DataTableColumn<TransactionRow>[]>(
    () => [
      {
        id: 'date',
        header: 'Date',
        className: 'whitespace-nowrap text-muted-foreground',
        cell: (tx) => formatWhen(tx.occurredAt),
      },
      {
        id: 'type',
        header: 'Type',
        cell: (tx) => (
          <span
            className={cn(
              'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
              tx.type === 'INCOME'
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                : 'bg-rose-500/15 text-rose-700 dark:text-rose-400',
            )}
          >
            {tx.type === 'INCOME' ? 'Income' : 'Expense'}
          </span>
        ),
      },
      {
        id: 'amount',
        header: 'Amount',
        className: 'font-medium tabular-nums',
        cell: (tx) => (
          <span
            className={cn(
              tx.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground',
            )}
          >
            {tx.type === 'INCOME' ? '+' : '−'}
            {money.format(tx.amount)}
          </span>
        ),
      },
      {
        id: 'description',
        header: 'Description',
        className: 'max-w-[240px] truncate text-muted-foreground',
        cell: (tx) => tx.description ?? '—',
      },
      {
        id: 'actions',
        header: <span className="sr-only">Actions</span>,
        className: 'w-0 text-right',
        cell: (tx) => (
          <div className="flex items-center justify-end gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-foreground"
              aria-label="Edit transaction"
              disabled={deletingTransactionId !== null}
              onClick={() => onEditTransaction(tx.id)}
            >
              <Pencil className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-destructive"
              aria-label="Delete transaction"
              disabled={deletingTransactionId !== null}
              onClick={() => onDeleteTransaction(tx.id)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [onEditTransaction, onDeleteTransaction, deletingTransactionId],
  );

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        {error.message}
      </div>
    );
  }

  if (isInitialLoading && !meta) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Loading transactions…
      </div>
    );
  }

  if (!meta || meta.total === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
        <p className="font-medium text-foreground">No transactions yet</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Use the + button to add income or expense.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DataTableContainer isFetching={isFetching}>
        <DataTable<TransactionRow>
          columns={columns}
          data={transactions}
          getRowId={(row) => row.id}
          isLoading={isInitialLoading}
          loadingMessage="Loading…"
        />
      </DataTableContainer>

      <DataTablePagination
        meta={meta}
        isFetching={isFetching}
        onPageChange={onPageChange}
        entityLabel="transactions"
      />
    </div>
  );
}
