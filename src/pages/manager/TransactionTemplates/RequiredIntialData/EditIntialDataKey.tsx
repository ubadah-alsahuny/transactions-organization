import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import IntialDataKeyForm from '../../../../components/forms/IntialDataKeyForm';
import { Toast } from '../../../../components/common/Toast';
import sectionStyles from '../../../../components/layout/section.module.css';
import { templatesService } from '../../../../services/templates.service';
import type { IntialDataKeyFormData } from '../../../../schemas/intialDataKey.schema';
import type { IntialDataKey } from '../../../../types/intialData.types';

export default function EditIntialDataKey() {
  const { keyId } = useParams();
  const navigate = useNavigate();
  const [key, setKey] = useState<IntialDataKey | null>(null);

  useEffect(() => {
    setKey(null);
  }, [keyId]);

  const submit = async (data: IntialDataKeyFormData) => {
    if (!keyId) return;
    try {
      const response = await templatesService.updateIntialDataKey(keyId, data);
      if (response.success) {
        Toast.success('تم تحديث المفتاح');
        navigate(-1);
        return;
      }
      Toast.error(response.error ?? 'فشل تحديث المفتاح');
    } catch (error: any) {
      Toast.error(error.response?.data?.error ?? 'حدث خطأ أثناء تحديث المفتاح');
    }
  };

  return (
    <div className={sectionStyles.section}>
      <div className={sectionStyles.titleContainer}>
        <div className={sectionStyles.sectionTitle}>تعديل مفتاح</div>
        <div className={sectionStyles.line} />
      </div>

      <IntialDataKeyForm
        mode="single"
        initialValues={{
          keyName: key?.keyName,
          keyType: key?.keyType as any,
          isRequired: key?.isRequired,
        }}
        submitLabel="تحديث"
        onCancel={() => navigate(-1)}
        onSubmit={submit}
      />
    </div>
  );
}
