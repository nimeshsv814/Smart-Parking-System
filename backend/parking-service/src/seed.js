const ParkingSlot = require("./models/ParkingSlot");

async function seedSlots() {
  const count = await ParkingSlot.countDocuments();
  if (count > 0) {
    return;
  }

  const slots = Array.from({ length: 10 }).map((_, index) => ({
    code: `A-${String(index + 1).padStart(2, "0")}`,
    status: "available",
    level: "Ground",
    vehicleType: "car"
  }));

  await ParkingSlot.insertMany(slots);
  console.log("Seeded parking slots");
}

module.exports = { seedSlots };
