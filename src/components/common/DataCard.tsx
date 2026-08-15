import { ShieldCheck, ExternalLink } from 'lucide-react';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function DataCard({
  data,
  title,
  onVerifyUuid,
  onViewDetails,
}: {
  data: Record<string, any>;
  title?: string;
  onVerifyUuid?: (uuid: string) => void;
  onViewDetails?: (uuid: string) => void;
}) {
  if (!data || Object.keys(data).length === 0) return null;

  return (
    <div className="flex flex-col gap-2 mt-2" dir="rtl">
      {title ? (
        <div className="text-sm font-semibold text-[var(--color-sub-text)] border-b border-[var(--color-outine)] pb-1">
          {title}
        </div>
      ) : null}
      {Object.entries(data).map(([key, value]) => {
        const strValue = String(value);
        const isUuid = typeof value === 'string' && UUID_REGEX.test(strValue);

        return (
          <div
            key={key}
            className="bg-[var(--color-section)] p-3 rounded-xl border border-[var(--color-outine)] flex flex-col gap-1"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs text-[var(--color-sub-text)] font-mono font-bold text-[var(--color-action)]">
                {key}
              </div>
              {isUuid && (onVerifyUuid || onViewDetails) && (
                <div className="flex gap-2">
                  {onViewDetails && (
                    <button
                      type="button"
                      onClick={() => onViewDetails(strValue)}
                      className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-action)] px-2 py-1 text-xs font-semibold text-[var(--color-action)] hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)] transition-all cursor-pointer"
                    >
                      <ExternalLink size={12} />
                      التفاصيل
                    </button>
                  )}
                  {onVerifyUuid && (
                    <button
                      type="button"
                      onClick={() => onVerifyUuid(strValue)}
                      className="inline-flex items-center gap-1 rounded-lg bg-[var(--color-action)] px-2 py-1 text-xs font-semibold text-white hover:opacity-90 transition-all cursor-pointer"
                    >
                      <ShieldCheck size={12} />
                      تحقق
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="text-sm font-medium break-words whitespace-pre-wrap text-[var(--color-text)]">
              {typeof value === 'boolean'
                ? value
                  ? 'نعم'
                  : 'لا'
                : typeof value === 'object'
                  ? JSON.stringify(value)
                  : strValue}
            </div>
          </div>
        );
      })}
    </div>
  );
}

