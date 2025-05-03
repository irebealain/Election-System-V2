import Notification from "../models/notifications.model.js";
import mongoose from "mongoose";

// Get all notifications for a specific recipient
export const getNotifications = async (req, res) => {
  const { recipientId } = req.params;
  
  try {
    const notifications = await Notification.find({ 
      recipient: recipientId 
    }).sort({ createdAt: -1 });
    
    res.status(200).json({ 
      success: true, 
      data: notifications 
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch notifications" 
    });
  }
};

// Create a new notification
export const createNotification = async (req, res) => {
  const { recipient, type, message, relatedId } = req.body;
  
  try {
    const notification = new Notification({
      recipient,
      type,
      message,
      relatedId,
      read: false
    });
    
    await notification.save();
    
    res.status(201).json({ 
      success: true, 
      data: notification 
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create notification" 
    });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  const { notificationId } = req.params;
  
  try {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ 
        success: false, 
        message: "Notification not found" 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      data: notification 
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update notification" 
    });
  }
};

// Mark all notifications as read for a user
export const markAllAsRead = async (req, res) => {
  const { recipientId } = req.params;
  
  try {
    await Notification.updateMany(
      { recipient: recipientId, read: false },
      { read: true }
    );
    
    res.status(200).json({ 
      success: true, 
      message: "All notifications marked as read" 
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update notifications" 
    });
  }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
  const { notificationId } = req.params;
  
  try {
    await Notification.findByIdAndDelete(notificationId);
    
    res.status(200).json({ 
      success: true, 
      message: "Notification deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete notification" 
    });
  }
};
