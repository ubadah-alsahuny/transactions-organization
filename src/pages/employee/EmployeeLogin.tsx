import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authSchema} from '../../schemas/auth.schema';
import type { AuthFormData } from '../../schemas/auth.schema';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../stores/authStore';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Toast } from '../../components/common/Toast';
import logo from '../../assets/logos/Syrian_Government_Logo.svg';

export default function EmployeeLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);

  const { register, handleSubmit, formState: { errors } } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema)
  });

  const onSubmit = async (data: AuthFormData) => {
    setIsLoading(true);
    try {
      const response = await authService.employeeLogin(data.email, data.password);
      if (response.success && response.data) {
        login(response.data);
        Toast.success("Login successful! Redirecting...");
        navigate('/employee/dashboard');
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
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img 
            src={logo} 
            alt="Logo" 
            className="h-16 object-contain" 
            onError={(e) => { e.currentTarget.style.display = 'none'; }} 
          />
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">Employee Login</h2>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input 
            label="Email" 
            type="email" 
            {...register('email')} 
            error={errors.email?.message} 
            placeholder="Enter your email" 
          />
          <Input 
            label="Password" 
            type="password" 
            {...register('password')} 
            error={errors.password?.message} 
            placeholder="Enter your password" 
          />
          <div className="mt-6">
            <Button type="submit" isLoading={isLoading}>Login</Button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400 flex flex-col gap-2">
          <Link to="/login/manager" className="text-blue-600 hover:underline dark:text-blue-400">Login as Manager?</Link>
          <Link to="/login/co-manager" className="text-blue-600 hover:underline dark:text-blue-400">Login as Co-manager?</Link>
        </div>
      </div>
    </div>
  );
}
