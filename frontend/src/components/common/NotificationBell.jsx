import { useState } from "react";
import { Bell, Check, X } from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";
import { useNavigate } from "react-router-dom";
import axios from "@/lib/axios";
import toast from "react-hot-toast";

function NotificationBell() {
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };
  
  const handleApproveAdmin = async (adminId) => {
    try {
      setLoading(true);
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/superadmin/approve/${adminId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.success) {
        // Find the notification for this admin
        const notification = notifications.find(n => n.relatedId === adminId);
        if (notification) {
          markAsRead(notification._id);
        }
        
        // Refresh notifications to get updated list
        fetchNotifications();
        
        toast.success("Admin approved successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve admin");
      console.error("Error approving admin:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRejectAdmin = async (adminId) => {
    try {
      setLoading(true);
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/superadmin/reject/${adminId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.success) {
        // Find the notification for this admin
        const notification = notifications.find(n => n.relatedId === adminId);
        if (notification) {
          markAsRead(notification._id);
        }
        
        // Refresh notifications to get updated list
        fetchNotifications();
        
        toast.success("Admin rejected successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject admin");
      console.error("Error rejecting admin:", error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="relative">
      <button 
        onClick={toggleNotifications}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 relative transition-all duration-300 hover:scale-110"
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse shadow-lg">
            {unreadCount}
          </span>
        )}
      </button>
      
      {/* Notification Panel */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden transform transition-all duration-300 animate-slideIn">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800">
            <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-sm text-primary hover:underline transition-colors duration-200 bg-white dark:bg-gray-700 px-3 py-1 rounded-full shadow-sm hover:shadow-md"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-[32rem] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center">
                <Bell className="h-12 w-12 mb-3 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification._id}
                  className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${
                    !notification.read ? 'bg-blue-50/70 dark:bg-blue-900/30' : ''
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium flex items-center gap-2">
                      {notification.type === 'admin_signup' && '👤 New Admin Registration'}
                      {notification.type === 'admin_login' && '🔑 Admin Login'}
                      {notification.type === 'admin_approved' && '✅ Admin Approved'}
                      {notification.type === 'admin_rejected' && '❌ Admin Rejected'}
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full">
                      {new Date(notification.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-sm mt-2 text-gray-600 dark:text-gray-300">{notification.message}</p>
                  
                  {notification.type === 'admin_signup' && !notification.read && (
                    <div className="mt-3 flex space-x-3">
                      <button
                        onClick={() => handleApproveAdmin(notification.relatedId)}
                        className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 flex items-center justify-center transition-all duration-200 hover:shadow-md disabled:opacity-50"
                        disabled={loading}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectAdmin(notification.relatedId)}
                        className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 flex items-center justify-center transition-all duration-200 hover:shadow-md disabled:opacity-50"
                        disabled={loading}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #CBD5E0
          border-radius: 3px
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #A0AEC0
        }
        @keyframes slideIn {
          from {
            opacity: 0
            transform: translateY(-10px)
          }
          to {
            opacity: 1
            transform: translateY(0)
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out
        }
      `}</style>
    </div>
  );
}

export default NotificationBell;