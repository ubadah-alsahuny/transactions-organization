import { useAuthStore } from '../../stores/authStore';
import ProfileDropdown from './ProfileDropdown';
import styles from './header_and_footer.module.css';
import logo from '../../assets/logos/Syrian_Government_Logo.svg';
import { useUIStore } from '../../stores/uiStore';
import { ENV } from '../../env';

export default function Header() {
  const user = useAuthStore(state => state.user);
  const headerActions = useUIStore(state => state.headerActions);

  const institutionLabel = user?.institution?.name ? `${user.institution.name} ` : '—';
  const sectionLabel = user?.section?.name ?? '';
  const backendBaseUrl = ENV.BASE_URL.replace(/\/api\/?$/, '');
  const institutionLogoPath = user?.institution?.logo;
  const institutionLogoUrl = institutionLogoPath
    ? `${backendBaseUrl}/${institutionLogoPath.replace(/^\/+/, '')}`
    : logo;

  return (
    <header className={styles.header_settings}>
      <div className="flex items-center gap-4 px-4 py-3">
        <div className={styles.left_panel}>
          <img
            src={institutionLogoUrl}
            alt="Logo"
            className={styles.syrian_logo}
            onError={(e) => {
              e.currentTarget.src = logo;
            }}
          />
          <div className="min-w-0 flex-1">
            <div className="truncate font-bold">{institutionLabel}</div>
            {sectionLabel ? <div className="truncate text-sm text-[var(--color-sub-text)]">{sectionLabel}</div> : null}
          </div>
        </div>

        <div className={styles.navigation_header_buttons}>
          {headerActions}
        </div>

        <ProfileDropdown />
      </div>
    </header>
  );
}
