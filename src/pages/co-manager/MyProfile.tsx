import { useEffect, useState  } from 'react';
import { Pencil , KeyRound } from 'lucide-react';
import sectionStyles from '../../components/layout/section.module.css';
import { Toast } from '../../components/common/Toast';
import Modal from '../../components/common/Modal';
import ProfileUpdateForm from '../../components/forms/ProfileUpdateForm';
import { employeesService } from '../../services/employees.service';
import type { EmployeeProfile } from '../../types/employee.types';
import { formatDateTime } from '../../utils/dateFormatter';
import { useUIStore } from '../../stores/uiStore';
import { useAuthStore } from '../../stores/authStore';
import ChangePasswordModal from "../../components/common/ChangePasswordModal.tsx";

export default function MyProfile() {
  const setHeaderActions = useUIStore(state => state.setHeaderActions);
  const updateUser = useAuthStore(state => state.updateUser);

  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [showChangePassword, setShowChangePassword] = useState(false);


  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const response = await employeesService.getCoManagerProfile();
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

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    setHeaderActions(
        <div>
        <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-action)] px-4 py-2 font-semibold text-[var(--color-text-button)] hover:bg-[var(--color-action-hover)] transition-colors m-2"
        >
          <Pencil size={18}/>
          تعديل البيانات
        </button>

    <button
        type="button"
        onClick={() => setShowChangePassword(true)}
        className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-action)] px-4 py-2 font-semibold text-[var(--color-text-button)] hover:bg-[var(--color-action-hover)] transition-colors"
    >
      <KeyRound size={18}/>
      تغيير كلمة المرور
    </button>
        </div>
  )
    ;
    return () => setHeaderActions(null);
  }, [setHeaderActions]);

  const handleUpdate = async (data: { email?: string; fullName?: string }) => {
    try {
      const response = await employeesService.updateCoManagerProfile(data);
      if (response.success) {
        if (data.email) updateUser({ email: data.email });
        Toast.success('تم تحديث البيانات بنجاح');
        setIsEditOpen(false);
        await fetchProfile();
      } else {
        Toast.error(response.error ?? 'فشل في تحديث البيانات');
      }
    } catch (error: any) {
      Toast.error(error.response?.data?.error ?? 'حدث خطأ أثناء تحديث البيانات');
    }
  };

  return (
    <div className={sectionStyles.section}>
      <div className={sectionStyles.titleContainer}>
        <div className={sectionStyles.sectionTitle}>حسابي (الملف الشخصي)</div>
        <div className={sectionStyles.line} />
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
            <div className="mt-1 font-semibold">{profile.currentSectionsCount ?? '—'}</div>
          </div>

          <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-5">
            <div className="text-sm text-[var(--color-sub-text)]">تاريخ التعيين</div>
            <div className="mt-1 font-semibold">{formatDateTime(profile.hiredAt)}</div>
          </div>

          <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-primary)] p-5">
            <div className="text-sm text-[var(--color-sub-text)]">حالة الحساب</div>
            <div className="mt-1">
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  profile.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {profile.isActive ? 'نشط' : 'غير نشط'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-[var(--color-sub-text)]">لم يتم العثور على بيانات الملف الشخصي</div>
      )}

      <Modal open={isEditOpen} title="تعديل الملف الشخصي" onClose={() => setIsEditOpen(false)}>
        <ProfileUpdateForm
          initialEmail={profile?.email}
          initialFullName={profile?.fullName}
          onCancel={() => setIsEditOpen(false)}
          onSubmit={handleUpdate}
        />
      </Modal>

      <ChangePasswordModal open={showChangePassword} onClose={() => setShowChangePassword(false)} />

    </div>
  );
}

