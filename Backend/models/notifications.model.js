import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'recipientModel'
  },
  recipientModel: {
    type: String,
    required: true,
    enum: ['Admins', 'SuperAdmins']
  },
  type: {
    type: String,
    required: true,
    enum: ['admin_signup', 'admin_approved', 'admin_rejected', 'admin_login', 'election_created', 'election_updated', 'election_deleted']
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedModel'
  },
  relatedModel: {
    type: String,
    enum: ['Admins', 'Elections']
  }
}, { timestamps: true });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification; 