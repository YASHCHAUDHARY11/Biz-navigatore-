import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

const app = express();
app.use(cors());
app.use(express.json());

// 1. MONGODB CONNECTION
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://yash963957_db_user:z83U3l4zKQnuo353@biznavigator.hgohuud.mongodb.net/biznavigator?retryWrites=true&w=majority";

let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log("MongoDB Connected Successfully to BizNavigator Database!");
  } catch (err) {
    console.error("MongoDB Connection Failed:", err);
  }
}

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// 2. NODEMAILER TRANSPORTER SETUP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 3. MONGOOSE SCHEMAS & MODELS
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    emailOrPhone: { type: String, required: true, unique: true, lowercase: true, trim: true },
    businessName: { type: String, default: "My Indian Enterprise" },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isProUser: { type: Boolean, default: false },
    evaluationsCount: { type: Number, default: 0 },
    resetOtp: { type: String, default: null },
    resetOtpExpires: { type: Date, default: null }
  },
  { timestamps: true }
);

// Temporary OTP Store for Registration Verification
const PendingRegistrationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    emailOrPhone: { type: String, required: true, lowercase: true, trim: true },
    businessName: { type: String, default: "My Indian Enterprise" },
    password: { type: String, required: true },
    otp: { type: String, required: true },
    otpExpires: { type: Date, required: true }
  },
  { timestamps: true }
);
PendingRegistrationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

