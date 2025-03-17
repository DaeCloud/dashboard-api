const fastify = require("fastify")({ logger: true });
const ical = require("ical");
const axios = require("axios");
const moment = require("moment");

require("dotenv").config();

fastify.get("/", async (request, reply) => {
  reply.type("application/json").code(200);
  return { hello: "world" };
});

fastify.get("/weather", async (request, reply) => {
  const apiKey = process.env.WEATHERAPI_KEY; // Replace with your OpenWeatherMap API key
  const lat = process.env.WEATHER_LAT; // Replace with the latitude of the location you want to get weather info for
  const lon = process.env.WEATHER_LON; // Replace with the longitude of the location you want to get weather info for
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

  try {
    const response = await fetch(url);
    const weatherData = await response.json();
    reply.type("application/json").code(200);
    return { weather: weatherData };
  } catch (error) {
    reply.type("application/json").code(500);
    return { error: "Failed to fetch weather data" };
  }
});

fastify.get("/calendar", async (request, reply) => {
  try {
    const url = process.env.ICAL_URL; // Replace with the actual URL of your .ics file
    const response = await axios.get(url);
    const data = response.data;
    const events = ical.parseICS(data);

    const today = moment().startOf("day");
    const tomorrow = moment().add(1, "days").startOf("day");
    const dayAfterTomorrow = moment().add(2, "days").startOf("day");

    const filteredEvents = Object.values(events).filter((event) => {
      const eventDate = moment(event.start);
      return (
        event.type === "VEVENT" && eventDate.isBetween(today, dayAfterTomorrow)
      );
    });

    reply.type("application/json").code(200);
    return { calendar: filteredEvents };
  } catch (error) {
    reply.type("application/json").code(500);
    return { error: "Failed to fetch or parse calendar data" };
  }
});

fastify.get("/speed", async (request, reply) => {
  const url = process.env.SPEED_DOWN_URL;
  const uploadUrl = process.env.SPEED_UP_URL; // Replace with your upload endpoint

  // Measure download speed
  const startTime = performance.now();
  const response = await fetch(url);
  const blob = await response.blob();
  const endTime = performance.now();
  const duration = (endTime - startTime) / 1000; // Convert to seconds

  const fileSizeMB = 100; // File size in MB
  const downloadSpeedMbps = (fileSizeMB * 8) / duration; // Calculate speed in Mbps

  console.log(`Download time: ${duration} seconds`);
  console.log(`Download speed: ${downloadSpeedMbps.toFixed(2)} Mbps`);

  // Measure upload speed
  const uploadStartTime = performance.now();
  const uploadResponse = await fetch(uploadUrl, {
    method: "POST",
    body: blob,
  });
  const uploadEndTime = performance.now();
  const uploadDuration = (uploadEndTime - uploadStartTime) / 1000; // Convert to seconds

  const uploadSpeedMbps = (fileSizeMB * 8) / uploadDuration; // Calculate speed in Mbps

  console.log(`Upload time: ${uploadDuration} seconds`);
  console.log(`Upload speed: ${uploadSpeedMbps.toFixed(2)} Mbps`);

  reply.type("application/json").code(200);
  return {
    downloadSpeed: `${downloadSpeedMbps.toFixed(2)}`,
    uploadSpeed: `${uploadSpeedMbps.toFixed(2)}`,
  };
});

fastify.listen({ port: 3000 }, (err, address) => {
  if (err) throw err;
});
