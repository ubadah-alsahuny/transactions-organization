import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ManagerLogin from '../pages/manager/ManagerLogin';
import CoManagerLogin from '../pages/co-manager/CoManagerLogin';
import EmployeeLogin from '../pages/employee/EmployeeLogin';
import PrivateRoute from './PrivateRoute';

const router = createBrowserRouter([
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
      <PrivateRoute roles={['manager', 'co_manager']}>
        <div className="p-8">Manager / Co-Manager Dashboard (Placeholder)</div>
      </PrivateRoute>
    )
  },
  {
    path: "/employee/dashboard",
    element: (
      <PrivateRoute roles={['employee']}>
        <div className="p-8">Employee Dashboard (Placeholder)</div>
      </PrivateRoute>
    )
  },
  {
    path: "*",
    element: <div className="p-8 text-center text-red-500 font-bold">404 Not Found</div>
  }
]);

export const AppRouter = () => <RouterProvider router={router} />;
export default router;
