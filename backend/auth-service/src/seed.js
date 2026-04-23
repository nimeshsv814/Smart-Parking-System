const User = require("./models/User");
const bcrypt = require("bcryptjs");

async function seedAdmin() {
  const email = "admin@test.com";
  const existingAdmin = await User.findOne({ email });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 10);

    await User.create({
      name: "Admin User",
      email,
      password: hashedPassword,
      role: "admin"
    });

    console.log("Seeded admin user");
  }
}

module.exports = { seedAdmin };