
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Mongoose connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("DB connection error:", err));

// Schema and model
const credentialSchema = new mongoose.Schema({
  user: String,
  pass: String
}, { collection: "bulkmail" });

const Credentials = mongoose.model("Credentials", credentialSchema);

// **Root route**
app.get("/", (req, res) => {
  res.send("Bulkmail backend is running!");
});

// Email sending route
app.post("/sendemail", async (req, res) => {
  const { msg, emailList } = req.body;

  try {
    const creds = await Credentials.findOne(); 
    if (!creds) {
      return res.status(500).send({ success: false, message: "No credentials found in DB" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: creds.user,
        pass: creds.pass
      },
    });

    for (let email of emailList) {
      await transporter.sendMail({
        from: creds.user,
        to: email,
        subject: "A message from Bulkmail app",
        text: msg,
      });
      console.log("Email sent to " + email);
    }

    res.send({ success: true });
  } catch (error) {
    console.error("Error sending emails:", error);
    res.status(500).send({ success: false, error: error.message });
  }
});

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
