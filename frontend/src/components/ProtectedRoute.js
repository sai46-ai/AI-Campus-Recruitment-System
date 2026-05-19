import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  // ❌ Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Role mismatch
  if (allowedRoles) {
    const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!allowed.includes(userRole)) {
      // If logged in but wrong role, send them to their own dashboard.
      return (
        <Navigate
          to={
            userRole === 'admin'
              ? '/admin-dashboard'
              : userRole === 'recruiter'
                ? '/recruiter-dashboard'
                : '/student-dashboard'
          }
          replace
        />
      );
    }
  }

  // ✅ Authorized
  return children;
}

export default ProtectedRoute;
