import { useNavigate, useParams } from 'react-router-dom';
import IntialDataKeyForm from '../../../../components/forms/IntialDataKeyForm';
import { Toast } from '../../../../components/common/Toast';
import sectionStyles from '../../../../components/layout/section.module.css';
import { templatesService } from '../../../../services/templates.service';
import type { IntialDataKeyFormData } from '../../../../schemas/intialDataKey.schema';

export default function AddIntialDataKey() {
  const { templateId } = useParams();
  const navigate = useNavigate();

  const submit = async (data: IntialDataKeyFormData) => {
    if (!templateId) return;
    try {
      const response = await templatesService.addIntialDataKey(templateId, data);
      if (response.success) {
        Toast.success('تمت إضافة المفتاح');
        navigate(-1);
        return;
      }
      Toast.error(response.error ?? 'فشل إضافة المفتاح');
    } catch (error: any) {
      Toast.error(error.response?.data?.error ?? 'حدث خطأ أثناء إضافة المفتاح');
    }
  };

  return (
    <div className={sectionStyles.section}>
      <div className={sectionStyles.titleContainer}>
        <div className={sectionStyles.sectionTitle}>إضافة مفتاح</div>
        <div className={sectionStyles.line} />
      </div>

      <IntialDataKeyForm
        mode="single"
        submitLabel="إضافة"
        onCancel={() => navigate(-1)}
        onSubmit={submit}
      />
    </div>
  );
}
