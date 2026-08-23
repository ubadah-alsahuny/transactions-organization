import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Users } from 'lucide-react';
import { Toast } from '../../../components/common/Toast';
import { DataTable, type DataTableColumn } from '../../../components/common/DataTable';
import Pagination from '../../../components/common/Pagination';
import Modal from '../../../components/common/Modal';
import { employeesService } from '../../../services/employees.service';
import { sectionsService } from '../../../services/sections.service';
import { usePagination } from '../../../hooks/usePagination';
import type { EmployeeListItem } from '../../../types/employee.types';
import type { SectionListItem } from '../../../types/section.types';
import { formatDateTime } from '../../../utils/dateFormatter';
import { Select } from '../../../components/common/Select';
import sectionStyles from '../../../components/layout/section.module.css';
import { useAuthStore } from '../../../stores/authStore';
import { compareDate, compareNullableText, compareText, type SortDirection, withDirection } from '../../../utils/sorting';

type AssignMode = 'assign' | 'transition';
type EmployeeSortKey = 'name' | 'hired_at' | 'section';

export default function EmployeesList() {
  const currentUser = useAuthStore(state => state.user);

  const pagination = usePagination({ page: 1, limit: 13, totalPages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [sections, setSections] = useState<SectionListItem[]>([]);

  const [assignMode, setAssignMode] = useState<AssignMode>('assign');
  const [targetEmployee, setTargetEmployee] = useState<EmployeeListItem | null>(null);
  const [targetSectionId, setTargetSectionId] = useState('');
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const [sortKey, setSortKey] = useState<EmployeeSortKey>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const activeSections = useMemo(() => sections.filter(s => s.is_active), [sections]);

  const loadSections = async () => {
    try {
      const res = await sectionsService.listCoManagerSections({ include_inactive: true });
      if (res.success && res.data) setSections(res.data);
      else Toast.error(res.error ?? 'فشل في جلب الأقسام');
    } catch (error: any) {
      Toast.error(error.response?.data?.error ?? 'حدث خطأ أثناء جلب الأقسام');
    }
  };

  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      const res = await employeesService.listAllCoManagerEmployees({ page: pagination.page, limit: pagination.limit });
      if (res.success && res.data) {
        setEmployees(res.data.items);
        pagination.setFromApi(res.data.pagination);
      } else {
        Toast.error(res.error ?? 'فشل في جلب الموظفين');
      }
    } catch (error: any) {
      Toast.error(error.response?.data?.error ?? 'حدث خطأ أثناء جلب الموظفين');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSections();
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [pagination.page, pagination.limit]);

  const openAssign = (employee: EmployeeListItem, mode: AssignMode) => {
    setTargetEmployee(employee);
    setAssignMode(mode);
    setTargetSectionId('');
    setIsAssignOpen(true);
  };

  const submitAssign = async () => {
    if (!targetEmployee) return;
    if (!targetSectionId) {
      Toast.error('القسم مطلوب');
      return;
    }

    setIsAssigning(true);
    try {
      let isSuccess = false;
      if (assignMode === 'assign') {
        const res = await employeesService.assignToSectionCoManager({ employeeId: targetEmployee.user_id, sectionId: targetSectionId });
        if (res.success) {
          Toast.success('تم تعيين الموظف إلى القسم');
          isSuccess = true;
        } else Toast.error(res.error ?? 'فشل تعيين الموظف');
      } else {
        const res = await employeesService.transitionToSectionCoManager({ employeeId: targetEmployee.user_id, sectionId: targetSectionId });
        if (res.success) {
          Toast.success(res.data?.message ?? 'تم نقل الموظف');
          isSuccess = true;
        } else Toast.error(res.error ?? 'فشل نقل الموظف');
      }
      setIsAssignOpen(false);
      if (isSuccess) {
        await loadEmployees();
        await loadSections();
      }
    } catch (error: any) {
      Toast.error(error.response?.data?.error ?? 'حدث خطأ أثناء العملية');
    } finally {
      setIsAssigning(false);
    }
  };

  const sectionOptions = activeSections.map(s => ({
    value: s.id,
    label: `${s.name} • ${s.employees_count} موظف`,
  }));

  const toggleSort = (nextKey: EmployeeSortKey) => {
    if (sortKey !== nextKey) {
      setSortKey(nextKey);
      setSortDirection('asc');
      return;
    }
    setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const employeesSorted = useMemo(() => {
    const list = [...employees];
    list.sort((a, b) => {
      if (sortKey === 'name') return withDirection(compareText(a.full_name, b.full_name), sortDirection);
      if (sortKey === 'hired_at') return withDirection(compareDate(a.hired_at, b.hired_at), sortDirection);
      return withDirection(compareNullableText(a.section_name, b.section_name), sortDirection);
    });
    return list;
  }, [employees, sortDirection, sortKey]);

  const SortHeader = ({ label, columnKey }: { label: string; columnKey: EmployeeSortKey }) => {
    const isActive = sortKey === columnKey;
    const icon = isActive ? (sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />) : null;
    return (
      <button
        type="button"
        onClick={() => toggleSort(columnKey)}
        className="inline-flex items-center gap-2 font-bold text-white"
      >
        <span>{label}</span>
        {icon ? <span className="opacity-90">{icon}</span> : null}
      </button>
    );
  };

  const columns: Array<DataTableColumn<EmployeeListItem>> = [
    { header: <SortHeader label="الاسم" columnKey="name" />, render: row => row.full_name },
    { header: 'البريد الإلكتروني', render: row => row.email },
    { header: <SortHeader label="تاريخ التوظيف" columnKey="hired_at" />, render: row => formatDateTime(row.hired_at) },
    {
      header: <SortHeader label="القسم" columnKey="section" />,
      render: row => row.section_name ?? '—',
    },
    {
      header: 'الحالة',
      render: row => (
        <span
          className={[
            'inline-flex rounded-xl px-3 py-1 text-sm font-semibold',
            row.is_active
              ? 'bg-[color-mix(in_srgb,var(--color-action),transparent_85%)]'
              : 'bg-[color-mix(in_srgb,var(--color-danger),transparent_85%)]',
          ].join(' ')}
        >
          {row.is_active ? 'نشط' : 'مفصول'}
        </span>
      ),
    },
    {
      header: '',
      render: row => {
        const isSelf = currentUser?.id === row.user_id;
        const canAct = row.is_active && !isSelf;
        const canAssign = canAct && row.section_id === null;
        const canTransition = canAct && row.section_id !== null;

        return (
          <div className="flex flex-wrap gap-2">
            {canAssign ? (
              <button
                type="button"
                onClick={() => openAssign(row, 'assign')}
                className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-outine)] bg-transparent px-3 py-2 font-semibold hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)] transition-colors"
              >
                <Users size={18} />
                تعيين
              </button>
            ) : null}
            {canTransition ? (
              <button
                type="button"
                onClick={() => openAssign(row, 'transition')}
                className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-outine)] bg-transparent px-3 py-2 font-semibold hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)] transition-colors"
              >
                <Users size={18} />
                نقل
              </button>
            ) : null}
          </div>
        );
      },
    },
  ];

  return (
    <div className={sectionStyles.section}>
      <div className={sectionStyles.titleContainer}>
        <div className={sectionStyles.sectionTitle}>الموظفون</div>
        <div className={sectionStyles.line} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-[var(--color-sub-text)]">
          {isLoading ? 'جارٍ التحميل...' : `الإجمالي: ${pagination.total}`}
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span className="text-[var(--color-sub-text)]">عدد السجلات:</span>
          <select
            value={pagination.limit}
            onChange={(e) => pagination.setLimit(Number(e.target.value))}
            className="rounded-2xl border border-[var(--color-outine)] bg-[var(--color-section)] px-3 py-2"
          >
            {[10, 13, 20, 50].map(v => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5">
        <DataTable columns={columns} rows={employeesSorted} rowKey={(r) => r.user_id} emptyText="لا يوجد موظفون" />
      </div>

      <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={pagination.setPage} />

      <Modal
        open={isAssignOpen}
        title={assignMode === 'assign' ? 'تعيين الموظف إلى قسم' : 'نقل الموظف إلى قسم آخر'}
        onClose={() => setIsAssignOpen(false)}
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsAssignOpen(false)}
              className="rounded-2xl border border-[var(--color-outine)] bg-transparent px-5 py-2.5 font-semibold hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)] transition-colors"
              disabled={isAssigning}
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={submitAssign}
              className="rounded-2xl bg-[var(--color-action)] px-5 py-2.5 font-semibold text-[var(--color-text-button)] hover:bg-[var(--color-action-hover)] disabled:opacity-50 transition-colors"
              disabled={isAssigning}
            >
              {isAssigning ? 'جارٍ الحفظ...' : 'تأكيد'}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="text-sm text-[var(--color-sub-text)]">
            الموظف: <span className="font-semibold text-[var(--color-text)]">{targetEmployee?.full_name ?? '—'}</span>
          </div>
          <Select
            label="القسم"
            options={sectionOptions}
            placeholder="اختر القسم"
            value={targetSectionId}
            onChange={(e) => setTargetSectionId(e.target.value)}
          />
        </div>
      </Modal>

    </div>
  );
}
