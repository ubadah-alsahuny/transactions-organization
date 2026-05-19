import { useNavigate, useParams } from 'react-router-dom';
import IntialDataKeyForm from '../../../../components/forms/IntialDataKeyForm';
import { Toast } from '../../../../components/common/Toast';
import sectionStyles from '../../../../components/layout/section.module.css';
import { templatesService } from '../../../../services/templates.service';
import type { BulkIntialDataKeysFormData } from '../../../../schemas/intialDataKey.schema';

export default function BulkAddIntialDataKeys() {
  const { templateId } = useParams();
  const navigate = useNavigate();

  const submit = async (data: BulkIntialDataKeysFormData) => {
    if (!templateId) return;
    try {
      const response = await templatesService.bulkAddIntialDataKeys(templateId, { items: data.items });
      if (response.success) {
        Toast.success('تمت إضافة المفاتيح');
        navigate(-1);
        return;
      }
      Toast.error(response.error ?? 'فشل إضافة المفاتيح');
    } catch (error: any) {
      Toast.error(error.response?.data?.error ?? 'حدث خطأ أثناء إضافة المفاتيح');
    }
  };

  return (
    <div className={sectionStyles.section}>
      <div className={sectionStyles.titleContainer}>
        <div className={sectionStyles.sectionTitle}>إضافة مفاتيح بالجملة</div>
        <div className={sectionStyles.line} />
      </div>

      <IntialDataKeyForm
        mode="bulk"
        submitLabel="إضافة"
        onCancel={() => navigate(-1)}
        onSubmit={submit}
      />
    </div>
  );
}
