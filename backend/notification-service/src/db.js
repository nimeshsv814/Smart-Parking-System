const mongoose = require("mongoose");

async function connectDatabase() {
  const mongoUri = process.env.MONGO_URI || "mongodb://mongo:27017/smart_parking";
  const retries = 12;

  mongoose.set("strictQuery", true);

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await mongoose.connect(mongoUri, {
        dbName: process.env.DB_NAME || "smart_parking"
      });
      console.log("Notification service connected to MongoDB");
      return;
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      console.log(`Notification service DB retry ${attempt}`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

module.exports = { connectDatabase };
