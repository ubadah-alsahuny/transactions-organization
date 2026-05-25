import type { RequestHistoryStep } from '../../types/requestHistory.types';
import DataCard from './DataCard';
import { formatDateTime } from '../../utils/dateFormatter';

const statusStyles: Record<string, { badge: string; dot: string }> = {
  approved: { badge: 'bg-green-100 text-green-800', dot: 'bg-green-600' },
  rejected: { badge: 'bg-red-100 text-red-800', dot: 'bg-red-600' },
  waiting: { badge: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500' },
  in_progress: { badge: 'bg-blue-100 text-blue-800', dot: 'bg-blue-600' },
  completed: { badge: 'bg-green-100 text-green-800', dot: 'bg-green-600' },
};

export default function RequestHistoryTimeline({ steps }: { steps: RequestHistoryStep[] }) {
  return (
    <div className="relative">
      <div className="absolute right-4 top-0 h-full w-px bg-[var(--color-outine)]" />
      <div className="space-y-6">
        {steps
          .slice()
          .sort((a, b) => a.stepOrder - b.stepOrder)
          .map(step => {
            const style = statusStyles[step.status] ?? { badge: 'bg-gray-100 text-gray-800', dot: 'bg-gray-500' };
            return (
              <div key={step.id} className="relative pr-12">
                <div
                  className={[
                    'absolute right-[0.65rem] top-6 h-3 w-3 rounded-full ring-4 ring-[var(--color-primary)]',
                    style.dot,
                  ].join(' ')}
                />

                <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-bold">
                        الخطوة {step.stepOrder} • {step.sectionName}
                      </div>
                      <div className="mt-1 text-sm text-[var(--color-sub-text)]">
                        {step.institutionName} • {step.processor.name} ({step.processor.role})
                      </div>
                      <div className="mt-1 text-sm text-[var(--color-sub-text)]">{step.processor.email}</div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className={['rounded-full px-3 py-1 text-sm font-semibold', style.badge].join(' ')}>
                        {step.status}
                      </span>
                      {step.processedAt ? (
                        <div className="text-sm text-[var(--color-sub-text)]">{formatDateTime(step.processedAt)}</div>
                      ) : null}
                    </div>
                  </div>

                  {step.data && Object.keys(step.data).length > 0 ? <DataCard data={step.data} /> : null}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

