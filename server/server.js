import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import { inngest, functions } from "./configs/inngest/index.js"

const app = express();
const port = 3000;

// Connect to database
await connectDB();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

// API Routes
app.get("/", (req, res) => {
  res.send("Server is live!!!!!");
});
app.use('/api/inngest', serve({ client: inngest, functions }))

// Listening the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
