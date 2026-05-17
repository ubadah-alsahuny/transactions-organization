import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export default function ProfileDropdown() {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="flex items-center gap-3">
      <div className="hidden min-w-0 sm:block">
        <div className="truncate text-sm font-semibold">{user?.email ?? '—'}</div>
        <div className="truncate text-xs text-[var(--color-sub-text)]">{user?.role ?? ''}</div>
      </div>
      <button
        type="button"
        onClick={onLogout}
        className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-outine)] bg-[var(--color-section)] px-4 py-2 font-semibold hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)] transition-colors"
      >
        <LogOut size={18} />
        <span className="hidden sm:inline">تسجيل الخروج</span>
      </button>
    </div>
  );
}
