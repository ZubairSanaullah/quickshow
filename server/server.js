import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import { inngest, functions } from "./configs/inngest/index.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to database with error handling
try {
  await connectDB();
  console.log("Database connected successfully");
} catch (error) {
  console.error("Database connection failed:", error);
  process.exit(1); // Exit if DB is critical
}

// Middlewares
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// API Routes
app.get("/", (req, res) => {
  res.json({ message: "Server is live", timestamp: new Date().toISOString() });
});

// Clerk Webhook Route (Bridge to Inngest)
app.post("/api/webhooks/clerk", async (req, res) => {
  try {
    const { data, type } = req.body;

    // Map Clerk types to Inngest events
    const eventMap = {
      "user.created": "clerk/user.created",
      "user.updated": "clerk/user.updated",
      "user.deleted": "clerk/user.deleted",
    };

    const eventName = eventMap[type];

    if (eventName) {
      await inngest.send({
        name: eventName,
        data: data,
      });
      console.log(`Event sent to Inngest: ${eventName}`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Webhook failed" });
  }
});

// Inngest route - Ensure this is reachable by Inngest
app.use("/api/inngest", serve({ client: inngest, functions }));

// Error handling middleware (Optional but recommended)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
