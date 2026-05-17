import { useEffect, useMemo, useState } from 'react';
import { Eye, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Modal from '../../../components/common/Modal';
import SectionForm from '../../../components/forms/SectionForm';
import { DataTable, type DataTableColumn } from '../../../components/common/DataTable';
import { Toast } from '../../../components/common/Toast';
import { sectionsService } from '../../../services/sections.service';
import { useUIStore } from '../../../stores/uiStore';
import type { SectionListItem } from '../../../types/section.types';
import sectionStyles from '../../../components/layout/section.module.css';

export default function SectionsList() {
  const navigate = useNavigate();
  const setHeaderActions = useUIStore(state => state.setHeaderActions);

  const [includeInactive, setIncludeInactive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sections, setSections] = useState<SectionListItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSections = async () => {
    setIsLoading(true);
    try {
      const res = await sectionsService.listManagerSections({ include_inactive: includeInactive });
      if (res.success && res.data) setSections(res.data);
      else Toast.error(res.error ?? 'فشل في جلب الأقسام');
    } catch (error: any) {
      Toast.error(error.response?.data?.error ?? 'حدث خطأ أثناء جلب الأقسام');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, [includeInactive]);

  useEffect(() => {
    setHeaderActions(
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-action)] px-4 py-2 font-semibold text-[var(--color-text-button)] hover:bg-[var(--color-action-hover)] transition-colors"
      >
        <Plus size={18} />
        إضافة قسم جديد
      </button>
    );
    return () => setHeaderActions(null);
  }, [setHeaderActions]);

  const columns: Array<DataTableColumn<SectionListItem>> = useMemo(
    () => [
      { header: 'الاسم', render: row => row.name },
      { header: 'الوصف', render: row => row.description },
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
            {row.is_active ? 'مفعّل' : 'معطّل'}
          </span>
        ),
      },
      { header: 'عدد الموظفين', render: row => row.employees_count.toString() },
      {
        header: '',
        render: row => (
          <button
            type="button"
            onClick={() => navigate(`/dashboard/manager/sections/${row.id}`)}
            className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-outine)] bg-transparent px-4 py-2 font-semibold hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)] transition-colors"
          >
            <Eye size={18} />
            تفاصيل
          </button>
        ),
      },
    ],
    [navigate]
  );

  const createSection = async (data: { name: string; description: string }) => {
    try {
      const res = await sectionsService.createManagerSection(data);
      if (res.success) {
        Toast.success('تم إنشاء القسم بنجاح');
        setIsModalOpen(false);
        fetchSections();
        return;
      }
      Toast.error(res.error ?? 'فشل إنشاء القسم');
      fetchSections();
    } catch (error: any) {
      Toast.error(error.response?.data?.error ?? 'حدث خطأ أثناء إنشاء القسم');
      fetchSections();
    }
  };

  return (
    <div className={sectionStyles.section}>
      <div className={sectionStyles.titleContainer}>
        <div className={sectionStyles.sectionTitle}>الأقسام</div>
        <div className={sectionStyles.line} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-[var(--color-sub-text)]">
          {isLoading ? 'جارٍ التحميل...' : `عدد الأقسام: ${sections.length}`}
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={(e) => setIncludeInactive(e.target.checked)}
            className="h-4 w-4 rounded border-[var(--color-outine)]"
          />
          عرض الأقسام المعطّلة
        </label>
      </div>

      <div className="mt-5">
        <DataTable columns={columns} rows={sections} rowKey={(r) => r.id} emptyText="لا توجد أقسام" />
      </div>

      <Modal open={isModalOpen} title="إضافة قسم جديد" onClose={() => setIsModalOpen(false)}>
        <SectionForm submitLabel="إضافة" onCancel={() => setIsModalOpen(false)} onSubmit={createSection} />
      </Modal>
    </div>
  );
}
