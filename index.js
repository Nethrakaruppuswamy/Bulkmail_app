
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to DB"))
  .catch(() => console.log("DB connection error"));


const credentialSchema = new mongoose.Schema({
  user: String,
  pass: String
}, { collection: "bulkmail" });

const Credentials = mongoose.model("Credentials", credentialSchema);


app.post("/sendemail", async (req, res) => {
  const { msg, emailList } = req.body;

  try {
    
    const creds = await Credentials.findOne(); 

    if (!creds) {
      return res.status(500).send(false);
    }


    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: creds.user,
        pass: creds.pass
      },
    });

    
    for (let i = 0; i < emailList.length; i++) {
      await transporter.sendMail({
        from: creds.user, 
        to: emailList[i],
        subject: "A message from Bulk mail app",
        text: msg,
      });
      console.log("Email sent to " + emailList[i]);
    }

    res.send(true); 
  } catch (error) {
    console.error("Error sending emails:", error);
    res.send(false); 
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

