import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export default function DashboardHome() {
  const user = useAuthStore(state => state.user);

  const role = user?.role;
  const links =
    role === 'manager'
      ? [
          { to: '/dashboard/manager/sections', label: 'الأقسام' },
          { to: '/dashboard/manager/employees', label: 'الموظفون' },
          { to: '/dashboard/manager/templates', label: 'قوالب المعاملات' },
          { to: '/dashboard/manager/requests/running', label: 'الطلبات الجارية' },
        ]
      : role === 'co_manager'
        ? [
            { to: '/dashboard/co-manager/sections', label: 'الأقسام' },
            { to: '/dashboard/co-manager/employees', label: 'الموظفون' },
            { to: '/dashboard/co-manager/requests/running', label: 'الطلبات الجارية' },
          ]
        : [
            { to: '/employee/requests/pending', label: 'الطلبات المعلقة' },
            { to: '/employee/profile', label: 'حسابي' },
          ];

  return (
    <div className="py-8">
      <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-section)] p-8 shadow-[rgba(0,0,0,0.1)_0_0.27rem_0.7rem]">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">الرئيسية</h1>
        <div className="mt-2 text-[var(--color-sub-text)]">
          {user?.institution?.name ? `${user.institution.name} institution` : '—'}
          {user?.section?.name ? ` • ${user.section.name}` : ''}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {links.map((item, i) => (
            <Link
              key={item.to}
              to={item.to}
              className="hover-lift rounded-2xl bg-[var(--color-action)] px-5 py-3 font-semibold text-[var(--color-text-button)] hover:bg-[var(--color-action-hover)] transition-colors"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

