const express = require("express");
const { google } = require("googleapis");
const fs = require("fs");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());

// Google Auth Setup
const auth = new google.auth.GoogleAuth({
  keyFile: "credentials.json", // Service account key file
  scopes: [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/tasks",
    "https://www.googleapis.com/auth/drive.file"
  ]
});

app.post("/create-event", async (req, res) => {
  const { summary, description, date } = req.body;
  const authClient = await auth.getClient();
  const calendar = google.calendar({ version: "v3", auth: authClient });

  calendar.events.insert({
    calendarId: "primary",
    resource: {
      summary,
      description,
      start: { dateTime: `${date}T09:00:00`, timeZone: "Asia/Kolkata" },
      end: { dateTime: `${date}T10:00:00`, timeZone: "Asia/Kolkata" }
    }
  }, (err, event) => {
    if (err) return res.status(500).send("Error: " + err);
    res.send(`Event created: ${event.data.htmlLink}`);
  });
});

app.post("/upload-note", async (req, res) => {
  const authClient = await auth.getClient();
  const drive = google.drive({ version: "v3", auth: authClient });

  const fileMetadata = {
    name: "note.pdf",
    parents: ["your-folder-id"]
  };
  const media = {
    mimeType: "application/pdf",
    body: fs.createReadStream("note.pdf")
  };

  drive.files.create({
    resource: fileMetadata,
    media,
    fields: "id"
  }, (err, file) => {
    if (err) return res.status(500).send("Upload error: " + err);
    res.send(`File ID: ${file.data.id}`);
  });
});

app.listen(3000, () => console.log("Server running on port 3000"));
