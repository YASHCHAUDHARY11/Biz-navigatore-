import React, { useState, useEffect, useCallback } from "react";
import {
  Briefcase,
  TrendingUp,
  CheckCircle2,
  Circle,
  FileText,
  Calculator,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Download,
  IndianRupee,
  Trash2,
  Plus,
  RefreshCw,
  Send,
  Zap,
  BookOpen,
  X,
  Lightbulb,
  ShieldCheck,
  Target,
  Bot,
  User,
  LogOut,
  Lock,
  Mail,
  Building,
  ExternalLink,
  Check,
  AlertTriangle,
  ShieldAlert,
  Crown,
  Users,
  Settings,
  Layers,
  KeyRound,
  Clock,
  RotateCcw,
  MapPin,
  Compass,
  Calendar,
  Filter,
  Flame,
  FileEdit,
  CheckCircle,
  Gauge,
  Eye,
  EyeOff,
  AlertCircle,
  Truck,
  Store,
  Percent,
  Database
} from "lucide-react";

// --- CONFIGURATION CONSTANTS, MONGODB API & CREDENTIALS ---
const API_BASE_URL =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "/api";

const FREE_USAGE_LIMIT = 5;
const STORAGE_PREFIX = "biznavigator_";
const ADMIN_EMAIL = "admin@biznavigator.in";

const VERCEL_ENV_GEMINI_KEY =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_GEMINI_API_KEY) ||
  (typeof process !== "undefined" &&
    (process.env?.REACT_APP_GEMINI_API_KEY ||
      process.env?.NEXT_PUBLIC_GEMINI_API_KEY ||
      process.env?.GEMINI_API_KEY)) ||
  "";

const PAYMENT_LINKS = {
  dayPass: "https://rzp.io/rzp/BotR1EMB",       // ₹49
  monthlyPro: "https://rzp.io/rzp/IYMoJDwv",   // ₹249
  quarterlyPro: "https://rzp.io/rzp/wkdIZLD"   // ₹599
};

// --- INITIAL 10-DAY SPRINT DATA ---
const INITIAL_10_DAY_SPRINT = [
  {
    id: "day_1",
    dayNumber: 1,
    dayTitle: "Day 1: Ground Demand Validation & Customer Survey",
    phase: "Phase 1: Validation",
    task: "Conduct 20 face-to-face target consumer interviews in the chosen micro-market. Ask what they currently pay, their biggest frustration, and willingness to switch.",
    timeEst: "3.5 hrs",
    budgetEst: "₹300 (Beverages/Clipboards)",
    priority: "Critical",
    completed: false
  },
  {
    id: "day_2",
    dayNumber: 2,
    dayTitle: "Day 2: Competitor Pricing & Margin Audit",
    phase: "Phase 1: Validation",
    task: "Mystery-shop 3 direct competitors in a 2-km radius. Catalog exact pricing, packaging quality, payment methods accepted, and estimate daily footfall.",
    timeEst: "3.0 hrs",
    budgetEst: "₹500 (Sampling)",
    priority: "High",
    completed: false
  },
  {
    id: "day_3",
    dayNumber: 3,
    dayTitle: "Day 3: Wholesale Vendor Sourcing & Raw Material Samples",
    phase: "Phase 2: Supply Chain",
    task: "Visit local wholesale APMC Mandi or connect with 3 verified IndiaMART / Udaan suppliers. Collect raw material sample lots and negotiate minimum order quantities (MOQs).",
    timeEst: "4.5 hrs",
    budgetEst: "₹1,500 (Sample batches)",
    priority: "Critical",
    completed: false
  },
  {
    id: "day_4",
    dayNumber: 4,
    dayTitle: "Day 4: Location / Space Finalization & Lease Negotiation",
    phase: "Phase 2: Setup",
    task: "Inspect 2 prospective commercial shops or kiosk spots. Negotiate standard 11-month lease with 1-month deposit, a 15-day rent-free fit-out window, and 5% cap on annual escalation.",
    timeEst: "4.0 hrs",
    budgetEst: "₹0 (Initial token withheld)",
    priority: "Critical",
    completed: false
  },
  {
    id: "day_5",
    dayNumber: 5,
    dayTitle: "Day 5: Legal Registrations (MSME Udyam, GST & Permits)",
    phase: "Phase 3: Compliance",
    task: "Submit zero-cost MSME Udyam online registration. File GSTIN if turnover applies, and apply for local Municipal Trade License or FSSAI Basic registration (for food businesses).",
    timeEst: "2.5 hrs",
    budgetEst: "₹100 - ₹1,000 (Govt statutory fee)",
    priority: "Critical",
    completed: false
  },
  {
    id: "day_6",
    dayNumber: 6,
    dayTitle: "Day 6: Branding, Signage, Packaging & Soundbox Setup",
    phase: "Phase 3: Infrastructure",
    task: "Print branded QR standee, order Paytm/PhonePe UPI Soundbox, print vinyl flex banner, and procure 100 eco-friendly packaging boxes or carry-bags with sticker labels.",
    timeEst: "3.5 hrs",
    budgetEst: "₹2,500 - ₹3,500",
    priority: "Medium",
    completed: false
  },
  {
    id: "day_7",
    dayNumber: 7,
    dayTitle: "Day 7: Initial Inventory Stocking & Equipment Dry Run",
    phase: "Phase 4: Operations",
    task: "Receive initial inventory stock from Day 3 suppliers. Conduct a complete 2-hour simulated operational dry-run (preparation, billing, packaging, and cash reconciliation).",
    timeEst: "4.0 hrs",
    budgetEst: "Allocated in initial capex",
    priority: "High",
    completed: false
  },
  {
    id: "day_8",
    dayNumber: 8,
    dayTitle: "Day 8: Soft Launch with Friends, Family & Beta Testers",
    phase: "Phase 4: Testing",
    task: "Invite 15-20 friendly customers for a controlled 3-hour trial window. Collect unvarnished feedback on speed of delivery, pricing, and taste/service experience.",
    timeEst: "3.5 hrs",
    budgetEst: "₹1,000 (Discounts/Tasting)",
    priority: "High",
    completed: false
  },
  {
    id: "day_9",
    dayNumber: 9,
    dayTitle: "Day 9: Hyperlocal Marketing & WhatsApp Community Launch",
    phase: "Phase 5: Go-to-Market",
    task: "Distribute 500 targeted pamphlets in nearby residential apartments/societies. Set up a WhatsApp Business catalog with broadcast list and offer Day-1 inaugural promo.",
    timeEst: "3.0 hrs",
    budgetEst: "₹1,200 (Pamphlet print & delivery)",
    priority: "Medium",
    completed: false
  },
  {
    id: "day_10",
    dayNumber: 10,
    dayTitle: "Day 10: Official Commercial Launch & Day-1 Cashflow Audit",
    phase: "Phase 5: Commercial Scale",
    task: "Doors open for commercial operations at 8:30 AM! Track total footfall, conversions, cash/UPI split, and reconcile cashbox at 9:00 PM against the Daily Ledger.",
    timeEst: "8.0 hrs",
    budgetEst: "₹500 (Opening rituals/float cash)",
    priority: "Critical",
    completed: false
  }
];

// --- HELPER FUNCTIONS ---
function extractJsonFromText(rawText) {
  if (!rawText) return null;
  try {
    return JSON.parse(rawText.trim());
  } catch (e) {}

  const firstBrace = rawText.indexOf("{");
  const lastBrace = rawText.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = rawText.substring(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate);
    } catch (e) {}
  }
  return null;
}

function safeGetStorage(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch (e) {
    return fallback;
  }
}

