import { useState } from "react"
import { Home, Vote, Users, BarChart3, UserCog, Settings } from "lucide-react"
import IconNav from "../common/IconNav"

function LinkBar() {
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
      href: "/superadmin/election-stats",
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
    <div className="">
      <div className="">
        <IconNav items={navItems} />
      </div>
    </div>
  )
}

export default LinkBar 