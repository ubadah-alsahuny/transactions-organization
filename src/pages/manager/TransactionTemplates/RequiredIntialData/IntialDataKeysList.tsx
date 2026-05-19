import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Toast } from '../../../../components/common/Toast';
import sectionStyles from '../../../../components/layout/section.module.css';
import { templatesService } from '../../../../services/templates.service';
import type { TemplateIntialDataResponse } from '../../../../types/intialData.types';
import { formatDateTime } from '../../../../utils/dateFormatter';

export default function IntialDataKeysList() {
  const { templateId } = useParams();
  const [data, setData] = useState<TemplateIntialDataResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchKeys = async () => {
      if (!templateId) return;
      setIsLoading(true);
      try {
        const response = await templatesService.getRequiredIntialData(templateId);
        if (response.success && response.data) setData(response.data);
        else Toast.error(response.error ?? 'فشل في جلب المفاتيح');
      } catch (error: any) {
        Toast.error(error.response?.data?.error ?? 'حدث خطأ أثناء جلب المفاتيح');
      } finally {
        setIsLoading(false);
      }
    };
    fetchKeys();
  }, [templateId]);

  return (
    <div className={sectionStyles.section}>
      <div className={sectionStyles.titleContainer}>
        <div className={sectionStyles.sectionTitle}>المفاتيح الأولية</div>
        <div className={sectionStyles.line} />
      </div>

      {isLoading ? (
        <div className="text-[var(--color-sub-text)]">جارٍ التحميل...</div>
      ) : data?.keys.length ? (
        <div className="space-y-3">
          {data.keys.map(key => (
            <div
              key={key.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--color-outine)] bg-[var(--color-section)] px-4 py-3"
            >
              <div>
                <div className="font-semibold">{key.keyName}</div>
                <div className="text-sm text-[var(--color-sub-text)]">
                  النوع: {key.keyType} • أضيف في: {formatDateTime(key.createdAt)}
                </div>
              </div>
              <div
                className={[
                  'inline-flex rounded-xl px-3 py-1 text-sm font-semibold',
                  key.isRequired
                    ? 'bg-[color-mix(in_srgb,var(--color-action),transparent_85%)]'
                    : 'bg-[color-mix(in_srgb,var(--color-danger),transparent_85%)]',
                ].join(' ')}
              >
                {key.isRequired ? 'إجباري' : 'اختياري'}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-[var(--color-sub-text)]">لا توجد مفاتيح.</div>
      )}
    </div>
  );
}