export default function BizNavigatorApp() {
  useEffect(() => {
    localStorage.removeItem(`${STORAGE_PREFIX}is_pro`);
  }, []);

  // 1. AUTHENTICATION & SESSION
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = safeGetStorage(`${STORAGE_PREFIX}user`, null);
    if (saved) {
      saved.evaluationsCount = Number(saved.evaluationsCount) || 0;
    }
    return saved;
  });

  const [authMode, setAuthMode] = useState("login");
  const [authEmailOrPhone, setAuthEmailOrPhone] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authFullName, setAuthFullName] = useState("");
  const [authBusinessName, setAuthBusinessName] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSuccessNotice, setAuthSuccessNotice] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // OTP States
  const [otpStep, setOtpStep] = useState(1);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpSecondsLeft, setOtpSecondsLeft] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");
  const [showPasswordToggle, setShowPasswordToggle] = useState(false);

  const [signupStep, setSignupStep] = useState(1);
  const [signupEnteredOtp, setSignupEnteredOtp] = useState("");
  const [signupOtpSecondsLeft, setSignupOtpSecondsLeft] = useState(0);
  const [isSendingSignupOtp, setIsSendingSignupOtp] = useState(false);

  // Direct MongoDB Database States
  const [submittedTxns, setSubmittedTxns] = useState([]);
  const [registeredUsersList, setRegisteredUsersList] = useState([]);
  const [isAdminDataLoading, setIsAdminDataLoading] = useState(false);
  const [adminDbError, setAdminDbError] = useState("");
  const [adminDbSuccess, setAdminDbSuccess] = useState("");
  const [adminSubTab, setAdminSubTab] = useState("txns");
  const [txnFilterStatus, setTxnFilterStatus] = useState("all");
  const [manualGrantEmail, setManualGrantEmail] = useState("");
  const [manualGrantPlan, setManualGrantPlan] = useState("Monthly Pro (₹249)");
  const [isExecutingAdminAction, setIsExecutingAdminAction] = useState(false);

  // Modals & Panels
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedPlanForVerification, setSelectedPlanForVerification] = useState("Monthly Pro (₹249)");
  const [inputPaymentId, setInputPaymentId] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [legalModalType, setLegalModalType] = useState(null);

  // Deep Analysis Modal
  const [deepAnalysisIdea, setDeepAnalysisIdea] = useState(null);
  const [deepAnalysisData, setDeepAnalysisData] = useState(null);
  const [isLoadingDeepAnalysis, setIsLoadingDeepAnalysis] = useState(false);

  // Active Venture State (Pipeline across tabs)
  const [selectedVenture, setSelectedVenture] = useState(() => safeGetStorage(`${STORAGE_PREFIX}selected_venture`, null));

  // Navigation
  const [activeTab, setActiveTab] = useState(() => {
    const user = safeGetStorage(`${STORAGE_PREFIX}user`, null);
    if (user?.role?.toLowerCase() === "admin" || user?.emailOrPhone?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      return "admin-works";
    }
    return "idea-finder";
  });

  const [lastAiError, setLastAiError] = useState("");

  const isAdminUser = Boolean(
    currentUser && (
      currentUser.role?.toLowerCase() === "admin" ||
      currentUser.emailOrPhone?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
    )
  );
  const isUserPro = Boolean(currentUser && (isAdminUser || currentUser.isProUser === true));
  const evaluationsCount = Math.max(0, Number(currentUser?.evaluationsCount) || 0);
  const remainingEvaluations = Math.max(0, FREE_USAGE_LIMIT - evaluationsCount);

  // Sync user state to local storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${STORAGE_PREFIX}user`, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(`${STORAGE_PREFIX}user`);
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedVenture) {
      localStorage.setItem(`${STORAGE_PREFIX}selected_venture`, JSON.stringify(selectedVenture));
    }
  }, [selectedVenture]);

  // Sync DB records directly from MongoDB
  const syncDatabaseData = useCallback(async () => {
    if (!currentUser) return;
    setIsAdminDataLoading(true);
    setAdminDbError("");
    try {
      const profileRes = await fetch(`${API_BASE_URL}/users/profile?email=${encodeURIComponent(currentUser.emailOrPhone)}`);
      if (profileRes.ok) {
        const freshUser = await profileRes.json();
        if (freshUser && freshUser.emailOrPhone) {
          setCurrentUser((prev) => ({
            ...prev,
            ...freshUser,
            evaluationsCount: Number(freshUser.evaluationsCount) || 0
          }));
        }
      }

      const txnsRes = await fetch(`${API_BASE_URL}/subscriptions/all`);
      if (txnsRes.ok) {
        const txns = await txnsRes.json();
        if (Array.isArray(txns)) {
          setSubmittedTxns(txns);
        }
      }

      if (isAdminUser) {
        const usersRes = await fetch(`${API_BASE_URL}/admin/users`);
        if (usersRes.ok) {
          const users = await usersRes.json();
          if (Array.isArray(users)) {
            setRegisteredUsersList(users);
          }
        }
      }
    } catch (err) {
      setAdminDbError(err.message || "Database connection error.");
    } finally {
      setIsAdminDataLoading(false);
    }
  }, [currentUser, isAdminUser]);

  useEffect(() => {
    if (currentUser) {
      syncDatabaseData();
    }
  }, [currentUser, syncDatabaseData]);

  // Timers
  useEffect(() => {
    if (otpSecondsLeft <= 0) return;
    const interval = setInterval(() => setOtpSecondsLeft((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(interval);
  }, [otpSecondsLeft]);

  useEffect(() => {
    if (signupOtpSecondsLeft <= 0) return;
    const interval = setInterval(() => setSignupOtpSecondsLeft((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(interval);
  }, [signupOtpSecondsLeft]);

  // Usage Recording Logic
  const recordEvaluationUsage = async () => {
    if (isAdminUser || isUserPro) return;
    try {
      const res = await fetch(`${API_BASE_URL}/users/usage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrPhone: currentUser.emailOrPhone })
      });
      if (res.ok) {
        const data = await res.json();
        const serverCount = Number(data.evaluationsCount) || (evaluationsCount + 1);
        setCurrentUser((prev) => ({ ...prev, evaluationsCount: serverCount }));
      }
    } catch (e) {
      setCurrentUser((prev) => ({ ...prev, evaluationsCount: Math.min(FREE_USAGE_LIMIT, (Number(prev?.evaluationsCount) || 0) + 1) }));
    }
  };

  const canPerformEvaluation = () => {
    if (isAdminUser || isUserPro) return true;
    if (remainingEvaluations <= 0) {
      setShowPaywallModal(true);
      return false;
    }
    return true;
  };

  // Direct MongoDB Admin CRUD
  const handleAdminApproveTxn = async (txn) => {
    const txnId = txn._id || txn.id;
    setIsExecutingAdminAction(true);
    setAdminDbError("");
    setAdminDbSuccess("");
    try {
      const res = await fetch(`${API_BASE_URL}/subscriptions/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txnId: txnId,
          paymentId: txn.paymentId,
          userEmail: txn.userEmail,
          status: "approved"
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update subscription in MongoDB.");
      setAdminDbSuccess(`Transaction ${txn.paymentId} APPROVED! ${txn.userEmail} Pro activated.`);
      await syncDatabaseData();
    } catch (err) {
      setAdminDbError(`MongoDB Error: ${err.message}`);
    } finally {
      setIsExecutingAdminAction(false);
    }
  };

  const handleAdminRevokeTxn = async (txn) => {
    const txnId = txn._id || txn.id;
    setIsExecutingAdminAction(true);
    setAdminDbError("");
    setAdminDbSuccess("");
    try {
      const res = await fetch(`${API_BASE_URL}/subscriptions/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txnId: txnId,
          paymentId: txn.paymentId,
          userEmail: txn.userEmail,
          status: "rejected"
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to revoke status in MongoDB.");
      setAdminDbSuccess(`Transaction ${txn.paymentId} marked REJECTED.`);
      await syncDatabaseData();
    } catch (err) {
      setAdminDbError(`MongoDB Error: ${err.message}`);
    } finally {
      setIsExecutingAdminAction(false);
    }
  };

  const handleAdminToggleUserPro = async (userEmail, currentProStatus) => {
    setIsExecutingAdminAction(true);
    setAdminDbError("");
    setAdminDbSuccess("");
    try {
      const res = await fetch(`${API_BASE_URL}/admin/toggle-pro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrPhone: userEmail, isProUser: !currentProStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update user in MongoDB.");
      setAdminDbSuccess(`MongoDB Updated: ${userEmail} Pro is now ${!currentProStatus ? "ACTIVE" : "INACTIVE"}.`);
      await syncDatabaseData();
    } catch (err) {
      setAdminDbError(`MongoDB Error: ${err.message}`);
    } finally {
      setIsExecutingAdminAction(false);
    }
  };

  const handleAdminResetEvaluations = async (userEmail) => {
    setIsExecutingAdminAction(true);
    setAdminDbError("");
    setAdminDbSuccess("");
    try {
      const res = await fetch(`${API_BASE_URL}/admin/reset-evaluations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrPhone: userEmail })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset evaluation count in MongoDB.");
      setAdminDbSuccess(`MongoDB Updated: Reset free evaluations to 0/5 for ${userEmail}.`);
      await syncDatabaseData();
    } catch (err) {
      setAdminDbError(`MongoDB Error: ${err.message}`);
    } finally {
      setIsExecutingAdminAction(false);
    }
  };

  const handleAdminDeleteUser = async (userEmail) => {
    if (!window.confirm(`Permanently delete user ${userEmail} from MongoDB?`)) return;
    setIsExecutingAdminAction(true);
    setAdminDbError("");
    setAdminDbSuccess("");
    try {
      const res = await fetch(`${API_BASE_URL}/admin/delete-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrPhone: userEmail })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete user document from MongoDB.");
      setAdminDbSuccess(`User ${userEmail} deleted from MongoDB.`);
      await syncDatabaseData();
    } catch (err) {
      setAdminDbError(`MongoDB Error: ${err.message}`);
    } finally {
      setIsExecutingAdminAction(false);
    }
  };

  const handleAdminManualGrant = async (e) => {
    e.preventDefault();
    if (!manualGrantEmail.trim()) return;
    setIsExecutingAdminAction(true);
    setAdminDbError("");
    setAdminDbSuccess("");
    try {
      const res = await fetch(`${API_BASE_URL}/admin/grant-pro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrPhone: manualGrantEmail.trim(), plan: manualGrantPlan })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to grant Pro in MongoDB.");
      setAdminDbSuccess(`Granted ${manualGrantPlan} to ${manualGrantEmail} in MongoDB.`);
      setManualGrantEmail("");
      await syncDatabaseData();
    } catch (err) {
      setAdminDbError(`MongoDB Error: ${err.message}`);
    } finally {
      setIsExecutingAdminAction(false);
    }
  };

  // Auth Handlers
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccessNotice("");
    setIsAuthLoading(true);

    const isAdminRequest =
      authMode === "admin" ||
      authEmailOrPhone.trim().toLowerCase() === "admin" ||
      authEmailOrPhone.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();

    const emailToSend = isAdminRequest ? ADMIN_EMAIL : authEmailOrPhone.trim();

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailOrPhone: emailToSend,
          password: authPassword.trim(),
          isAdminMode: isAdminRequest
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Authentication failed.");

      const loggedInUser = {
        ...data.user,
        role: isAdminRequest ? "admin" : data.user?.role || "user",
        evaluationsCount: Number(data.user.evaluationsCount) || 0
      };

      setCurrentUser(loggedInUser);
      setAuthPassword("");

      if (isAdminRequest || loggedInUser?.role?.toLowerCase() === "admin") {
        setActiveTab("admin-works");
      } else {
        setActiveTab("idea-finder");
      }
    } catch (err) {
      setAuthError(err.message || "Login failed. Check server connection and credentials.");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignupRequestOtp = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccessNotice("");

    if (!authFullName.trim() || !authEmailOrPhone.trim() || !authPassword.trim()) {
      setAuthError("Please fill in all mandatory fields.");
      return;
    }
    if (authPassword.trim().length < 4) {
      setAuthError("Password must be at least 4 characters long.");
      return;
    }

    setIsSendingSignupOtp(true);
    try {
      let res = await fetch(`${API_BASE_URL}/auth/register-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: authFullName.trim(),
          emailOrPhone: authEmailOrPhone.trim(),
          businessName: authBusinessName.trim(),
          password: authPassword.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to dispatch verification OTP.");

      setSignupStep(2);
      setSignupOtpSecondsLeft(data.expiresInSeconds || 300);
      setAuthSuccessNotice(`Verification OTP has been sent to ${authEmailOrPhone}.`);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setIsSendingSignupOtp(false);
    }
  };

  const handleSignupVerifyAndRegister = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccessNotice("");

    if (signupOtpSecondsLeft <= 0) {
      setAuthError("OTP code has expired. Please request a new verification code.");
      return;
    }
    if (!signupEnteredOtp || signupEnteredOtp.trim().length !== 6) {
      setAuthError("Please enter the complete 6-digit OTP code received in your email.");
      return;
    }

    setIsAuthLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register-verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailOrPhone: authEmailOrPhone.trim(),
          otp: signupEnteredOtp.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed. Invalid OTP code.");

      const registeredUser = {
        ...data.user,
        evaluationsCount: Number(data.user.evaluationsCount) || 0
      };

      setCurrentUser(registeredUser);
      setAuthPassword("");
      setSignupEnteredOtp("");
      setSignupStep(1);
      setActiveTab("idea-finder");
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleForgotRequestOtp = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccessNotice("");
    setResetNewPassword("");
    setResetConfirmPassword("");
    setEnteredOtp("");

    setIsSendingOtp(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmailOrPhone.trim() })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to dispatch OTP email.");

      setOtpStep(2);
      setOtpSecondsLeft(data.expiresInSeconds || 300);
      setAuthSuccessNotice(`Verification OTP has been sent to ${authEmailOrPhone}.`);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleForgotVerifyAndReset = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccessNotice("");

    const cleanEmail = authEmailOrPhone.trim().toLowerCase();
    const cleanOtp = enteredOtp.trim();
    const cleanNew = resetNewPassword.trim();
    const cleanConfirm = resetConfirmPassword.trim();

    if (!cleanOtp || cleanOtp.length !== 6) {
      setAuthError("Please enter the complete 6-digit OTP code.");
      return;
    }
    if (cleanNew.length < 4) {
      setAuthError("Password must be at least 4 characters long.");
      return;
    }
    if (cleanNew !== cleanConfirm) {
      setAuthError("Passwords do not match.");
      return;
    }

    setIsAuthLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, otp: cleanOtp, newPassword: cleanNew })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Password reset failed. Invalid or expired OTP.");

      setOtpStep(1);
      setEnteredOtp("");
      setResetNewPassword("");
      setResetConfirmPassword("");
      setAuthPassword("");
      setAuthMode("login");
      setAuthSuccessNotice("Password updated successfully! Please log in with your new password.");
    } catch (err) {
      setAuthError(err.message || "Failed to reset password.");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out of BizNavigator?")) {
      setCurrentUser(null);
      localStorage.removeItem(`${STORAGE_PREFIX}user`);
      setActiveTab("idea-finder");
    }
  };

  // Gemini AI Caller
  const callGeminiAI = async (prompt, systemInstruction = "") => {
    if (!currentUser) throw new Error("AUTH_REQUIRED");
    setLastAiError("");

    try {
      const serverRes = await fetch(`${API_BASE_URL}/ai/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          systemInstruction,
          userEmail: currentUser.emailOrPhone
        })
      });

      if (serverRes.ok) {
        const serverData = await serverRes.json();
        if (serverData.text) {
          return serverData.text;
        }
        if (serverData.error) {
          setLastAiError(serverData.error);
        }
      }
    } catch (err) {}

    const envKey = VERCEL_ENV_GEMINI_KEY.trim();
    if (envKey) {
      const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.5-flash"];
      for (const model of models) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${envKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json", "x-goog-api-key": envKey },
              body: JSON.stringify({
                contents: [{ parts: [{ text: `${systemInstruction}\n\nTask:\n${prompt}` }] }],
                generationConfig: { temperature: 0.7, responseMimeType: "application/json" }
              })
            }
          );

          const data = await response.json();
          const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

          if (textResponse) {
            return textResponse;
          }
        } catch (e) {}
      }
    }
    return null;
  };

  const handleSubmitVerification = async (e) => {
    e.preventDefault();
    setVerificationError("");

    const cleanId = inputPaymentId.trim();
    if (!/^pay_[a-zA-Z0-9]{12,24}$/.test(cleanId)) {
      setVerificationError("Invalid Razorpay ID format! Must start with 'pay_'.");
      return;
    }

    setIsVerifying(true);
    try {
      const res = await fetch(`${API_BASE_URL}/subscriptions/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: cleanId,
          userEmail: currentUser?.emailOrPhone,
          userName: currentUser?.name,
          plan: selectedPlanForVerification
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed.");

      await syncDatabaseData();
      setShowVerificationModal(false);
      setInputPaymentId("");
      alert(`Payment ID ${cleanId} successfully saved to MongoDB!\nStatus: PENDING ADMIN APPROVAL.`);
    } catch (err) {
      setVerificationError(err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  // Tab 1: AI Matcher & Deep Analysis
  const [finderBudget, setFinderBudget] = useState("150000");
  const [finderLocation, setFinderLocation] = useState("Bengaluru (Koramangala / HSR Corridor)");
  const [finderSkills, setFinderSkills] = useState("Direct Sales, Food Preparation, Digital Marketing");
  const [finderInterests, setFinderInterests] = useState("Beverages, Organic Food, Quick-Service Snacks");
  const [finderTime, setFinderTime] = useState("Full-Time (8+ hrs/day)");
  const [finderRisk, setFinderRisk] = useState("Medium Risk (Balanced)");
  const [isFindingIdeas, setIsFindingIdeas] = useState(false);
  const [matchedIdeas, setMatchedIdeas] = useState(() => safeGetStorage(`${STORAGE_PREFIX}matched_ideas_6inputs`, null));

  const handleGenerateIdeas = async (e) => {
    e.preventDefault();
    if (!canPerformEvaluation()) return;
    setIsFindingIdeas(true);
    setLastAiError("");

    try {
      const prompt = `Act as an elite Indian Startup & SME Strategist.
Generate 5 DISTINCT, CREATIVE, HIGHLY VIABLE Indian business ideas tailored specifically to these 6 inputs:
1. Budget: ₹${finderBudget}
2. Location / Target City: ${finderLocation}
3. Skills: ${finderSkills}
4. Interests: ${finderInterests}
5. Working Time: ${finderTime}
6. Risk Tolerance: ${finderRisk}

Return ONLY valid JSON matching this schema:
{
  "ideas": [
    {
      "id": "idea_1",
      "title": "Specific Business Title",
      "tagline": "Catchy 1-line business pitch",
      "category": "Retail F&B / B2B Supply / D2C / Micro-Services / Manufacturing",
      "matchScore": 95,
      "whyFit": "Direct explanation of why this matches their skills, budget, schedule, and risk appetite.",
      "estimatedCapex": "₹95,000",
      "monthlyPotential": "₹40,000 - ₹85,000 net profit",
      "targetAudience": "Target customer segment",
      "firstStep": "Tangible Day 1 launch action"
    }
  ]
}`;

      const rawResponse = await callGeminiAI(prompt, "You are BizNavigator's Lead Indian SME Matchmaker. Return valid JSON only.");
      const parsedData = extractJsonFromText(rawResponse);

      if (parsedData?.ideas && Array.isArray(parsedData.ideas) && parsedData.ideas.length > 0) {
        setMatchedIdeas(parsedData.ideas);
        localStorage.setItem(`${STORAGE_PREFIX}matched_ideas_6inputs`, JSON.stringify(parsedData.ideas));
      } else {
        const numBudget = parseInt(finderBudget) || 150000;
        const cleanLoc = finderLocation.split("(")[0].replace(/,/g, "").trim() || "Bengaluru";
        const cleanSkill = finderSkills.split(",")[0].trim() || "Operations";
        const cleanInterest = finderInterests.split(",")[0].trim() || "Snacks & Beverages";

        const dynamicSynthesis = [
          {
            id: `dyn_1_${Date.now()}`,
            title: `Artisanal ${cleanInterest} Express Kiosk`,
            tagline: `High-frequency daily refreshment counter optimized for high-traffic corridors in ${cleanLoc}.`,
            category: "Retail F&B",
            matchScore: 96,
            whyFit: `Capitalizes directly on your skills in ${cleanSkill} and passion for ${cleanInterest}. Perfectly calibrated to a ₹${numBudget.toLocaleString("en-IN")} capex with quick 30-day payback.`,
            estimatedCapex: `₹${Math.round(numBudget * 0.65).toLocaleString("en-IN")}`,
            monthlyPotential: "₹45,000 - ₹95,000 net profit",
            targetAudience: `Young professionals and daily commuters in ${cleanLoc}`,
            firstStep: `Conduct Day-1 pedestrian count at two transit-adjacent spots in ${cleanLoc}.`
          },
          {
            id: `dyn_2_${Date.now()}`,
            title: `B2B ${cleanInterest} Supply & Contract Distribution`,
            tagline: `Wholesale supply of consumables and packaged batches to local cafes and eateries in ${cleanLoc}.`,
            category: "B2B Supply Chain",
            matchScore: 91,
            whyFit: `Asset-light trade utilizing your ${cleanSkill} network. Recovers working capital weekly without heavy retail front investment.`,
            estimatedCapex: `₹${Math.round(numBudget * 0.75).toLocaleString("en-IN")}`,
            monthlyPotential: "₹40,000 - ₹90,000 retainers",
            targetAudience: `Independent cafes, boutique grocers, and commercial canteens`,
            firstStep: `Obtain wholesale rates on IndiaMART and APMC wholesale hub for ${cleanInterest}.`
          },
          {
            id: `dyn_3_${Date.now()}`,
            title: `Direct-to-Society (D2C) ${cleanInterest} Subscription`,
            tagline: `Curated weekly fresh supply delivered directly to gated society communities via WhatsApp.`,
            category: "Hyperlocal D2C",
            matchScore: 89,
            whyFit: `Zero shop rent overhead. Fits your ${finderTime} schedule with prepaid UPI community subscriptions.`,
            estimatedCapex: `₹${Math.round(numBudget * 0.4).toLocaleString("en-IN")}`,
            monthlyPotential: "₹30,000 - ₹65,000 net profit",
            targetAudience: `Apartment welfare association families in ${cleanLoc}`,
            firstStep: `Create a 5-item curated menu brochure and test with 10 residential society secretaries.`
          },
          {
            id: `dyn_4_${Date.now()}`,
            title: `${cleanSkill}-Powered SME Marketing Agency`,
            tagline: `Helping small high-street retailers in ${cleanLoc} digitize orders, Google Maps, and soundboxes.`,
            category: "Asset-Light Services",
            matchScore: 87,
            whyFit: `Near-zero inventory requirement. Generates immediate upfront cashflow matching a ${finderRisk} profile.`,
            estimatedCapex: `₹${Math.round(numBudget * 0.25).toLocaleString("en-IN")}`,
            monthlyPotential: "₹35,000 - ₹80,000 monthly retainers",
            targetAudience: `Local retail shops, doctors, coaching centers, and restaurants`,
            firstStep: `Audit Google Business profiles of 20 local merchants in ${cleanLoc}.`
          },
          {
            id: `dyn_5_${Date.now()}`,
            title: `Micro-Packaging & Specialty Gift Assembly Hub`,
            tagline: `Value-added packaging and customized corporate gifting for festive and promotional seasons.`,
            category: "Value-Add Manufacturing",
            matchScore: 84,
            whyFit: `High gross margins (50%+). Can scale up during festival quarters with flexible temporary labor.`,
            estimatedCapex: `₹${Math.round(numBudget * 0.85).toLocaleString("en-IN")}`,
            monthlyPotential: "₹50,000 - ₹1,20,000 net profit",
            targetAudience: `Tech firms, event managers, and wedding planners across ${cleanLoc}`,
            firstStep: `Procure sample corrugated rigid boxes and ribbons from regional industrial packagers.`
          }
        ];

        setMatchedIdeas(dynamicSynthesis);
        localStorage.setItem(`${STORAGE_PREFIX}matched_ideas_6inputs`, JSON.stringify(dynamicSynthesis));
      }
      await recordEvaluationUsage();
    } catch (err) {
      setLastAiError(err.message || "Failed to generate ideas.");
    } finally {
      setIsFindingIdeas(false);
    }
  };

  const handleOpenDeepAnalysis = async (idea) => {
    if (!canPerformEvaluation()) return;
    setDeepAnalysisIdea(idea);
    setIsLoadingDeepAnalysis(true);
    setDeepAnalysisData(null);

    try {
      const city = finderLocation.split("(")[0].replace(/,/g, "").trim() || "India";
      const prompt = `Perform an exhaustive deep-dive commercial feasibility breakdown for this business idea in ${city}, India:
Idea: "${idea.title}"
Category: ${idea.category}
Budget: ₹${finderBudget}

Return ONLY valid JSON matching this exact structure:
{
  "unitEconomics": {
    "sellingPricePerUnit": "₹250",
    "cogsRawMaterials": "₹85 (34%)",
    "packagingAndConsumables": "₹15 (6%)",
    "deliveryOrPlatformFee": "₹20 (8%)",
    "paymentGatewayAndSoundboxFee": "₹5 (2%)",
    "netMarginPerUnit": "₹125 (50% net profit)"
  },
  "breakEvenAnalysis": {
    "estimatedMonthlyFixedCost": "₹32,000",
    "dailyUnitsRequiredToBreakEven": "9 units per day",
    "comfortableProfitTargetVolume": "25-35 units per day",
    "timeToBreakEven": "3 to 4 Months"
  },
  "customerArchetype": {
    "persona": "Working Millennial & Tech Professional (Age 22-38)",
    "conversionTrigger": "Speed of service (< 3 mins), cleanliness, UPI Soundbox instant checkout.",
    "repeatPurchaseRate": "3 to 4 times per week"
  },
  "supplyChainSourcingGuide": {
    "primaryPlatforms": "IndiaMART (Direct verification), APMC Local Wholesale Mandi, Udaan B2B",
    "sourcingLocations": "Local regional industrial zones & APMC market yard in ${city}",
    "vendorNegotiationRule": "Never commit to 100% upfront cash. Pay 30% advance on sample approval."
  }
}`;

      const raw = await callGeminiAI(prompt, "You are BizNavigator's Senior Indian SME Financial & Supply Chain Auditor. Return JSON only.");
      const parsed = extractJsonFromText(raw);

      if (parsed?.unitEconomics) {
        setDeepAnalysisData(parsed);
      } else {
        setDeepAnalysisData({
          unitEconomics: {
            sellingPricePerUnit: "₹250 average ticket size",
            cogsRawMaterials: "₹85 (34% cost of raw goods)",
            packagingAndConsumables: "₹18 (7% containers & carry-bags)",
            deliveryOrPlatformFee: "₹18 (7% hyperlocal dispatch)",
            paymentGatewayAndSoundboxFee: "₹4 (1.6% merchant processing)",
            netMarginPerUnit: "₹125 (50% net contribution margin)"
          },
          breakEvenAnalysis: {
            estimatedMonthlyFixedCost: "₹35,000 (Rent ₹20k, utilities ₹5k, staff ₹10k)",
            dailyUnitsRequiredToBreakEven: "10 orders / day to cover all fixed costs",
            comfortableProfitTargetVolume: "28 - 35 orders / day to generate ₹65,000 - ₹90,000 net take-home",
            timeToBreakEven: "3.5 to 5 Months"
          },
          customerArchetype: {
            persona: "Convenience-seeking daily commuter & young professional",
            conversionTrigger: "Sub-3 minute turnaround, visible hygiene, UPI Soundbox instant ping.",
            repeatPurchaseRate: "35% - 45% weekly repeat rate"
          },
          supplyChainSourcingGuide: {
            primaryPlatforms: "Local APMC Wholesale Mandi, IndiaMART verified sellers, Udaan B2B",
            sourcingLocations: `Central trading market in ${city}`,
            vendorNegotiationRule: "Offer 50% initial cash + 50% upon delivery inspection."
          }
        });
      }
      await recordEvaluationUsage();
    } catch (err) {
      setLastAiError(err.message || "Failed to complete deep analysis.");
    } finally {
      setIsLoadingDeepAnalysis(false);
    }
  };

  const handleChooseVenture = (idea) => {
    setSelectedVenture(idea);
    setBusinessIdea(`${idea.title} - ${idea.tagline}`);
    setInitialCapital(finderBudget);
    setTargetCity(finderLocation);
    setCustomerSegment(idea.targetAudience);
    setScoutConcept(idea.title);
    setScoutCity(finderLocation.split("(")[0].replace(/,/g, "").trim() || "Bengaluru");
    setScoutDemographic(idea.targetAudience || "Daily consumers & commuters in this city");
    setScoutNeeds(`Optimized for ${idea.category} operations, high target-audience footfall, direct visibility`);
    setActiveTab("location-scout");
  };

  // Tab 2: Location Scout
  const [scoutCity, setScoutCity] = useState("Bengaluru");
  const [scoutConcept, setScoutConcept] = useState("Artisanal Chai & Fresh Snack Kiosk");
  const [scoutNeeds, setScoutNeeds] = useState("High morning pedestrian footfall, sub-3 min grab-and-go access, compact counter space, high UPI soundbox usage");
  const [scoutDemographic, setScoutDemographic] = useState("Corporate tech workforce, co-working tenants & daily commuters (Ages 21-38)");
  const [isScoutingLocations, setIsScoutingLocations] = useState(false);
  const [scoutResults, setScoutResults] = useState(() => safeGetStorage(`${STORAGE_PREFIX}location_scout_demand`, null));

  const handleEvaluateLocations = async (e) => {
    e.preventDefault();
    if (!canPerformEvaluation()) return;
    setIsScoutingLocations(true);

    try {
      const prompt = `Act as an expert Indian Retail Demographer. Evaluate 3 micro-locations in "${scoutCity}" for:
Concept: "${scoutConcept}"
Requirements: "${scoutNeeds}"
Demographic: "${scoutDemographic}"

Return ONLY valid JSON:
{
  "cityDemandOverview": "2-sentence demand summary.",
  "locations": [
    {
      "name": "Street / Junction Name",
      "catchmentType": "Corporate Tech Corridor / Transit Node",
      "suitabilityScore": 96,
      "demandIntensity": "Critical Underserved Demand",
      "unmetNeedAnalysis": "Detailed local unmet need.",
      "idealPlacementSpot": "Exact placement spot.",
      "demandTriggers": "Peak hours.",
      "competitionVoid": "Why existing alternatives fail."
    }
  ]
}`;

      const raw = await callGeminiAI(prompt, "You are BizNavigator's Lead Catchment Demand Strategist. Return JSON only.");
      const parsed = extractJsonFromText(raw);

      if (parsed?.locations && Array.isArray(parsed.locations) && parsed.locations.length > 0) {
        setScoutResults(parsed);
        localStorage.setItem(`${STORAGE_PREFIX}location_scout_demand`, JSON.stringify(parsed));
      } else {
        const fallback = {
          cityDemandOverview: `In ${scoutCity}, demand for ${scoutConcept} is driven by convenience, speed of service, and visible hygiene.`,
          locations: [
            {
              name: `${scoutCity} Outer Ring Road / Primary IT Corridor`,
              catchmentType: "Corporate Tech Corridor & Transit Node",
              suitabilityScore: 96,
              demandIntensity: "High Supply Deficit (Severe Peak Hours Squeeze)",
              unmetNeedAnalysis: `Over 45,000 corporate professionals pass through this node daily. Zero sub-3 minute hygienic alternatives.`,
              idealPlacementSpot: "Within 30–50 meters of the primary office feeder junction, facing the morning walkway.",
              demandTriggers: "8:00 AM – 11:00 AM (Morning rush) & 4:30 PM – 7:30 PM (Evening transition).",
              competitionVoid: "Current vendors suffer from slow billing and cluttered counters."
            },
            {
              name: `${scoutCity} Student Coaching & PG Belt`,
              catchmentType: "Youth & College Hub",
              suitabilityScore: 91,
              demandIntensity: "Sustained High Demand (Volume Driven)",
              unmetNeedAnalysis: `Students and young interns require quick, fresh, value-for-money sustenance between lectures.`,
              idealPlacementSpot: "Directly opposite the central study library lane.",
              demandTriggers: "11:30 AM – 2:00 PM & 5:00 PM – 10:00 PM.",
              competitionVoid: "Nearby legacy eateries have slow turnaround times."
            }
          ]
        };
        setScoutResults(fallback);
        localStorage.setItem(`${STORAGE_PREFIX}location_scout_demand`, JSON.stringify(fallback));
      }
      await recordEvaluationUsage();
    } catch (err) {
      setLastAiError(err.message || "Failed to evaluate locations.");
    } finally {
      setIsScoutingLocations(false);
    }
  };

  // Tab 3: Feasibility & Risk Matrix
  const [businessIdea, setBusinessIdea] = useState("");
  const [targetCity, setTargetCity] = useState("HSR Layout, Bengaluru");
  const [initialCapital, setInitialCapital] = useState("150000");
  const [customerSegment, setCustomerSegment] = useState("B2C Working Professionals & Commuters");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(() => safeGetStorage(`${STORAGE_PREFIX}last_analysis`, null));

  const handleEvaluateIdea = async (e) => {
    e.preventDefault();
    if (!canPerformEvaluation()) return;
    setIsAnalyzing(true);

    try {
      const prompt = `Perform a comprehensive business evaluation and Indian Risk & Threat Matrix for:
Concept: ${businessIdea}
City/Location: ${targetCity}
Capital: ₹${initialCapital}
Customer Segment: ${customerSegment}

Return ONLY valid JSON matching this schema:
{
  "viabilityScore": 8.7,
  "competitionScore": 7.2,
  "summary": "2-sentence strategic feasibility audit.",
  "estimatedMarginPercent": "38% - 48%",
  "breakEvenMonths": "4 to 6 Months",
  "capex": [
    {"item": "Machinery & Counters", "cost": "₹55,000"},
    {"item": "Opening Stock", "cost": "₹45,000"}
  ],
  "monthlyOpex": [
    {"item": "Kiosk Rent", "cost": "₹20,000"},
    {"item": "Staff Salary", "cost": "₹12,000"}
  ],
  "licenses": ["MSME Udyam Registration (Free)", "GSTIN Registration", "FSSAI Food License / Trade Permit"],
  "riskMatrix": {
    "udhaarRisk": {
      "level": "Medium",
      "threat": "Customers asking for credit tabs ('Khata').",
      "mitigation": "Strict 'Zero-Khata' policy. Promote instant UPI checkout."
    },
    "seasonalRisk": {
      "level": "High",
      "threat": "Monsoon downpours reducing walk-in footfall.",
      "mitigation": "Partner with hyperlocal delivery partners on rainy days."
    },
    "downsideSurvivalPlan": "Emergency Protocol: Cut staff hours and pivot to pre-booked corporate catering."
  }
}`;

      const raw = await callGeminiAI(prompt, "You are BizNavigator's Senior Indian SME Strategist & Risk Auditor. Return JSON only.");
      const parsed = extractJsonFromText(raw);

      if (parsed?.viabilityScore) {
        setAnalysisResult(parsed);
        localStorage.setItem(`${STORAGE_PREFIX}last_analysis`, JSON.stringify(parsed));
      } else {
        const numCap = parseInt(initialCapital) || 150000;
        const fallbackAnalysis = {
          viabilityScore: 8.5,
          competitionScore: 6.9,
          summary: `Strong operational feasibility in ${targetCity}. The model benefits from rapid cash conversion and healthy gross margins.`,
          estimatedMarginPercent: "35% - 46%",
          breakEvenMonths: "4 to 5 Months",
          capex: [
            { item: "Machinery, Setup & Dispensing Units", cost: `₹${Math.round(numCap * 0.38).toLocaleString('en-IN')}` },
            { item: "Opening Raw Stock & Packaging", cost: `₹${Math.round(numCap * 0.32).toLocaleString('en-IN')}` },
            { item: "Signage & Digital Standees", cost: `₹${Math.round(numCap * 0.12).toLocaleString('en-IN')}` },
            { item: "Working Capital Safety Reserve", cost: `₹${Math.round(numCap * 0.18).toLocaleString('en-IN')}` }
          ],
          monthlyOpex: [
            { item: "Kiosk / Space Rent", cost: "₹18,000 - ₹25,000" },
            { item: "Helper / Operational Staff", cost: "₹12,000" },
            { item: "Utilities & Sundries", cost: "₹5,500" }
          ],
          licenses: ["MSME Udyam Registration (Govt Portal - Free)", "GSTIN Registration", "FSSAI Basic Registration / Local Trade Permit"],
          riskMatrix: {
            udhaarRisk: {
              level: "Medium",
              threat: "Customers requesting delayed credit settlement ('Likh lena').",
              mitigation: "Install an audible UPI soundbox prominently. Enforce 100% upfront digital billing."
            },
            seasonalRisk: {
              level: "High",
              threat: "Monsoon street flooding and post-festival demand dips.",
              mitigation: "Setup an automated WhatsApp Broadcast catalog for nearby apartment complexes."
            },
            downsideSurvivalPlan: "Emergency Protocol: If Month 2 revenue falls below break-even, transition to owner-operator mode to eliminate staff overhead."
          }
        };
        setAnalysisResult(fallbackAnalysis);
        localStorage.setItem(`${STORAGE_PREFIX}last_analysis`, JSON.stringify(fallbackAnalysis));
      }
      await recordEvaluationUsage();
    } catch (err) {
      setLastAiError(err.message || "Failed to evaluate idea.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Tab 4: 10-Day Sprint
  const [dailySprintTasks, setDailySprintTasks] = useState(() => safeGetStorage(`${STORAGE_PREFIX}daily_sprint_10days`, INITIAL_10_DAY_SPRINT));
  const [sprintFilter, setSprintFilter] = useState("all");
  const [taskAdviceModal, setTaskAdviceModal] = useState(null);
  const [isLoadingTaskAdvice, setIsLoadingTaskAdvice] = useState(false);

  const toggleDailyTask = (id) => {
    const updated = dailySprintTasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    setDailySprintTasks(updated);
    localStorage.setItem(`${STORAGE_PREFIX}daily_sprint_10days`, JSON.stringify(updated));
  };

  const resetSprintTasks = () => {
    if (window.confirm("Reset all 10-day tasks to default?")) {
      setDailySprintTasks(INITIAL_10_DAY_SPRINT);
      localStorage.setItem(`${STORAGE_PREFIX}daily_sprint_10days`, JSON.stringify(INITIAL_10_DAY_SPRINT));
    }
  };

  const handleConsultDailyTaskAI = async (taskItem) => {
    setIsLoadingTaskAdvice(true);
    setTaskAdviceModal({ title: taskItem.dayTitle, phase: taskItem.phase, sopText: "" });

    try {
      const ventureContext = selectedVenture ? selectedVenture.title : "Indian SME Retail / Service Venture";
      const prompt = `Act as BizNavigator's Lead Field Operations Manager for Indian small businesses. Provide a step-by-step Standard Operating Procedure (SOP) for this launch task:
Day & Task: "${taskItem.dayTitle}" - ${taskItem.task}
Business Context: ${ventureContext}
Target Budget: ${taskItem.budgetEst} | Time Allocated: ${taskItem.timeEst}

Provide:
1. Hourly checklist.
2. Verbatim negotiation dialogue in Hinglish/English.
3. 2 ground pitfalls to avoid.
4. Completion metric.`;

      const raw = await callGeminiAI(prompt, "You are BizNavigator's Field Operations Manager.");
      setTaskAdviceModal({
        title: taskItem.dayTitle,
        phase: taskItem.phase,
        sopText: raw || `### Field SOP for ${taskItem.dayTitle}\n\n1. Complete all market vendor visits early before 11 AM.\n2. **Negotiation Script (Hinglish):** "Bhaiya, pehla sample wholesale price pe dijiye, hum repeat bulk order plan kar rahe hain."\n3. **Pitfall:** Never release 100% advance payments without delivery verification.`
      });
    } catch (err) {
      setTaskAdviceModal((prev) => prev ? { ...prev, sopText: "Unable to retrieve SOP. Please try again." } : null);
    } finally {
      setIsLoadingTaskAdvice(false);
    }
  };

  const completedDailyCount = dailySprintTasks.filter((t) => t.completed).length;
  const sprintProgressPercent = Math.round((completedDailyCount / dailySprintTasks.length) * 100);

  const filteredTasks = dailySprintTasks.filter((t) => {
    if (sprintFilter === "incomplete") return !t.completed;
    if (sprintFilter === "completed") return t.completed;
    return true;
  });

  // Tab 5: Calculators & Ledger
  const [costPrice, setCostPrice] = useState(250);
  const [shippingCost, setShippingCost] = useState(40);
  const [gstPercent, setGstPercent] = useState(18);
  const [sellingPrice, setSellingPrice] = useState(599);
  const [monthlyOverhead, setMonthlyOverhead] = useState(45000);
  const [unitRevenue, setUnitRevenue] = useState(500);
  const [unitVariableCost, setUnitVariableCost] = useState(220);

  const [aiMarginAnalysis, setAiMarginAnalysis] = useState("");
  const [isAnalyzingMargin, setIsAnalyzingMargin] = useState(false);
  const [aiLedgerAudit, setAiLedgerAudit] = useState("");
  const [isAuditingLedger, setIsAuditingLedger] = useState(false);

  const [ledgerEntries, setLedgerEntries] = useState(() => safeGetStorage(`${STORAGE_PREFIX}ledger`, [
    { id: 1, desc: "Packaging Cartons & Bags Purchase", type: "out", amount: 4500, date: "Today" },
    { id: 2, desc: "Direct UPI Order Receipts", type: "in", amount: 14200, date: "Today" }
  ]));
  const [ledgerDesc, setLedgerDesc] = useState("");
  const [ledgerAmount, setLedgerAmount] = useState("");
  const [ledgerType, setLedgerType] = useState("in");

  const handleRunMarginDoctorAI = async () => {
    setIsAnalyzingMargin(true);
    try {
      const totalCost = Number(costPrice) + Number(shippingCost);
      const netMargin = (((Number(sellingPrice) - totalCost) / Number(sellingPrice)) * 100).toFixed(1);
      const prompt = `Indian SME Pricing Check: Cost ₹${costPrice}, Packing/Shipping ₹${shippingCost}, GST ${gstPercent}%, Selling Price ₹${sellingPrice}, Net Margin ${netMargin}%. Provide profit buffer & RTO observations.`;
      const res = await callGeminiAI(prompt, "You are BizNavigator's Pricing & Margins Doctor.");
      setAiMarginAnalysis(res || `Margin of ${netMargin}% is healthy. Factor in a 10-12% buffer for return-to-origin on cash-on-delivery orders.`);
    } catch (err) {
      setAiMarginAnalysis("Pricing audit complete. Ensure vendor tax invoices are collected for Input Tax Credit.");
    } finally {
      setIsAnalyzingMargin(false);
    }
  };

  const handleRunLedgerAuditAI = async () => {
    setIsAuditingLedger(true);
    try {
      const summary = ledgerEntries.map((e) => `${e.date}: ${e.desc} (${e.type === "in" ? "+₹" : "-₹"}${e.amount})`).join("; ");
      const prompt = `Audit Indian SME cashflow logs: ${summary}. Give 3 observations on working capital and Udhaar control.`;
      const res = await callGeminiAI(prompt, "You are BizNavigator's Financial Auditor.");
      setAiLedgerAudit(res || "Inflows are steady. Reconcile soundbox audio receipts at daily closing.");
    } catch (err) {
      setAiLedgerAudit("Cashflow balance is healthy. Keep 30-45 days of fixed expenses in reserve.");
    } finally {
      setIsAuditingLedger(false);
    }
  };

  const totalIn = ledgerEntries.filter((e) => e.type === "in").reduce((s, i) => s + Number(i.amount), 0);
  const totalOut = ledgerEntries.filter((e) => e.type === "out").reduce((s, i) => s + Number(i.amount), 0);
  const netLedgerBalance = totalIn - totalOut;

  const totalUnitCost = Number(costPrice) + Number(shippingCost);
  const gstDeduction = Number(sellingPrice) * (Number(gstPercent) / (100 + Number(gstPercent)));
  const netProfitUnit = Number(sellingPrice) - gstDeduction - totalUnitCost;
  const netMarginPercent = sellingPrice > 0 ? ((netProfitUnit / Number(sellingPrice)) * 100).toFixed(1) : 0;
  const unitContribution = Number(unitRevenue) - Number(unitVariableCost);
  const breakEvenUnitsNeeded = unitContribution > 0 ? Math.ceil(Number(monthlyOverhead) / unitContribution) : "N/A";

  // Tab 6: Live Market Radar
  const [marketTrends, setMarketTrends] = useState(() => safeGetStorage(`${STORAGE_PREFIX}market_trends`, [
    {
      tag: "Hyperlocal Logistics",
      title: "ONDC Direct Merchant Integrations",
      desc: "Independent eateries and retailers utilizing ONDC protocol logistics partners are fulfilling deliveries within 4km for sub-₹30 per packet without 30% marketplace commissions."
    },
    {
      tag: "GST Compliance",
      title: "IMS (Invoice Management System) Input Matching",
      desc: "GSTN's automated invoice matching mandates daily reconciliation of vendor invoices in GSTR-2B before claiming monthly Input Tax Credit (ITC)."
    },
    {
      tag: "Supply Chain",
      title: "Pre-Festive Packaging Inventory Lock-In",
      desc: "Corrugated box manufacturing and paper pulp rates surge 15% preceding Diwali and wedding quarters. Pre-order 60 days of packaging stock early."
    }
  ]));
  const [isScanningMarket, setIsScanningMarket] = useState(false);

  const handleScanLiveMarketAI = async () => {
    setIsScanningMarket(true);
    try {
      const prompt = `Provide 3 fresh Indian SME intelligence cards (Logistics/ONDC, Wholesale Sourcing, Compliance/GST). Output JSON:
{ "updates": [{ "tag": "Category", "title": "Catchy Title", "desc": "Practical advice" }] }`;
      const raw = await callGeminiAI(prompt, "You are BizNavigator's SME Market Analyst.");
      const parsed = extractJsonFromText(raw);
      if (parsed?.updates && Array.isArray(parsed.updates)) {
        setMarketTrends(parsed.updates);
        localStorage.setItem(`${STORAGE_PREFIX}market_trends`, JSON.stringify(parsed.updates));
      }
    } catch (e) {
    } finally {
      setIsScanningMarket(false);
    }
  };

  // 24/7 BizMentor Chat
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "mentor",
      text: "Namaste! I am your 24/7 BizMentor AI. Ask me anything about lease negotiations, Udhaar recovery scripts, GST filing, or Indiamart sourcing!"
    }
  ]);
  const [inputChat, setInputChat] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleSendChat = async () => {
    if (!inputChat.trim()) return;
    const userText = inputChat;
    setInputChat("");
    setChatMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setIsChatLoading(true);

    try {
      const prompt = `Question from Indian Entrepreneur: ${userText}\nVenture: ${selectedVenture ? selectedVenture.title : "Indian SME"}\nProvide actionable, culturally astute advice for Indian SME operations.`;
      const res = await callGeminiAI(prompt, "You are BizMentor AI, an expert Indian small business advisor.");
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "mentor",
          text: res || "Always maintain a strict credit ledger. Offer a 2% immediate UPI cash discount to disincentivize credit requests politely."
        }
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "mentor",
          text: "Ensure prominent UPI QR display with instant soundbox confirmation."
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const filteredSubmittedTxns = submittedTxns.filter((txn) => {
    if (txnFilterStatus === "pending") return txn.status === "pending" || !txn.status;
    if (txnFilterStatus === "approved") return txn.status === "approved";
    if (txnFilterStatus === "rejected") return txn.status === "rejected";
    return true;
  });

  // ==========================================
  // AUTH WALL VIEW
  // ==========================================
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between items-center px-4 py-8 font-sans selection:bg-amber-500 selection:text-black">
        <div className="w-full max-w-md space-y-6 my-auto">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-xl shadow-amber-500/20 mx-auto">
              <TrendingUp className="text-slate-950 font-black h-8 w-8" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 via-orange-300 to-rose-400 bg-clip-text text-transparent">
              BizNavigator 🇮🇳
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              India's AI-Powered SME Operating System & Launch Suite
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="grid grid-cols-4 border-b border-slate-800 pb-3 gap-1">
              <button
                onClick={() => { setAuthMode("login"); setSignupStep(1); setAuthError(""); setAuthSuccessNotice(""); }}
                className={`text-center py-2 text-[11px] font-bold transition border-b-2 ${
                  authMode === "login" ? "border-amber-500 text-amber-400" : "border-transparent text-slate-400"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setAuthMode("signup"); setSignupStep(1); setAuthError(""); setAuthSuccessNotice(""); }}
                className={`text-center py-2 text-[11px] font-bold transition border-b-2 ${
                  authMode === "signup" ? "border-amber-500 text-amber-400" : "border-transparent text-slate-400"
                }`}
              >
                Register
              </button>
              <button
                onClick={() => {
                  setAuthMode("forgot");
                  setOtpStep(1);
                  setAuthError("");
                  setAuthSuccessNotice("");
                  setEnteredOtp("");
                  setResetNewPassword("");
                  setResetConfirmPassword("");
                }}
                className={`text-center py-2 text-[11px] font-bold transition border-b-2 flex items-center justify-center space-x-1 ${
                  authMode === "forgot" ? "border-amber-500 text-amber-400" : "border-transparent text-slate-400"
                }`}
              >
                <span>Forgot?</span>
              </button>
              <button
                onClick={() => { setAuthMode("admin"); setSignupStep(1); setAuthError(""); setAuthSuccessNotice(""); }}
                className={`text-center py-2 text-[11px] font-bold transition border-b-2 flex items-center justify-center space-x-1 ${
                  authMode === "admin" ? "border-rose-500 text-rose-400" : "border-transparent text-slate-400"
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>

            {authError && (
              <div className="bg-rose-950/40 border border-rose-500/40 p-3 rounded-xl text-xs text-rose-300 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{authError}</span>
              </div>
            )}

            {authSuccessNotice && (
              <div className="bg-emerald-950/40 border border-emerald-500/40 p-3 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
                <Check className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                <span>{authSuccessNotice}</span>
              </div>
            )}

            {/* SIGN UP */}
            {authMode === "signup" ? (
              signupStep === 1 ? (
                <form onSubmit={handleSignupRequestOtp} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anand Sharma"
                      value={authFullName}
                      onChange={(e) => setAuthFullName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Business Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Sharma Enterprises"
                      value={authBusinessName}
                      onChange={(e) => setAuthBusinessName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="founder@business.in"
                      value={authEmailOrPhone}
                      onChange={(e) => setAuthEmailOrPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSendingSignupOtp}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl transition text-xs flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    {isSendingSignupOtp ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Send Verification OTP</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSignupVerifyAndRegister} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Enter 6-Digit OTP from Email</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="e.g. 583920"
                      value={signupEnteredOtp}
                      onChange={(e) => setSignupEnteredOtp(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono tracking-widest text-center"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isAuthLoading}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl transition text-xs cursor-pointer"
                  >
                    {isAuthLoading ? "Verifying..." : "Verify & Complete Registration"}
                  </button>
                </form>
              )
            ) : authMode === "forgot" ? (
              otpStep === 1 ? (
                <form onSubmit={handleForgotRequestOtp} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Registered Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="founder@business.in"
                      value={authEmailOrPhone}
                      onChange={(e) => setAuthEmailOrPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSendingOtp}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl transition text-xs flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    {isSendingOtp ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Send Password Reset OTP</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleForgotVerifyAndReset} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">6-Digit OTP from Email</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="e.g. 583920"
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono tracking-widest text-center"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-300 font-semibold">New Password</label>
                      <button
                        type="button"
                        onClick={() => setShowPasswordToggle(!showPasswordToggle)}
                        className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center space-x-1 cursor-pointer"
                      >
                        {showPasswordToggle ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{showPasswordToggle ? "Hide" : "Show"}</span>
                      </button>
                    </div>
                    <input
                      type={showPasswordToggle ? "text" : "password"}
                      required
                      placeholder="At least 4 characters"
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Confirm New Password</label>
                    <input
                      type={showPasswordToggle ? "text" : "password"}
                      required
                      placeholder="Re-enter new password"
                      value={resetConfirmPassword}
                      onChange={(e) => setResetConfirmPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isAuthLoading}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl transition text-xs mt-2 cursor-pointer"
                  >
                    {isAuthLoading ? "Updating in MongoDB..." : "Reset Password"}
                  </button>
                </form>
              )
            ) : (
              <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
                {authMode === "admin" ? (
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Master Admin Secret Key</label>
                    <input
                      type="password"
                      required
                      placeholder="Enter Admin Secret (admin123)"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-rose-500/40 rounded-xl px-3 py-2.5 text-slate-100 font-mono"
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                      <input
                        type="text"
                        required
                        placeholder="founder@business.in"
                        value={authEmailOrPhone}
                        onChange={(e) => setAuthEmailOrPhone(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-slate-300 font-semibold">Password</label>
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode("forgot");
                            setOtpStep(1);
                            setAuthError("");
                            setAuthSuccessNotice("");
                          }}
                          className="text-[11px] font-bold text-amber-400 hover:underline cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100"
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={isAuthLoading}
                  className={`w-full font-bold py-3 rounded-xl transition text-xs shadow-lg flex items-center justify-center space-x-2 cursor-pointer ${
                    authMode === "admin"
                      ? "bg-rose-500 hover:bg-rose-400 text-slate-950"
                      : "bg-amber-500 hover:bg-amber-400 text-slate-950"
                  }`}
                >
                  {isAuthLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>{authMode === "admin" ? "Authenticate Admin" : "Sign In"}</span>}
                </button>
              </form>
            )}
          </div>
        </div>

        <footer className="w-full max-w-7xl mx-auto border-t border-slate-800/80 pt-4 pb-2 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>BizNavigator © 2026. Made for Indian SMEs.</div>
          <div className="flex flex-wrap gap-4 text-slate-400 font-medium">
            <button onClick={() => setLegalModalType("terms")} className="hover:text-amber-400 cursor-pointer">Terms</button>
            <button onClick={() => setLegalModalType("privacy")} className="hover:text-amber-400 cursor-pointer">Privacy</button>
            <button onClick={() => setLegalModalType("refund")} className="hover:text-amber-400 cursor-pointer">Refund</button>
            <button onClick={() => setLegalModalType("contact")} className="hover:text-amber-400 cursor-pointer">Contact</button>
          </div>
        </footer>
      </div>
    );
  }

  // ==========================================
  // MAIN APP VIEW
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <TrendingUp className="text-slate-950 font-black h-6 w-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 via-orange-300 to-rose-400 bg-clip-text text-transparent">
                BizNavigator
              </span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
                INDIA 🇮🇳
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-sm">
            {isAdminUser ? (
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    syncDatabaseData();
                    setActiveTab("admin-works");
                  }}
                  className="bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-rose-500/20"
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>Admin Works (DB) ⚙️</span>
                </button>
              </div>
            ) : isUserPro ? (
              <div className="flex items-center space-x-1.5 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1.5 rounded-full text-emerald-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pro Member</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-300 flex items-center space-x-1.5 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-xl">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    Free: <strong className="text-amber-400 font-bold">{remainingEvaluations} of {FREE_USAGE_LIMIT} left</strong>
                  </span>
                </span>
                <button
                  onClick={() => setShowPaywallModal(true)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs cursor-pointer shadow"
                >
                  Upgrade
                </button>
              </div>
            )}

            <div className="flex items-center space-x-2 bg-slate-800 border border-slate-700 px-3 py-1 rounded-xl">
              <div className={`w-6 h-6 rounded-full font-black text-xs flex items-center justify-center ${
                isAdminUser ? "bg-rose-500 text-white" : "bg-amber-500 text-slate-950"
              }`}>
                {currentUser.name?.charAt(0).toUpperCase()}
              </div>
              <button onClick={handleLogout} title="Logout" className="text-slate-400 hover:text-rose-400 p-1 ml-1 cursor-pointer">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 flex space-x-1 overflow-x-auto text-sm border-t border-slate-800/80 pt-1">
          {[
            { id: "idea-finder", label: "AI Idea Matcher (5 Ideas)", icon: Lightbulb },
            { id: "location-scout", label: "Location Scout 📍", icon: MapPin },
            { id: "evaluator", label: "Feasibility & Risk Matrix 📊", icon: Briefcase },
            { id: "roadmap", label: `10-Day Sprint Guide (${sprintProgressPercent}%) 🗓️`, icon: Calendar },
            { id: "tools", label: "AI Calculators & Ledger", icon: Calculator },
            { id: "market", label: "Live AI Market Radar", icon: FileText },
            ...(isAdminUser
              ? [{ id: "admin-works", label: "Administrative Works (MongoDB) ⚙️", icon: Database, highlight: true }]
              : [])
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === "admin-works") {
                    syncDatabaseData();
                  }
                }}
                className={`flex items-center space-x-2 py-2.5 px-4 font-medium transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? tab.highlight
                      ? "border-rose-500 text-rose-400 bg-rose-500/10 font-bold"
                      : "border-amber-500 text-amber-400 bg-amber-500/5 font-bold"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* ACTIVE VENTURE PIPELINE BANNER */}
      {selectedVenture && (
        <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-transparent border-b border-amber-500/30 px-4 py-2 text-xs text-amber-200">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded text-[10px]">
                ACTIVE PIPELINE
              </span>
              <strong>{selectedVenture.title}</strong>
              <span className="text-slate-400 hidden sm:inline">({selectedVenture.category})</span>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <button onClick={() => setActiveTab("location-scout")} className="text-amber-300 hover:underline cursor-pointer">1. Scout 📍</button>
              <span>•</span>
              <button onClick={() => setActiveTab("evaluator")} className="text-amber-300 hover:underline cursor-pointer">2. Feasibility & Risk 📊</button>
              <span>•</span>
              <button onClick={() => setActiveTab("roadmap")} className="text-amber-300 hover:underline cursor-pointer">3. 10-Day Sprint 🗓️</button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-1">
        {/* FREE EVALUATION COUNTDOWN NOTE BANNER */}
        {!isAdminUser && !isUserPro && (
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-3.5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm ${
                remainingEvaluations === 0
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                  : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
              }`}>
                {remainingEvaluations}
              </div>
              <div>
                <p className="font-bold text-slate-200">
                  Free Evaluation Countdown Note
                </p>
                <p className="text-slate-400 text-[11px]">
                  {remainingEvaluations > 0 ? (
                    <>
                      You have <strong className="text-amber-400">{remainingEvaluations} of {FREE_USAGE_LIMIT} free evaluations remaining</strong>. Every AI analysis, idea generation, or location scout uses 1 evaluation.
                    </>
                  ) : (
                    <span className="text-rose-400 font-semibold">
                      Free usage limit reached (0/{FREE_USAGE_LIMIT} remaining). Please upgrade to Pro for unlimited evaluations.
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
              <div className="w-24 bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-300 ${
                    remainingEvaluations === 0 ? "bg-rose-500" : "bg-gradient-to-r from-amber-500 to-orange-500"
                  }`}
                  style={{ width: `${(remainingEvaluations / FREE_USAGE_LIMIT) * 100}%` }}
                />
              </div>
              <button
                type="button"
                onClick={() => setShowPaywallModal(true)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs whitespace-nowrap cursor-pointer transition shadow"
              >
                Upgrade to Pro
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB: ADMINISTRATIVE WORKS (DIRECT MONGODB HANDLING)       */}
        {/* ========================================================= */}
        {activeTab === "admin-works" && isAdminUser && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-rose-950/40 via-red-950/30 to-slate-900 border border-rose-500/40 rounded-3xl p-6 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-rose-400 font-bold text-xs uppercase tracking-wider flex items-center space-x-2">
                  <Database className="w-4 h-4" />
                  <span>Direct MongoDB Database Control Console</span>
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 mt-1">
                  Administrative Works & Live Subscriptions
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Connected directly to your MongoDB database collections: <code>subscriptions</code> & <code>users</code>.
                </p>
              </div>
              <button
                type="button"
                onClick={syncDatabaseData}
                disabled={isAdminDataLoading}
                className="bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg cursor-pointer whitespace-nowrap"
              >
                <RefreshCw className={`w-4 h-4 ${isAdminDataLoading ? "animate-spin" : ""}`} />
                <span>{isAdminDataLoading ? "Connecting to MongoDB..." : "Sync Fresh DB Records"}</span>
              </button>
            </div>

            {adminDbError && (
              <div className="bg-rose-950/60 border border-rose-500 p-4 rounded-2xl text-xs text-rose-300 flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
                <div>
                  <strong className="block font-bold">Database Error</strong>
                  <span>{adminDbError}</span>
                </div>
              </div>
            )}
            {adminDbSuccess && (
              <div className="bg-emerald-950/60 border border-emerald-500 p-4 rounded-2xl text-xs text-emerald-300 flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-400 mt-0.5" />
                <div>
                  <strong className="block font-bold">Database Operation Successful</strong>
                  <span>{adminDbSuccess}</span>
                </div>
              </div>
            )}

            <div className="flex space-x-2 border-b border-slate-800 pb-2 text-xs">
              <button
                type="button"
                onClick={() => setAdminSubTab("txns")}
                className={`px-4 py-2 rounded-xl font-bold transition flex items-center space-x-2 cursor-pointer ${
                  adminSubTab === "txns" ? "bg-rose-500 text-slate-950" : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                <IndianRupee className="w-3.5 h-3.5" />
                <span>Payment Approvals ({submittedTxns.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setAdminSubTab("users")}
                className={`px-4 py-2 rounded-xl font-bold transition flex items-center space-x-2 cursor-pointer ${
                  adminSubTab === "users" ? "bg-rose-500 text-slate-950" : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Registered Users ({registeredUsersList.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setAdminSubTab("manual")}
                className={`px-4 py-2 rounded-xl font-bold transition flex items-center space-x-2 cursor-pointer ${
                  adminSubTab === "manual" ? "bg-rose-500 text-slate-950" : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Manual Pro Grant</span>
              </button>
            </div>

            {/* SUB-TAB 1: PAYMENT APPROVALS */}
            {adminSubTab === "txns" && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="font-extrabold text-slate-100 text-base">
                      Submitted Payments from MongoDB
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Approving grants permanent Pro access to the user in MongoDB.
                    </p>
                  </div>
                  <div className="flex items-center space-x-1 text-xs">
                    {["all", "pending", "approved", "rejected"].map((st) => (
                      <button
                        key={st}
                        onClick={() => setTxnFilterStatus(st)}
                        className={`px-3 py-1.5 rounded-lg capitalize font-bold transition cursor-pointer ${
                          txnFilterStatus === st
                            ? "bg-slate-800 text-amber-400 border border-slate-700"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredSubmittedTxns.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
                    <Database className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                    No transactions found in MongoDB matching status: <strong className="text-slate-400">{txnFilterStatus}</strong>.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                          <th className="py-3 px-3">Razorpay ID</th>
                          <th className="py-3 px-3">User Email</th>
                          <th className="py-3 px-3">Plan</th>
                          <th className="py-3 px-3">DB Status</th>
                          <th className="py-3 px-3 text-right">MongoDB Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono">
                        {filteredSubmittedTxns.map((txn) => {
                          const isApproved = txn.status === "approved";
                          const isRejected = txn.status === "rejected";
                          return (
                            <tr key={txn._id || txn.id || txn.paymentId} className="hover:bg-slate-950/40 transition">
                              <td className="py-3.5 px-3 font-bold text-amber-400">
                                {txn.paymentId}
                              </td>
                              <td className="py-3.5 px-3 font-sans text-slate-200">
                                {txn.userEmail}
                              </td>
                              <td className="py-3.5 px-3 font-sans text-slate-300">
                                {txn.plan}
                              </td>
                              <td className="py-3.5 px-3 font-sans">
                                {isApproved ? (
                                  <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 px-2.5 py-1 rounded-full text-[10px] font-bold">
                                    Approved
                                  </span>
                                ) : isRejected ? (
                                  <span className="bg-rose-950/80 text-rose-400 border border-rose-500/40 px-2.5 py-1 rounded-full text-[10px] font-bold">
                                    Rejected
                                  </span>
                                ) : (
                                  <span className="bg-amber-950/80 text-amber-400 border border-amber-500/40 px-2.5 py-1 rounded-full text-[10px] font-bold">
                                    Pending Approval
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 px-3 font-sans text-right space-x-2">
                                {!isApproved ? (
                                  <button
                                    type="button"
                                    disabled={isExecutingAdminAction}
                                    onClick={() => handleAdminApproveTxn(txn)}
                                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1 rounded-lg text-xs transition cursor-pointer"
                                  >
                                    Approve in DB
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={isExecutingAdminAction}
                                    onClick={() => handleAdminRevokeTxn(txn)}
                                    className="bg-slate-800 hover:bg-rose-950 text-rose-400 border border-rose-500/30 font-bold px-3 py-1 rounded-lg text-xs transition cursor-pointer"
                                  >
                                    Revoke in DB
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 2: REGISTERED USERS & EVALUATION RESET */}
            {adminSubTab === "users" && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="border-b border-slate-800 pb-4">
                  <h3 className="font-extrabold text-slate-100 text-base">
                    MongoDB User Accounts ({registeredUsersList.length})
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Directly modify user records, reset their free evaluation limits to 0, or grant Pro status in the database.
                  </p>
                </div>

                {registeredUsersList.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
                    <Users className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                    No users returned from MongoDB API <code>/api/admin/users</code>.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                          <th className="py-3 px-3">Name</th>
                          <th className="py-3 px-3">Email Address</th>
                          <th className="py-3 px-3">Role</th>
                          <th className="py-3 px-3">Free Used</th>
                          <th className="py-3 px-3">Pro Access</th>
                          <th className="py-3 px-3 text-right">MongoDB Controls</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {registeredUsersList.map((u) => {
                          const isPro = Boolean(u.isProUser || u.role === "admin");
                          return (
                            <tr key={u._id || u.emailOrPhone} className="hover:bg-slate-950/40 transition">
                              <td className="py-3 px-3 font-bold text-slate-100">{u.name || "N/A"}</td>
                              <td className="py-3 px-3 text-slate-300 font-mono">{u.emailOrPhone}</td>
                              <td className="py-3 px-3">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  u.role === "admin" ? "bg-rose-950 text-rose-400" : "bg-slate-800 text-slate-400"
                                }`}>
                                  {u.role || "user"}
                                </span>
                              </td>
                              <td className="py-3 px-3">
                                <span className="text-amber-400 font-bold">{u.evaluationsCount || 0}</span> / {FREE_USAGE_LIMIT}
                              </td>
                              <td className="py-3 px-3">
                                {isPro ? (
                                  <span className="text-emerald-400 font-bold flex items-center space-x-1">
                                    <Check className="w-3 h-3" />
                                    <span>Active</span>
                                  </span>
                                ) : (
                                  <span className="text-slate-500">Free Tier</span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-right space-x-2 whitespace-nowrap">
                                <button
                                  type="button"
                                  disabled={isExecutingAdminAction}
                                  onClick={() => handleAdminResetEvaluations(u.emailOrPhone)}
                                  className="bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer"
                                  title="Reset evaluation count to 0 in MongoDB"
                                >
                                  Reset Count
                                </button>
                                <button
                                  type="button"
                                  disabled={isExecutingAdminAction}
                                  onClick={() => handleAdminToggleUserPro(u.emailOrPhone, isPro)}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                                    isPro
                                      ? "bg-slate-800 text-rose-400 hover:bg-rose-950"
                                      : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                                  }`}
                                >
                                  {isPro ? "Revoke Pro" : "Grant Pro"}
                                </button>
                                <button
                                  type="button"
                                  disabled={isExecutingAdminAction}
                                  onClick={() => handleAdminDeleteUser(u.emailOrPhone)}
                                  className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                                  title="Delete User from MongoDB"
                                >
                                  <Trash2 className="w-3.5 h-3.5 inline" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 3: MANUAL PRO GRANT FORM */}
            {adminSubTab === "manual" && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg space-y-4 shadow-xl text-xs">
                <div>
                  <h3 className="font-extrabold text-slate-100 text-base">
                    Manual MongoDB Subscription Creator
                  </h3>
                  <p className="text-slate-400 mt-1">
                    Grant immediate Pro membership by user email for bank transfers, cash payments, or testing.
                  </p>
                </div>
                <form onSubmit={handleAdminManualGrant} className="space-y-4 pt-2">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">User Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="founder@business.in"
                      value={manualGrantEmail}
                      onChange={(e) => setManualGrantEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Select Membership Plan</label>
                    <select
                      value={manualGrantPlan}
                      onChange={(e) => setManualGrantPlan(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                    >
                      <option>Day Pass (₹49)</option>
                      <option>Monthly Pro (₹249)</option>
                      <option>Quarterly Pro (₹599)</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={isExecutingAdminAction}
                    className="w-full bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold py-2.5 rounded-xl transition cursor-pointer"
                  >
                    {isExecutingAdminAction ? "Writing to MongoDB..." : "Grant Pro Access in MongoDB"}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 1: 6-INPUT AI IDEA MATCHER + DEEP ANALYSIS            */}
        {/* ========================================================= */}
        {activeTab === "idea-finder" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-3">
                  <Target className="w-5 h-5 text-amber-400" />
                  <span>Configure Your 6 Parameters</span>
                </h2>

                <form onSubmit={handleGenerateIdeas} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">1. Capital Budget (₹ INR)</label>
                    <input
                      type="number"
                      required
                      value={finderBudget}
                      onChange={(e) => setFinderBudget(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">2. Target Location / Indian City</label>
                    <input
                      type="text"
                      required
                      value={finderLocation}
                      onChange={(e) => setFinderLocation(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">3. Your Skills & Strengths</label>
                    <textarea
                      rows={2}
                      required
                      value={finderSkills}
                      onChange={(e) => setFinderSkills(e.target.value)}
                      placeholder="e.g. Sales, Cooking, Accounting, Tech, Social Media"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">4. Passions & Niche Interests</label>
                    <input
                      type="text"
                      required
                      value={finderInterests}
                      onChange={(e) => setFinderInterests(e.target.value)}
                      placeholder="e.g. Healthy Food, Packaging, Fitness, Apparel"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">5. Working Time</label>
                      <select
                        value={finderTime}
                        onChange={(e) => setFinderTime(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-slate-200"
                      >
                        <option>Full-Time (8+ hrs/day)</option>
                        <option>Part-Time / Side Hustle (3-4 hrs/day)</option>
                        <option>Weekend-Only (8-10 hrs)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">6. Risk Appetite</label>
                      <select
                        value={finderRisk}
                        onChange={(e) => setFinderRisk(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-slate-200"
                      >
                        <option>Low Risk (Capital Preservation)</option>
                        <option>Medium Risk (Balanced)</option>
                        <option>High Risk (Aggressive Scale)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isFindingIdeas}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 text-slate-950 font-bold py-3 rounded-xl transition text-xs shadow-lg flex items-center justify-center space-x-2 mt-2 cursor-pointer"
                  >
                    {isFindingIdeas ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Evaluating Parameters with AI...</span>
                      </>
                    ) : (
                      <>
                        <Lightbulb className="w-4 h-4" />
                        <span>Generate 5 Tailored Business Ideas</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Ideas Output */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="font-bold text-slate-200 text-sm flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>5 Tailored Opportunities</span>
                  </h3>
                </div>

                {matchedIdeas ? (
                  matchedIdeas.map((idea, idx) => {
                    const isSelected = selectedVenture?.title === idea.title;
                    return (
                      <div
                        key={idea.id || idx}
                        className={`p-5 rounded-3xl transition space-y-3 relative border ${
                          isSelected
                            ? "bg-slate-900 border-2 border-amber-500 shadow-xl"
                            : "bg-slate-900 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="bg-slate-800 text-amber-400 font-bold text-xs px-2.5 py-0.5 rounded-full border border-slate-700">
                            #{idx + 1} {idea.category || "Venture"} • {idea.matchScore}% Match
                          </span>
                          <span className="text-xs text-emerald-400 font-bold">{idea.monthlyPotential}</span>
                        </div>

                        <div>
                          <h4 className="text-base font-extrabold text-slate-100">{idea.title}</h4>
                          <p className="text-xs text-slate-400">{idea.tagline}</p>
                        </div>

                        <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-xs text-slate-300">
                          <strong className="text-amber-400">Why it fits your inputs: </strong>
                          {idea.whyFit}
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                          <button
                            type="button"
                            onClick={() => handleOpenDeepAnalysis(idea)}
                            className="bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Run Deep Analysis 🔬</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleChooseVenture(idea)}
                            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 transition cursor-pointer"
                          >
                            <span>{isSelected ? "Active Pipeline 🚀" : "Adopt Venture 🚀"}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-72 border border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center p-8 text-center text-slate-500">
                    <Lightbulb className="w-10 h-10 text-slate-700 mb-2" />
                    <p className="text-sm font-semibold text-slate-400">Configure parameters on the left to evaluate 5 bespoke ideas.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Deep Analysis Modal */}
            {deepAnalysisIdea && (
              <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[110] flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-6 relative shadow-2xl text-xs">
                  <button
                    type="button"
                    onClick={() => setDeepAnalysisIdea(null)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="border-b border-slate-800 pb-4">
                    <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase">
                      Deep Feasibility & Unit Economics Audit
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-100 mt-2">{deepAnalysisIdea.title}</h3>
                    <p className="text-slate-400 text-xs">{deepAnalysisIdea.tagline}</p>
                  </div>

                  {isLoadingDeepAnalysis ? (
                    <div className="py-16 text-center space-y-3">
                      <RefreshCw className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
                      <p className="text-slate-300 font-semibold text-sm">Calculating Unit Economics, Break-Even & IndiaMART Sourcing Channels...</p>
                    </div>
                  ) : deepAnalysisData ? (
                    <div className="space-y-6">
                      <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3">
                        <h4 className="font-bold text-amber-400 text-sm flex items-center space-x-2">
                          <Calculator className="w-4 h-4" />
                          <span>1. Unit Economics & Margin Breakdown</span>
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <div className="bg-slate-900 p-3 rounded-xl">
                            <span className="text-slate-400 block text-[11px]">Selling Price / Ticket:</span>
                            <strong className="text-slate-100 text-sm">{deepAnalysisData.unitEconomics?.sellingPricePerUnit}</strong>
                          </div>
                          <div className="bg-slate-900 p-3 rounded-xl">
                            <span className="text-slate-400 block text-[11px]">COGS (Raw Materials):</span>
                            <strong className="text-rose-400 text-sm">{deepAnalysisData.unitEconomics?.cogsRawMaterials}</strong>
                          </div>
                          <div className="bg-slate-900 p-3 rounded-xl">
                            <span className="text-slate-400 block text-[11px]">Packaging & Consumables:</span>
                            <strong className="text-rose-400 text-sm">{deepAnalysisData.unitEconomics?.packagingAndConsumables}</strong>
                          </div>
                          <div className="bg-slate-900 p-3 rounded-xl">
                            <span className="text-slate-400 block text-[11px]">Delivery / Commission:</span>
                            <strong className="text-slate-300 text-sm">{deepAnalysisData.unitEconomics?.deliveryOrPlatformFee}</strong>
                          </div>
                          <div className="bg-slate-900 p-3 rounded-xl">
                            <span className="text-slate-400 block text-[11px]">UPI Soundbox / Gateway:</span>
                            <strong className="text-slate-300 text-sm">{deepAnalysisData.unitEconomics?.paymentGatewayAndSoundboxFee}</strong>
                          </div>
                          <div className="bg-emerald-950/40 border border-emerald-500/40 p-3 rounded-xl">
                            <span className="text-emerald-400 block text-[11px] font-bold">Net Margin / Unit:</span>
                            <strong className="text-emerald-300 text-sm">{deepAnalysisData.unitEconomics?.netMarginPerUnit}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3">
                        <h4 className="font-bold text-sky-400 text-sm flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4" />
                          <span>2. Break-Even Volume & Timeline</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="bg-slate-900 p-3 rounded-xl">
                            <span className="text-slate-400 block text-[11px]">Est. Monthly Fixed Cost:</span>
                            <strong className="text-slate-200">{deepAnalysisData.breakEvenAnalysis?.estimatedMonthlyFixedCost}</strong>
                          </div>
                          <div className="bg-slate-900 p-3 rounded-xl">
                            <span className="text-slate-400 block text-[11px]">Daily Sales to Break-Even:</span>
                            <strong className="text-amber-400">{deepAnalysisData.breakEvenAnalysis?.dailyUnitsRequiredToBreakEven}</strong>
                          </div>
                          <div className="bg-slate-900 p-3 rounded-xl">
                            <span className="text-slate-400 block text-[11px]">Healthy Profit Target Volume:</span>
                            <strong className="text-emerald-400">{deepAnalysisData.breakEvenAnalysis?.comfortableProfitTargetVolume}</strong>
                          </div>
                          <div className="bg-slate-900 p-3 rounded-xl">
                            <span className="text-slate-400 block text-[11px]">Capital Recovery Runway:</span>
                            <strong className="text-indigo-400">{deepAnalysisData.breakEvenAnalysis?.timeToBreakEven}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3">
                        <h4 className="font-bold text-amber-400 text-sm flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>3. Target Customer Archetype & Conversion Trigger</span>
                        </h4>
                        <p className="text-slate-300">
                          <strong className="text-slate-200">Ideal Buyer Persona: </strong>
                          {deepAnalysisData.customerArchetype?.persona}
                        </p>
                        <p className="text-slate-300">
                          <strong className="text-slate-200">Footfall Conversion Trigger: </strong>
                          {deepAnalysisData.customerArchetype?.conversionTrigger}
                        </p>
                        <p className="text-slate-300">
                          <strong className="text-slate-200">Repeat Retention Frequency: </strong>
                          {deepAnalysisData.customerArchetype?.repeatPurchaseRate}
                        </p>
                      </div>

                      <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3">
                        <h4 className="font-bold text-indigo-400 text-sm flex items-center space-x-2">
                          <Truck className="w-4 h-4" />
                          <span>4. Supply Chain & B2B Vendor Sourcing Guide</span>
                        </h4>
                        <div className="space-y-2 text-slate-300">
                          <p>
                            <strong className="text-slate-200">Recommended Wholesale Platforms: </strong>
                            {deepAnalysisData.supplyChainSourcingGuide?.primaryPlatforms}
                          </p>
                          <p>
                            <strong className="text-slate-200">Physical Sourcing Hubs: </strong>
                            {deepAnalysisData.supplyChainSourcingGuide?.sourcingLocations}
                          </p>
                          <div className="bg-amber-950/20 border border-amber-500/30 p-3 rounded-xl text-amber-300 text-[11px]">
                            <strong>Indian Vendor Negotiation Protocol: </strong>
                            {deepAnalysisData.supplyChainSourcingGuide?.vendorNegotiationRule}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setDeepAnalysisIdea(null)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                        >
                          Close
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleChooseVenture(deepAnalysisIdea);
                            setDeepAnalysisIdea(null);
                          }}
                          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer"
                        >
                          <span>Adopt This Venture & Scout Locations 📍</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: DEMAND LOCATION SCOUT                              */}
        {/* ========================================================= */}
        {activeTab === "location-scout" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <Compass className="w-4 h-4" />
                    <span>Demand & Catchment Scout</span>
                  </div>
                  <h2 className="text-base font-extrabold text-slate-100 mt-1">
                    Pinpoint Local Demand Hotspots
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Evaluates locations based on unmet customer hunger, catchment footfall, and operational fit—not rental rates.
                  </p>
                </div>

                <form onSubmit={handleEvaluateLocations} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      1. Target Indian City / Metro Area *
                    </label>
                    <input
                      type="text"
                      required
                      value={scoutCity}
                      onChange={(e) => setScoutCity(e.target.value)}
                      placeholder="e.g. Bengaluru, Mumbai, Delhi-NCR, Hyderabad, Pune, Indore"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      2. Business Offering / Format *
                    </label>
                    <input
                      type="text"
                      required
                      value={scoutConcept}
                      onChange={(e) => setScoutConcept(e.target.value)}
                      placeholder="e.g. Artisanal Cold-Brew & Chai Kiosk, Fast 2W EV Charging Station"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      3. Operational & Placement Requirements *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={scoutNeeds}
                      onChange={(e) => setScoutNeeds(e.target.value)}
                      placeholder="e.g. High morning pedestrian density, sub-3 min grab-and-go access, compact counter space, high UPI soundbox usage"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      4. Target Catchment Demographic *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={scoutDemographic}
                      onChange={(e) => setScoutDemographic(e.target.value)}
                      placeholder="e.g. Working IT professionals, coaching students, hospital visitors, evening shoppers"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isScoutingLocations}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 text-slate-950 font-bold py-3 rounded-xl transition text-xs flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/10 mt-2 cursor-pointer"
                  >
                    {isScoutingLocations ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Analyzing Catchment Demand in {scoutCity}...</span>
                      </>
                    ) : (
                      <>
                        <Target className="w-4 h-4" />
                        <span>Evaluate Demand Hotspots in {scoutCity}</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Results Output Column */}
              <div className="lg:col-span-7 space-y-4">
                {scoutResults?.cityDemandOverview && (
                  <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl text-xs text-slate-300 leading-relaxed shadow-lg">
                    <div className="flex items-center space-x-2 text-amber-400 font-bold text-[11px] mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Catchment Demand Macro-Diagnosis for {scoutCity}:</span>
                    </div>
                    {scoutResults.cityDemandOverview}
                  </div>
                )}

                {scoutResults?.locations ? (
                  scoutResults.locations.map((loc, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3.5 shadow-xl transition hover:border-slate-700"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 mr-2">
                            {loc.catchmentType}
                          </span>
                          <h4 className="text-base font-extrabold text-slate-100 mt-1">{loc.name}</h4>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-emerald-400 font-bold text-xs bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-xl flex items-center space-x-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>{loc.suitabilityScore}% Demand Match</span>
                          </span>
                        </div>
                      </div>

                      <div className="bg-amber-950/20 border border-amber-500/30 px-3.5 py-2 rounded-2xl flex items-center space-x-2 text-xs text-amber-300">
                        <Flame className="w-4 h-4 flex-shrink-0 text-amber-400" />
                        <span>
                          <strong>Demand Profile: </strong> {loc.demandIntensity}
                        </span>
                      </div>

                      <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-1">
                        <strong className="text-slate-100 flex items-center space-x-1.5">
                          <Target className="w-3.5 h-3.5 text-rose-400" />
                          <span>Unmet Need & Local Frustration:</span>
                        </strong>
                        <p className="leading-relaxed text-slate-300">{loc.unmetNeedAnalysis}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 space-y-1">
                          <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-sky-400" />
                            <span>Peak Demand Hours</span>
                          </span>
                          <p className="font-semibold text-slate-200">{loc.demandTriggers}</p>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 space-y-1">
                          <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center space-x-1">
                            <MapPin className="w-3 h-3 text-emerald-400" />
                            <span>Ideal Placement Spot</span>
                          </span>
                          <p className="font-semibold text-slate-200">{loc.idealPlacementSpot}</p>
                        </div>
                      </div>

                      <div className="bg-indigo-950/20 border border-indigo-500/30 p-3.5 rounded-2xl text-[11px] text-indigo-300 space-y-1">
                        <strong className="text-indigo-200 flex items-center space-x-1.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Why Existing Alternatives Fail (Your Edge):</span>
                        </strong>
                        <p className="leading-relaxed">{loc.competitionVoid}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-72 border border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center p-8 text-center text-slate-500">
                    <Compass className="w-10 h-10 text-slate-700 mb-2" />
                    <p className="text-sm font-semibold text-slate-400">
                      Enter your target city and operational needs to uncover high-demand pockets.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: BUSINESS EVALUATOR & RISK MATRIX                   */}
        {/* ========================================================= */}
        {activeTab === "evaluator" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                    <Briefcase className="w-5 h-5 text-amber-400" />
                    <span>Business Feasibility & Indian Risk Audit</span>
                  </h3>
                </div>

                <form onSubmit={handleEvaluateIdea} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Business Concept / Format</label>
                    <textarea
                      rows={3}
                      required
                      value={businessIdea}
                      onChange={(e) => setBusinessIdea(e.target.value)}
                      placeholder="e.g. Specialty Chai & Fresh Snack Kiosk"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Target City / Micro-Zone</label>
                    <input
                      type="text"
                      required
                      value={targetCity}
                      onChange={(e) => setTargetCity(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Initial Capital (₹ INR)</label>
                    <input
                      type="number"
                      required
                      value={initialCapital}
                      onChange={(e) => setInitialCapital(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Primary Customer Segment</label>
                    <input
                      type="text"
                      required
                      value={customerSegment}
                      onChange={(e) => setCustomerSegment(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isAnalyzing}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 text-slate-950 font-bold py-3 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg cursor-pointer"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Auditing Capex, Opex & Indian Risk Matrix...</span>
                      </>
                    ) : (
                      <>
                        <Briefcase className="w-4 h-4" />
                        <span>Run Full Feasibility & Risk Audit</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Evaluation Output Column */}
              <div className="lg:col-span-7">
                {analysisResult ? (
                  <div id="printable-report" className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl text-xs">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Feasibility Verdict</span>
                        <h3 className="font-extrabold text-slate-100 text-base">{businessIdea}</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 flex items-center space-x-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Print PDF</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center text-xs">
                      <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Viability Score</span>
                        <span className="font-black text-emerald-400 block text-lg">{analysisResult.viabilityScore}/10</span>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Net Margin</span>
                        <span className="font-black text-sky-400 block text-lg">{analysisResult.estimatedMarginPercent}</span>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Break-Even</span>
                        <span className="font-black text-indigo-400 block text-lg">{analysisResult.breakEvenMonths}</span>
                      </div>
                    </div>

                    <p className="text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                      {analysisResult.summary}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                        <strong className="text-amber-400 block font-bold">Planned Capex Breakdown:</strong>
                        {analysisResult.capex?.map((c, i) => (
                          <div key={i} className="flex justify-between border-b border-slate-800/60 pb-1 text-[11px]">
                            <span className="text-slate-400">{c.item}</span>
                            <span className="font-bold text-slate-200">{c.cost}</span>
                          </div>
                        ))}
                      </div>

                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                        <strong className="text-sky-400 block font-bold">Monthly Opex Estimates:</strong>
                        {analysisResult.monthlyOpex?.map((o, i) => (
                          <div key={i} className="flex justify-between border-b border-slate-800/60 pb-1 text-[11px]">
                            <span className="text-slate-400">{o.item}</span>
                            <span className="font-bold text-slate-200">{o.cost}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                      <strong className="text-indigo-400 block font-bold mb-2">Mandatory Indian Registrations & Permits:</strong>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.licenses?.map((lic, i) => (
                          <span key={i} className="bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-lg text-slate-300 text-[11px]">
                            ✓ {lic}
                          </span>
                        ))}
                      </div>
                    </div>

                    {analysisResult.riskMatrix && (
                      <div className="space-y-4 pt-2 border-t border-slate-800">
                        <h4 className="font-bold text-rose-400 text-sm flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Indian SME Risk & Threat Matrix</span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-200">1. Cashflow & Udhaar Risk</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                analysisResult.riskMatrix.udhaarRisk.level === "High" ? "bg-rose-950 text-rose-400" : "bg-amber-950 text-amber-400"
                              }`}>{analysisResult.riskMatrix.udhaarRisk.level}</span>
                            </div>
                            <p className="text-slate-400 text-[11px]">{analysisResult.riskMatrix.udhaarRisk.threat}</p>
                            <div className="text-emerald-400 text-[11px] mt-1">
                              <strong>Mitigation: </strong>{analysisResult.riskMatrix.udhaarRisk.mitigation}
                            </div>
                          </div>

                          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-200">2. Monsoon & Seasonal Risk</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                analysisResult.riskMatrix.seasonalRisk.level === "High" ? "bg-rose-950 text-rose-400" : "bg-amber-950 text-amber-400"
                              }`}>{analysisResult.riskMatrix.seasonalRisk.level}</span>
                            </div>
                            <p className="text-slate-400 text-[11px]">{analysisResult.riskMatrix.seasonalRisk.threat}</p>
                            <div className="text-emerald-400 text-[11px] mt-1">
                              <strong>Mitigation: </strong>{analysisResult.riskMatrix.seasonalRisk.mitigation}
                            </div>
                          </div>
                        </div>

                        <div className="bg-rose-950/20 border border-rose-500/40 p-4 rounded-2xl space-y-1 text-slate-300">
                          <strong className="text-rose-400 block font-bold flex items-center space-x-1.5">
                            <ShieldAlert className="w-4 h-4" />
                            <span>Worst-Case Downside Survival Contingency Plan:</span>
                          </strong>
                          <p className="text-[11px] leading-relaxed">
                            {analysisResult.riskMatrix.downsideSurvivalPlan}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-72 border border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center p-8 text-center text-slate-500">
                    <Briefcase className="w-10 h-10 text-slate-700 mb-2" />
                    <p className="text-sm font-semibold text-slate-400">Run a feasibility audit to generate financial capex, break-even, and Indian risk matrix.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: 10-DAY STEP-BY-STEP LAUNCH SPRINT                  */}
        {/* ========================================================= */}
        {activeTab === "roadmap" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div>
                  <h3 className="font-extrabold text-slate-100 text-lg flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-amber-400" />
                    <span>The 10-Day Indian Launch Sprint</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Complete Day 1 through Day 10 execution blueprint with field checklists & Hinglish scripts.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={resetSprintTasks}
                    className="text-xs text-slate-400 hover:text-slate-200 border border-slate-800 px-3 py-1.5 rounded-xl cursor-pointer"
                  >
                    Reset
                  </button>
                  <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-400">
                    {completedDailyCount}/10 Done ({sprintProgressPercent}%)
                  </div>
                </div>
              </div>

              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-amber-500 to-emerald-500 h-2.5 transition-all duration-300 rounded-full"
                  style={{ width: `${sprintProgressPercent}%` }}
                />
              </div>

              <div className="flex space-x-2 text-xs">
                {["all", "incomplete", "completed"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSprintFilter(filter)}
                    className={`px-3 py-1.5 rounded-xl font-bold capitalize transition cursor-pointer ${
                      sprintFilter === filter
                        ? "bg-amber-500 text-slate-950"
                        : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {filteredTasks.map((t) => (
                  <div
                    key={t.id}
                    className={`p-4 rounded-2xl border transition text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      t.completed
                        ? "bg-slate-950/60 border-slate-800/60 opacity-80"
                        : "bg-slate-950 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start space-x-3 flex-1">
                      <button
                        type="button"
                        onClick={() => toggleDailyTask(t.id)}
                        className="mt-0.5 cursor-pointer text-slate-400 hover:text-emerald-400 transition"
                      >
                        {t.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-600" />
                        )}
                      </button>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`font-extrabold ${t.completed ? "line-through text-slate-500" : "text-slate-100"}`}>
                            {t.dayTitle}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                            {t.phase}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            t.priority === "Critical" ? "bg-rose-950 text-rose-400" : "bg-amber-950 text-amber-400"
                          }`}>
                            {t.priority}
                          </span>
                        </div>
                        <p className={`text-[11px] leading-relaxed ${t.completed ? "text-slate-500" : "text-slate-300"}`}>
                          {t.task}
                        </p>
                        <div className="flex flex-wrap gap-3 text-[10px] text-slate-400 pt-1">
                          <span>⏱ Time: <strong className="text-slate-300">{t.timeEst}</strong></span>
                          <span>💰 Budget: <strong className="text-slate-300">{t.budgetEst}</strong></span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleConsultDailyTaskAI(t)}
                      className="bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 px-3.5 py-2 rounded-xl font-bold flex items-center justify-center space-x-1.5 self-end sm:self-center transition cursor-pointer"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>AI Field SOP 🤖</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {taskAdviceModal && (
              <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[85vh] overflow-y-auto space-y-4 relative text-xs shadow-2xl">
                  <button
                    type="button"
                    onClick={() => setTaskAdviceModal(null)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="border-b border-slate-800 pb-2">
                    <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                      Field Execution SOP
                    </span>
                    <h3 className="font-extrabold text-slate-100 text-base mt-1">{taskAdviceModal.title}</h3>
                  </div>

                  <div className="whitespace-pre-line text-slate-300 leading-relaxed font-sans">
                    {isLoadingTaskAdvice ? (
                      <div className="py-12 text-center space-y-2">
                        <RefreshCw className="w-6 h-6 animate-spin text-amber-400 mx-auto" />
                        <p className="text-slate-400">Formulating step-by-step field checklists and negotiation scripts...</p>
                      </div>
                    ) : (
                      taskAdviceModal.sopText
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setTaskAdviceModal(null)}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                    >
                      Understood & Ready to Execute
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: CALCULATORS & DAILY LEDGER                         */}
        {/* ========================================================= */}
        {activeTab === "tools" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-slate-100 text-sm">Unit Profit & Margin Doctor</h3>
                  <button
                    type="button"
                    onClick={handleRunMarginDoctorAI}
                    disabled={isAnalyzingMargin}
                    className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>{isAnalyzingMargin ? "Auditing..." : "Run AI Margin Audit"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Cost Price (₹)</label>
                    <input type="number" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-2 rounded-xl text-slate-100" />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Selling Price (₹)</label>
                    <input type="number" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-2 rounded-xl text-slate-100" />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Packaging / Shipping (₹)</label>
                    <input type="number" value={shippingCost} onChange={(e) => setShippingCost(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-2 rounded-xl text-slate-100" />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Applicable GST (%)</label>
                    <input type="number" value={gstPercent} onChange={(e) => setGstPercent(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-2 rounded-xl text-slate-100" />
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex justify-between">
                  <div>Net Profit/Unit: <strong className="text-emerald-400 font-bold">₹{netProfitUnit.toFixed(1)}</strong></div>
                  <div>Net Margin: <strong className="text-amber-400 font-bold">{netMarginPercent}%</strong></div>
                </div>

                {aiMarginAnalysis && (
                  <div className="bg-amber-950/20 border border-amber-500/30 p-3 rounded-xl text-xs text-amber-200">
                    {aiMarginAnalysis}
                  </div>
                )}
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                <h3 className="font-bold text-slate-100 text-sm border-b border-slate-800 pb-3">Break-Even Volume Calculator</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Monthly Overhead (Rent+Salaries ₹)</label>
                    <input type="number" value={monthlyOverhead} onChange={(e) => setMonthlyOverhead(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-2 rounded-xl text-slate-100" />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Selling Revenue/Unit (₹)</label>
                    <input type="number" value={unitRevenue} onChange={(e) => setUnitRevenue(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-2 rounded-xl text-slate-100" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-slate-400 block mb-1">Variable Direct Cost/Unit (₹)</label>
                    <input type="number" value={unitVariableCost} onChange={(e) => setUnitVariableCost(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-2 rounded-xl text-slate-100" />
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex justify-between">
                  <div>Contribution/Unit: <strong className="text-slate-200">₹{unitContribution}</strong></div>
                  <div>Volume Needed: <strong className="text-emerald-400 font-bold">{breakEvenUnitsNeeded} Units/mo</strong></div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                  <IndianRupee className="w-5 h-5 text-amber-400" />
                  <span>Daily Cashflow & Udhaar Ledger</span>
                </h3>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={handleRunLedgerAuditAI}
                    disabled={isAuditingLedger}
                    className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>{isAuditingLedger ? "Auditing..." : "Run AI Cashflow Audit"}</span>
                  </button>
                  <span className="text-xs bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-200">
                    Net: <strong className={netLedgerBalance >= 0 ? "text-emerald-400" : "text-rose-400"}>₹{netLedgerBalance.toLocaleString("en-IN")}</strong>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                <input
                  type="text"
                  placeholder="Transaction details..."
                  value={ledgerDesc}
                  onChange={(e) => setLedgerDesc(e.target.value)}
                  className="sm:col-span-6 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                />
                <input
                  type="number"
                  placeholder="Amount (₹)"
                  value={ledgerAmount}
                  onChange={(e) => setLedgerAmount(e.target.value)}
                  className="sm:col-span-3 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono"
                />
                <select
                  value={ledgerType}
                  onChange={(e) => setLedgerType(e.target.value)}
                  className="sm:col-span-2 bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-slate-200"
                >
                  <option value="in">Cash In (+)</option>
                  <option value="out">Cash Out (-)</option>
                </select>
                <button
                  type="button"
                  onClick={() => {
                    if (!ledgerDesc || !ledgerAmount) return;
                    setLedgerEntries([
                      ...ledgerEntries,
                      { id: Date.now(), desc: ledgerDesc, amount: Number(ledgerAmount), type: ledgerType, date: "Today" }
                    ]);
                    setLedgerDesc("");
                    setLedgerAmount("");
                  }}
                  className="sm:col-span-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center justify-center p-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {aiLedgerAudit && (
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <strong className="text-amber-400 block font-bold mb-1">AI Financial Health Diagnosis:</strong>
                  {aiLedgerAudit}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: LIVE AI MARKET RADAR                               */}
        {/* ========================================================= */}
        {activeTab === "market" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  <span>Live Indian SME Market Radar</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">Real-time alerts on ONDC logistics, GST mandates, and APMC wholesale shifts.</p>
              </div>
              <button
                type="button"
                onClick={handleScanLiveMarketAI}
                disabled={isScanningMarket}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-2 shadow-md transition cursor-pointer"
              >
                {isScanningMarket ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Scan Market Radar Now</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {marketTrends.map((t, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 shadow-lg">
                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase">
                    {t.tag}
                  </span>
                  <h3 className="font-bold text-slate-100 text-sm">{t.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-900/60 py-6 text-xs text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="font-bold text-slate-200">BizNavigator 🇮🇳</p>
            <p className="text-[11px] text-slate-500">India's SME Strategic Roadmap & Launch Platform</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-xs font-medium">
            <button onClick={() => setLegalModalType("terms")} className="hover:text-amber-400 cursor-pointer">Terms of Service</button>
            <span>•</span>
            <button onClick={() => setLegalModalType("privacy")} className="hover:text-amber-400 cursor-pointer">Privacy Policy</button>
            <span>•</span>
            <button onClick={() => setLegalModalType("refund")} className="hover:text-amber-400 cursor-pointer">Refund Policy</button>
            <span>•</span>
            <button onClick={() => setLegalModalType("contact")} className="hover:text-amber-400 cursor-pointer">Contact & Support</button>
          </div>
        </div>
      </footer>

      {/* 24/7 DOCKED FLOATING BIZMENTOR CHAT */}
      <div className="fixed bottom-5 right-5 z-50">
        {!isChatOpen ? (
          <button
            type="button"
            onClick={() => setIsChatOpen(true)}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 text-slate-950 font-bold px-4 py-3 rounded-full shadow-2xl flex items-center space-x-2 transition transform hover:scale-105 cursor-pointer"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-sm">Ask BizMentor AI 🇮🇳</span>
          </button>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-80 sm:w-96 flex flex-col h-[480px]">
            <div className="p-3 bg-slate-950 border-b border-slate-800 rounded-t-3xl flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-bold text-xs text-slate-200">BizMentor AI (24/7 SME Advisor)</span>
              </div>
              <button type="button" onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 ${msg.sender === "user" ? "bg-amber-500 text-slate-950 font-medium" : "bg-slate-800 text-slate-200"}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="text-slate-500 text-[11px] flex items-center space-x-1.5">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>BizMentor is formulating advice...</span>
                </div>
              )}
            </div>

            <div className="p-2 border-t border-slate-800 bg-slate-950 rounded-b-3xl flex items-center space-x-1.5">
              <input
                type="text"
                placeholder="Ask about GST, credit, wholesale..."
                value={inputChat}
                onChange={(e) => setInputChat(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
              />
              <button type="button" onClick={handleSendChat} className="bg-amber-500 hover:bg-amber-400 text-slate-950 p-2 rounded-xl cursor-pointer">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SUBSCRIPTION PAYWALL MODAL */}
      {showPaywallModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-6 relative shadow-2xl">
            <button type="button" onClick={() => setShowPaywallModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer">
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs px-3 py-1 rounded-full font-bold">
                BizNavigator Pro Upgrade
              </span>
              <h3 className="text-2xl font-black text-slate-100">
                Free limit reached ({evaluationsCount}/{FREE_USAGE_LIMIT}). Upgrade to Pro for unlimited evaluations.
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-center space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-slate-400">Day Pass</span>
                  <div className="text-2xl font-extrabold text-slate-100 mt-1">₹49</div>
                  <span className="text-[10px] text-slate-500">24 Hours Access</span>
                </div>
                <button
                  type="button"
                  onClick={() => { window.open(PAYMENT_LINKS.dayPass, "_blank"); setShowPaywallModal(false); setShowVerificationModal(true); }}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-2 rounded-xl font-bold flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <span>Pay ₹49</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <div className="bg-slate-950 border-2 border-amber-500/80 p-4 rounded-2xl text-center space-y-3 relative flex flex-col justify-between shadow-lg shadow-amber-500/10">
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full">
                  MOST POPULAR
                </span>
                <div>
                  <span className="text-xs text-amber-400 font-semibold">Monthly Pro</span>
                  <div className="text-2xl font-black text-slate-100 mt-1">₹249</div>
                  <span className="text-[10px] text-slate-400">Unlimited evaluations</span>
                </div>
                <button
                  type="button"
                  onClick={() => { window.open(PAYMENT_LINKS.monthlyPro, "_blank"); setShowPaywallModal(false); setShowVerificationModal(true); }}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs py-2 rounded-xl font-bold flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <span>Pay ₹249</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-center space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-slate-400">3 Months</span>
                  <div className="text-2xl font-extrabold text-slate-100 mt-1">₹599</div>
                  <span className="text-[10px] text-emerald-400">Save 20%</span>
                </div>
                <button
                  type="button"
                  onClick={() => { window.open(PAYMENT_LINKS.quarterlyPro, "_blank"); setShowPaywallModal(false); setShowVerificationModal(true); }}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-2 rounded-xl font-bold flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <span>Pay ₹599</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setShowPaywallModal(false); setShowVerificationModal(true); setVerificationError(""); }}
                className="text-xs text-slate-400 hover:text-amber-400 underline cursor-pointer"
              >
                Already paid? Submit Razorpay Payment ID for verification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT VERIFICATION MODAL */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 relative shadow-2xl">
            <button type="button" onClick={() => setShowVerificationModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer">
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <ShieldCheck className="w-10 h-10 text-amber-400 mx-auto" />
              <h3 className="text-lg font-bold text-slate-100">Payment Verification</h3>
              <p className="text-xs text-slate-400">
                Provide your official <strong>Razorpay Payment ID</strong> (starts with <code>pay_</code>).
              </p>
            </div>

            {verificationError && (
              <div className="bg-rose-950/40 border border-rose-500/40 p-3 rounded-xl text-xs text-rose-300">
                {verificationError}
              </div>
            )}

            <form onSubmit={handleSubmitVerification} className="space-y-4 pt-2 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Razorpay Payment ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. pay_Pxyz89234abcd"
                  value={inputPaymentId}
                  onChange={(e) => setInputPaymentId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Plan Paid For</label>
                <select
                  value={selectedPlanForVerification}
                  onChange={(e) => setSelectedPlanForVerification(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                >
                  <option>Day Pass (₹49)</option>
                  <option>Monthly Pro (₹249)</option>
                  <option>Quarterly Pro (₹599)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl transition text-xs shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                {isVerifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Submit to MongoDB</span>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* LEGAL POLICIES MODAL */}
      {legalModalType && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[120] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] flex flex-col relative shadow-2xl">
            <button
              type="button"
              onClick={() => setLegalModalType(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {legalModalType === "terms" && (
              <div className="space-y-4 overflow-y-auto pr-2 text-xs text-slate-300">
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  Terms of Service & AI Disclaimer
                </h2>
                <p className="text-slate-400">Last updated: October 2026</p>
                <div className="bg-amber-950/30 border border-amber-500/30 p-3 rounded-xl text-amber-200">
                  <strong>⚠️ Statutory Disclaimer:</strong> BizNavigator provides AI-driven business feasibility calculations for educational and planning purposes only. We do not provide chartered accountancy, formal audit guarantees, or statutory legal council.
                </div>
              </div>
            )}

            {legalModalType === "privacy" && (
              <div className="space-y-4 overflow-y-auto pr-2 text-xs text-slate-300">
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  Privacy Policy (DPDP Act Compliant)
                </h2>
                <p>We collect and secure basic credentials strictly for account authentication and transactional alerts. No credentials or business ideas are monetized or sold to third parties.</p>
              </div>
            )}

            {legalModalType === "refund" && (
              <div className="space-y-4 overflow-y-auto pr-2 text-xs text-slate-300">
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-sky-400" />
                  Refund & Cancellation Policy
                </h2>
                <p>Digital subscriptions provision AI compute instances on demand and are non-refundable upon activation. In cases of duplicate charges, email admin@biznavigator.in with Razorpay Payment IDs within 48 hours for full refund processing.</p>
              </div>
            )}

            {legalModalType === "contact" && (
              <div className="space-y-4 overflow-y-auto pr-2 text-xs text-slate-300">
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-amber-400" />
                  Contact & Support
                </h2>
                <p>Support Email: <strong>admin@biznavigator.in</strong></p>
                <p>Operational Headquarters: Rangpuri Pahari, Vasant Kunj Road, South West Delhi, Delhi - 110037</p>
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setLegalModalType(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
