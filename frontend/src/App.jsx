import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./context/AuthContext"
import ProtectedRoute from "./routes/ProtectedRoute"

// Layouts
import AdminLayout from "./layouts/AdminLayout"
import StudentLayout from "./layouts/StudentLayout"
import SuperAdminLayout from "./layouts/SuperAdminLayout"

// Public Pages
import LoginPage from "./pages/LoginPage"
import HomePage from "./pages/HomePage"
import NotFoundPage from "./pages/NotFoundPage"

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard"
import AdminElections from "./pages/admin/Elections"
import StudentsTable from "./pages/admin/StudentTable"
// import AdminStatistics from "./pages/admin/Statistics"
import Settings from "./pages/admin/AdminSettings"
import Notifications from "./pages/admin/Notifications"
// Student Pages
import StudentDashboard from "./pages/student/Dashboard"
import StudentElections from "./pages/student/Elections"
import AdminSettings from "./pages/admin/AdminSettings"

// SuperAdmin Pages
import SuperAdminDashboard from "./pages/superadmin/Dashboard"
import SuperAdminElections from "./pages/superadmin/Elections"
// import SuperAdminStudents from "./pages/superadmin/Students"
// import SuperAdminAdmins from "./pages/superadmin/Admins"
// import SuperAdminStatistics from "./pages/superadmin/Statistics"
// import SuperAdminSettings from "./pages/superadmin/Settings"

function App() {
  const { user } = useAuth()

  // Redirect to appropriate dashboard based on user role
  const getRedirectPath = () => {
    if (!user) return "/login"

    switch (user.role) {
      case "admin":
        return "/admin/dashboard"
      case "student":
        return "/student/dashboard"
      case "superadmin":
        return "/superadmin/dashboard"
      default:
        return "/login"
    }
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="elections" element={<AdminElections />} />
        <Route path="students" element={<StudentsTable />} />
        {/* <Route path="statistics" element={<AdminStatistics />} /> */}
        <Route path="settings" element={<AdminSettings />} />
        <Route path="settings" element={<Notifications />} />
      </Route>

      {/* Student Routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="elections" element={<StudentElections />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* SuperAdmin Routes */}
      <Route
        path="/superadmin"
        element={
          <ProtectedRoute allowedRoles={["superadmin"]}>
            <SuperAdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<SuperAdminDashboard />} />
        <Route path="elections" element={<SuperAdminElections />} />
        {/* <Route path="students" element={<SuperAdminStudents />} /> */}
        {/* <Route path="admins" element={<SuperAdminAdmins />} /> */}
        {/* <Route path="statistics" element={<SuperAdminStatistics />} /> */}
        {/* <Route path="settings" element={<SuperAdminSettings />} /> */}
      </Route>

      {/* Redirect to appropriate dashboard */}
      <Route path="/dashboard" element={<Navigate to={getRedirectPath()} />} />

      {/* 404 Page */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
