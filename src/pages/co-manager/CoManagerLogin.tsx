import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authSchema } from '../../schemas/auth.schema';
import type { AuthFormData } from '../../schemas/auth.schema';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../stores/authStore';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Toast } from '../../components/common/Toast';
import logo from '../../assets/logos/Syrian_Government_Logo.svg';

export default function CoManagerLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);

  const { register, handleSubmit, formState: { errors } } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema)
  });

  const onSubmit = async (data: AuthFormData) => {
    setIsLoading(true);
    try {
      const response = await authService.coManagerLogin(data.email, data.password);
      if (response.success && response.data) {
        login(response.data);
        Toast.success("Login successful! Redirecting...");
        navigate('/dashboard');
      } else {
        Toast.error("Login failed.");
      }
    } catch (error: any) {
      const backendError = error.response?.data?.error;
      if (backendError === 'invalid credentials') {
        Toast.error("بيانات الاعتماد غير صحيحة");
      } else {
        Toast.error(backendError || "حدث خطأ أثناء تسجيل الدخول");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-primary)] px-4">
      <div className="w-full max-w-md rounded-3xl border border-[var(--color-outine)] bg-[var(--color-section)] p-8 shadow-[rgba(0,0,0,0.2)_0_1rem_2rem] backdrop-blur-xl backdrop-saturate-180">
        <div className="mb-6 flex justify-center">
          <img
            src={logo}
            alt="Logo"
            className="h-20 object-contain"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>
        <h2 className="mb-6 text-center text-2xl font-bold text-[var(--color-text)]">تسجيل دخول نائب المدير</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="البريد الإلكتروني"
            type="email"
            {...register('email')}
            error={errors.email?.message}
            placeholder="example@domain.com"
          />
          <Input
            label="كلمة المرور"
            type="password"
            {...register('password')}
            error={errors.password?.message}
            placeholder="******"
          />
          <div className="mt-6">
            <Button type="submit" isLoading={isLoading}>تسجيل الدخول</Button>
          </div>
        </form>

        <div className="mt-6 flex flex-col gap-2 text-center text-sm text-[var(--color-sub-text)]">
          <Link to="/login/manager" className="font-semibold text-[var(--color-action)] hover:underline">تسجيل الدخول كمدير</Link>
          <Link to="/login/employee" className="font-semibold text-[var(--color-action)] hover:underline">تسجيل الدخول كموظف</Link>
        </div>
      </div>
    </div>
  );
}
