const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["available", "reserved", "occupied", "blocked"],
      default: "available"
    },
    level: {
      type: String,
      required: true,
      trim: true
    },
    vehicleType: {
      type: String,
      enum: ["car", "bike", "ev"],
      default: "car"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("ParkingSlot", slotSchema);
