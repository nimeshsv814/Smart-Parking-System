require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { connectDatabase } = require("./db");
const Payment = require("./models/Payment");
const { requireAuth } = require("./middleware/auth");
const { bookingClient, notificationClient } = require("./clients");

const app = express();
const port = process.env.PORT || 5004;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

async function notify(type, message, metadata) {
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

app.post("/", requireAuth, async (req, res) => {
  try {
    const { bookingId, success } = req.body;

    if (!bookingId || typeof success !== "boolean") {
      return res.status(400).json({ message: "bookingId and boolean success are required" });
    }

    const bookingResponse = await bookingClient.get(`/internal/${bookingId}`);
    const booking = bookingResponse.data;

    if (req.user.role !== "admin" && booking.userId !== req.user.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (booking.status !== "pending_payment") {
      return res.status(400).json({ message: "Booking is not awaiting payment" });
    }

    const payment = await Payment.create({
      bookingId: booking._id,
      userId: booking.userId,
      amount: booking.amount,
      success
    });

    let updatedBooking;

    if (success) {
      const response = await bookingClient.post(`/internal/${bookingId}/confirm`);
      updatedBooking = response.data;
      await notify("payment_status", `Payment succeeded for booking ${bookingId}`, {
        bookingId,
        success: true
      });
    } else {
      const response = await bookingClient.post(`/internal/${bookingId}/fail`);
      updatedBooking = response.data;
      await notify("payment_status", `Payment failed for booking ${bookingId}`, {
        bookingId,
        success: false
      });
    }

    res.json({
      payment,
      booking: updatedBooking
    });
  } catch (error) {
    console.error(error.response?.data || error.message || error);
    const message = error.response?.data?.message || "Failed to process payment";
    const status = error.response?.status || 500;
    res.status(status).json({ message });
  }
});

async function bootstrap() {
  await connectDatabase();

  app.listen(port, () => {
    console.log(`Payment service running on port ${port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Payment service failed to start", error);
  process.exit(1);
});
