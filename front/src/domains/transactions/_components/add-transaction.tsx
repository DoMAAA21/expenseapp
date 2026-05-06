import { TransactionForm, type TransactionFormValues } from './transaction-form';
import { getApiErrorMessage } from '@/lib/http-error';
import http from '@/lib/http';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

type AddTransactionProps = {
  onClose: () => void;
  defaultType: 'INCOME' | 'EXPENSE';
};

export function AddTransaction({ onClose, defaultType }: AddTransactionProps) {
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(values: TransactionFormValues) {
    setSubmitting(true);
    try {
      await http.post('/transactions', {
        type: values.type,
        amount: values.amount,
        description: values.description,
        occurredAt: values.occurredAt,
      });
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success(
        values.type === 'EXPENSE' ? 'Expense added' : 'Income added',
      );
      onClose();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Could not save transaction'));
    } finally {
      setSubmitting(false);
    }
  }

  return (

      <div className="p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-foreground">Add transaction</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Log a {defaultType === 'EXPENSE' ? 'money out' : 'money in'} movement.
        </p>
        <div className="mt-6">
          <TransactionForm
            defaultType={defaultType}
            onSubmit={handleSubmit}
            onCancel={onClose}
            isSubmitting={submitting}
          />
        </div>
      </div>
  );
}
