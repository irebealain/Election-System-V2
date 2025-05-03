import express from "express";
import dotenv from 'dotenv';
import { connectDB } from "./config/db.js";
import candidateRoutes from "./routes/candidates.route.js";
import superAdminRoutes from "./routes/superAdmin.route.js";
import adminRoutes from "./routes/admin.route.js"
import electionRoutes from "./routes/elections.route.js";
import userRoutes from "./routes/users.route.js"
import positionRoutes from "./routes/positions.route.js";
import voteRoutes from "./routes/votes.route.js";
import notificationRoutes from "./routes/notifications.route.js";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

dotenv.config();
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use("/api/candidates/", candidateRoutes);
app.use("/api/superadmins/", superAdminRoutes);
app.use("/api/admins/", adminRoutes);
app.use("/api/elections/", electionRoutes);
app.use("/api/users/", userRoutes);
app.use("/api/positions/", positionRoutes);
app.use("/api/votes/", voteRoutes);
app.use("/api/notifications/", notificationRoutes);

// Connect to MongoDB and start server
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });
}).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});