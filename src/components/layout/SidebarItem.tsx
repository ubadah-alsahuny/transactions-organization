import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

type SidebarItemProps = {
  to: string;
  label: string;
  icon?: ReactNode;
};

export default function SidebarItem({ to, label, icon }: SidebarItemProps) {
  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) =>
          [
            'flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold transition-colors',
            isActive
              ? 'bg-[color-mix(in_srgb,var(--color-action),transparent_85%)]'
              : 'hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)]',
          ].join(' ')
        }
      >
        <span className="inline-flex h-5 w-5 items-center justify-center">{icon}</span>
        <span className="truncate">{label}</span>
      </NavLink>
    </li>
  );
}
