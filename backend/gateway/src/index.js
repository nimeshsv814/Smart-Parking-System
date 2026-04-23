require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const port = process.env.PORT || 5000;

const services = {
  auth: process.env.AUTH_SERVICE_URL || "http://auth-service:5001",
  parking: process.env.PARKING_SERVICE_URL || "http://parking-service:5002",
  booking: process.env.BOOKING_SERVICE_URL || "http://booking-service:5003",
  payment: process.env.PAYMENT_SERVICE_URL || "http://payment-service:5004",
  notification: process.env.NOTIFICATION_SERVICE_URL || "http://notification-service:5005"
};

app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", services });
});

function proxy(path, target) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: {
      [`^${path}`]: ""
    }
  });
}

app.use("/api/auth", proxy("/api/auth", services.auth));
app.use("/api/parking", proxy("/api/parking", services.parking));
app.use("/api/bookings", proxy("/api/bookings", services.booking));
app.use("/api/payments", proxy("/api/payments", services.payment));
app.use("/api/notifications", proxy("/api/notifications", services.notification));

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(port, () => {
  console.log(`Gateway running on port ${port}`);
});
