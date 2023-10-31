const express = require("express");
const bodyParser = require("body-parser");
const { exec } = require("child_process");

const app = express();
const port = 3001; // You can choose any available port

app.use(bodyParser.json());

// Define a route to play a sound file
app.post("/playSound", (req, res) => {
  const { index } = req.body;

  // Replace with the actual path to your sound files
  const soundFilePath = `/path/to/your/sound/files/${index}.mp3`;

  // Command to play the sound file (adjust as needed for your system)
  const playCommand = `omxplayer -o local ${soundFilePath}`;

  exec(playCommand, (error, stdout, stderr) => {
    if (error) {
      console.error("Error playing sound:", error);
      res.status(500).json({ error: "Failed to play sound" });
    } else {
      console.log("Sound played successfully");
      res.status(200).json({ message: "Sound played successfully" });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
