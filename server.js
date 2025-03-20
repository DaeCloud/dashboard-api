const express = require("express");
const axios = require("axios");

require("dotenv").config();

const app = express();
const port = 3000;

app.get("/speed", async (req, res) => {
  const url = process.env.SPEED_DOWN_URL;
  const numDownloads = process.env.NUM_DOWNLOADS || 5;
  const fileSizeMB = process.env.SPEED_FILE_SIZE;

  const downloadPromises = [];
    const startTime = performance.now();

    for (let i = 0; i < numDownloads; i++) {
        downloadPromises.push(axios.get(url, { responseType: "blob" }));
    }

    const responses = await Promise.all(downloadPromises);
    const blob = responses[0].data;
    const endTime = performance.now();
    const duration = (endTime - startTime) / 1000; // Convert to seconds

    const totalFileSizeMB = fileSizeMB * numDownloads;
    const downloadSpeedMbps = (totalFileSizeMB * 8) / duration; // Calculate speed in Mbps

    console.log(`Download time: ${duration} seconds`);
    console.log(`Download speed: ${downloadSpeedMbps.toFixed(2)} Mbps`);
  
    res.status(200).json({
      downloadSpeed: `${downloadSpeedMbps.toFixed(2)}`
    });
});

app.listen(port, () => {
  console.log(`Server listening at http://0.0.0.0:${port}`);
});
