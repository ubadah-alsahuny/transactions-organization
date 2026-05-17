import { Link } from 'react-router-dom';
import logo from '../../assets/logos/Syrian_Government_Logo.svg';

export default function Forbidden() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-primary)] px-4">
      <div className="w-full max-w-md rounded-3xl border border-[var(--color-outine)] bg-[var(--color-section)] p-8 shadow-[rgba(0,0,0,0.1)_0_0.27rem_0.7rem] text-center">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo" className="h-16 object-contain" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">403</h1>
        <p className="text-[var(--color-sub-text)] mb-6">ليس لديك صلاحية للوصول إلى هذه الصفحة</p>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-2xl bg-[var(--color-action)] px-6 py-3 font-semibold text-[var(--color-text-button)] hover:bg-[var(--color-action-hover)] transition-colors"
        >
          العودة إلى الصفحة الرئيسية
        </Link>
      </div>
    </div>
  );
}

