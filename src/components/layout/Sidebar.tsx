import { Building2, FileText, Home, Layers3, UserRound, Users } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import SidebarItem from './SidebarItem';
import logo from '../../assets/logos/Syrian_Government_Logo.svg';

export default function Sidebar() {
  const user = useAuthStore(state => state.user);
  const role = user?.role;

  const items =
    role === 'manager'
      ? [
          { to: '/dashboard', label: 'الرئيسية', icon: <Home size={18} /> },
          { to: '/dashboard/manager/sections', label: 'الأقسام', icon: <Layers3 size={18} /> },
          { to: '/dashboard/manager/employees', label: 'الموظفون', icon: <Users size={18} /> },
          { to: '/dashboard/manager/templates', label: 'قوالب المعاملات', icon: <FileText size={18} /> },
          { to: '/dashboard/manager/requests/running', label: 'الطلبات الجارية', icon: <Building2 size={18} /> },
        ]
      : role === 'co_manager'
        ? [
            { to: '/dashboard', label: 'الرئيسية', icon: <Home size={18} /> },
            { to: '/dashboard/co-manager/sections', label: 'الأقسام', icon: <Layers3 size={18} /> },
            { to: '/dashboard/co-manager/employees', label: 'الموظفون', icon: <Users size={18} /> },
            { to: '/dashboard/co-manager/requests/running', label: 'الطلبات الجارية', icon: <Building2 size={18} /> },
          ]
        : [
            { to: '/employee/dashboard', label: 'الرئيسية', icon: <Home size={18} /> },
            { to: '/employee/requests/pending', label: 'الطلبات المعلقة', icon: <Building2 size={18} /> },
            { to: '/employee/profile', label: 'حسابي', icon: <UserRound size={18} /> },
          ];

  return (
    <aside className="sticky top-0 h-screen w-[280px] shrink-0 border-r border-[var(--color-outine)] bg-[var(--color-section)] px-4 py-6">
      <div className="flex items-center gap-3 px-2">
        <img src={logo} alt="Logo" className="h-10 w-10 object-contain" />
        <div className="min-w-0">
          <div className="truncate font-bold">{user?.institution?.name ? `${user.institution.name} institution` : '—'}</div>
          <div className="truncate text-sm text-[var(--color-sub-text)]">{user?.section?.name ?? ''}</div>
        </div>
      </div>

      <nav className="mt-8">
        <ul className="flex flex-col gap-2">
          {items.map(item => (
            <SidebarItem key={item.to} to={item.to} label={item.label} icon={item.icon} />
          ))}
        </ul>
      </nav>
    </aside>
  );
}
