const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    userEmail: {
      type: String,
      required: true
    },
    slotId: {
      type: String,
      required: true
    },
    slotCode: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      default: 100
    },
    status: {
      type: String,
      enum: ["pending_payment", "confirmed", "cancelled", "expired"],
      default: "pending_payment"
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed", "refunded"],
      default: "pending"
    },
    expiresAt: {
      type: Date,
      required: true
    },
    startTime: {
      type: Date,
      default: Date.now
    },
    endTime: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Booking", bookingSchema);
