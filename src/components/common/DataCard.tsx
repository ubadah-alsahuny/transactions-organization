export default function DataCard({ data, title }: { data: Record<string, any>; title?: string }) {
  if (!data || Object.keys(data).length === 0) return null;

  return (
    <div className="flex flex-col gap-2 mt-2" dir="rtl">
      {title ? (
        <div className="text-sm font-semibold text-[var(--color-sub-text)] border-b border-[var(--color-outine)] pb-1">
          {title}
        </div>
      ) : null}
      {Object.entries(data).map(([key, value]) => (
        <div
          key={key}
          className="bg-[var(--color-section)] p-3 rounded-xl border border-[var(--color-outine)] flex flex-col gap-1"
        >
          <div className="text-xs text-[var(--color-sub-text)] font-mono font-bold text-[var(--color-action)]">
            {key}
          </div>
          <div className="text-sm font-medium break-words whitespace-pre-wrap text-[var(--color-text)]">
            {typeof value === 'boolean'
              ? value
                ? 'نعم'
                : 'لا'
              : typeof value === 'object'
                ? JSON.stringify(value)
                : String(value)}
          </div>
        </div>
      ))}
    </div>
  );
}

