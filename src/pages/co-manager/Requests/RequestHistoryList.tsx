import { useEffect, useMemo, useState } from 'react';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DataTable, type DataTableColumn } from '../../../components/common/DataTable';
import Pagination from '../../../components/common/Pagination';
import { Toast } from '../../../components/common/Toast';
import sectionStyles from '../../../components/layout/section.module.css';
import { usePagination } from '../../../hooks/usePagination';
import { requestHistoryService } from '../../../services/requestHistory.service';
import type { HistoryStatusFilter, RequestHistoryListItem } from '../../../types/requestHistory.types';
import { formatDateTime } from '../../../utils/dateFormatter';

export default function RequestHistoryList() {
  const navigate = useNavigate();

  const pagination = usePagination({ page: 1, limit: 20, totalPages: 1, total: 0 });
  const [order, setOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [status, setStatus] = useState<HistoryStatusFilter>('rejected');
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<RequestHistoryListItem[]>([]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const response = await requestHistoryService.listCoManagerHistory({
        status,
        page: pagination.page,
        limit: pagination.limit,
        order,
      });
      if (response.success && response.data) {
        setItems(response.data.items);
        pagination.setFromApi({
          page: response.data.pagination.page,
          limit: response.data.pagination.limit,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.totalPages,
        });
      } else {
        Toast.error(response.error ?? 'فشل في جلب سجل الطلبات');
      }
    } catch (error: any) {
      Toast.error(error.response?.data?.error ?? 'حدث خطأ أثناء جلب سجل الطلبات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [pagination.page, pagination.limit, order, status]);

  const columns: Array<DataTableColumn<RequestHistoryListItem>> = useMemo(
    () => [
      { header: 'المعاملة', render: row => row.transaction.name },
      { header: 'المواطن', render: row => row.citizen.name },
      { header: 'الحالة', render: row => row.requestStatus },
      { header: 'آخر قسم', render: row => `${row.lastProgress.stepOrder} • ${row.lastProgress.sectionName}` },
      { header: 'آخر تحديث', render: row => formatDateTime(row.updatedAt) },
      {
        header: '',
        render: row => (
          <button
            type="button"
            onClick={() => navigate(`/dashboard/co-manager/requests/history/${row.requestId}`)}
            className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-outine)] bg-transparent px-3 py-2 font-semibold hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)] transition-colors"
          >
            <Eye size={16} />
            التفاصيل
          </button>
        ),
      },
    ],
    [navigate]
  );

  return (
    <div className={sectionStyles.section}>
      <div className={sectionStyles.titleContainer}>
        <div className={sectionStyles.sectionTitle}>سجل الطلبات</div>
        <div className={sectionStyles.line} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-[var(--color-sub-text)]">{!isLoading && `الإجمالي: ${pagination.total}`}</div>
        <div className="flex flex-wrap items-center gap-3 text-sm font-semibold">
          <div className="flex items-center gap-2">
            <span className="text-[var(--color-sub-text)]">الحالة:</span>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as HistoryStatusFilter);
                pagination.setPage(1);
              }}
              className="rounded-2xl border border-[var(--color-outine)] bg-[var(--color-section)] px-3 py-2"
            >
              <option value="rejected">مرفوضة</option>
              <option value="completed">مكتملة</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[var(--color-sub-text)]">الترتيب:</span>
            <select
              value={order}
              onChange={(e) => setOrder(e.target.value as 'ASC' | 'DESC')}
              className="rounded-2xl border border-[var(--color-outine)] bg-[var(--color-section)] px-3 py-2"
            >
              <option value="DESC">الأحدث أولاً (DESC)</option>
              <option value="ASC">الأقدم أولاً (ASC)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[var(--color-sub-text)]">عدد السجلات:</span>
            <select
              value={pagination.limit}
              onChange={(e) => pagination.setLimit(Number(e.target.value))}
              className="rounded-2xl border border-[var(--color-outine)] bg-[var(--color-section)] px-3 py-2"
            >
              {[10, 20, 50].map(v => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <DataTable
          columns={columns}
          rows={items}
          rowKey={(r) => r.requestId}
          emptyText="لا يوجد سجل مطابق"
          isLoading={isLoading}
        />
      </div>

      <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={pagination.setPage} />
    </div>
  );
}

