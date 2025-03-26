import { Navigate } from 'react-router-dom';

function ProtectedAdminRoute({ children }) {
  const adminToken = localStorage.getItem('adminToken');
  
  if (!adminToken) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default ProtectedAdminRoute;