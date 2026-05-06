import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toDatetimeLocalValue } from '@/lib/date';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

export type TransactionFormValues = {
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string | null;
  occurredAt: string;
};

type TransactionFormFields = {
  type: 'INCOME' | 'EXPENSE';
  amount: string;
  description: string;
  occurredAt: string;
};

type TransactionFormProps = {
  defaultType: 'INCOME' | 'EXPENSE';
  onSubmit: (values: TransactionFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
};

function toPayload(data: TransactionFormFields): TransactionFormValues {
  const num = Number.parseFloat(data.amount);
  return {
    type: data.type,
    amount: num,
    description: data.description.trim() ? data.description.trim() : null,
    occurredAt: new Date(data.occurredAt).toISOString(),
  };
}

export function TransactionForm({
  defaultType,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: TransactionFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormFields>({
    defaultValues: {
      type: defaultType,
      amount: '',
      description: '',
      occurredAt: toDatetimeLocalValue(new Date()),
    },
  });

  const type = watch('type');

  useEffect(() => {
    setValue('type', defaultType);
  }, [defaultType, setValue]);

  return (
    <form
      onSubmit={(e) =>
        void handleSubmit(async (data) => {
          await onSubmit(toPayload(data));
        })(e)
      }
      className="space-y-4 px-1 pb-1"
    >
      <div className="space-y-2">
        <Label>Type</Label>
        <div className="flex gap-2">
          <button
            type="button"
            className={cn(
              'flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
              type === 'EXPENSE'
                ? 'border-foreground bg-foreground text-background'
                : 'border-border bg-background hover:bg-muted',
            )}
            onClick={() => setValue('type', 'EXPENSE', { shouldValidate: true })}
          >
            Expense
          </button>
          <button
            type="button"
            className={cn(
              'flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
              type === 'INCOME'
                ? 'border-foreground bg-foreground text-background'
                : 'border-border bg-background hover:bg-muted',
            )}
            onClick={() => setValue('type', 'INCOME', { shouldValidate: true })}
          >
            Income
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tx-amount" required>
          Amount
        </Label>
        <Input
          id="tx-amount"
          inputMode="decimal"
          placeholder="0.00"
          aria-invalid={errors.amount ? 'true' : 'false'}
          {...register('amount', {
            required: 'Amount is required',
            validate: (v) => {
              const n = Number.parseFloat(String(v));
              if (Number.isNaN(n) || n <= 0) {
                return 'Enter an amount greater than 0';
              }
              return true;
            },
          })}
        />
        {errors.amount?.message ? (
          <p className="text-sm text-destructive">{errors.amount.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="tx-date">Date & time</Label>
        <Input
          id="tx-date"
          type="datetime-local"
          aria-invalid={errors.occurredAt ? 'true' : 'false'}
          {...register('occurredAt', {
            required: 'Date and time is required',
          })}
        />
        {errors.occurredAt?.message ? (
          <p className="text-sm text-destructive">{errors.occurredAt.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="tx-desc">Description</Label>
        <Input
          id="tx-desc"
          placeholder="Optional note"
          {...register('description')}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  );
}
