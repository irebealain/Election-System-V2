import express from "express";
import dotenv from 'dotenv';
import { connectDB } from "./config/db.js";

const app = express()
const port = 3000

dotenv.config();

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  connectDB();
  console.log(`App listening on port ${port}`)
})