const TransactionSchema = new mongoose.Schema(
  {
    paymentId: { type: String, required: true, unique: true, trim: true },
    userEmail: { type: String, required: true, lowercase: true },
    userName: { type: String, required: true },
    plan: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const PendingRegistration = mongoose.models.PendingRegistration || mongoose.model("PendingRegistration", PendingRegistrationSchema);
const Transaction = mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);

// 4. AUTHENTICATION ROUTES

// Send Registration OTP to Email
app.post("/api/auth/register-otp", async (req, res) => {
  try {
    const { name, emailOrPhone, businessName, password } = req.body;
    if (!name || !emailOrPhone || !password) {
      return res.status(400).json({ error: "Name, email and password are required." });
    }

    const cleanAccount = emailOrPhone.trim().toLowerCase();
    const existing = await User.findOne({ emailOrPhone: cleanAccount });
    if (existing) {
      return res.status(400).json({ error: "An account with this email already exists. Please login." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    await PendingRegistration.deleteMany({ emailOrPhone: cleanAccount });
    await PendingRegistration.create({
      name,
      emailOrPhone: cleanAccount,
      businessName: businessName || "My Indian Enterprise",
      password: hashedPassword,
      otp: generatedOtp,
      otpExpires
    });

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail({
        from: `"BizNavigator Team" <${process.env.EMAIL_USER}>`,
        to: cleanAccount,
        subject: "Verify Your BizNavigator Registration OTP",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <h2 style="color: #f59e0b; text-align: center; margin-bottom: 5px;">BizNavigator 🇮🇳</h2>
            <p style="text-align: center; color: #64748b; font-size: 13px; margin-top: 0;">Empowering Indian SMEs</p>
            <p>Namaste <strong>${name}</strong>,</p>
            <p>BizNavigator par apna account verify karne ke liye 6-digit OTP enter karein:</p>
            <div style="text-align: center; margin: 25px 0;">
              <span style="font-size: 28px; font-weight: bold; letter-spacing: 6px; background: #0f172a; color: #f59e0b; padding: 12px 28px; border-radius: 8px; display: inline-block;">${generatedOtp}</span>
            </div>
            <p style="color: #64748b; font-size: 13px;">Ye OTP agle <strong>5 minutes</strong> ke liye valid hai.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin-top: 20px;" />
            <p style="color: #94a3b8; font-size: 11px; text-align: center;">BizNavigator • Smart Business Strategy for India</p>
          </div>
        `
      });
    }

    return res.json({
      message: "Verification OTP sent to your email!",
      expiresInSeconds: 300
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to dispatch registration OTP: " + err.message });
  }
});

// Verify Registration OTP & Save to MongoDB
app.post("/api/auth/register-verify", async (req, res) => {
  try {
    const { emailOrPhone, otp } = req.body;
    const cleanAccount = emailOrPhone?.trim().toLowerCase();

    const pending = await PendingRegistration.findOne({ emailOrPhone: cleanAccount });
    if (!pending) {
      return res.status(400).json({ error: "No pending registration found or session expired. Please start over." });
    }

    if (pending.otp !== otp?.trim()) {
      return res.status(400).json({ error: "Invalid 6-digit verification OTP." });
    }

    if (new Date() > pending.otpExpires) {
      return res.status(400).json({ error: "OTP has expired. Please request a new one." });
    }

    const newUser = new User({
      name: pending.name,
      emailOrPhone: pending.emailOrPhone,
      businessName: pending.businessName,
      password: pending.password,
      role: "user",
      isProUser: false,
      evaluationsCount: 0
    });

    await newUser.save();
    await PendingRegistration.deleteMany({ emailOrPhone: cleanAccount });

    return res.status(201).json({
      message: "Account verified and registered successfully!",
      user: {
        id: newUser._id,
        name: newUser.name,
        emailOrPhone: newUser.emailOrPhone,
        businessName: newUser.businessName,
        role: newUser.role,
        isProUser: newUser.isProUser,
        evaluationsCount: newUser.evaluationsCount
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Login User & Admin
app.post("/api/auth/login", async (req, res) => {
  try {
    const { emailOrPhone, password, isAdminMode } = req.body;
    const cleanAccount = emailOrPhone?.trim().toLowerCase();
    const cleanPassword = password?.trim();

    if (
      isAdminMode ||
      cleanAccount === "admin" ||
      cleanAccount === "admin@biznavigator.in"
    ) {
      if (cleanPassword === (process.env.ADMIN_SECRET_KEY || "admin123")) {
        return res.json({
          user: {
            name: "Master Administrator",
            emailOrPhone: "admin@biznavigator.in",
            businessName: "BizNavigator Headquarters",
            role: "admin",
            isProUser: true,
            evaluationsCount: 0
          }
        });
      } else {
        return res.status(401).json({ error: "Invalid Admin Secret Key. Access Denied." });
      }
    }

    const user = await User.findOne({ emailOrPhone: cleanAccount });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(cleanPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        emailOrPhone: user.emailOrPhone,
        businessName: user.businessName,
        role: user.role,
        isProUser: user.isProUser,
        evaluationsCount: user.evaluationsCount
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Forgot Password - Send OTP
app.post("/api/auth/forgot-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = email?.trim().toLowerCase();

    if (cleanEmail === "admin" || cleanEmail === "admin@biznavigator.in") {
      return res.status(400).json({ error: "Admin credentials cannot be recovered via OTP." });
    }

    const user = await User.findOne({ emailOrPhone: cleanEmail });
    if (!user) {
      return res.status(404).json({ error: "No registered account found with this email." });
    }

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = generatedOtp;
    user.resetOtpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail({
        from: `"BizNavigator Support" <${process.env.EMAIL_USER}>`,
        to: cleanEmail,
        subject: "Your BizNavigator Password Reset OTP",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <h2 style="color: #f59e0b; text-align: center;">BizNavigator 🇮🇳</h2>
            <p>Namaste <strong>${user.name}</strong>,</p>
            <p>Aapke BizNavigator account ka password reset request receive hua hai. Aapka 6-digit OTP:</p>
            <div style="text-align: center; margin: 25px 0;">
              <span style="font-size: 28px; font-weight: bold; letter-spacing: 6px; background: #0f172a; color: #f59e0b; padding: 12px 28px; border-radius: 8px; display: inline-block;">${generatedOtp}</span>
            </div>
            <p style="color: #64748b; font-size: 13px;">Ye OTP agle <strong>5 minutes</strong> ke liye valid hai.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin-top: 20px;" />
            <p style="color: #94a3b8; font-size: 11px; text-align: center;">BizNavigator • Smart Business Strategy for India</p>
          </div>
        `
      });
    }

    return res.json({
      message: "OTP sent to your registered email address!",
      expiresInSeconds: 300
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to send email OTP: " + err.message });
  }
});

// Forgot Password - Reset
app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const cleanEmail = email?.trim().toLowerCase();

    const user = await User.findOne({ emailOrPhone: cleanEmail });
    if (!user) {
      return res.status(404).json({ error: "Account not found." });
    }

    if (!user.resetOtp || user.resetOtp !== otp.trim()) {
      return res.status(400).json({ error: "Invalid 6-digit OTP code." });
    }

    if (new Date() > user.resetOtpExpires) {
      return res.status(400).json({ error: "OTP has expired. Please request a new one." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetOtp = null;
    user.resetOtpExpires = null;
    await user.save();

    return res.json({ message: "Password updated successfully in database! Please login." });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Increment User Usage
app.post("/api/users/usage", async (req, res) => {
  try {
    const { emailOrPhone } = req.body;
    const user = await User.findOne({ emailOrPhone: emailOrPhone?.trim().toLowerCase() });
    if (user) {
      user.evaluationsCount += 1;
      await user.save();
      return res.json({ evaluationsCount: user.evaluationsCount });
    }
    return res.status(404).json({ error: "User not found." });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 5. SUBSCRIPTION & PAYMENT ROUTES
app.post("/api/subscriptions/submit", async (req, res) => {
  try {
    const { paymentId, userEmail, userName, plan } = req.body;
    const cleanPaymentId = paymentId?.trim();

    if (!/^pay_[a-zA-Z0-9]{12,24}$/.test(cleanPaymentId)) {
      return res.status(400).json({ error: "Invalid Razorpay Payment ID format." });
    }

    const duplicate = await Transaction.findOne({ paymentId: cleanPaymentId });
    if (duplicate) {
      return res.status(400).json({ error: "This Payment ID has already been submitted." });
    }

    const txn = new Transaction({
      paymentId: cleanPaymentId,
      userEmail: userEmail?.toLowerCase(),
      userName,
      plan,
      status: "pending"
    });

    await txn.save();
    return res.status(201).json({ message: "Submitted successfully!", transaction: txn });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get("/api/subscriptions/all", async (req, res) => {
  try {
    const txns = await Transaction.find().sort({ createdAt: -1 });
    return res.json(txns);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Safe Admin Approve / Reject Transaction (By ObjectId or PaymentId)
app.post("/api/subscriptions/status", async (req, res) => {
  try {
    const { txnId, paymentId, userEmail, status } = req.body;
    let txn = null;

    if (txnId && mongoose.isValidObjectId(txnId)) {
      txn = await Transaction.findById(txnId);
    }
    if (!txn && paymentId) {
      txn = await Transaction.findOne({ paymentId: paymentId.trim() });
    }

    if (!txn) {
      return res.status(404).json({ error: "Transaction not found." });
    }

    txn.status = status;
    await txn.save();

    const targetEmail = (userEmail || txn.userEmail)?.trim().toLowerCase();
    if (targetEmail) {
      const user = await User.findOne({ emailOrPhone: targetEmail });
      if (user) {
        user.isProUser = status === "approved";
        await user.save();
      }
    }

    return res.json({ message: `Transaction marked as ${status}.`, transaction: txn });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get("/api/admin/users", async (req, res) => {
  try {
    const users = await User.find({}, "-password").sort({ createdAt: -1 });
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/api/admin/toggle-pro", async (req, res) => {
  try {
    const { emailOrPhone } = req.body;
    const user = await User.findOne({ emailOrPhone: emailOrPhone?.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    user.isProUser = !user.isProUser;
    await user.save();
    return res.json({ message: "Pro status updated", isProUser: user.isProUser });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 6. SECURE GEMINI AI ROUTE
app.post("/api/ai/generate", async (req, res) => {
  try {
    const { prompt, systemInstruction } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not set in Vercel environment variables." });
    }

    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.5-flash"];

    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": apiKey
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `${systemInstruction || ""}\n\nTask:\n${prompt}` }] }],
              generationConfig: {
                temperature: 0.7,
                responseMimeType: "application/json"
              }
            })
          }
        );

        const data = await response.json();

        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
          return res.json({ text: data.candidates[0].content.parts[0].text });
        }
        if (data.error) {
          console.warn(`Model ${model} error from Google:`, data.error.message);
        }
      } catch (modelErr) {
        console.warn(`Fetch error for ${model}:`, modelErr.message);
      }
    }

    return res.status(502).json({ error: "Gemini models were temporarily unavailable. Please retry." });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default app;
