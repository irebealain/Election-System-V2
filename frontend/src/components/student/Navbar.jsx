import { useState, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { User, LogOut, Settings, ChevronDown, Menu } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import Button from "../common/Button"
import ModeToggle from "../common/ModeToggle"
import logo from "../../assets/Logo.svg"
import LinkBar from "./LinkBar"
import { useClickOutside } from "../../hooks/useClickOutside"

function Navbar() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const userMenuRef = useClickOutside(() => setUserMenuOpen(false))

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/login")
    } catch (error) {
      console.error("Failed to log out", error)
    }
  }

  return (
    <header className="sticky top-0 z-40 backdrop-blur-sm">
      <div className="flex h-16 items-center px-4 justify-between">
        <Link to="/student/dashboard" className="flex items-center mr-6">
          <span className="text-xl font-bold font-satoshi">
            <img src={logo} alt="" />
          </span>
        </Link>

        {/* Center links */}
        <div className="bg-background rounded-[40px]">
          <LinkBar />
        </div>

        <div className="flex items-center space-x-2 rounded-[40px] bg-background p-2">
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
                {currentUser?.profilePic ? (
                  <img 
                    src={currentUser.profilePic} 
                    alt={`${currentUser.firstName} ${currentUser.lastName}`}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium">
                    {currentUser?.firstName?.charAt(0)}
                  </span>
                )}
              </div>
              <div className="hidden md:flex flex-col items-start text-sm">
                <span className="font-medium">{currentUser?.firstName} {currentUser?.lastName}</span>
                <span className="text-xs text-muted-foreground capitalize">Student</span>
              </div>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-[20px] border bg-background shadow-lg">
                <div className="p-3 border-b">
                  <h3 className="font-medium">Account Details</h3>
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

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/profile"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
