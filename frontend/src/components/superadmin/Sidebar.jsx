import { useState } from "react"
import { Home, Vote, Users, BarChart3, UserCog, Settings } from "lucide-react"
import IconNav from "../common/IconNav"

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  const navItems = [
    {
      href: "/superadmin/dashboard",
      label: "Dashboard",
      icon: Home,
    },
    {
      href: "/superadmin/elections",
      label: "Elections",
      icon: Vote,
    },
    {
      href: "/superadmin/students",
      label: "Students",
      icon: Users,
    },
    {
      href: "/superadmin/admins",
      label: "Admins",
      icon: UserCog,
    },
    {
      href: "/superadmin/statistics",
      label: "Statistics",
      icon: BarChart3,
    },
    {
      href: "/superadmin/settings",
      label: "Settings",
      icon: Settings,
    },
  ]

  return (
    <div className={`border-r bg-background transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}>
      <div className="p-4">
        <button
          className="w-full flex items-center justify-center h-8 rounded-md hover:bg-accent"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>
      <div className="px-3 py-2">
        <IconNav items={navItems} />
      </div>
    </div>
  )
}

export default Sidebar
