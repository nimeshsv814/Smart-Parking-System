require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { connectDatabase } = require("./db");
const ParkingSlot = require("./models/ParkingSlot");
const { requireAuth, requireRole, requireService } = require("./middleware/auth");
const { seedSlots } = require("./seed");

const app = express();
const port = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/", requireAuth, async (req, res) => {
  try {
    const slots = await ParkingSlot.find().sort({ code: 1 });
    res.json(slots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch parking slots" });
  }
});

app.post("/", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { code, level, vehicleType, status } = req.body;

    if (!code || !level) {
      return res.status(400).json({ message: "Code and level are required" });
    }

    const slot = await ParkingSlot.create({
      code,
      level,
      vehicleType: vehicleType || "car",
      status: status || "available"
    });

    res.status(201).json(slot);
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Slot code already exists" });
    }
    res.status(500).json({ message: "Failed to create parking slot" });
  }
});

app.patch("/:slotId/status", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const slot = await ParkingSlot.findByIdAndUpdate(
      req.params.slotId,
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    if (!slot) {
      return res.status(404).json({ message: "Parking slot not found" });
    }

    res.json(slot);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update slot status" });
  }
});

app.post("/internal/reserve/:slotId", requireService, async (req, res) => {
  try {
    const slot = await ParkingSlot.findById(req.params.slotId);

    if (!slot) {
      return res.status(404).json({ message: "Parking slot not found" });
    }

    if (slot.status !== "available") {
      return res.status(400).json({ message: "Parking slot is not available" });
    }

    slot.status = "reserved";
    await slot.save();

    res.json(slot);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to reserve slot" });
  }
});

app.post("/internal/release/:slotId", requireService, async (req, res) => {
  try {
    const slot = await ParkingSlot.findByIdAndUpdate(
      req.params.slotId,
      { status: "available" },
      { new: true }
    );

    if (!slot) {
      return res.status(404).json({ message: "Parking slot not found" });
    }

    res.json(slot);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to release slot" });
  }
});

app.post("/internal/occupy/:slotId", requireService, async (req, res) => {
  try {
    const slot = await ParkingSlot.findByIdAndUpdate(
      req.params.slotId,
      { status: "occupied" },
      { new: true }
    );

    if (!slot) {
      return res.status(404).json({ message: "Parking slot not found" });
    }

    res.json(slot);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to occupy slot" });
  }
});

app.get("/internal/:slotId", requireService, async (req, res) => {
  try {
    const slot = await ParkingSlot.findById(req.params.slotId);
    if (!slot) {
      return res.status(404).json({ message: "Parking slot not found" });
    }
    res.json(slot);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch slot" });
  }
});

async function bootstrap() {
  await connectDatabase();
  await seedSlots();

  app.listen(port, () => {
    console.log(`Parking service running on port ${port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Parking service failed to start", error);
  process.exit(1);
});
