import { cn } from '@/lib/utils';
import { Plus, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type QuickAddOption = {
  id: 'expense' | 'income';
  label: string;
  icon: typeof TrendingDown;
};

const options: QuickAddOption[] = [
  { id: 'expense', label: 'Add expense', icon: TrendingDown },
  { id: 'income', label: 'Add income', icon: TrendingUp },
];

export function QuickAddFab() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  function handleOption(id: QuickAddOption['id']) {
    setOpen(false);
    const param = id === 'expense' ? 'expense' : 'income';
    navigate(`/transactions?add=${param}`);
  }

  return (
    <div ref={rootRef} className="fixed bottom-6 right-6 z-40">
      {open ? (
        <div
          className="absolute bottom-full right-0 mb-3 min-w-[220px] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg"
          role="menu"
          aria-label="Quick add options"
        >
          <div className="p-1">
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                role="menuitem"
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium',
                  'hover:bg-muted focus-visible:bg-muted focus-visible:outline-none',
                )}
                onClick={() => handleOption(option.id)}
              >
                <option.icon className="size-4 shrink-0 opacity-80" aria-hidden />
                {option.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        className={cn(
          'flex size-14 cursor-pointer items-center justify-center rounded-full bg-black text-white shadow-lg transition',
          'hover:bg-black/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
          'dark:bg-white dark:text-black dark:hover:bg-white/90',
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={open ? 'Close quick add menu' : 'Open quick add menu'}
        onClick={() => setOpen((prev) => !prev)}
      >
        <Plus
          className={cn('size-7 stroke-[2.5] transition-transform', open && 'rotate-45')}
          aria-hidden
        />
      </button>
    </div>
  );
}
