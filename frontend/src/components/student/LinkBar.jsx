import { useState } from "react"
import { Home, Vote, Settings } from "lucide-react"
import IconNav from "../common/IconNav"

function LinkBar() {
  // const [collapsed, setCollapsed] = useState(false)

  const navItems = [
    {
      href: "/student/dashboard",
      label: "Dashboard",
      icon: Home,
    },
    {
      href: "/student/elections",
      label: "Elections",
      icon: Vote,
    },
    {
      href: "/student/settings",
      label: "Settings",
      icon: Settings,
    },
  ]

  return (
    <div className= "">
      <div className="px-3 py-1 flex justify-center">
        <IconNav items={navItems} />
      </div>
    </div>
  )
}

export default LinkBar
