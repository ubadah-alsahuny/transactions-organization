import { useEffect, useMemo, useState } from 'react';
import { Eye, FilePlus2, Power } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DataTable, type DataTableColumn } from '../../../components/common/DataTable';
import Modal from '../../../components/common/Modal';
import { Toast } from '../../../components/common/Toast';
import { ENV } from '../../../env';
import TemplateForm from '../../../components/forms/TemplateForm';
import sectionStyles from '../../../components/layout/section.module.css';
import { institutionService } from '../../../services/institution.service';
import { sectionsService } from '../../../services/sections.service';
import { templatesService } from '../../../services/templates.service';
import { useUIStore } from '../../../stores/uiStore';
import type { InstitutionListItem } from '../../../types/institution.types';
import type { SectionListItem } from '../../../types/section.types';
import type { TransactionTemplateListItem } from '../../../types/template.types';
import { formatDateTime } from '../../../utils/dateFormatter';

export default function TemplatesList() {
  const navigate = useNavigate();
  const setHeaderActions = useUIStore(state => state.setHeaderActions);

  const [isLoading, setIsLoading] = useState(true);
  const [templates, setTemplates] = useState<TransactionTemplateListItem[]>([]);
  const [sections, setSections] = useState<SectionListItem[]>([]);
  const [institutions, setInstitutions] = useState<InstitutionListItem[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [toggleTarget, setToggleTarget] = useState<TransactionTemplateListItem | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  const activeSections = useMemo(() => sections.filter(section => section.is_active), [sections]);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await templatesService.listManagerTemplates();
      if (response.success && response.data) {
        setTemplates(response.data);
      } else {
        Toast.error(response.error ?? 'فشل في جلب قوالب المعاملات');
      }
    } catch (error: any) {
      Toast.error(error.response?.data?.error ?? 'حدث خطأ أثناء جلب قوالب المعاملات');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSections = async () => {
    try {
      const response = await sectionsService.listManagerSections({ include_inactive: false });
      if (response.success && response.data) {
        setSections(response.data);
      }
    } catch {
    }
  };

  const fetchInstitutions = async () => {
    try {
      const response = await institutionService.listManagerInstitutions({ page: 1, limit: 20 });
      if (response.success && response.data) {
        setInstitutions(response.data.items);
      } else if (response.error) {
        Toast.error(response.error);
      }
    } catch (error: any) {
      Toast.error(error.response?.data?.error ?? 'حدث خطأ أثناء جلب المؤسسات');
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchSections();
    fetchInstitutions();
  }, []);

  useEffect(() => {
    setHeaderActions(
      <button
        type="button"
        onClick={() => {
          if (!activeSections.length) {
            Toast.error('يجب أن يكون لديك قسم واحد فعّال على الأقل لإنشاء قالب');
            return;
          }
          setIsCreateOpen(true);
        }}
        className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-action)] px-4 py-2 font-semibold text-[var(--color-text-button)] hover:bg-[var(--color-action-hover)] transition-colors"
      >
        <FilePlus2 size={18} />
        إنشاء قالب جديد
      </button>
    );
    return () => setHeaderActions(null);
  }, [activeSections.length, setHeaderActions]);

  const createTemplate = async (data: { name: string; description: string; steps: string[] }) => {
    try {
      const response = await templatesService.createManagerTemplate(data);
      if (response.success) {
        Toast.success('تم إنشاء القالب بنجاح');
        setIsCreateOpen(false);
        fetchTemplates();
        return;
      }
      Toast.error(response.error ?? 'فشل في إنشاء القالب');
    } catch (error: any) {
      Toast.error(error.response?.data?.error ?? 'حدث خطأ أثناء إنشاء القالب');
    }
  };

  const toggleTemplate = async () => {
    if (!toggleTarget) return;
    setIsToggling(true);
    try {
      const response = await templatesService.toggleManagerTemplateActive(toggleTarget.id);
      if (response.success) {
        Toast.success(toggleTarget.is_active ? 'تم إخفاء القالب' : 'تم إظهار القالب');
        setToggleTarget(null);
        fetchTemplates();
        return;
      }
      Toast.error(response.error ?? 'فشل تغيير حالة القالب');
    } catch (error: any) {
      Toast.error(error.response?.data?.error ?? 'حدث خطأ أثناء تغيير حالة القالب');
    } finally {
      setIsToggling(false);
    }
  };

  const columns: Array<DataTableColumn<TransactionTemplateListItem>> = [
    { header: 'الاسم', render: row => row.name },
    { header: 'الوصف', render: row => row.description },
    { header: 'تاريخ الإنشاء', render: row => formatDateTime(row.created_at) },
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
          {row.is_active ? 'ظاهر للعامة' : 'مخفي'}
        </span>
      ),
    },
    {
      header: '',
      render: row => (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate(`/dashboard/manager/templates/${row.id}`)}
            className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-outine)] bg-transparent px-3 py-2 font-semibold hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)] transition-colors"
          >
            <Eye size={16} />
            التفاصيل
          </button>
          <button
            type="button"
            onClick={() => setToggleTarget(row)}
            className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-danger)] px-3 py-2 font-semibold text-[var(--color-text-button)] hover:bg-[var(--color-danger-hover)] transition-colors"
          >
            <Power size={16} />
            {row.is_active ? 'إخفاء' : 'إظهار'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={sectionStyles.section}>
      <div className={sectionStyles.titleContainer}>
        <div className={sectionStyles.sectionTitle}>قوالب المعاملات</div>
        <div className={sectionStyles.line} />
      </div>

      <div className="text-[var(--color-sub-text)]">
        {!isLoading && `عدد القوالب: ${templates.length}`}
      </div>

      <div className="mt-5">
        <DataTable columns={columns} rows={templates} rowKey={row => row.id} emptyText="لا توجد قوالب معاملات" isLoading={isLoading} />
      </div>

      <Modal open={isCreateOpen} title="إنشاء قالب معاملة جديد" onClose={() => setIsCreateOpen(false)}>
        <TemplateForm
          defaultInstitutionSections={activeSections}
          institutions={institutions}
          ownInstitutionId={localStorage.getItem(ENV.INSTITUTION_ID_KEY) ?? ''}
          submitLabel="إنشاء"
          onCancel={() => setIsCreateOpen(false)}
          onSubmit={createTemplate}
        />
      </Modal>

      <Modal
        open={toggleTarget !== null}
        title={toggleTarget?.is_active ? 'تأكيد إخفاء القالب' : 'تأكيد إظهار القالب'}
        onClose={() => setToggleTarget(null)}
        footer={
          <>
            <button
              type="button"
              onClick={() => setToggleTarget(null)}
              className="rounded-2xl border border-[var(--color-outine)] bg-transparent px-5 py-2.5 font-semibold hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)] transition-colors"
              disabled={isToggling}
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={toggleTemplate}
              className="rounded-2xl bg-[var(--color-action)] px-5 py-2.5 font-semibold text-[var(--color-text-button)] hover:bg-[var(--color-action-hover)] disabled:opacity-50 transition-colors"
              disabled={isToggling}
            >
              {isToggling ? 'جارٍ التنفيذ...' : 'تأكيد'}
            </button>
          </>
        }
      >
        <div className="text-[var(--color-sub-text)] leading-relaxed">
          {toggleTarget?.is_active
            ? 'هل أنت متأكد من إخفاء هذا القالب عن المواطنين؟'
            : 'هل أنت متأكد من إظهار هذا القالب للمواطنين؟'}
        </div>
      </Modal>
    </div>
  );
}
