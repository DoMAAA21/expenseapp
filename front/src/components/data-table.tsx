import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type DataTableColumn<T> = {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
};

export type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowId: (row: T) => string;
  isLoading?: boolean;
  loadingMessage?: ReactNode;
  getRowClassName?: (row: T) => string | undefined;
  tableClassName?: string;
};

export function DataTable<T>({
  columns,
  data,
  getRowId,
  isLoading = false,
  loadingMessage = 'Loading…',
  getRowClassName,
  tableClassName = 'min-w-[600px]',
}: DataTableProps<T>) {
  const colCount = columns.length;

  return (
    <div className="overflow-x-auto">
      <table className={cn('w-full text-left text-sm', tableClassName)}>
        <thead className="border-b border-border bg-muted/50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.id}
                className={cn('px-4 py-3 font-medium', col.headerClassName)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card">
          {isLoading ? (
            <tr>
              <td
                colSpan={colCount}
                className="px-4 py-8 text-center text-muted-foreground"
              >
                {loadingMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={getRowId(row)}
                className={cn('hover:bg-muted/40', getRowClassName?.(row))}
              >
                {columns.map((col) => (
                  <td key={col.id} className={cn('px-4 py-3', col.className)}>
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export type PaginationMeta = {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type DataTablePaginationProps = {
  meta: PaginationMeta;
  isFetching: boolean;
  onPageChange: (page: number) => void;
  entityLabel?: string;
};

export function DataTablePagination({
  meta,
  isFetching,
  onPageChange,
  entityLabel,
}: DataTablePaginationProps) {
  const start = (meta.page - 1) * meta.pageSize + 1;
  const end = Math.min(meta.page * meta.pageSize, meta.total);

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        Showing {start}–{end} of {meta.total}
        {entityLabel ? ` ${entityLabel}` : ''}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isFetching || meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>
        <span className="min-w-[7rem] text-center text-sm text-muted-foreground">
          Page {meta.page} of {meta.totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isFetching || meta.page >= meta.totalPages}
          onClick={() => onPageChange(meta.page + 1)}
          aria-label="Next page"
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export function DataTableContainer({
  children,
  isFetching,
  className,
}: {
  children: ReactNode;
  isFetching: boolean;
  className?: string;
}) {
  return (
    <div className={cn('relative space-y-4', className)}>
      {isFetching ? (
        <div
          className="pointer-events-none absolute inset-0 z-10 rounded-lg bg-background/40"
          aria-hidden
        />
      ) : null}
      <div
        className={cn(
          'overflow-hidden rounded-lg border border-border transition-opacity',
          isFetching && 'opacity-70',
        )}
      >
        {children}
      </div>
    </div>
  );
}
