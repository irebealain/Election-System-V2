import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/common/Card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/common/Tabs"
import Button from "../../components/common/Button"
import { Switch } from "../../components/common/Switch"
import { Camera, Save, Trash, LogOut, User, Bell, Shield, Key, Mail } from "lucide-react"
import toast from "react-hot-toast"
import { motion } from "framer-motion"

function Settings() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")
  const [isLoading, setIsLoading] = useState(false)
  const [profileImage, setProfileImage] = useState("/placeholder.svg")
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: "Student at Example University, majoring in Computer Science.",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
    notifications: {
      email: true,
      elections: true,
      results: true,
      reminders: true,
      marketing: false,
    },
    privacy: {
      showProfile: true,
      showVotingActivity: false,
    },
  })

  useEffect(() => {
    document.title = "Settings | Student Dashboard"
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleNotificationToggle = (key) => {
    setFormData({
      ...formData,
      notifications: {
        ...formData.notifications,
        [key]: !formData.notifications[key],
      },
    })
  }

  const handlePrivacyToggle = (key) => {
    setFormData({
      ...formData,
      privacy: {
        ...formData.privacy,
        [key]: !formData.privacy[key],
      },
    })
  }

  const handleProfileUpdate = (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      toast.success("Profile updated successfully!")
      setIsLoading(false)
    }, 1000)
  }

  const handlePasswordUpdate = (e) => {
    e.preventDefault()

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match!")
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      toast.success("Password updated successfully!")
      setIsLoading(false)

      // Reset password fields
      setFormData({
        ...formData,
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    }, 1000)
  }

  const handleNotificationUpdate = (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      toast.success("Notification preferences updated!")
      setIsLoading(false)
    }, 1000)
  }

  const handlePrivacyUpdate = (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      toast.success("Privacy settings updated!")
      setIsLoading(false)
    }, 1000)
  }

  const handleImageUpload = () => {
    // Simulate file upload
    setIsLoading(true)

    setTimeout(() => {
      toast.success("Profile image updated!")
      setIsLoading(false)
    }, 1000)
  }

  const handleTabChange = (value) => {
    setActiveTab(value)
  }

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-satoshi">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User size={16} />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <Key size={16} />
            <span>Account</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell size={16} />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield size={16} />
            <span>Privacy</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card className="settings-card">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your profile information and bio.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full overflow-hidden">
                      <img
                        src={profileImage || "/placeholder.svg"}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="default"
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full p-0 bg-primary hover:bg-primary/90"
                      onClick={handleImageUpload}
                      disabled={isLoading}
                    >
                      <Camera className="h-4 w-4" />
                      <span className="sr-only">Upload image</span>
                    </Button>
                  </div>

                  <div className="space-y-4 flex-1">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label htmlFor="name" className="block text-sm font-medium">
                          Full Name
                        </label>
                        <input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium">
                          Email
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            disabled
                          />
                          <Mail className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="bio" className="block text-sm font-medium">
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isLoading}>
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Saving...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Save className="mr-2 h-4 w-4" />
                        Save changes
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-4">
          <Card className="settings-card">
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Update your password to keep your account secure.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="oldPassword" className="block text-sm font-medium">
                    Current password
                  </label>
                  <input
                    id="oldPassword"
                    name="oldPassword"
                    type="password"
                    value={formData.oldPassword}
                    onChange={handleInputChange}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="newPassword" className="block text-sm font-medium">
                    New password
                  </label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium">
                    Confirm password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update password"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="settings-card">
            <CardHeader>
              <CardTitle className="text-red-500">Danger Zone</CardTitle>
              <CardDescription>Irreversible and destructive actions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Log out from all devices</h4>
                  <p className="text-sm text-muted-foreground">
                    This will log you out from all devices except this one.
                  </p>
                </div>
                <Button variant="outline">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Delete account</h4>
                  <p className="text-sm text-muted-foreground">
                    This will permanently delete your account and all associated data.
                  </p>
                </div>
                <Button variant="destructive">
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card className="settings-card">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure how you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleNotificationUpdate} className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label htmlFor="emailNotifications" className="text-sm font-medium">
                        Email notifications
                      </label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email.</p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={formData.notifications.email}
                      onCheckedChange={() => handleNotificationToggle("email")}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label htmlFor="electionUpdates" className="text-sm font-medium">
                        Election updates
                      </label>
                      <p className="text-sm text-muted-foreground">Get notified about new elections and results.</p>
                    </div>
                    <Switch
                      id="electionUpdates"
                      checked={formData.notifications.elections}
                      onCheckedChange={() => handleNotificationToggle("elections")}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label htmlFor="resultNotifications" className="text-sm font-medium">
                        Results notifications
                      </label>
                      <p className="text-sm text-muted-foreground">Get notified when election results are available.</p>
                    </div>
                    <Switch
                      id="resultNotifications"
                      checked={formData.notifications.results}
                      onCheckedChange={() => handleNotificationToggle("results")}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label htmlFor="reminderNotifications" className="text-sm font-medium">
                        Voting reminders
                      </label>
                      <p className="text-sm text-muted-foreground">Get reminders about upcoming voting deadlines.</p>
                    </div>
                    <Switch
                      id="reminderNotifications"
                      checked={formData.notifications.reminders}
                      onCheckedChange={() => handleNotificationToggle("reminders")}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label htmlFor="marketingEmails" className="text-sm font-medium">
                        Marketing emails
                      </label>
                      <p className="text-sm text-muted-foreground">Receive marketing and promotional emails.</p>
                    </div>
                    <Switch
                      id="marketingEmails"
                      checked={formData.notifications.marketing}
                      onCheckedChange={() => handleNotificationToggle("marketing")}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save preferences"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card className="settings-card">
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control who can see your information.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePrivacyUpdate} className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label htmlFor="showProfile" className="text-sm font-medium">
                        Show profile to other students
                      </label>
                      <p className="text-sm text-muted-foreground">Allow other students to see your profile details.</p>
                    </div>
                    <Switch
                      id="showProfile"
                      checked={formData.privacy.showProfile}
                      onCheckedChange={() => handlePrivacyToggle("showProfile")}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label htmlFor="showVotingActivity" className="text-sm font-medium">
                        Share voting activity
                      </label>
                      <p className="text-sm text-muted-foreground">
                        Allow others to see that you've voted (not who you voted for).
                      </p>
                    </div>
                    <Switch
                      id="showVotingActivity"
                      checked={formData.privacy.showVotingActivity}
                      onCheckedChange={() => handlePrivacyToggle("showVotingActivity")}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save privacy settings"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}

export default Settings
