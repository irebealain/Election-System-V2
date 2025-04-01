import express from "express";
import dotenv from 'dotenv';
import { connectDB } from "./config/db.js";
import candidateRoutes from "./routes/candidates.route.js";
const app = express()
const port = 3000

dotenv.config();

app.use("api/candidates", candidateRoutes)

app.listen(port, () => {
  connectDB();
  console.log(`App listening on port ${port}`)
})