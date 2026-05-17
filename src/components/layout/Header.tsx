import { useAuthStore } from '../../stores/authStore';
import ProfileDropdown from './ProfileDropdown';
import styles from './header_and_footer.module.css';
import logo from '../../assets/logos/Syrian_Government_Logo.svg';

export default function Header() {
  const user = useAuthStore(state => state.user);

  const institutionLabel = user?.institution?.name ? `${user.institution.name} institution` : '—';
  const sectionLabel = user?.section?.name ?? '';

  return (
    <header className={styles.header_settings}>
      <div className="flex items-center gap-4 px-4 py-3">
        <div className={styles.left_panel}>
          <img src={logo} alt="Logo" className={styles.syrian_logo} />
          <div className="min-w-0">
            <div className="truncate font-bold">{institutionLabel}</div>
            {sectionLabel ? <div className="truncate text-sm text-[var(--color-sub-text)]">{sectionLabel}</div> : null}
          </div>
        </div>

        <div className={styles.navigation_header_buttons} />
        <ProfileDropdown />
      </div>
    </header>
  );
}
