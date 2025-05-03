import express from "express";
import { 
  getNotifications, 
  createNotification, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification 
} from "../controllers/notifications.controller.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

// Get all notifications for a user
router.get("/:recipientId", protect, getNotifications);

// Create a new notification
router.post("/", protect, createNotification);

// Mark a notification as read
router.put("/:notificationId/read", protect, markAsRead);

// Mark all notifications as read for a user
router.put("/:recipientId/read-all", protect, markAllAsRead);

// Delete a notification
router.delete("/:notificationId", protect, deleteNotification);

export default router;