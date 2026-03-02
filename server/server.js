// server/server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = 3001;
const SCRIPT_ID = "AKfycbzr7lB1Rc572hvOqwYs4Xbo7oNSbVeDMNubvSymy9JbsBEChYqc8upG6KUCfv6iMKpF";

// Enable CORS for your React app
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/submit-survey", async (req, res) => {
  try {
    const formBody = new URLSearchParams();

    // Convert request body to URLSearchParams for Apps Script
    Object.keys(req.body).forEach((key) => {
      if (Array.isArray(req.body[key])) {
        req.body[key].forEach((val) => formBody.append(key, val));
      } else {
        formBody.append(key, req.body[key]);
      }
    });

    const response = await fetch(
      `https://script.google.com/macros/s/${SCRIPT_ID}/exec`,
      {
        method: "POST",
        body: formBody,
      }
    );

    const text = await response.text();
    res.json({ status: "success", text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));