// In src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// For routes that require authentication
export function ProtectedRoute() {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return currentUser ? <Outlet /> : <Navigate to="/login" />;
}

// For routes that require admin approval
export function ApprovedAdminRoute() {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  if (currentUser.role !== "admin") {
    return <Navigate to="/" />;
  }
  
  if (!currentUser.isApproved) {
    return <Navigate to="/waiting-approval" />;
  }
  
  return <Outlet />;
}

// For routes specific to students
export function StudentRoute() {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  if (currentUser.role !== "student") {
    return <Navigate to="/" />;
  }
  
  return <Outlet />;
}

// For routes specific to superadmins
export function SuperAdminRoute() {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  if (currentUser.role !== "superadmin") {
    return <Navigate to="/" />;
  }
  
  return <Outlet />;
}