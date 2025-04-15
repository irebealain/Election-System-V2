import { Outlet } from "react-router-dom"
import Navbar from "../components/admin/Navbar"
import LinkBar from "../../src/components/admin/LinkBar"
import { Toaster } from "react-hot-toast"

function AdminLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {/* <LinkBar /> */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  )
}

export default AdminLayout
