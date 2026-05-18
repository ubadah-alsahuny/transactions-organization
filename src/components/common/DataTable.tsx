import type { ReactNode } from 'react';
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
};

export function DataTable<T>({ columns, rows, rowKey, emptyText }: DataTableProps<T>) {
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
          {rows.length ? (
            rows.map((row) => (
              <tr key={rowKey(row)}>
                {columns.map((col, idx) => (
                  <td key={idx} className={col.className}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="py-6 text-center text-[var(--color-sub-text)]">
                {emptyText ?? 'لا توجد بيانات'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
