import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { Skeleton } from './Skeleton';
import styles from './DataTable.module.css';

export type DataTableColumn<T> = {
  header: ReactNode;
  render: (row: T) => ReactNode;
  className?: string;
};

type DataTableProps<T> = {
  columns: Array<DataTableColumn<T>>;
  rows: T[];
  rowKey: (row: T) => string;
  emptyText?: string;
  isLoading?: boolean;
};

export function DataTable<T>({ columns, rows, rowKey, emptyText, isLoading }: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className={styles.tableContainer}>
        <table className={styles.customTable}>
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={col.className}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, r) => (
              <tr key={r}>
                {columns.map((_, c) => (
                  <td key={c}>
                    <Skeleton className="h-5 w-full" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.customTable}>
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className={col.className}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="animate-stagger">
          {rows.length ? (
            rows.map((row) => (
              <tr key={rowKey(row)} className="transition-colors">
                {columns.map((col, idx) => (
                  <td key={idx} className={col.className}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length}>
                <div className="flex flex-col items-center justify-center py-12 text-[var(--color-sub-text)]">
                  <Inbox size={48} className="mb-3 opacity-40" />
                  <span className="text-sm">{emptyText ?? 'لا توجد بيانات'}</span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
