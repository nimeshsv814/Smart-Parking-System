const axios = require("axios");

const serviceToken = process.env.SERVICE_TOKEN || "internal-service-token";

const parkingClient = axios.create({
  baseURL: process.env.PARKING_SERVICE_URL || "http://parking-service:5002",
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
  parkingClient,
  notificationClient
};
