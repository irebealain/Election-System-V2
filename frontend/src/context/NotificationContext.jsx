import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '@/lib/axios';

const NotificationContext = createContext();

export const useNotifications = () => {
    return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
    // Keep your existing notification toast state
    const [notification, setNotification] = useState({
        show: false,
        message: '',
        type: 'success', // success, error, warning, info
    });

    // Add new state for the notification list
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch notifications when the component mounts
    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/notifications`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            if (response.data.success) {
                setNotifications(response.data.notifications || []);
                setUnreadCount(
                    response.data.notifications.filter(n => !n.read).length
                );
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/notifications/${notificationId}/read`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            if (response.data.success) {
                // Update local state
                setNotifications(prev => 
                    prev.map(n => 
                        n._id === notificationId ? { ...n, read: true } : n
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/notifications/read-all`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            if (response.data.success) {
                // Update local state
                setNotifications(prev => 
                    prev.map(n => ({ ...n, read: true }))
                );
                setUnreadCount(0);
            }
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
        }
    };

    // Keep your existing toast notification functions
    const showNotification = (message, type = 'success') => {
        setNotification({
            show: true,
            message,
            type,
        });

        // Auto-hide notification after 3 seconds
        setTimeout(() => {
            setNotification(prev => ({
                ...prev,
                show: false,
            }));
        }, 3000);
    };

    const hideNotification = () => {
        setNotification(prev => ({
            ...prev,
            show: false,
        }));
    };

    const value = {
        // Toast notification
        notification,
        showNotification,
        hideNotification,
        
        // Notification list
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        refreshNotifications: fetchNotifications
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
export default NotificationContext;