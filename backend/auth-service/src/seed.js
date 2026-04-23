const User = require("./models/User");

async function seedAdmin() {
  const email = "admin@test.com";
  const existingAdmin = await User.findOne({ email });

  if (!existingAdmin) {
    await User.create({
      name: "Admin User",
      email,
      password: "admin123",
      role: "admin"
    });
    console.log("Seeded admin user");
  }
}

module.exports = { seedAdmin };
