import { Routes, Route, Navigate } from "react-router-dom"
// import { useAuth } from "./context/AuthContext"
import { ProtectedRoute, ApprovedAdminRoute, StudentRoute, SuperAdminRoute } from "./routes/ProtectedRoute"

// Layouts
import AdminLayout from "./layouts/AdminLayout"
import StudentLayout from "./layouts/StudentLayout"
import SuperAdminLayout from "./layouts/SuperAdminLayout"

// Public Pages
import LoginPage from "./pages/LoginPage"
import HomePage from "./pages/HomePage"
import NotFoundPage from "./pages/NotFoundPage"
import WaitingApprovalPage from "./pages/admin/WaitingApprovalPage"

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard"
import AdminElections from "./pages/admin/Elections"
import StudentsTable from "./pages/admin/StudentTable"
import Settings from "./pages/admin/AdminSettings"
import Notifications from "./pages/admin/Notifications"

// Student Pages
import StudentDashboard from "./pages/student/Dashboard"
import StudentElections from "./pages/student/Elections"
import AdminSettings from "./pages/admin/AdminSettings"

// SuperAdmin Pages
import SuperAdminDashboard from "./pages/superadmin/Dashboard"
import SuperAdminElections from "./pages/superadmin/Elections"

function App() {
  // const { user } = useAuth()

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/waiting-approval" element={<WaitingApprovalPage />} />

      {/* Admin Routes */}
      <Route element={<ApprovedAdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="elections" element={<AdminElections />} />
          <Route path="students" element={<StudentsTable />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>
      </Route>

      {/* Student Routes */}
      <Route element={<StudentRoute />}>
        <Route path="/student" element={<StudentLayout />}>
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="elections" element={<StudentElections />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      {/* SuperAdmin Routes */}
      <Route element={<SuperAdminRoute />}>
        <Route path="/superadmin" element={<SuperAdminLayout />}>
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          <Route path="elections" element={<SuperAdminElections />} />
        </Route>
      </Route>

      {/* 404 Page */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App