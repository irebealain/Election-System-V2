import { useState } from "react"
import { Home, Vote, Users, BarChart3, Settings } from "lucide-react"
import IconNav from "../common/IconNav"

function LinkBar() {
  const [collapsed, setCollapsed] = useState(false)

  const navItems = [
    {
      href: "/admin/dashboard",
      label: "Dashboard",
      icon: Home,
    },
    {
      href: "/admin/elections",
      label: "Elections",
      icon: Vote,
    },
    {
      href: "/admin/students",
      label: "Students",
      icon: Users,
    },
    {
      href: "/admin/statistics",
      label: "Statistics",
      icon: BarChart3,
    },
    {
      href: "/admin/settings",
      label: "Settings",
      icon: Settings,
    },
  ]

  return (
    <div className="">
      <div className="px-3 py-2">
        <IconNav items={navItems} />
      </div>
    </div>
  )
}

export default LinkBar
