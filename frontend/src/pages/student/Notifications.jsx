import Link from "next/link"
import { useState, useEffect } from "react"
import { Card, CardContent } from "../../components/common/Card"
import Button from "../../components/common/Button"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, Clock, Vote, Award, Settings, AlertTriangle, Check, Trash, MailOpen } from "lucide-react"
import toast from "react-hot-toast"

// Sample notifications data
const notificationsData = [
  {
    id: 1,
    type: "election",
    title: "New Election Created",
    message: "A new election for Student Council 2023 has been created. Voting starts on October 25, 2023.",
    timestamp: "2023-10-15T10:00:00",
    read: false,
  },
  {
    id: 2,
    type: "reminder",
    title: "Voting Reminder",
    message: "Don't forget to cast your vote for the Student Council 2023 election. Voting closes in 2 days.",
    timestamp: "2023-10-23T09:30:00",
    read: true,
  },
  {
    id: 3,
    type: "result",
    title: "Election Results Available",
    message: "The results for the Spring 2023 election are now available. Click to view the results.",
    timestamp: "2023-04-30T14:15:00",
    read: false,
  },
  {
    id: 4,
    type: "system",
    title: "Account Security",
    message: "We noticed a login from a new device. Please verify if this was you or update your password.",
    timestamp: "2023-10-10T08:45:00",
    read: false,
  },
  {
    id: 5,
    type: "election",
    title: "New Position Added",
    message: "A new position 'Student Representative' has been added to the upcoming election.",
    timestamp: "2023-10-12T11:20:00",
    read: true,
  },
]

function Notifications() {
  const [notifications, setNotifications] = useState([...notificationsData])
  const [filter, setFilter] = useState("all")
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false)

  useEffect(() => {
    document.title = "Notifications | Student Dashboard"
  }, [])

  const getFilteredNotifications = () => {
    if (filter === "all") return notifications
    if (filter === "unread") return notifications.filter((notification) => !notification.read)
    return notifications.filter((notification) => notification.type === filter)
  }

  const getUnreadCount = () => {
    return notifications.filter((notification) => !notification.read).length
  }

  const handleMarkAsRead = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    )
    toast.success("Marked as read")
  }

  const handleMarkAllAsRead = () => {
    setIsMarkingAllRead(true)

    // Simulate API call
    setTimeout(() => {
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({ ...notification, read: true })),
      )
      setIsMarkingAllRead(false)
      toast.success("All notifications marked as read")
    }, 1000)
  }

  const handleDeleteNotification = (id) => {
    setNotifications((prevNotifications) => prevNotifications.filter((notification) => notification.id !== id))
    toast.success("Notification deleted")
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "election":
        return <Vote className="h-5 w-5 text-blue-500" />
      case "reminder":
        return <Clock className="h-5 w-5 text-amber-500" />
      case "result":
        return <Award className="h-5 w-5 text-green-500" />
      case "system":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-satoshi">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with the latest election information and system updates.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={getUnreadCount() === 0 || isMarkingAllRead}
          >
            {isMarkingAllRead ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : (
              <>
                <MailOpen className="mr-2 h-4 w-4" />
                Mark all as read
              </>
            )}
          </Button>
          <Link to="/student/settings">
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Notification Settings
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center space-x-2 mb-4 overflow-x-auto pb-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
          className="transition-colors"
        >
          All
          {filter === "all" && (
            <div className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-background">
              {notifications.length}
            </div>
          )}
        </Button>
        <Button
          variant={filter === "unread" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("unread")}
          className="transition-colors"
        >
          Unread
          {getUnreadCount() > 0 && (
            <div className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-background">
              {getUnreadCount()}
            </div>
          )}
        </Button>
        <Button
          variant={filter === "election" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("election")}
          className="transition-colors"
        >
          Elections
        </Button>
        <Button
          variant={filter === "reminder" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("reminder")}
          className="transition-colors"
        >
          Reminders
        </Button>
        <Button
          variant={filter === "result" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("result")}
          className="transition-colors"
        >
          Results
        </Button>
        <Button
          variant={filter === "system" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("system")}
          className="transition-colors"
        >
          System
        </Button>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {getFilteredNotifications().length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 text-center space-y-4"
            >
              <Bell className="h-16 w-16 text-muted-foreground opacity-30" />
              <div>
                <h3 className="text-lg font-medium">No notifications found</h3>
                <p className="text-muted-foreground">
                  {filter === "all"
                    ? "You don't have any notifications yet."
                    : filter === "unread"
                      ? "You don't have any unread notifications."
                      : `You don't have any ${filter} notifications.`}
                </p>
              </div>
            </motion.div>
          ) : (
            getFilteredNotifications().map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                layout
              >
                <Card className={`transition-colors ${!notification.read ? "border-l-4 border-l-primary" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="rounded-full p-2 bg-background">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className={`font-medium ${!notification.read ? "text-primary" : ""}`}>
                              {notification.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">{formatDate(notification.timestamp)}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleMarkAsRead(notification.id)}
                              >
                                <span className="sr-only">Mark as read</span>
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground"
                              onClick={() => handleDeleteNotification(notification.id)}
                            >
                              <span className="sr-only">Delete</span>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm">{notification.message}</p>
                        {notification.type === "election" && (
                          <Button variant="outline" size="sm" className="mt-2">
                            <Vote className="mr-2 h-4 w-4" />
                            View Election
                          </Button>
                        )}
                        {notification.type === "result" && (
                          <Button variant="outline" size="sm" className="mt-2">
                            <Award className="mr-2 h-4 w-4" />
                            View Results
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default Notifications
