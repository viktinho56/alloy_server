const bcrypt = require("bcryptjs");
const express = require("express");
const router = express.Router();
const { sendContactEmail, sendPaymentEmail } = require("./../helpers/email");

// Create news
router.post("/sendContactEmail", async (req, res) => {
  await sendContactEmail(
    "",
    "Contact Email",
    req.body.message,
    req.body.fullName,
    req.body.phone,
    req.body.email,
    req.body.company
  );
  res.send("Mail Sent Successfully");
});

// Create news
router.post("/sendPaymentEmail", async (req, res) => {
  await sendPaymentEmail(
    req.body.email,
    "Payment Email",
    "",
    req.body.fullName,
    req.body.amount,
    req.body.tracking
  );
  res.send("Mail Sent Successfully");
});

module.exports = router;
