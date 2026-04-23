require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cron = require("node-cron");
const { connectDatabase } = require("./db");
const Booking = require("./models/Booking");
const { requireAuth, requireService } = require("./middleware/auth");
const { parkingClient, notificationClient } = require("./clients");

const app = express();
const port = process.env.PORT || 5003;
const bookingExpiryMinutes = Number(process.env.BOOKING_EXPIRY_MINUTES || 10);

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

async function sendNotification(type, message, metadata) {
  try {
    await notificationClient.post("/", {
      type,
      message,
      metadata
    });
  } catch (error) {
    console.error("Notification request failed", error.message);
  }
}

async function releaseSlot(slotId) {
  await parkingClient.post(`/internal/release/${slotId}`);
}

async function occupySlot(slotId) {
  await parkingClient.post(`/internal/occupy/${slotId}`);
}

async function reserveSlot(slotId) {
  const { data } = await parkingClient.post(`/internal/reserve/${slotId}`);
  return data;
}

async function expireBookingRecord(booking, reason) {
  if (!booking || booking.status !== "pending_payment") {
    return booking;
  }

  booking.status = "expired";
  booking.paymentStatus = "failed";
  booking.endTime = new Date();
  await booking.save();

  await releaseSlot(booking.slotId);
  await sendNotification("expiry_alert", `Booking ${booking._id} expired`, {
    reason,
    bookingId: booking._id.toString(),
    slotId: booking.slotId,
    slotCode: booking.slotCode
  });

  return booking;
}

app.get("/", requireAuth, async (req, res) => {
  try {
    const query = req.user.role === "admin" ? {} : { userId: req.user.userId };
    const bookings = await Booking.find(query).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

app.post("/", requireAuth, async (req, res) => {
  try {
    const { slotId } = req.body;

    if (!slotId) {
      return res.status(400).json({ message: "slotId is required" });
    }

    const existingOpenBooking = await Booking.findOne({
      userId: req.user.userId,
      status: { $in: ["pending_payment", "confirmed"] }
    });

    if (existingOpenBooking) {
      return res.status(400).json({ message: "User already has an active booking" });
    }

    const reservedSlot = await reserveSlot(slotId);

    const booking = await Booking.create({
      userId: req.user.userId,
      userName: req.user.name,
      userEmail: req.user.email,
      slotId: reservedSlot._id.toString(),
      slotCode: reservedSlot.code,
      amount: 100,
      expiresAt: new Date(Date.now() + bookingExpiryMinutes * 60 * 1000)
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error(error.response?.data || error.message || error);
    const message = error.response?.data?.message || "Failed to create booking";
    const status = error.response?.status || 500;
    res.status(status).json({ message });
  }
});

app.patch("/:bookingId/cancel", requireAuth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const isOwner = booking.userId === req.user.userId;
    if (req.user.role !== "admin" && !isOwner) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (booking.status === "cancelled" || booking.status === "expired") {
      return res.json(booking);
    }

    const shouldRelease = booking.status === "pending_payment" || booking.status === "confirmed";

    booking.status = "cancelled";
    booking.paymentStatus = booking.paymentStatus === "success" ? "refunded" : "failed";
    booking.endTime = new Date();
    await booking.save();

    if (shouldRelease) {
      await releaseSlot(booking.slotId);
    }

    await sendNotification("booking_cancelled", `Booking ${booking._id} cancelled`, {
      bookingId: booking._id.toString(),
      slotCode: booking.slotCode
    });

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to cancel booking" });
  }
});

app.post("/internal/:bookingId/confirm", requireService, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = "confirmed";
    booking.paymentStatus = "success";
    booking.endTime = null;
    await booking.save();

    await occupySlot(booking.slotId);
    await sendNotification("booking_confirmation", `Booking ${booking._id} confirmed`, {
      bookingId: booking._id.toString(),
      slotCode: booking.slotCode
    });

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to confirm booking" });
  }
});

app.post("/internal/:bookingId/fail", requireService, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status === "cancelled" || booking.status === "expired") {
      return res.json(booking);
    }

    booking.status = "cancelled";
    booking.paymentStatus = "failed";
    booking.endTime = new Date();
    await booking.save();

    await releaseSlot(booking.slotId);
    await sendNotification("payment_status", `Payment failed for booking ${booking._id}`, {
      bookingId: booking._id.toString(),
      slotCode: booking.slotCode,
      success: false
    });

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fail booking" });
  }
});

app.get("/internal/:bookingId", requireService, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch booking" });
  }
});

function startScheduler() {
  cron.schedule("* * * * *", async () => {
    const expiredBookings = await Booking.find({
      status: "pending_payment",
      expiresAt: { $lte: new Date() }
    });

    for (const booking of expiredBookings) {
      try {
        await expireBookingRecord(booking, "timeout");
      } catch (error) {
        console.error("Failed to expire booking", booking._id.toString(), error.message);
      }
    }
  });

  console.log("Booking scheduler started");
}

async function bootstrap() {
  await connectDatabase();
  startScheduler();

  app.listen(port, () => {
    console.log(`Booking service running on port ${port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Booking service failed to start", error);
  process.exit(1);
});
