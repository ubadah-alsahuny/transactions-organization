import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';

export default function DashboardLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[var(--color-primary)] text-[var(--color-text)]">
      <div className="dashboard-scale flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          <main className="flex-1 px-4 md:px-8">
            <div
              key={location.pathname}
              className="animate-fade-in-up"
            >
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
