import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema, type ChangePasswordFormData } from '../../schemas/auth.schema';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../stores/authStore';
import Modal from './Modal';
import { Input } from './Input';
import { Button } from './Button';
import { Toast } from './Toast';

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    if (!user?.role) {
      Toast.error('خطأ في بيانات المستخدم');
      return;
    }

    setIsLoading(true);
    try {
      await authService.changePassword(
        user.role,
        data.oldPassword,
        data.newPassword,
        data.confirmPassword
      );
      Toast.success('تم تغيير كلمة المرور بنجاح');
      reset();
      onClose();
      logout();
      window.location.href = '/';
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      const backendError = axiosError.response?.data?.error;
      if (backendError === 'invalid old password') {
        Toast.error('كلمة المرور الحالية غير صحيحة');
      } else {
        Toast.error(backendError || 'حدث خطأ أثناء تغيير كلمة المرور');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal open={open} title="تغيير كلمة المرور" onClose={handleClose}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="كلمة المرور الحالية"
          type="password"
          {...register('oldPassword')}
          error={errors.oldPassword?.message}
          placeholder="أدخل كلمة المرور الحالية"
        />
        <Input
          label="كلمة المرور الجديدة"
          type="password"
          {...register('newPassword')}
          error={errors.newPassword?.message}
          placeholder="أدخل كلمة المرور الجديدة"
        />
        <Input
          label="تأكيد كلمة المرور"
          type="password"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
          placeholder="أعد إدخال كلمة المرور الجديدة"
        />
        <div className="mt-6 flex gap-3">
          <Button type="submit" isLoading={isLoading}>
            تغيير كلمة المرور
          </Button>
          <button
            type="button"
            onClick={handleClose}
            className="w-full rounded-2xl border border-[var(--color-outine)] bg-[var(--color-primary)] px-5 py-2.5 font-semibold hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)] transition-colors"
          >
            إلغاء
          </button>
        </div>
      </form>
    </Modal>
  );
}