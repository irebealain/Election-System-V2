import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from "react-router-dom"
// import { useAuth } from "./context/AuthContext"
import { ProtectedRoute, ApprovedAdminRoute, StudentRoute, SuperAdminRoute } from "./routes/ProtectedRoute"

// Layouts
import AdminLayout from "./layouts/AdminLayout"
import StudentLayout from "./layouts/StudentLayout"
import SuperAdminLayout from "./layouts/SuperAdminLayout"

// Public Pages (Lazy)
const LoginPage = lazy(() => import("./pages/LoginPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const WaitingApprovalPage = lazy(() => import("./pages/admin/WaitingApprovalPage"));

// Admin Pages (Lazy)
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminElections = lazy(() => import("./pages/admin/Elections"));
const StudentsTable = lazy(() => import("./pages/admin/StudentTable"));
const Settings = lazy(() => import("./pages/admin/AdminSettings"));
const Notifications = lazy(() => import("./pages/admin/Notifications"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));

// Student Pages (Lazy)
const StudentDashboard = lazy(() => import("./pages/student/Dashboard"));
const StudentElections = lazy(() => import("./pages/student/Elections"));

// SuperAdmin Pages (Lazy)
const SuperAdminDashboard = lazy(() => import("./pages/superadmin/Dashboard"));
const SuperAdminElections = lazy(() => import("./pages/superadmin/Elections"));
const AdminPage = lazy(() => import("./pages/superadmin/AdminPage"));
const Students = lazy(() => import("./pages/superadmin/Students"));
const ElectionStats = lazy(() => import("./pages/superadmin/Statistics"));

import { NotificationProvider } from "./context/NotificationContext"

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
  </div>
);

function App() {
  return (
    <NotificationProvider>
      <Suspense fallback={<LoadingFallback />}>
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
            <Route path="admins" element={<AdminPage />} />
            <Route path="students" element={<Students />} />
            <Route path="election-stats" element={<ElectionStats />} />
          </Route>
        </Route>

        {/* 404 Page */}
        <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </NotificationProvider>
  )
}

export default App