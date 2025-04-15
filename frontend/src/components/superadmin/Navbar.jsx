import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Bell, Search, User, LogOut, Settings, ChevronDown, X, Menu } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import Button from "../common/Button"
import ModeToggle from "../common/ModeToggle"

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchOpen, setSearchOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="flex h-16 items-center px-4">
        <Link to="/superadmin/dashboard" className="flex items-center mr-6">
          <span className="text-xl font-bold font-satoshi">ElectSys</span>
          <span className="ml-2 text-sm text-muted-foreground">Super Admin</span>
        </Link>

        <div className="ml-auto flex items-center space-x-2">
          {/* Search */}
          {searchOpen ? (
            <div className="relative mr-2">
              <input
                type="text"
                placeholder="Search..."
                className="w-[200px] md:w-[300px] h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                autoFocus
                onBlur={() => setSearchOpen(false)}
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
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-[#F79F21] text-white text-xs">
                5
              </span>
              <span className="sr-only">Notifications</span>
            </Button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-md border bg-background shadow-lg">
                <div className="p-3 border-b">
                  <h3 className="font-medium">Notifications</h3>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  <NotificationItem
                    title="New Admin Request"
                    description="A new admin account is pending approval."
                    time="2 minutes ago"
                  />
                  <NotificationItem
                    title="System Update"
                    description="The system has been updated to version 2.0."
                    time="1 hour ago"
                  />
                  <NotificationItem
                    title="Election Created"
                    description="A new election has been created for Spring 2023."
                    time="1 day ago"
                  />
                </div>
                <div className="p-2 border-t">
                  <Button variant="ghost" className="w-full justify-start text-sm">
                    View all notifications
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <ModeToggle />

          {/* User Menu */}
          <div className="relative">
            <Button
              variant="ghost"
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
              <div className="absolute right-0 mt-2 w-56 rounded-md border bg-background shadow-lg">
                <div className="p-3 border-b">
                  <h3 className="font-medium">My Account</h3>
                </div>
                <div className="p-2">
                  <Button variant="ghost" className="w-full justify-start text-sm">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Button>
                  <div className="my-1 h-px bg-border"></div>
                  <Button variant="ghost" className="w-full justify-start text-sm" onClick={handleLogout}>
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
