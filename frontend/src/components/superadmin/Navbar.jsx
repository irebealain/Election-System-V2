import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Bell, Search, User, LogOut, Settings, ChevronDown, X, Menu } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import Button from "../common/Button"
import ModeToggle from "../common/ModeToggle"
import LinkBar from "./LinkBar"
import logo from "../../assets/logo.svg"
import { useClickOutside } from "../../hooks/useClickOutside"
import NotificationBell from "../common/NotificationBell"

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchOpen, setSearchOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const searchRef = useClickOutside(() => setSearchOpen(false))
  const userMenuRef = useClickOutside(() => setUserMenuOpen(false))
  const notificationsRef = useClickOutside(() => setNotificationsOpen(false))

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <header className="sticky top-0 z-40 backdrop-blur-sm">
      <div className="flex h-16 items-center px-4 justify-between">
        <Link to="/superadmin/dashboard" className="flex items-center mr-6">
          <span className="text-xl font-bold font-satoshi">
            <img src={logo} alt="" />
          </span>
        </Link>

        {/* Center links */}
        <div className="bg-background rounded-[40px]">
          <LinkBar />
        </div>

        <div className="flex items-center space-x-2 rounded-[40px] bg-background p-2">
          {/* Search */}
          {searchOpen ? (
            <div ref={searchRef} className="relative mr-2">
              <input
                type="text"
                placeholder="Search..."
                className="w-[200px] md:w-[300px] h-10 border border-input bg-background px-3 py-2 text-sm rounded-[20px]"
                autoFocus
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0"
                onClick={() => setSearchOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)}>
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          )}

          {/* Notifications */}
          <NotificationBell />

          {/* Theme Toggle */}
          <ModeToggle />

          {/* User Menu */}
          <div ref={userMenuRef} className="relative">
            <Button
              variant=""
              className="relative h-8 flex items-center gap-2 pl-2 pr-1"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <div className="hidden md:flex flex-col items-start text-sm">
                <span className="font-medium">{user?.name || "Super Admin"}</span>
                <span className="text-xs text-muted-foreground capitalize">Super Admin</span>
              </div>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-[20px] border bg-background shadow-lg">
                <div className="p-3 border-b">
                  <h3 className="font-medium">My Account</h3>
                </div>
                <div className="p-2">
                  <Button variant="ghost" className="w-full !justify-start text-sm">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Button>
                  <Button variant="ghost" className="w-full !justify-start text-sm">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Button>
                  <div className="my-1 h-px bg-border"></div>
                  <Button variant="ghost" className="w-full !justify-start text-sm" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

function NotificationItem({ title, description, time }) {
  return (
    <div className="flex flex-col gap-1 p-3 hover:bg-accent rounded-md cursor-pointer">
      <div className="font-medium text-sm">{title}</div>
      <div className="text-xs text-muted-foreground">{description}</div>
      <div className="text-xs text-muted-foreground mt-1">{time}</div>
    </div>
  )
}

export default Navbar
