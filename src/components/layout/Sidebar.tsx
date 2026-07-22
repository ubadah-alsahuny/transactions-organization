import { Building2, FileText, History, Home, Layers3, ShieldCheck, UserRound, Users } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import SidebarItem from './SidebarItem';
import logo from '../../assets/logos/Syrian_Government_Logo.svg';

export default function Sidebar() {
  const user = useAuthStore(state => state.user);
  const role = user?.role;
  const hasSection = Boolean(user?.section?.id);

  const items =
    role === 'manager'
      ? [
          { to: '/dashboard', label: 'الرئيسية', icon: <Home size={18} /> },
          { to: '/dashboard/manager/profile', label: 'حسابي', icon: <UserRound size={18} /> },
          { to: '/dashboard/manager/sections', label: 'الأقسام', icon: <Layers3 size={18} /> },
          { to: '/dashboard/manager/employees', label: 'الموظفون', icon: <Users size={18} /> },
          { to: '/dashboard/manager/templates', label: 'قوالب المعاملات', icon: <FileText size={18} /> },
          { to: '/dashboard/manager/requests/running', label: 'الطلبات الجارية', icon: <Building2 size={18} /> },
          { to: '/dashboard/manager/requests/history', label: 'سجل الطلبات', icon: <History size={18} /> },
        ]
      : role === 'co_manager'
        ? [
            { to: '/dashboard', label: 'الرئيسية', icon: <Home size={18} /> },
            { to: '/dashboard/co-manager/profile', label: 'حسابي', icon: <UserRound size={18} /> },
            { to: '/dashboard/co-manager/sections', label: 'الأقسام', icon: <Layers3 size={18} /> },
            { to: '/dashboard/co-manager/employees', label: 'الموظفون', icon: <Users size={18} /> },
            ...(hasSection
              ? [{ to: '/dashboard/co-manager/requests/pending', label: 'الطلبات المعلقة', icon: <Building2 size={18} /> }]
              : []),
            { to: '/dashboard/co-manager/requests/running', label: 'الطلبات الجارية', icon: <Building2 size={18} /> },
            { to: '/dashboard/co-manager/requests/history', label: 'سجل الطلبات', icon: <History size={18} /> },
          ]
        : [
            { to: '/employee/dashboard', label: 'الرئيسية', icon: <Home size={18} /> },
            { to: '/employee/requests/pending', label: 'الطلبات المعلقة', icon: <Building2 size={18} /> },
            { to: '/employee/verify', label: 'تحقق', icon: <ShieldCheck size={18} /> },
            { to: '/employee/profile', label: 'حسابي', icon: <UserRound size={18} /> },
          ];

  return (
    <aside className="sticky top-0 z-30 flex h-[calc(100vh/0.8)] w-[280px] shrink-0 flex-col border-r border-[var(--color-outine)] bg-[var(--color-section)] px-4 py-6 backdrop-blur-xl backdrop-saturate-180">
      <div className="flex items-center gap-3 px-2">
        <img src={logo} alt="Logo" className="h-28 w-28 object-contain" />
        <div className="min-w-0">
          <div className="truncate font-bold">{user?.institution?.name ? `${user.institution.name} ` : '—'}</div>
          <div className="truncate text-sm text-[var(--color-sub-text)]">{user?.section?.name ?? ''}</div>
        </div>
      </div>

      <nav className="mt-8 flex-1 overflow-y-auto pb-4">
        <ul className="flex flex-col gap-2">
          {items.map(item => (
            <SidebarItem key={item.to} to={item.to} label={item.label} icon={item.icon} />
          ))}
        </ul>
      </nav>


    </aside>
  );
}
