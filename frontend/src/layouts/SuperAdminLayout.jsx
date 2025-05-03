import { Outlet } from "react-router-dom"
import Navbar from "../components/superadmin/Navbar"
import { Toaster } from "react-hot-toast"
import { NotificationProvider } from "../context/NotificationContext"
function SuperAdminLayout() {
  return (
    <NotificationProvider> 
      <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
    </NotificationProvider>
    
  )
}

export default SuperAdminLayout
