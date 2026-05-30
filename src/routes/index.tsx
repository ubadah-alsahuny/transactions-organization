import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import ManagerLogin from '../pages/manager/ManagerLogin';
import CoManagerLogin from '../pages/co-manager/CoManagerLogin';
import EmployeeLogin from '../pages/employee/EmployeeLogin';
import EmployeePendingRequestsList from '../pages/employee/PendingRequestsList';
import EmployeeRequestDetails from '../pages/employee/RequestDetails';
import EmployeeMyProfile from '../pages/employee/MyProfile';
import PrivateRoute from './PrivateRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import Landing from '../pages/shared/Landing';
import NotFound from '../pages/shared/NotFound';
import DashboardHome from '../pages/shared/DashboardHome';
import AuthProvider from '../providers/AuthProvider';
import Forbidden from '../pages/shared/Forbidden';
import SectionsList from '../pages/manager/Sections/SectionsList';
import SectionDetails from '../pages/manager/Sections/SectionDetails';
import EmployeesList from '../pages/manager/Employees/EmployeesList';
import TemplatesList from '../pages/manager/TransactionTemplates/TemplatesList';
import TemplateDetails from '../pages/manager/TransactionTemplates/TemplateDetails';
import RunningRequestsList from '../pages/manager/Requests/RunningRequestsList';
import RequestDetails from '../pages/manager/Requests/RequestDetails';
import ManagerRequestHistoryList from '../pages/manager/Requests/RequestHistoryList';
import ManagerRequestHistoryDetails from '../pages/manager/Requests/RequestHistoryDetails';
import CoManagerSectionsList from '../pages/co-manager/Sections/SectionsList';
import CoManagerEmployeesList from '../pages/co-manager/Employees/EmployeesList';
import CoManagerIncomingRequestsList from '../pages/co-manager/Requests/IncomingRequestsList';
import CoManagerSectionDetails from '../pages/co-manager/Sections/SectionDetails';
import CoManagerRequestDetails from '../pages/co-manager/Requests/RequestDetails';
import CoManagerPendingRequestsList from '../pages/co-manager/Requests/PendingRequestsList';
import CoManagerPendingRequestDetails from '../pages/co-manager/Requests/PendingRequestDetails';
import CoManagerRequestHistoryList from '../pages/co-manager/Requests/RequestHistoryList';
import CoManagerRequestHistoryDetails from '../pages/co-manager/Requests/RequestHistoryDetails';
import PrintRequest from '../pages/shared/PDF feature/PrintRequest.tsx';


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
          { path: 'employees', element: <EmployeesList /> },
          { path: 'templates', element: <TemplatesList /> },
          { path: 'templates/:id', element: <TemplateDetails /> },
          { path: 'requests/running', element: <RunningRequestsList /> },
          { path: 'requests/running/:requestId', element: <RequestDetails /> },
          { path: 'requests/history', element: <ManagerRequestHistoryList /> },
          { path: 'requests/history/:requestId', element: <ManagerRequestHistoryDetails /> },
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
          { path: 'sections', element: <CoManagerSectionsList /> },
          { path: 'sections/:id', element: <CoManagerSectionDetails /> },
          { path: 'employees', element: <CoManagerEmployeesList /> },
          { path: 'requests/pending', element: <CoManagerPendingRequestsList /> },
          { path: 'requests/pending/:requestId', element: <CoManagerPendingRequestDetails /> },
          { path: 'requests/running', element: <CoManagerIncomingRequestsList /> },
          { path: 'requests/running/:requestId', element: <CoManagerRequestDetails /> },
          { path: 'requests/history', element: <CoManagerRequestHistoryList /> },
          { path: 'requests/history/:requestId', element: <CoManagerRequestHistoryDetails /> },
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
      { path: 'requests/pending', element: <EmployeePendingRequestsList /> },
      { path: 'requests/:requestId', element: <EmployeeRequestDetails /> },
      { path: 'profile', element: <EmployeeMyProfile /> },
    ],
  },
  {
    path: '/print/request/:requestId',
    element: <PrintRequest />,
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
