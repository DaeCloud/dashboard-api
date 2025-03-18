const express = require("express");
const ical = require("ical");
const axios = require("axios");
const moment = require("moment");

require("dotenv").config();

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.status(200).json({ hello: "world" });
});

app.get("/weather", async (req, res) => {
  const apiKey = process.env.WEATHERAPI_KEY; // Replace with your OpenWeatherMap API key
  const lat = process.env.WEATHER_LAT; // Replace with the latitude of the location you want to get weather info for
  const lon = process.env.WEATHER_LON; // Replace with the longitude of the location you want to get weather info for
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

  try {
    const response = await axios.get(url);
    const weatherData = response.data;
    res.status(200).json({ weather: weatherData });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

app.get("/calendar", async (req, res) => {
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

    res.status(200).json({ calendar: filteredEvents });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch or parse calendar data" });
  }
});

app.get("/speed", async (req, res) => {
  const url = process.env.SPEED_DOWN_URL;
  const uploadUrl = process.env.SPEED_UP_URL; // Replace with your upload endpoint
  const username = process.env.UPLOAD_USERNAME; // Your username
  const password = process.env.UPLOAD_PASSWORD; // Your password

  // Measure download speed
  const startTime = performance.now();
  const response = await axios.get(url, { responseType: "blob" });
  const blob = response.data;
  const endTime = performance.now();
  const duration = (endTime - startTime) / 1000; // Convert to seconds

  const fileSizeMB = process.env.SPEED_FILE_SIZE; // File size in MB
  const downloadSpeedMbps = (fileSizeMB * 8) / duration; // Calculate speed in Mbps

  console.log(`Download time: ${duration} seconds`);
  console.log(`Download speed: ${downloadSpeedMbps.toFixed(2)} Mbps`);

  // Measure upload speed
  const uploadStartTime = performance.now();
  const uploadResponse = await axios.post(uploadUrl, blob, {
    auth: {
      username: username,
      password: password,
    },
  });
  const uploadEndTime = performance.now();
  const uploadDuration = (uploadEndTime - uploadStartTime) / 1000; // Convert to seconds

  const uploadSpeedMbps = (fileSizeMB * 8) / uploadDuration; // Calculate speed in Mbps

  console.log(`Upload time: ${uploadDuration} seconds`);
  console.log(`Upload speed: ${uploadSpeedMbps.toFixed(2)} Mbps`);

  res.status(200).json({
    downloadSpeed: `${downloadSpeedMbps.toFixed(2)}`,
    uploadSpeed: `${uploadSpeedMbps.toFixed(2)}`,
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://0.0.0.0:${port}`);
});
