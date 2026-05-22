import { Outlet, useLocation } from "react-router-dom"
import Navbar from "../components/student/Navbar"
import { Toaster } from "react-hot-toast"
import { AnimatePresence } from "framer-motion"
import PageWrapper from "../components/PageWrapper"

function StudentLayout() {
  const location = useLocation();
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <AnimatePresence mode="wait">
            <PageWrapper key={location.pathname}>
              <Outlet />
            </PageWrapper>
          </AnimatePresence>
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  )
}

export default StudentLayout
