import { useEffect, useState } from 'react';
import sectionStyles from '../../components/layout/section.module.css';
import { Toast } from '../../components/common/Toast';
import { employeesService } from '../../services/employees.service';
import type { EmployeeProfile } from '../../types/employee.types';
import { formatDateTime } from '../../utils/dateFormatter';
import ChangePasswordModal from '../../components/common/ChangePasswordModal';
import { KeyRound } from 'lucide-react';

export default function MyProfile() {
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await employeesService.getEmployeeProfile();
        if (response.success && response.data) {
          setProfile(response.data);
        } else {
          Toast.error(response.error ?? 'فشل في جلب بيانات الملف الشخصي');
        }
      } catch (error: any) {
        Toast.error(error.response?.data?.error ?? 'حدث خطأ أثناء جلب البيانات');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className={sectionStyles.section}>
      <div className={sectionStyles.titleContainer}>
        <div className={sectionStyles.sectionTitle}>حسابي (الملف الشخصي)</div>
        <div className={sectionStyles.line} />
      </div>

      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={() => setShowChangePassword(true)}
          className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-outine)] bg-[var(--color-section)] px-4 py-2 font-semibold hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)] transition-colors"
        >
          <KeyRound size={18} />
          تغيير كلمة المرور
        </button>
      </div>

      {isLoading ? (
        <div className="text-[var(--color-sub-text)]">جارٍ التحميل...</div>
      ) : profile ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-5">
            <div className="text-sm text-[var(--color-sub-text)]">الاسم الكامل</div>
            <div className="mt-1 font-bold text-lg">{profile.fullName}</div>
          </div>
          
          <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-5">
            <div className="text-sm text-[var(--color-sub-text)]">البريد الإلكتروني</div>
            <div className="mt-1 font-semibold">{profile.email}</div>
          </div>

          <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-5">
            <div className="text-sm text-[var(--color-sub-text)]">المؤسسة</div>
            <div className="mt-1 font-semibold">{profile.institution.name}</div>
          </div>

          <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-5">
            <div className="text-sm text-[var(--color-sub-text)]">عدد الأقسام المعين بها</div>
            <div className="mt-1 font-semibold">{profile.currentSectionsCount}</div>
          </div>

          <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-5">
            <div className="text-sm text-[var(--color-sub-text)]">تاريخ التعيين</div>
            <div className="mt-1 font-semibold">{formatDateTime(profile.hiredAt)}</div>
          </div>

          <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-5">
            <div className="text-sm text-[var(--color-sub-text)]">حالة الحساب</div>
            <div className="mt-1">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${profile.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {profile.isActive ? 'نشط' : 'غير نشط'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-[var(--color-sub-text)]">لم يتم العثور على بيانات الملف الشخصي</div>
      )}

      <ChangePasswordModal open={showChangePassword} onClose={() => setShowChangePassword(false)} />
    </div>
  );
}
