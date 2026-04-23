const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true
    },
    userId: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    success: {
      type: Boolean,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Payment", paymentSchema);
