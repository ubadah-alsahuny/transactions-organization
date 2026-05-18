import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from 'lucide-react';

type PaginationProps = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
};

export default function Pagination({ page, totalPages, onChange }: PaginationProps) {
  const safeTotal = Math.max(1, totalPages);

  const createPages = () => {
    const windowSize = 5;
    const half = Math.floor(windowSize / 2);
    let start = Math.max(1, page - half);
    let end = Math.min(safeTotal, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);
    const pages: number[] = [];
    for (let p = start; p <= end; p++) pages.push(p);
    return pages;
  };

  const pages = createPages();

  const btnBase =
    'inline-flex h-10 min-w-10 items-center justify-center rounded-2xl border border-[var(--color-outine)] bg-[var(--color-section)] px-3 font-semibold hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)] transition-colors disabled:opacity-50';

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
      <button type="button" className={btnBase} onClick={() => onChange(1)} disabled={page <= 1}>
        <ChevronLast size={18} />
      </button>
      <button type="button" className={btnBase} onClick={() => onChange(page - 1)} disabled={page <= 1}>
        <ChevronRight size={18} />
      </button>

      {pages.map(p => (
        <button
          key={p}
          type="button"
          className={[
            btnBase,
            p === page ? 'bg-[var(--color-action)] text-[var(--color-text)] hover:bg-[var(--color-action-hover)] hover:text-[var(--color-text-button)]' : '',
          ].join(' ')}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}

      <button type="button" className={btnBase} onClick={() => onChange(page + 1)} disabled={page >= safeTotal}>
        <ChevronLeft size={18} />
      </button>
      <button type="button" className={btnBase} onClick={() => onChange(safeTotal)} disabled={page >= safeTotal}>
        <ChevronFirst size={18} />
      </button>
    </div>
  );
}
