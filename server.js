const express = require("express");
const axios = require("axios");

require("dotenv").config();

const app = express();
const port = 3000;

app.get("/speed", async (req, res) => {
  const url = process.env.SPEED_DOWN_URL;

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

  res.status(200).json({
    downloadSpeed: `${downloadSpeedMbps.toFixed(2)}`,
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://0.0.0.0:${port}`);
});
