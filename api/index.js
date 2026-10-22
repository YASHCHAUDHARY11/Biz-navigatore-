import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";

const app = express();
app.use(cors());
app.use(express.json());

// 1. MONGODB CONNECTION (Cached for Serverless)
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

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// 2. MONGOOSE SCHEMAS & MODELS
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
const Transaction = mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);

// 3. AUTHENTICATION ROUTES

// Register User
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, emailOrPhone, businessName, password } = req.body;
    if (!name || !emailOrPhone || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const cleanAccount = emailOrPhone.trim().toLowerCase();
    const existing = await User.findOne({ emailOrPhone: cleanAccount });
    if (existing) {
      return res.status(400).json({ error: "An account with this email/phone already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      emailOrPhone: cleanAccount,
      businessName: businessName || "My Indian Enterprise",
      password: hashedPassword,
      role: "user",
      isProUser: false,
      evaluationsCount: 0
    });

    await user.save();
    return res.status(201).json({
      message: "Account registered successfully!",
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
      return res.status(401).json({ error: "Invalid email/mobile or password." });
    }

    const isMatch = await bcrypt.compare(cleanPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email/mobile or password." });
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

    return res.json({
      message: "OTP generated successfully",
      otp: generatedOtp,
      expiresInSeconds: 300
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Forgot Password - Verify OTP & Update Password
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

// Increment User Evaluation Usage
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

// 4. SUBSCRIPTION & PAYMENT VERIFICATION ROUTES

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

app.post("/api/subscriptions/status", async (req, res) => {
  try {
    const { txnId, status } = req.body;
    const txn = await Transaction.findById(txnId);
    if (!txn) {
      return res.status(404).json({ error: "Transaction not found." });
    }

    txn.status = status;
    await txn.save();

    const user = await User.findOne({ emailOrPhone: txn.userEmail });
    if (user) {
      user.isProUser = status === "approved";
      await user.save();
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

export default app;
