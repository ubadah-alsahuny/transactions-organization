import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Toast } from '../../../components/common/Toast';
import { sectionsService } from '../../../services/sections.service';
import type { SectionListItem } from '../../../types/section.types';
import sectionStyles from '../../../components/layout/section.module.css';

export default function SectionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [section, setSection] = useState<SectionListItem | null>(null);

  useEffect(() => {
    const fetchSection = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        // Co-manager doesn't have a dedicated get-by-id endpoint,
        // so we fetch the full list and find the matching section.
        const res = await sectionsService.listCoManagerSections({ include_inactive: true });
        if (res.success && res.data) {
          const found = res.data.find(s => s.id === id) ?? null;
          if (found) setSection(found);
          else Toast.error('القسم غير موجود');
        } else {
          Toast.error(res.error ?? 'فشل في جلب بيانات القسم');
        }
      } catch (error: any) {
        Toast.error(error.response?.data?.error ?? 'حدث خطأ أثناء جلب بيانات القسم');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSection();
  }, [id]);

  return (
    <div className={sectionStyles.section}>
      <div className={sectionStyles.titleContainer}>
        <div className={sectionStyles.sectionTitle}>تفاصيل القسم</div>
        <div className={sectionStyles.line} />
      </div>

      <div className="mb-5">
        <button
          type="button"
          onClick={() => navigate('/dashboard/co-manager/sections')}
          className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-outine)] bg-transparent px-4 py-2 font-semibold hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)] transition-colors"
        >
          <ArrowLeft size={18} />
          العودة للقائمة
        </button>
      </div>

      <div className="mt-6 grid gap-4">
        {isLoading ? (
          <div className="text-[var(--color-sub-text)]">جارٍ التحميل...</div>
        ) : section ? (
          <>
            <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-5">
              <div className="text-sm text-[var(--color-sub-text)]">الاسم</div>
              <div className="mt-1 font-bold">{section.name}</div>
            </div>
            <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-5">
              <div className="text-sm text-[var(--color-sub-text)]">الوصف</div>
              <div className="mt-1 font-semibold">{section.description}</div>
            </div>
            <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-5">
              <div className="text-sm text-[var(--color-sub-text)]">الحالة</div>
              <div className="mt-1 font-semibold">{section.is_active ? 'مفعّل' : 'معطّل'}</div>
            </div>
            <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-5">
              <div className="text-sm text-[var(--color-sub-text)]">عدد الموظفين</div>
              <div className="mt-1 font-semibold">{section.employees_count}</div>
            </div>
          </>
        ) : (
          <div className="text-[var(--color-sub-text)]">القسم غير موجود</div>
        )}
      </div>
    </div>
  );
}
