import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/common/Card"
import { TabsContent, TabsList, TabsTrigger } from "../../components/common/Tabs"
import Tabs from "../../components/common/Tabs"
import Button from "../../components/common/Button"
import { Switch } from "../../components/common/Switch"
import { Camera, Save, Trash, LogOut, User, Shield, Key, Mail, Lock } from "lucide-react"
import toast from "react-hot-toast"
import { motion } from "framer-motion"
import { updateUserProfile, updateUserPassword, updateUserPrivacy, uploadProfileImage } from "../../services/UserService"

function Settings() {
  const { currentUser, login } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")
  const [isLoading, setIsLoading] = useState(false)
  const [profileImage, setProfileImage] = useState(currentUser?.picture || "/placeholder.svg")
  const [formData, setFormData] = useState({
    firstName: currentUser?.firstName || "",
    lastName: currentUser?.lastName || "",
    email: currentUser?.email || "",
    bio: currentUser?.bio || "Student at Example University, majoring in Computer Science.",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
    privacy: {
      showProfile: currentUser?.privacy?.showProfile ?? true,
      showVotingActivity: currentUser?.privacy?.showVotingActivity ?? false,
    },
  })

  useEffect(() => {
    document.title = "Settings | Student Dashboard"
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
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

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const profileData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio,
      }

      const response = await updateUserProfile(currentUser.id, profileData)
      
      login({
        token: localStorage.getItem('authToken'),
        user: { ...currentUser, ...response.data }
      })

      toast.success("Profile updated successfully!")
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error(error.response?.data?.message || "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match!")
      return
    }

    setIsLoading(true)

    try {
      await updateUserPassword(currentUser.id, {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      })

      toast.success("Password updated successfully!")

      setFormData({
        ...formData,
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      console.error('Error updating password:', error)
      toast.error(error.response?.data?.message || "Failed to update password")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrivacyUpdate = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await updateUserPrivacy(currentUser.id, formData.privacy)
      
      login({
        token: localStorage.getItem('authToken'),
        user: { ...currentUser, privacy: response.data.privacy }
      })

      toast.success("Privacy settings updated!")
    } catch (error) {
      console.error('Error updating privacy settings:', error)
      toast.error(error.response?.data?.message || "Failed to update privacy settings")
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)

    try {
      const response = await uploadProfileImage(currentUser.id, file)
      
      setProfileImage(response.data.profileImage)
      login({
        token: localStorage.getItem('authToken'),
        user: { ...currentUser, picture: response.data.profileImage }
      })

      toast.success("Profile image updated!")
    } catch (error) {
      console.error('Error uploading profile image:', error)
      toast.error(error.response?.data?.message || "Failed to upload profile image")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTabChange = (value) => {
    setActiveTab(value)
  }

  return (
    <motion.div 
      className="max-w-4xl mx-auto px-4 py-8 space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-satoshi">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User size={16} />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <Key size={16} />
            <span>Account</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield size={16} />
            <span>Privacy</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/50">
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your profile information and bio.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                  <motion.div 
                    className="relative group"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="h-32 w-32 rounded-full overflow-hidden ring-4 ring-background shadow-lg">
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <label className="absolute bottom-0 right-0">
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isLoading}
                      />
                      <Button
                        size="sm"
                        variant="default"
                        className="h-10 w-10 rounded-full p-0 bg-primary hover:bg-primary/90 shadow-lg"
                        disabled={isLoading}
                      >
                        <Camera className="h-5 w-5" />
                        <span className="sr-only">Upload image</span>
                      </Button>
                    </label>
                  </motion.div>

                  <div className="space-y-4 flex-1">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label htmlFor="firstName" className="block text-sm font-medium">
                          First Name
                        </label>
                        <input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="lastName" className="block text-sm font-medium">
                          Last Name
                        </label>
                        <input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
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
                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
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
                        className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    className="bg-primary hover:bg-primary/90 transition-colors"
                    disabled={isLoading}
                  >
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

        <TabsContent value="account" className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/50">
              <CardTitle>Password</CardTitle>
              <CardDescription>Update your password to keep your account secure.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="oldPassword" className="block text-sm font-medium">
                    Current password
                  </label>
                  <div className="relative">
                    <input
                      id="oldPassword"
                      name="oldPassword"
                      type="password"
                      value={formData.oldPassword}
                      onChange={handleInputChange}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                    />
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="newPassword" className="block text-sm font-medium">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                    />
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium">
                    Confirm password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                    />
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    className="bg-primary hover:bg-primary/90 transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? "Updating..." : "Update password"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/50">
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control who can see your information.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handlePrivacyUpdate} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-input hover:bg-muted/50 transition-colors">
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

                  <div className="flex items-center justify-between p-4 rounded-lg border border-input hover:bg-muted/50 transition-colors">
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
                  <Button 
                    type="submit" 
                    className="bg-primary hover:bg-primary/90 transition-colors"
                    disabled={isLoading}
                  >
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
