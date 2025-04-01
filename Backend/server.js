import express from "express";
import dotenv from 'dotenv';
import { connectDB } from "./config/db.js";
import candidateRoutes from "./routes/candidates.route.js";
import superAdminRoutes from "./routes/superAdmin.route.js";
import adminRoutes from "./routes/admin.route.js"
import electionRoutes from "./routes/elections.route.js"

const app = express()
const port = 3000

dotenv.config();
app.use(express.json());
app.use("/api/candidates", candidateRoutes)
app.use("/api/superAdmins", superAdminRoutes)
app.use("/api/admins/", adminRoutes)
app.use("/api/elections/", electionRoutes)

app.listen(port, () => {
  connectDB();
  console.log(`App listening on port ${port}`)
})