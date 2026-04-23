const axios = require("axios");

const serviceToken = process.env.SERVICE_TOKEN || "internal-service-token";

const bookingClient = axios.create({
  baseURL: process.env.BOOKING_SERVICE_URL || "http://booking-service:5003",
  headers: {
    "x-service-token": serviceToken
  }
});

const notificationClient = axios.create({
  baseURL: process.env.NOTIFICATION_SERVICE_URL || "http://notification-service:5005",
  headers: {
    "x-service-token": serviceToken
  }
});

module.exports = {
  bookingClient,
  notificationClient
};
