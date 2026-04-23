require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { connectDatabase } = require("./db");
const Notification = require("./models/Notification");
const { requireAuth, requireService } = require("./middleware/auth");

const app = express();
const port = process.env.PORT || 5005;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/", requireAuth, async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(25);
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
});

app.post("/", requireService, async (req, res) => {
  try {
    const notification = await Notification.create({
      type: req.body.type,
      message: req.body.message,
      metadata: req.body.metadata || {}
    });

    console.log(`[Notification:${notification.type}] ${notification.message}`, notification.metadata);
    res.status(201).json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create notification" });
  }
});

async function bootstrap() {
  await connectDatabase();

  app.listen(port, () => {
    console.log(`Notification service running on port ${port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Notification service failed to start", error);
  process.exit(1);
});
