import { TransactionForm, type TransactionFormValues } from './transaction-form';
import type { TransactionRow } from './transaction-list';
import { getApiErrorMessage } from '@/lib/http-error';
import http from '@/lib/http';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

type EditTransactionProps = {
  onClose: () => void;
  transaction: TransactionRow;
};

export function EditTransaction({ onClose, transaction }: EditTransactionProps) {
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);

  const initialValues = useMemo(
    (): Pick<
      TransactionFormValues,
      'type' | 'amount' | 'description' | 'occurredAt'
    > => ({
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      occurredAt: transaction.occurredAt,
    }),
    [
      transaction.amount,
      transaction.description,
      transaction.id,
      transaction.occurredAt,
      transaction.type,
    ],
  );

  async function handleSubmit(values: TransactionFormValues) {
    setSubmitting(true);
    try {
      await http.put(`/transactions/${encodeURIComponent(transaction.id)}`, {
        type: values.type,
        amount: values.amount,
        description: values.description,
        occurredAt: values.occurredAt,
      });
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction updated');
      onClose();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Could not update transaction'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-foreground">Edit transaction</h2>
      <p className="mt-1 text-sm text-muted-foreground">Update amount, type, date, or description.</p>
      <div className="mt-6">
        <TransactionForm
          key={transaction.id}
          defaultType={transaction.type}
          initialValues={initialValues}
          submitLabel="Update"
          onSubmit={handleSubmit}
          onCancel={onClose}
          isSubmitting={submitting}
        />
      </div>
    </div>
  );
}
