import { Outlet } from "react-router-dom"
import Navbar from "../components/superadmin/Navbar"
import Sidebar from "../components/superadmin/Sidebar"
import { Toaster } from "react-hot-toast"

function SuperAdminLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  )
}

export default SuperAdminLayout
