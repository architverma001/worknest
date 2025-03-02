const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const otpModels = require("../models/otpModels");

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

const generateOTP = () => Math.floor(10000 + Math.random() * 90000).toString(); // 6-digit OTP
const SALT_ROUNDS = 10; // Adjust for security vs. performance
const OTP_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds
const MAX_ATTEMPTS = 3; // Limit OTP attempts

const sendOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ status: "failed", message: "Email is required" });
  }

  try {
    // Delete existing OTPs for this email
    await otpModels.deleteMany({ email });

    const otp = generateOTP();
    const hashedOtp = await bcrypt.hash(otp, SALT_ROUNDS);

    // Save OTP with creation time
    await new otpModels({ email, otp: hashedOtp, attempts: 0 }).save();

    const mailOptions = {
      from: `"WorkNest Support" <${process.env.EMAIL}>`,
      to: email,
      subject: "Your One-Time Password (OTP) for Secure Access",
      text: `Hello,
    
    We received a request to verify your email address. Use the following One-Time Password (OTP) to proceed:
    
    🔒 OTP: ${otp}
    
    This OTP is valid for **5 minutes**. Do not share it with anyone.
    
    If you did not request this, please ignore this email.
    
    Best regards,  
    WorkNest Support Team`,
    };


    await transporter.sendMail(mailOptions);

    return res.status(200).json({ status: "success", message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({ status: "failed", message: "Failed to send OTP" });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ status: "failed", message: "Email and OTP are required" });
  }

  const existingOtp = await otpModels.findOne({ email });

  if (!existingOtp) {
    return res.status(400).json({ status: "failed", message: "Invalid or expired OTP" });
  }

  // Check if OTP is expired
  const timeElapsed = Date.now() - existingOtp.createdAt;
  if (timeElapsed > OTP_EXPIRY) {
    await otpModels.deleteOne({ email });
    return res.status(400).json({ status: "failed", message: "OTP has expired" });
  }

  // Check if attempts exceeded
  if (existingOtp.attempts >= MAX_ATTEMPTS) {
    await otpModels.deleteOne({ email });
    return res.status(400).json({ status: "failed", message: "Too many failed attempts. Please request a new OTP." });
  }

  // Verify OTP using bcrypt
  const isMatch = await bcrypt.compare(otp, existingOtp.otp);
  if (!isMatch) {
    await otpModels.findOneAndUpdate({ email }, { $inc: { attempts: 1 } });
    return res.status(400).json({ status: "failed", message: "Invalid OTP" });
  }

  // OTP is valid, remove it from the database
  await otpModels.deleteOne({ email });

  // Generate JWT Token
  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "15d" });

  return res.status(200).json({ status: "success", message: "OTP verified successfully", token });
};

module.exports = { sendOTP, verifyOtp };
