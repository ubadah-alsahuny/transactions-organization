import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import ManagerLogin from '../pages/manager/ManagerLogin';
import CoManagerLogin from '../pages/co-manager/CoManagerLogin';
import EmployeeLogin from '../pages/employee/EmployeeLogin';
import PrivateRoute from './PrivateRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import Landing from '../pages/shared/Landing';
import NotFound from '../pages/shared/NotFound';
import PlaceholderPage from '../pages/shared/PlaceholderPage';
import DashboardHome from '../pages/shared/DashboardHome';
import AuthProvider from '../providers/AuthProvider';
import Forbidden from '../pages/shared/Forbidden';
import SectionsList from '../pages/manager/Sections/SectionsList';
import SectionDetails from '../pages/manager/Sections/SectionDetails';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: "/login",
    children: [
      { path: "manager", element: <ManagerLogin /> },
      { path: "co-manager", element: <CoManagerLogin /> },
      { path: "employee", element: <EmployeeLogin /> }
    ]
  },
  {
    path: "/dashboard",
    element: (
      <AuthProvider>
        <PrivateRoute roles={['manager', 'co_manager']}>
          <DashboardLayout />
        </PrivateRoute>
      </AuthProvider>
    ),
    children: [
      { index: true, element: <DashboardHome /> },
      {
        path: 'manager',
        element: (
          <PrivateRoute roles={['manager']}>
            <Outlet />
          </PrivateRoute>
        ),
        children: [
          { path: 'sections', element: <SectionsList /> },
          { path: 'sections/:id', element: <SectionDetails /> },
          { path: 'employees', element: <PlaceholderPage title="إدارة الموظفين (Manager)" /> },
          { path: 'templates', element: <PlaceholderPage title="قوالب المعاملات (Manager)" /> },
          { path: 'requests/running', element: <PlaceholderPage title="الطلبات الجارية (Manager)" /> },
        ],
      },
      {
        path: 'co-manager',
        element: (
          <PrivateRoute roles={['co_manager']}>
            <Outlet />
          </PrivateRoute>
        ),
        children: [
          { path: 'sections', element: <PlaceholderPage title="عرض الأقسام (Co-Manager)" /> },
          { path: 'employees', element: <PlaceholderPage title="إدارة الموظفين (Co-Manager)" /> },
          { path: 'requests/running', element: <PlaceholderPage title="الطلبات الجارية (Co-Manager)" /> },
        ],
      },
    ],
  },
  {
    path: '/employee',
    element: (
      <AuthProvider>
        <PrivateRoute roles={['employee']}>
          <DashboardLayout />
        </PrivateRoute>
      </AuthProvider>
    ),
    children: [
      { path: 'dashboard', element: <DashboardHome /> },
      { path: 'requests/pending', element: <PlaceholderPage title="الطلبات المعلقة (Employee)" /> },
      { path: 'profile', element: <PlaceholderPage title="حسابي (Employee)" /> },
    ],
  },
  {
    path: '/403',
    element: <Forbidden />,
  },
  {
    path: "*",
    element: <NotFound />
  }
]);

export const AppRouter = () => <RouterProvider router={router} />;
export default router;
