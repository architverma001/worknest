const express = require("express");
const { sendOTP, verifyOtp } = require("../controllers/otpController");


const router = express.Router();

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOtp);

module.exports = router;
