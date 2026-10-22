
import React, { useState, useEffect } from "react";
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
  FileEdit
} from "lucide-react";

// --- CONFIGURATION CONSTANTS, MONGODB API & CREDENTIALS ---
const API_BASE_URL = typeof window !== "undefined" && window.location.hostname === "localhost"
  ? "http://localhost:5000/api"
  : "/api";

const FREE_USAGE_LIMIT = 5;
const PRO_DAILY_LIMIT = 50;
const STORAGE_PREFIX = "biznavigator_";
const ADMIN_EMAIL = "admin@biznavigator.in";
const ADMIN_SECRET_KEY = "admin123";

// READ SECURELY FROM VERCEL ENVIRONMENT VARIABLES (NO HARDCODED KEY)
const VERCEL_ENV_GEMINI_KEY =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_GEMINI_API_KEY) ||
  (typeof process !== "undefined" && (process.env?.REACT_APP_GEMINI_API_KEY || process.env?.NEXT_PUBLIC_GEMINI_API_KEY || process.env?.GEMINI_API_KEY)) ||
  "";

const PAYMENT_LINKS = {
  dayPass: "https://rzp.io/rzp/BotR1EMB",       // ₹49
  monthlyPro: "https://rzp.io/rzp/IYMoJDwv",   // ₹249
  quarterlyPro: "https://rzp.io/rzp/wkdIZLD"   // ₹599
};

export default function BizNavigatorApp() {
  // Clear any legacy global Pro leakage
  useEffect(() => {
    localStorage.removeItem(`${STORAGE_PREFIX}is_pro`);
  }, []);

  // ==========================================
  // 1. STRICT AUTHENTICATION STATE
  // ==========================================
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}user`);
    return saved ? JSON.parse(saved) : null;
  });

  const [authMode, setAuthMode] = useState("login"); // 'login', 'signup', 'forgot', 'admin'
  const [authEmailOrPhone, setAuthEmailOrPhone] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authFullName, setAuthFullName] = useState("");
  const [authBusinessName, setAuthBusinessName] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSuccessNotice, setAuthSuccessNotice] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Forgot Password States
  const [otpStep, setOtpStep] = useState(1);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpSecondsLeft, setOtpSecondsLeft] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");

  // Subscriptions & Users synced from MongoDB
  const [submittedTxns, setSubmittedTxns] = useState([]);
  const [registeredUsersList, setRegisteredUsersList] = useState([]);

  // Modals & Panels
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showAdminConsoleModal, setShowAdminConsoleModal] = useState(false);
  const [adminConsoleTab, setAdminConsoleTab] = useState("txns");
  const [selectedPlanForVerification, setSelectedPlanForVerification] = useState("Monthly Pro (₹249)");

  const [inputPaymentId, setInputPaymentId] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // App Navigation
  const [activeTab, setActiveTab] = useState("idea-finder");
  
  // Custom API Key Override
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem(`${STORAGE_PREFIX}gemini_key`) || VERCEL_ENV_GEMINI_KEY
  );
  const [proDailyCount, setProDailyCount] = useState(
    () => parseInt(localStorage.getItem(`${STORAGE_PREFIX}pro_count`)) || 0
  );

  // Pro status derived strictly per user from MongoDB
  const isUserPro = Boolean(
    currentUser && (
      currentUser.role === "admin" ||
      currentUser.isProUser === true ||
      submittedTxns.some(
        (t) =>
          t.userEmail?.toLowerCase() === currentUser.emailOrPhone?.toLowerCase() &&
          t.status === "approved"
      )
    )
  );

  const evaluationsCount = currentUser?.evaluationsCount || 0;

  const userPendingTxn = currentUser
    ? submittedTxns.find(
        (t) =>
          t.userEmail?.toLowerCase() === currentUser.emailOrPhone?.toLowerCase() &&
          t.status === "pending"
      )
    : null;

  // Sync user session to local storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${STORAGE_PREFIX}user`, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(`${STORAGE_PREFIX}user`);
    }
  }, [currentUser]);

  // Sync Transactions & User Directory from MongoDB
  const fetchDbData = async () => {
    try {
      const txnsRes = await fetch(`${API_BASE_URL}/subscriptions/all`);
      if (txnsRes.ok) {
        const txns = await txnsRes.json();
        setSubmittedTxns(txns);
      }

      if (currentUser?.role === "admin") {
        const usersRes = await fetch(`${API_BASE_URL}/admin/users`);
        if (usersRes.ok) {
          const users = await usersRes.json();
          setRegisteredUsersList(users);
        }
      }
    } catch (err) {
      console.warn("Backend API offline or unreachable:", err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchDbData();
    }
  }, [currentUser]);

  // Countdown timers
  useEffect(() => {
    if (otpSecondsLeft <= 0) return;
    const interval = setInterval(() => setOtpSecondsLeft((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(interval);
  }, [otpSecondsLeft]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => setResendCooldown((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // ==========================================
  // CENTRALIZED GEMINI AI EVALUATION ENGINE
  // ==========================================
  const callGeminiAI = async (prompt, systemInstruction = "", fallbackData = null) => {
    if (!currentUser) throw new Error("AUTH_REQUIRED");

    const isAdmin = currentUser.role === "admin";
    if (!isAdmin && !isUserPro && evaluationsCount >= FREE_USAGE_LIMIT) {
      setShowPaywallModal(true);
      throw new Error("LIMIT_REACHED");
    }

    try {
      const serverRes = await fetch(`${API_BASE_URL}/ai/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, systemInstruction, userEmail: currentUser.emailOrPhone })
      });

      if (serverRes.ok) {
        const serverData = await serverRes.json();
        if (serverData.text) {
          if (!isAdmin && !isUserPro) {
            setCurrentUser((p) => ({ ...p, evaluationsCount: (p.evaluationsCount || 0) + 1 }));
          }
          return serverData.text;
        }
      }
    } catch (e) {}

    const activeKey = (apiKey || VERCEL_ENV_GEMINI_KEY).trim();
    if (activeKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-goog-api-key": activeKey },
            body: JSON.stringify({ contents: [{ parts: [{ text: `${systemInstruction}\n\nTask:\n${prompt}` }] }] })
          }
        );

        const data = await response.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (textResponse) {
          if (!isAdmin && !isUserPro) {
            fetch(`${API_BASE_URL}/users/usage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ emailOrPhone: currentUser.emailOrPhone })
            })
              .then((r) => r.json())
              .then((d) => {
                if (d.evaluationsCount) {
                  setCurrentUser((p) => ({ ...p, evaluationsCount: d.evaluationsCount }));
                }
              })
              .catch(() => {});
          }
          return textResponse;
        }
      } catch (err) {
        console.warn("Direct Gemini call failed:", err);
      }
    }

    await new Promise((r) => setTimeout(r, 900));
    return fallbackData;
  };

  // ==========================================
  // AUTHENTICATION LOGIC (MONGODB)
  // ==========================================
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccessNotice("");
    setIsAuthLoading(true);

    try {
      if (authMode === "signup") {
        const res = await fetch(`${API_BASE_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: authFullName,
            emailOrPhone: authEmailOrPhone,
            businessName: authBusinessName,
            password: authPassword
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Registration failed.");

        setCurrentUser(data.user);
        setAuthPassword("");
      } else {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            emailOrPhone: authEmailOrPhone,
            password: authPassword,
            isAdminMode: authMode === "admin"
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Login failed.");

        setCurrentUser(data.user);
        setAuthPassword("");
      }
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
    setIsSendingOtp(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmailOrPhone })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate OTP.");

      setOtpStep(2);
      setOtpSecondsLeft(data.expiresInSeconds || 300);
      setResendCooldown(30);
      setAuthSuccessNotice(`OTP code [${data.otp}] generated & saved in MongoDB! Valid for 5 minutes.`);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleForgotVerifyAndReset = async (e) => {
    e.preventDefault();
    setAuthError("");

    if (resetNewPassword !== resetConfirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: authEmailOrPhone,
          otp: enteredOtp,
          newPassword: resetNewPassword
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Password reset failed.");

      setOtpStep(1);
      setEnteredOtp("");
      setResetNewPassword("");
      setResetConfirmPassword("");
      setAuthMode("login");
      setAuthPassword("");
      setAuthSuccessNotice("Password updated in MongoDB successfully! Please login with your new password.");
    } catch (err) {
      setAuthError(err.message);
    }
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

      await fetchDbData();
      setShowVerificationModal(false);
      alert(
        `Payment ID ${cleanId} stored in MongoDB!\nStatus: PENDING ADMIN APPROVAL.\nYour Pro subscription will activate automatically once the admin approves it.`
      );
    } catch (err) {
      setVerificationError(err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAdminUpdateTxn = async (txnId, status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/subscriptions/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txnId, status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed.");
      await fetchDbData();
      alert(`Transaction in MongoDB marked as ${status}!`);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAdminTogglePro = async (emailOrPhone) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/toggle-pro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrPhone })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Toggle failed.");
      await fetchDbData();
      alert(`Pro status updated in MongoDB for: ${emailOrPhone}`);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out of BizNavigator?")) {
      setCurrentUser(null);
      localStorage.removeItem(`${STORAGE_PREFIX}user`);
      setActiveTab("idea-finder");
    }
  };

  // ==========================================
  // TAB 1: AI IDEA MATCHER
  // ==========================================
  const [finderBudget, setFinderBudget] = useState("100000");
  const [finderLocation, setFinderLocation] = useState("Bengaluru (Tech & Startup Corridor)");
  const [finderSkills, setFinderSkills] = useState("Sales, Basic Cooking, Social Media Handling");
  const [finderInterests, setFinderInterests] = useState("Healthy Snacks, Specialty Beverages, Local Retail");
  const [finderTime, setFinderTime] = useState("Full-Time (8+ hrs/day)");
  const [finderRisk, setFinderRisk] = useState("Moderate (Balanced)");
  const [isFindingIdeas, setIsFindingIdeas] = useState(false);
  const [matchedIdeas, setMatchedIdeas] = useState(() => {
    const cached = localStorage.getItem(`${STORAGE_PREFIX}matched_ideas`);
    return cached ? JSON.parse(cached) : null;
  });

  const handleGenerateIdeas = async (e) => {
    e.preventDefault();
    setIsFindingIdeas(true);

    const prompt = `Generate 3 tailored Indian business ideas based on:
Capital: ₹${finderBudget}, Location: ${finderLocation}, Skills: ${finderSkills}, Interests: ${finderInterests}, Commitment: ${finderTime}, Risk: ${finderRisk}.
Return ONLY valid JSON matching this schema:
{
  "ideas": [
    {
      "id": "idea_1",
      "title": "Business Concept Name",
      "tagline": "One-line summary",
      "matchScore": 94,
      "whyFit": "Why this matches their skills and capital.",
      "estimatedCapex": "₹80,000",
      "monthlyPotential": "₹40,000 - ₹70,000",
      "targetAudience": "Target demographic",
      "firstStep": "Tangible Day 1 launch step in India"
    }
  ]
}`;

    const fallback = JSON.stringify({
      ideas: [
        {
          id: "idea_1",
          title: "Specialty Chai & Healthy Street-Food Kiosk",
          tagline: "High-volume kiosk near office tech-parks or coaching hubs.",
          matchScore: 95,
          whyFit: `Capitalizes on your skills with an initial setup under ₹${(finderBudget * 0.75).toLocaleString("en-IN")}.`,
          estimatedCapex: `₹${(finderBudget * 0.65).toFixed(0)}`,
          monthlyPotential: "₹45,000 - ₹85,000 net profit",
          targetAudience: "Tech park employees, college youth & daily commuters",
          firstStep: "Survey 2 commercial tech parks for footfall density between 4 PM to 7 PM."
        },
        {
          id: "idea_2",
          title: "Eco-Friendly Corrugated Packaging & Retail Bags",
          tagline: "B2B supply partner for local retail brands replacing single-use plastic.",
          matchScore: 91,
          whyFit: "Matches sales capabilities with recurring monthly procurement contracts.",
          estimatedCapex: `₹${(finderBudget * 0.85).toFixed(0)}`,
          monthlyPotential: "₹35,000 - ₹90,000 recurring retainers",
          targetAudience: "Boutique clothing shops, sweet vendors, and local cafes",
          firstStep: "Request wholesale pricing catalogs from paper bag converters on Indiamart."
        },
        {
          id: "idea_3",
          title: "Hyperlocal WhatsApp D2C Daily Essentials & Regional Snacks",
          tagline: "Curated regional namkeen & organic spices delivered via society groups.",
          matchScore: 88,
          whyFit: "Minimal fixed Capex; lets you start from home and test local demand.",
          estimatedCapex: `₹${(finderBudget * 0.4).toFixed(0)}`,
          monthlyPotential: "₹25,000 - ₹50,000 part-time",
          targetAudience: "Gated society residents & festive gift buyers",
          firstStep: "Set up a WhatsApp Business catalog and run an introductory sample pack offer."
        }
      ]
    });

    try {
      const res = await callGeminiAI(prompt, "You are BizNavigator's Lead Indian SME Matchmaker. Output JSON only.", fallback);
      const parsed = JSON.parse(res.replace(/```json|```/g, "").trim());
      setMatchedIdeas(parsed.ideas);
      localStorage.setItem(`${STORAGE_PREFIX}matched_ideas`, JSON.stringify(parsed.ideas));
    } catch (err) {
      if (err.message !== "LIMIT_REACHED") console.error(err);
    } finally {
      setIsFindingIdeas(false);
    }
  };

  const handleSelectIdeaForRoadmap = (idea) => {
    setBusinessIdea(idea.title + " - " + idea.tagline);
    setInitialCapital(finderBudget);
    setTargetCity(finderLocation);
    setCustomerSegment(idea.targetAudience);
    setActiveTab("evaluator");
  };

  // ==============================================================
  // TAB 2: AI MICRO-LOCATION SCOUT (NEW FEATURE)
  // ==========================================
  const [scoutCity, setScoutCity] = useState("Bengaluru");
  const [scoutConcept, setScoutConcept] = useState("Specialty Quick Chai & Snacks Kiosk");
  const [scoutBudgetRent, setScoutBudgetRent] = useState("25000");
  const [scoutTrafficType, setScoutTrafficType] = useState("Corporate Tech Park / Office Crowd");
  const [isScoutingLocations, setIsScoutingLocations] = useState(false);
  const [scoutResults, setScoutResults] = useState(() => {
    const cached = localStorage.getItem(`${STORAGE_PREFIX}location_scout`);
    return cached ? JSON.parse(cached) : null;
  });

  const handleEvaluateLocations = async (e) => {
    e.preventDefault();
    setIsScoutingLocations(true);

    const prompt = `Act as an expert Indian Commercial Real Estate & Retail Expansion Strategist.
Evaluate the best micro-locations in the Indian city of "${scoutCity}" for the business: "${scoutConcept}".
Target Monthly Rent: Up to ₹${scoutBudgetRent}
Desired Footfall Type: ${scoutTrafficType}

Suggest 3 to 4 realistic, specific neighborhoods/commercial streets in ${scoutCity}.
Return ONLY valid JSON matching this schema:
{
  "cityOverview": "2-sentence commercial summary of ${scoutCity} for this business niche.",
  "locations": [
    {
      "name": "Exact Neighborhood / Market Street (e.g., Koramangala 5th Block or Manyata Backgate)",
      "zoneType": "High-Street F&B / Office Hub / Transit Hub / Student Hub",
      "suitabilityScore": 94,
      "estimatedRent": "₹110 - ₹160 / sq.ft (Approx ₹22,000/mo for 150 sq.ft)",
      "footfallProfile": "Techies, startup employees, evening transit crowd",
      "competitionDensity": "Moderate (3 existing stalls within 400m)",
      "peakHours": "8:30 AM - 11:00 AM & 4:30 PM - 8:30 PM",
      "idealFormat": "100-150 sq.ft takeaway counter or semi-kiosk with outdoor standing tables",
      "verdict": "Why this specific zone gives the fastest cash conversion."
    }
  ]
}`;

    const fallback = JSON.stringify({
      cityOverview: `Strong retail consumption corridor in ${scoutCity}. Given your rent budget of ₹${parseInt(scoutBudgetRent).toLocaleString("en-IN")}/month, focus on secondary high-footfall transit connectors rather than flagship arterial road frontage.`,
      locations: [
        {
          name: "HSR Layout - Sector 1 & Sector 2 Main Road",
          zoneType: "Startup Hub & Residential Hybrid",
          suitabilityScore: 95,
          estimatedRent: "₹120 - ₹175 / sq.ft (~₹22,000/mo for 140 sq.ft counter)",
          footfallProfile: "Startup techies, co-working space occupants, gym-goers",
          competitionDensity: "Moderate",
          peakHours: "9:00 AM - 11:30 AM & 5:00 PM - 9:00 PM",
          idealFormat: "Compact front-facing takeaway counter with UPI soundbox & bar counter",
          verdict: "High evening beverage spend with very low price sensitivity for premium chai/snacks."
        },
        {
          name: "Koramangala 7th Block (Near Forum & Co-working Clusters)",
          zoneType: "High-Street Commercial & Student Belt",
          suitabilityScore: 91,
          estimatedRent: "₹140 - ₹190 / sq.ft (~₹25,000/mo for 130 sq.ft)",
          footfallProfile: "College students, working bachelors, weekend cafe crowds",
          competitionDensity: "High (Requires signature hero item differentiator)",
          peakHours: "1:00 PM - 3:30 PM & 6:00 PM - 10:30 PM",
          idealFormat: "Eye-catching neon branding kiosk with fast-serving menu items",
          verdict: "Immense daily footfall; guaranteed high volume if served under 90 seconds."
        },
        {
          name: "Marathahalli - Outer Ring Road Transit Connector",
          zoneType: "Tech Corridor & Bus Transit Spine",
          suitabilityScore: 88,
          estimatedRent: "₹85 - ₹125 / sq.ft (~₹18,000/mo for 150 sq.ft)",
          footfallProfile: "Daily bus commuters, IT campus contract workers, shift staff",
          competitionDensity: "Low to Moderate",
          peakHours: "8:00 AM - 10:30 AM & 5:30 PM - 8:30 PM",
          idealFormat: "Grab-and-go morning combo station (Chai + Poha/Idli box)",
          verdict: "High margin breakfast and evening transit sales with very economical rent."
        }
      ]
    });

    try {
      const res = await callGeminiAI(prompt, "You are BizNavigator's Lead Commercial Location Evaluator for Indian Retail. Output JSON only.", fallback);
      const parsed = JSON.parse(res.replace(/```json|```/g, "").trim());
      setScoutResults(parsed);
      localStorage.setItem(`${STORAGE_PREFIX}location_scout`, JSON.stringify(parsed));
    } catch (err) {
      if (err.message !== "LIMIT_REACHED") console.error(err);
    } finally {
      setIsScoutingLocations(false);
    }
  };

  const handleApplyLocationToEvaluator = (locName) => {
    setTargetCity(`${locName}, ${scoutCity}`);
    setBusinessIdea(scoutConcept);
    setActiveTab("evaluator");
  };

  // ==========================================
  // TAB 3: BUSINESS EVALUATOR & REPORT
  // ==========================================
  const [businessIdea, setBusinessIdea] = useState("");
  const [targetCity, setTargetCity] = useState("HSR Layout, Bengaluru");
  const [initialCapital, setInitialCapital] = useState("250000");
  const [customerSegment, setCustomerSegment] = useState("B2C Young Working Professionals");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(() => {
    const cached = localStorage.getItem(`${STORAGE_PREFIX}last_analysis`);
    return cached ? JSON.parse(cached) : null;
  });

  const handleEvaluateIdea = async (e) => {
    e.preventDefault();
    setIsAnalyzing(true);

    const prompt = `Evaluate this business idea for India:
Idea: ${businessIdea}
City: ${targetCity}
Budget: ₹${initialCapital}
Customer: ${customerSegment}

Return ONLY valid JSON:
{
  "viabilityScore": 8.5,
  "competitionScore": 7.0,
  "summary": "Brief 2-sentence market verdict.",
  "estimatedMarginPercent": "35-45%",
  "breakEvenMonths": "4 to 6 Months",
  "capex": [{"item": "Machinery/Equipment", "cost": "₹60,000"}],
  "monthlyOpex": [{"item": "Shop / Cloud Rent", "cost": "₹18,000"}],
  "licenses": ["GST Registration", "MSME Udyam (Free)", "Trade License"],
  "actionPlan": [
    {"day": "Day 1-3", "task": "Validate target audience demand"},
    {"day": "Day 4-7", "task": "Identify suppliers in wholesale markets"},
    {"day": "Day 8-10", "task": "Apply for MSME Udyam & Current Account"},
    {"day": "Day 11-15", "task": "Setup packaging & launch UPI QR"}
  ]
}`;

    const fallback = JSON.stringify({
      viabilityScore: 8.4,
      competitionScore: 6.8,
      summary: `High domestic demand in ${targetCity}. Given your capital of ₹${parseInt(initialCapital).toLocaleString("en-IN")}, focus on lean direct-to-consumer distribution before taking on expensive long-term lease commitments.`,
      estimatedMarginPercent: "32% - 44%",
      breakEvenMonths: "5 to 6 Months",
      capex: [
        { item: "Machinery / Equipment / Kiosk", cost: `₹${(initialCapital * 0.35).toFixed(0)}` },
        { item: "Opening Stock & Packaging", cost: `₹${(initialCapital * 0.40).toFixed(0)}` },
        { item: "Signage, UPI Soundbox & Tech", cost: `₹${(initialCapital * 0.15).toFixed(0)}` }
      ],
      monthlyOpex: [
        { item: "Space Rent / Utility Share", cost: "₹14,000 - ₹22,000" },
        { item: "Hyperlocal Marketing & WhatsApp", cost: "₹7,000 - ₹10,000" },
        { item: "Logistics & Consumables", cost: "₹8,500" }
      ],
      licenses: [
        "MSME Udyam Registration (Free priority bank loan backing)",
        "GSTIN Registration (Voluntary or mandatory if interstate)",
        "Municipal Trade License / Shop & Establishment Act",
        businessIdea.toLowerCase().includes("food") ? "FSSAI Food License" : "Trademark Class Registry"
      ],
      actionPlan: [
        { day: "Day 1-2", task: `Field test customer price tolerance in ${targetCity}` },
        { day: "Day 3-5", task: "Contact bulk vendors on Indiamart; negotiate 15-day payment credit" },
        { day: "Day 6-7", task: "Apply for zero-cost MSME Udyam certificate on udyamregistration.gov.in" },
        { day: "Day 8-10", task: "Set up Soundbox / UPI Merchant QR & unbox initial samples" },
        { day: "Day 11+", task: "Launch local referral discount strategy with immediate neighbors" }
      ]
    });

    try {
      const res = await callGeminiAI(prompt, "You are BizNavigator's Senior Indian SME Strategist. Return JSON only.", fallback);
      const parsed = JSON.parse(res.replace(/```json|```/g, "").trim());
      setAnalysisResult(parsed);
      localStorage.setItem(`${STORAGE_PREFIX}last_analysis`, JSON.stringify(parsed));
    } catch (err) {
      if (err.message !== "LIMIT_REACHED") console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ==============================================================
  // TAB 4: UPGRADED DAY-BY-DAY EXECUTION SPRINT & DAILY TASK SOPs
  // ==============================================================
  const initialDailyTasks = [
    {
      id: "day_1",
      dayNumber: 1,
      dayTitle: "Day 1: Ground Demand & Target Customer Intercept",
      phase: "Phase 1: Demand Validation",
      task: "Survey 25 prospective customers in your target zone to test willingness to pay.",
      timeEst: "3.5 hrs",
      budgetEst: "₹300 (Chai/samples)",
      priority: "Critical",
      completed: true,
      notes: "Surveyed 20 techies near co-working cluster; 16 preferred sugarless cardamom blend at ₹20."
    },
    {
      id: "day_2",
      dayNumber: 2,
      dayTitle: "Day 2: Competitor Price & Portion Audit",
      phase: "Phase 1: Demand Validation",
      task: "Mystery shop at 3 nearby competitors. Note their cup sizes, pricing, and peak queue bottlenecks.",
      timeEst: "2.5 hrs",
      budgetEst: "₹450",
      priority: "High",
      completed: true,
      notes: "Competitor A charges ₹15 but wait time is 6 mins. Speed is our key advantage."
    },
    {
      id: "day_3",
      dayNumber: 3,
      dayTitle: "Day 3: Wholesale Vendor & Mandi Price Lock-in",
      phase: "Phase 2: Supply Chain & Sourcing",
      task: "Visit local APMC mandi or wholesale tea/spices trader to request volume rate-cards.",
      timeEst: "4 hrs",
      budgetEst: "₹0",
      priority: "Critical",
      completed: false,
      notes: ""
    },
    {
      id: "day_4",
      dayNumber: 4,
      dayTitle: "Day 4: Packaging, Paper Cups & Consumables Order",
      phase: "Phase 2: Supply Chain & Sourcing",
      task: "Source 3-ply rippled heat-resistant paper cups and custom tissue packs from wholesale carton dealers.",
      timeEst: "3 hrs",
      budgetEst: "₹6,500",
      priority: "High",
      completed: false,
      notes: ""
    },
    {
      id: "day_5",
      dayNumber: 5,
      dayTitle: "Day 5: MSME Udyam Zero-Cost Registration",
      phase: "Phase 3: Compliance & Legal",
      task: "Register online at udyamregistration.gov.in using Aadhaar & PAN for priority SME benefits.",
      timeEst: "1 hr",
      budgetEst: "₹0 (Official Gov site is 100% Free)",
      priority: "Critical",
      completed: false,
      notes: ""
    },
    {
      id: "day_6",
      dayNumber: 6,
      dayTitle: "Day 6: Current Bank Account & GST Verification",
      phase: "Phase 3: Compliance & Legal",
      task: "Visit bank with Udyam Certificate, Trade License / Rent Agreement to initiate Current Account.",
      timeEst: "3 hrs",
      budgetEst: "₹10,000 (Initial deposit)",
      priority: "High",
      completed: false,
      notes: ""
    },
    {
      id: "day_7",
      dayNumber: 7,
      dayTitle: "Day 7: Basic FSSAI Food License / Municipal Trade Permit",
      phase: "Phase 3: Compliance & Legal",
      task: "Apply on foscos.fssai.gov.in for Food Safety Basic Registration (Form A).",
      timeEst: "1.5 hrs",
      budgetEst: "₹100/yr (Govt fee)",
      priority: "Critical",
      completed: false,
      notes: ""
    },
    {
      id: "day_8",
      dayNumber: 8,
      dayTitle: "Day 8: Merchant QR & Soundbox Installation",
      phase: "Phase 4: Launch & Scaling",
      task: "Set up Paytm/PhonePe/BharatPe UPI Merchant QR with Voice Soundbox to capture zero-MDR instant payments.",
      timeEst: "1.5 hrs",
      budgetEst: "₹125/mo rental",
      priority: "High",
      completed: false,
      notes: ""
    },
    {
      id: "day_9",
      dayNumber: 9,
      dayTitle: "Day 9: WhatsApp Business Catalog & QR Flyers",
      phase: "Phase 4: Launch & Scaling",
      task: "Upload menu with high-res photos on WhatsApp Business and print 500 neighborhood delivery flyers.",
      timeEst: "3 hrs",
      budgetEst: "₹1,200 (Printing)",
      priority: "Medium",
      completed: false,
      notes: ""
    },
    {
      id: "day_10",
      dayNumber: 10,
      dayTitle: "Day 10: Soft Launch (Beta Batch & Feedback Loop)",
      phase: "Phase 4: Launch & Scaling",
      task: "Open counters for 3 hours with a 'Buy 1 Chai Get 1 Free Samosa' promo to gather initial Google reviews.",
      timeEst: "5 hrs",
      budgetEst: "₹2,500 (Promo stock)",
      priority: "Critical",
      completed: false,
      notes: ""
    }
  ];

  const [dailySprintTasks, setDailySprintTasks] = useState(() => {
    const cached = localStorage.getItem(`${STORAGE_PREFIX}daily_sprint`);
    return cached ? JSON.parse(cached) : initialDailyTasks;
  });

  const [roadmapFilter, setRoadmapFilter] = useState("all"); // 'all', 'pending', 'completed'
  const [taskAdviceModal, setTaskAdviceModal] = useState(null);
  const [isLoadingTaskAdvice, setIsLoadingTaskAdvice] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [tempNoteText, setTempNoteText] = useState("");

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}daily_sprint`, JSON.stringify(dailySprintTasks));
  }, [dailySprintTasks]);

  const toggleDailyTask = (id) => {
    const updated = dailySprintTasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    setDailySprintTasks(updated);
  };

  const handleSaveTaskNote = (id) => {
    const updated = dailySprintTasks.map((t) => (t.id === id ? { ...t, notes: tempNoteText } : t));
    setDailySprintTasks(updated);
    setEditingNoteId(null);
    setTempNoteText("");
  };

  // Generate Deep AI Daily SOP & Script
  const handleConsultDailyTaskAI = async (taskItem) => {
    setIsLoadingTaskAdvice(true);
    setTaskAdviceModal({
      title: taskItem.dayTitle,
      task: taskItem.task,
      sopText: ""
    });

    const prompt = `Act as an expert Indian SME Launch Specialist.
Provide a deep, step-by-step Standard Operating Procedure (SOP) for this specific daily task:
Task: "${taskItem.task}" (${taskItem.dayTitle})
Estimated Time: ${taskItem.timeEst} | Budget: ${taskItem.budgetEst}

Please provide:
1. Exact Step-by-Step Execution Checklist for today.
2. Realistic Negotiation Dialogue / Phone Script in Hinglish/English when dealing with Indian vendors or customers.
3. Crucial Pitfall / 'Don't do this' warning for today.
4. Definition of Done: Exact metric to know today's work was 100% successful.`;

    const fallback = `1. STEP-BY-STEP CHECKLIST:
- Arrive at the wholesale market/portal by 9:30 AM before peak trading rush.
- Request rate-slabs for 50 units, 200 units, and 500 units to know their true floor margin.
- Verify GST invoice availability to claim Input Tax Credit (ITC).

2. REALISTIC NEGOTIATION SCRIPT:
"Namaste Bhaiya, humara daily retail counter launch ho raha hai next week. Humein weekly recurring orders place karne hain. Initial test batch ke liye 50 units par kya best wholesale rate lagaoge? Agar quality jam gayi toh monthly billing aapse hi karenge."

3. CRITICAL PITFALL:
Never pay 100% upfront in cash to unverified traders without an official counter receipt or GST bill. Offer 30% advance and 70% upon delivery inspection.

4. DEFINITION OF DONE:
You have secured 2 competitive written quotes and locked in a payment credit window.`;

    try {
      const res = await callGeminiAI(prompt, "You are BizNavigator's Lead Field Operations Manager for Indian SMEs.", fallback);
      setTaskAdviceModal({
        title: taskItem.dayTitle,
        task: taskItem.task,
        sopText: res
      });
    } catch (err) {
      if (err.message !== "LIMIT_REACHED") console.error(err);
    } finally {
      setIsLoadingTaskAdvice(false);
    }
  };

  const completedDailyCount = dailySprintTasks.filter((t) => t.completed).length;
  const sprintProgressPercent = Math.round((completedDailyCount / dailySprintTasks.length) * 100);

  const filteredTasks = dailySprintTasks.filter((t) => {
    if (roadmapFilter === "pending") return !t.completed;
    if (roadmapFilter === "completed") return t.completed;
    return true;
  });

  // --- TAB 5: CALCULATORS & LEDGER ---
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

  const [ledgerEntries, setLedgerEntries] = useState(() => {
    const cached = localStorage.getItem(`${STORAGE_PREFIX}ledger`);
    return cached
      ? JSON.parse(cached)
      : [
          { id: 1, desc: "Packaging Cartons Purchase", type: "out", amount: 4500, date: "Today" },
          { id: 2, desc: "Direct UPI Order Payments (batch 1)", type: "in", amount: 12400, date: "Today" }
        ];
  });
  const [ledgerDesc, setLedgerDesc] = useState("");
  const [ledgerAmount, setLedgerAmount] = useState("");
  const [ledgerType, setLedgerType] = useState("in");

  const handleRunMarginDoctorAI = async () => {
    setIsAnalyzingMargin(true);
    const totalUnitCost = Number(costPrice) + Number(shippingCost);
    const netMargin = (((Number(sellingPrice) - totalUnitCost) / Number(sellingPrice)) * 100).toFixed(1);

    const prompt = `Indian SME Pricing Check: Cost ₹${costPrice}, Packing/Shipping ₹${shippingCost}, GST ${gstPercent}%, Selling Price ₹${sellingPrice}, Net Margin ${netMargin}%.
Give 3 bullet observations on profit buffer, RTO risk, and GST Input Tax Credit (ITC).`;

    const fallback = `• Profitability Check: A ${netMargin}% margin is healthy for Tier-2 retail, but if offering Cash on Delivery (COD), set aside a 15% Return to Origin (RTO) buffer.\n• Packaging: Sourcing corrugated boxes directly from Bhiwandi/Okhla/Peenya clusters will save ~₹12/unit.\n• GST ITC: Make sure your suppliers issue GST invoices so you can claim back the ${gstPercent}% input tax on monthly GSTR-3B filings.`;

    try {
      const res = await callGeminiAI(prompt, "You are BizNavigator's Pricing & Margins Doctor.", fallback);
      setAiMarginAnalysis(res);
    } catch (err) {
      if (err.message !== "LIMIT_REACHED") console.error(err);
    } finally {
      setIsAnalyzingMargin(false);
    }
  };

  const handleRunLedgerAuditAI = async () => {
    setIsAuditingLedger(true);
    const summary = ledgerEntries.map((e) => `${e.date}: ${e.desc} (${e.type === "in" ? "+₹" : "-₹"}${e.amount})`).join("; ");

    const prompt = `Audit Indian SME cashflow logs: ${summary}. Give 3 insights on working capital runway, cash leaks, and Udhaar recovery.`;
    const fallback = `• Cashflow Health: Inflows are steady, but irregular petty vendor payouts are leaking cash. Set a weekly vendor clearing cycle.\n• Credit Recovery: Send WhatsApp polite reminders with UPI QR links on Friday mornings to settle customer udhaar before the weekend.\n• Reserve Buffer: Keep at least 45 days of fixed expenses untouched in a dedicated current account.`;

    try {
      const res = await callGeminiAI(prompt, "You are BizNavigator's Financial Auditor for Indian Small Businesses.", fallback);
      setAiLedgerAudit(res);
    } catch (err) {
      if (err.message !== "LIMIT_REACHED") console.error(err);
    } finally {
      setIsAuditingLedger(false);
    }
  };

  // --- TAB 6: LIVE AI MARKET RADAR ---
  const [marketTrends, setMarketTrends] = useState(() => {
    const cached = localStorage.getItem(`${STORAGE_PREFIX}market_trends`);
    return cached
      ? JSON.parse(cached)
      : [
          {
            tag: "Logistics",
            title: "ONDC Hyperlocal Integration Subsidies",
            desc: "Local kiranas & retailers utilizing ONDC logistics aggregators can ship within a 5km radius for under ₹30/order."
          },
          {
            tag: "Compliance",
            title: "IMS (Invoice Management System) Mandate",
            desc: "New GST input matching rules mandate real-time acceptance of vendor invoices to ensure seamless ITC claims."
          },
          {
            tag: "Festive Trends",
            title: "Pre-Season Packaging Inventory Buffer",
            desc: "Corrugated box rates routinely surge prior to peak wedding and festival quarters. Lock in 60-day stock early."
          }
        ];
  });
  const [isScanningMarket, setIsScanningMarket] = useState(false);

  const handleScanLiveMarketAI = async () => {
    setIsScanningMarket(true);
    const prompt = `Provide 3 fresh Indian SME intelligence cards (Logistics, Sourcing, Policy). Output JSON:
{ "updates": [{ "tag": "Category", "title": "Catchy Title", "desc": "Practical advice" }] }`;

    const fallback = JSON.stringify({
      updates: [
        {
          tag: "Raw Material",
          title: "Paper & Packaging Rate Moderation",
          desc: "Kraft paper prices across Morbi and Gujarat mills have stabilized. Good window to negotiate 90-day wholesale carton supplies."
        },
        {
          tag: "Fintech",
          title: "RuPay Credit Card on UPI Integration",
          desc: "Customers are increasingly paying via RuPay on UPI. Ensure your Soundbox & merchant QR is enabled for RuPay credit cards."
        },
        {
          tag: "MSME Scheme",
          title: "CGTMSE Collateral-Free Bank Loans",
          desc: "Public sector banks have accelerated approvals for micro-enterprises under the Credit Guarantee Fund without property collateral."
        }
      ]
    });

    try {
      const res = await callGeminiAI(prompt, "You are BizNavigator's Lead Macroeconomic SME Analyst in India.", fallback);
      const parsed = JSON.parse(res.replace(/```json|```/g, "").trim());
      setMarketTrends(parsed.updates);
      localStorage.setItem(`${STORAGE_PREFIX}market_trends`, JSON.stringify(parsed.updates));
    } catch (err) {
      if (err.message !== "LIMIT_REACHED") console.error(err);
    } finally {
      setIsScanningMarket(false);
    }
  };

  // --- FLOATING BIZMENTOR CHAT ---
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "mentor",
      text: "Namaste! I am your 24/7 BizMentor AI. Ask me about finding local retail spots, polite udhaar recovery, supplier negotiation, or GST setup!"
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

    const prompt = `Question from Indian Entrepreneur: ${userText}\nProvide actionable, culturally astute advice for Indian SME operations.`;
    const fallback = "Always maintain a polite yet strict credit period (Udhaar) ledger. Offer a 2% immediate UPI cash discount to disincentivize credit requests.";

    try {
      const res = await callGeminiAI(prompt, "You are BizMentor AI, an expert Indian small business advisor.", fallback);
      setChatMessages((prev) => [...prev, { sender: "mentor", text: res }]);
    } catch (err) {
      if (err.message !== "LIMIT_REACHED") {
        setChatMessages((prev) => [...prev, { sender: "mentor", text: "Service busy. Please check connection or API key." }]);
      }
    } finally {
      setIsChatLoading(false);
    }
  };

  // Math Computations
  const totalIn = ledgerEntries.filter((e) => e.type === "in").reduce((s, i) => s + Number(i.amount), 0);
  const totalOut = ledgerEntries.filter((e) => e.type === "out").reduce((s, i) => s + Number(i.amount), 0);
  const netLedgerBalance = totalIn - totalOut;

  const totalUnitCost = Number(costPrice) + Number(shippingCost);
  const gstDeduction = Number(sellingPrice) * (Number(gstPercent) / (100 + Number(gstPercent)));
  const netProfitUnit = Number(sellingPrice) - gstDeduction - totalUnitCost;
  const netMarginPercent = sellingPrice > 0 ? ((netProfitUnit / Number(sellingPrice)) * 100).toFixed(1) : 0;
  const unitContribution = Number(unitRevenue) - Number(unitVariableCost);
  const breakEvenUnitsNeeded = unitContribution > 0 ? Math.ceil(Number(monthlyOverhead) / unitContribution) : "N/A";

  const formatCountdown = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // STRICT AUTH WALL
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-8 font-sans selection:bg-amber-500 selection:text-black">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md relative z-10 space-y-6">
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
                onClick={() => { setAuthMode("login"); setAuthError(""); setAuthSuccessNotice(""); }}
                className={`text-center py-2 text-[11px] font-bold transition border-b-2 ${
                  authMode === "login"
                    ? "border-amber-500 text-amber-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setAuthMode("signup"); setAuthError(""); setAuthSuccessNotice(""); }}
                className={`text-center py-2 text-[11px] font-bold transition border-b-2 ${
                  authMode === "signup"
                    ? "border-amber-500 text-amber-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Register
              </button>
              <button
                onClick={() => { setAuthMode("forgot"); setOtpStep(1); setAuthError(""); setAuthSuccessNotice(""); }}
                className={`text-center py-2 text-[11px] font-bold transition border-b-2 flex items-center justify-center space-x-1 ${
                  authMode === "forgot"
                    ? "border-amber-500 text-amber-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <KeyRound className="w-3 h-3" />
                <span>Forgot? 🔑</span>
              </button>
              <button
                onClick={() => { setAuthMode("admin"); setAuthError(""); setAuthSuccessNotice(""); }}
                className={`text-center py-2 text-[11px] font-bold transition border-b-2 flex items-center justify-center space-x-1 ${
                  authMode === "admin"
                    ? "border-rose-500 text-rose-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Admin 🛡️</span>
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

            {/* FORGOT PASSWORD VIA OTP */}
            {authMode === "forgot" ? (
              <div className="space-y-4">
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <h3 className="font-bold text-slate-100 text-xs flex items-center space-x-1.5">
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <span>MongoDB OTP Password Reset</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {otpStep === 1
                      ? "Step 1: Enter email to receive security code"
                      : "Step 2: Enter code & configure new password"}
                  </p>
                </div>

                {otpStep === 1 ? (
                  <form onSubmit={handleForgotRequestOtp} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Registered Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                        <input
                          type="email"
                          required
                          placeholder="founder@yourbusiness.in"
                          value={authEmailOrPhone}
                          onChange={(e) => setAuthEmailOrPhone(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSendingOtp}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold py-2.5 rounded-xl transition text-xs shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {isSendingOtp ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Generating & Sending OTP...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Generate & Dispatch OTP</span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleForgotVerifyAndReset} className="space-y-3.5 text-xs">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-slate-300 font-semibold">6-Digit Security OTP</label>
                        <span className="text-[10px] text-amber-400 font-mono flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Expires in: {formatCountdown(otpSecondsLeft)}</span>
                        </span>
                      </div>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-amber-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          maxLength={6}
                          placeholder="e.g. 583920"
                          value={enteredOtp}
                          onChange={(e) => setEnteredOtp(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-slate-100 font-mono tracking-widest text-center focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">New Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                        <input
                          type="password"
                          required
                          placeholder="At least 4 characters"
                          value={resetNewPassword}
                          onChange={(e) => setResetNewPassword(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Confirm New Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                        <input
                          type="password"
                          required
                          placeholder="Re-enter new password"
                          value={resetConfirmPassword}
                          onChange={(e) => setResetConfirmPassword(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold py-2.5 rounded-xl transition text-xs shadow-lg mt-2"
                    >
                      Update Password in MongoDB
                    </button>
                  </form>
                )}
              </div>
            ) : (
              /* LOGIN & SIGNUP */
              <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
                {authMode === "admin" ? (
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Master Admin Secret Key</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-rose-400 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        required
                        placeholder="Enter Admin Secret Password"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-rose-500/40 rounded-xl pl-9 pr-3 py-2.5 text-slate-100 focus:outline-none focus:border-rose-400 font-mono text-xs"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    {authMode === "signup" && (
                      <>
                        <div>
                          <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                          <div className="relative">
                            <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                            <input
                              type="text"
                              required
                              placeholder="e.g. Anand Sharma"
                              value={authFullName}
                              onChange={(e) => setAuthFullName(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-300 font-semibold mb-1">Business Name (Optional)</label>
                          <div className="relative">
                            <Building className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                            <input
                              type="text"
                              placeholder="e.g. Sharma Enterprises"
                              value={authBusinessName}
                              onChange={(e) => setAuthBusinessName(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          placeholder="founder@yourbusiness.in"
                          value={authEmailOrPhone}
                          onChange={(e) => setAuthEmailOrPhone(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-slate-300 font-semibold">Password</label>
                        {authMode === "login" && (
                          <button
                            type="button"
                            onClick={() => { setAuthMode("forgot"); setOtpStep(1); setAuthError(""); }}
                            className="text-[11px] font-bold text-amber-400 hover:underline"
                          >
                            Forgot Password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={isAuthLoading}
                  className={`w-full font-bold py-3 rounded-xl transition text-xs shadow-lg flex items-center justify-center space-x-2 ${
                    authMode === "admin"
                      ? "bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 text-slate-950"
                      : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-slate-950"
                  }`}
                >
                  {isAuthLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Syncing with MongoDB Database...</span>
                    </>
                  ) : (
                    <span>
                      {authMode === "admin"
                        ? "Authenticate Admin Credentials 🛡️"
                        : authMode === "login"
                        ? "Sign In via MongoDB"
                        : "Register Account in MongoDB"}
                    </span>
                  )}
                </button>
              </form>
            )}

            {authMode === "login" && (
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400">Locked out of your account? </span>
                <button
                  type="button"
                  onClick={() => { setAuthMode("forgot"); setOtpStep(1); setAuthError(""); }}
                  className="text-[11px] text-amber-400 font-bold hover:underline"
                >
                  Reset Password with Email OTP 🔑
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==============================================================
  // MAIN AUTHENTICATED APPLICATION SHELL
  // ==============================================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Header */}
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
            {currentUser.role === "admin" ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1.5 bg-rose-950/80 border border-rose-500/40 px-3 py-1.5 rounded-full text-rose-400 text-xs font-bold">
                  <Crown className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">ADMINISTRATOR</span>
                </div>

                <button
                  onClick={() => { fetchDbData(); setShowAdminConsoleModal(true); }}
                  className="bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition transform hover:scale-105"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Administrative Works ⚙️</span>
                </button>
              </div>
            ) : isUserPro ? (
              <div className="flex items-center space-x-1.5 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1.5 rounded-full text-emerald-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pro Member</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400 hidden sm:inline">
                  Free checks: <strong className="text-amber-400">{evaluationsCount}/{FREE_USAGE_LIMIT}</strong>
                </span>
                <button
                  onClick={() => setShowPaywallModal(true)}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center shadow-md transition"
                >
                  <Zap className="w-3.5 h-3.5 mr-1" /> Upgrade
                </button>
              </div>
            )}

            {/* Authenticated User Pill */}
            <div className="flex items-center space-x-2 bg-slate-800 border border-slate-700 px-3 py-1 rounded-xl">
              <div className={`w-6 h-6 rounded-full font-black text-xs flex items-center justify-center ${
                currentUser.role === "admin" ? "bg-rose-500 text-white" : "bg-amber-500 text-slate-950"
              }`}>
                {currentUser.name?.charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-bold text-slate-200 leading-none">{currentUser.name}</div>
                <div className="text-[10px] text-slate-400 leading-none">{currentUser.businessName}</div>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="text-slate-400 hover:text-rose-400 p-1 ml-1"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 flex space-x-1 overflow-x-auto text-sm border-t border-slate-800/80 pt-1">
          {[
            { id: "idea-finder", label: "AI Idea Matcher", icon: Lightbulb },
            { id: "location-scout", label: "Location Scout 📍", icon: MapPin, highlight: true },
            { id: "evaluator", label: "Business Evaluator", icon: Briefcase },
            { id: "roadmap", label: `Daily Sprint Guide (${sprintProgressPercent}%)`, icon: Calendar },
            { id: "tools", label: "AI Calculators & Ledger", icon: Calculator },
            { id: "market", label: "Live AI Market Radar", icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2.5 px-4 font-medium transition-all border-b-2 whitespace-nowrap ${
                  isActive
                    ? "border-amber-500 text-amber-400 bg-amber-500/5 font-bold"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.highlight && (
                  <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded border border-amber-500/40">
                    NEW
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-1">
        {/* ============================================================== */}
        {/* TAB 1: AI IDEA MATCHER                                         */}
        {/* ============================================================== */}
        {activeTab === "idea-finder" && (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/30 rounded-3xl p-6 sm:p-8">
              <span className="text-amber-400 font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Personalized Opportunity Engine</span>
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 mt-2">
                Find High-Margin Indian SME Ideas for Your Budget & Skills
              </h1>
              <p className="text-sm text-slate-300 mt-1 max-w-3xl">
                Evaluated against Indian Tier-1/2/3 local buying habits, wholesale supply chains, and realistic capital payback.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-3">
                  <Target className="w-5 h-5 text-amber-400" />
                  <span>Input Your Profile</span>
                </h2>

                <form onSubmit={handleGenerateIdeas} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Investment Budget (₹ INR)</label>
                    <input
                      type="number"
                      required
                      value={finderBudget}
                      onChange={(e) => setFinderBudget(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Target Indian City / Region</label>
                    <input
                      type="text"
                      required
                      value={finderLocation}
                      onChange={(e) => setFinderLocation(e.target.value)}
                      placeholder="e.g. Pune, Jaipur, Indore, Ahmedabad"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Your Skills & Strengths</label>
                    <textarea
                      rows={2}
                      required
                      value={finderSkills}
                      onChange={(e) => setFinderSkills(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Interests & Hobbies</label>
                    <input
                      type="text"
                      required
                      value={finderInterests}
                      onChange={(e) => setFinderInterests(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isFindingIdeas}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold py-3 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50"
                  >
                    {isFindingIdeas ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Evaluating Market Viability...</span>
                      </>
                    ) : (
                      <>
                        <Lightbulb className="w-4 h-4" />
                        <span>Generate Curated Business Ideas</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              <div className="lg:col-span-7 space-y-4">
                {matchedIdeas ? (
                  matchedIdeas.map((idea, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold px-2.5 py-1 rounded-full flex items-center space-x-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{idea.matchScore}% Viability Match</span>
                        </span>
                        <span className="text-xs text-emerald-400 font-bold">{idea.monthlyPotential}</span>
                      </div>
                      <h4 className="text-xl font-extrabold text-slate-100">{idea.title}</h4>
                      <p className="text-xs text-slate-400">{idea.tagline}</p>
                      <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs text-slate-300">
                        <strong className="text-amber-400">AI Evaluation: </strong>
                        {idea.whyFit}
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2 justify-end">
                        <button
                          onClick={() => {
                            setScoutConcept(idea.title);
                            setActiveTab("location-scout");
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 font-bold px-3 py-2 rounded-xl text-xs flex items-center space-x-1"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Find Best Locations in City</span>
                        </button>
                        <button
                          onClick={() => handleSelectIdeaForRoadmap(idea)}
                          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 transition"
                        >
                          <span>Build Feasibility & Roadmap</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-72 border border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center p-8 text-center text-slate-500">
                    <Lightbulb className="w-10 h-10 text-slate-700 mb-2" />
                    <p className="text-sm font-semibold text-slate-400">Ready for Live AI Evaluation</p>
                    <p className="text-xs max-w-sm mt-1">Submit your profile on the left to evaluate matching SME opportunities.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: AI MICRO-LOCATION SCOUT (NEW FEATURE)                   */}
        {/* ============================================================== */}
        {activeTab === "location-scout" && (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/30 rounded-3xl p-6 sm:p-8">
              <span className="text-amber-400 font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <MapPin className="w-4 h-4" />
                <span>AI Commercial Micro-Market Scout</span>
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 mt-2">
                Discover the Most Profitable Neighborhoods & Streets in Your City
              </h1>
              <p className="text-sm text-slate-300 mt-1 max-w-3xl">
                Evaluates rental rates per sq.ft., footfall profiles (IT techies vs. student clusters vs. families), and competition density for your exact concept.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Form */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-3">
                  <Compass className="w-5 h-5 text-amber-400" />
                  <span>City & Footfall Parameters</span>
                </h2>

                <form onSubmit={handleEvaluateLocations} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Target Indian City</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bengaluru, Pune, Jaipur, Ahmedabad, Lucknow, Delhi"
                      value={scoutCity}
                      onChange={(e) => setScoutCity(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Business Concept / Format</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Specialty Chai Kiosk, Cloud Kitchen, Gym & Fitness Studio"
                      value={scoutConcept}
                      onChange={(e) => setScoutConcept(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Target Monthly Rent Budget (₹ INR)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-500 text-sm">₹</span>
                      <input
                        type="number"
                        required
                        value={scoutBudgetRent}
                        onChange={(e) => setScoutBudgetRent(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Target Customer Footfall Type</label>
                    <select
                      value={scoutTrafficType}
                      onChange={(e) => setScoutTrafficType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                    >
                      <option>Corporate Tech Park / Startup Office Crowd</option>
                      <option>High-Street Retail & Weekend Dining Walkers</option>
                      <option>College / University Hostel & Student Belt</option>
                      <option>High-Density Gated Societies & Family Residential</option>
                      <option>Metro Station / Bus Stand Transit Hub</option>
                      <option>Industrial Cluster & Wholesale Mandi Traders</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isScoutingLocations}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold py-3 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50"
                  >
                    {isScoutingLocations ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Scanning Commercial Micro-Markets...</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-4 h-4" />
                        <span>Scout Best Micro-Locations</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Right Column: AI Location Recommendations */}
              <div className="lg:col-span-7 space-y-4">
                {scoutResults ? (
                  <div className="space-y-4">
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-xs text-slate-300 leading-relaxed">
                      <strong className="text-amber-400 block font-bold mb-1">City Commercial Verdict:</strong>
                      {scoutResults.cityOverview}
                    </div>

                    <div className="space-y-4">
                      {scoutResults.locations?.map((loc, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-3xl shadow-xl space-y-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                            <div>
                              <h3 className="font-extrabold text-slate-100 text-base flex items-center space-x-2">
                                <MapPin className="w-4 h-4 text-amber-400" />
                                <span>{loc.name}</span>
                              </h3>
                              <span className="text-[10px] text-slate-400">{loc.zoneType}</span>
                            </div>
                            <span className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-bold text-xs px-2.5 py-1 rounded-full">
                              {loc.suitabilityScore}% Location Match
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                              <span className="text-[10px] text-slate-500 block">Est. Market Rent</span>
                              <span className="font-bold text-amber-300 block truncate">{loc.estimatedRent}</span>
                            </div>

                            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                              <span className="text-[10px] text-slate-500 block">Competition</span>
                              <span className="font-bold text-slate-200 block truncate">{loc.competitionDensity}</span>
                            </div>

                            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
                              <span className="text-[10px] text-slate-500 block">Peak Hours</span>
                              <span className="font-bold text-emerald-400 block truncate">{loc.peakHours}</span>
                            </div>
                          </div>

                          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                            <div><strong className="text-slate-200">Recommended Format: </strong>{loc.idealFormat}</div>
                            <div><strong className="text-amber-400">Why it works: </strong>{loc.verdict}</div>
                          </div>

                          <div className="flex justify-end pt-1">
                            <button
                              onClick={() => handleApplyLocationToEvaluator(loc.name)}
                              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 transition"
                            >
                              <span>Apply this Location to Feasibility Plan</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-80 border border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center p-8 text-center text-slate-500">
                    <Compass className="w-12 h-12 text-slate-700 mb-2" />
                    <p className="text-sm font-semibold text-slate-400">Location Scout Awaiting City Input</p>
                    <p className="text-xs max-w-sm mt-1">
                      Enter your desired city and rent budget on the left to evaluate high-converting streets and tech corridors.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: BUSINESS EVALUATOR                                      */}
        {/* ============================================================== */}
        {activeTab === "evaluator" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-3 mb-4">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>Comprehensive Business Evaluation</span>
                </h2>
                <form onSubmit={handleEvaluateIdea} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Business Concept / Niche</label>
                    <textarea
                      rows={3}
                      required
                      value={businessIdea}
                      onChange={(e) => setBusinessIdea(e.target.value)}
                      placeholder="e.g. Specialty cold-pressed oil micro-mill or Quick Chai cafe kiosk"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Target Indian City / Micro-Market</label>
                    <input
                      type="text"
                      value={targetCity}
                      onChange={(e) => setTargetCity(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Planned Capital (₹ INR)</label>
                    <input
                      type="number"
                      required
                      value={initialCapital}
                      onChange={(e) => setInitialCapital(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isAnalyzing}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold py-3 rounded-xl transition flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Running Indian Market Analysis...</span>
                      </>
                    ) : (
                      <>
                        <span>Generate Feasibility Report</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              <div className="lg:col-span-7">
                {analysisResult ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                      <div>
                        <span className="text-xs uppercase font-bold text-amber-500">Live Feasibility Report</span>
                        <h3 className="text-xl font-bold text-slate-100">{businessIdea.substring(0, 45)}...</h3>
                      </div>
                      <button
                        onClick={() => window.print()}
                        className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 hover:bg-slate-800"
                      >
                        <Download className="w-3.5 h-3.5 inline mr-1" /> PDF
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                        <span className="text-xs text-slate-400 block">Viability</span>
                        <span className="text-2xl font-black text-emerald-400">{analysisResult.viabilityScore}/10</span>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                        <span className="text-xs text-slate-400 block">Competition</span>
                        <span className="text-2xl font-black text-amber-400">{analysisResult.competitionScore}/10</span>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                        <span className="text-xs text-slate-400 block">Net Margin</span>
                        <span className="text-lg font-bold text-sky-400 mt-1 block">{analysisResult.estimatedMarginPercent}</span>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                        <span className="text-xs text-slate-400 block">Break-Even</span>
                        <span className="text-sm font-bold text-indigo-400 mt-1 block">{analysisResult.breakEvenMonths}</span>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                      <strong className="text-amber-400">Market Verdict: </strong>
                      {analysisResult.summary}
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => setActiveTab("roadmap")}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
                      >
                        <span>Start Day-by-Day Launch Sprint</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full border border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center p-8 text-center text-slate-500 min-h-[350px]">
                    <Briefcase className="w-10 h-10 text-slate-700 mb-2" />
                    <p className="text-sm font-semibold text-slate-400">No Idea Evaluated Yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: UPGRADED DAY-BY-DAY EXECUTION SPRINT & DAILY TASK SOPs  */}
        {/* ============================================================== */}
        {activeTab === "roadmap" && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
                    <Calendar className="w-6 h-6 text-amber-400" />
                    <span>Daily Task Execution Guide (10-Day Sprint)</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Execute one tangible milestone per day with time allocations, budget estimates, and automated AI SOPs.
                  </p>
                </div>

                <div className="flex items-center space-x-4 bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800">
                  <div className="text-right">
                    <div className="flex items-center space-x-1.5 justify-end">
                      <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
                      <span className="text-lg font-black text-amber-400">{sprintProgressPercent}% Ready</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">{completedDailyCount} of {dailySprintTasks.length} Days Finished</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${sprintProgressPercent}%` }}
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center space-x-2 text-xs border-b border-slate-800 pb-3">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <button
                  onClick={() => setRoadmapFilter("all")}
                  className={`px-3 py-1 rounded-lg font-semibold transition ${
                    roadmapFilter === "all" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  All Days ({dailySprintTasks.length})
                </button>
                <button
                  onClick={() => setRoadmapFilter("pending")}
                  className={`px-3 py-1 rounded-lg font-semibold transition ${
                    roadmapFilter === "pending" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Pending ({dailySprintTasks.length - completedDailyCount})
                </button>
                <button
                  onClick={() => setRoadmapFilter("completed")}
                  className={`px-3 py-1 rounded-lg font-semibold transition ${
                    roadmapFilter === "completed" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Completed ({completedDailyCount})
                </button>
              </div>

              {/* Daily Task Action Cards */}
              <div className="space-y-4">
                {filteredTasks.map((t) => (
                  <div
                    key={t.id}
                    className={`p-5 rounded-2xl border transition space-y-3 ${
                      t.completed
                        ? "bg-slate-950/40 border-emerald-500/30 text-slate-400"
                        : "bg-slate-950 border-slate-800 text-slate-200"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start space-x-3 flex-1">
                        <button onClick={() => toggleDailyTask(t.id)} className="mt-0.5 focus:outline-none">
                          {t.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-600 flex-shrink-0 hover:text-amber-400" />
                          )}
                        </button>

                        <div>
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <span className="font-extrabold text-sm text-slate-100">{t.dayTitle}</span>
                            <span className="text-[10px] bg-slate-800 text-amber-400 px-2 py-0.5 rounded border border-slate-700">
                              {t.phase}
                            </span>
                            <span className={`text-[9px] px-2 py-0.2 rounded font-bold uppercase ${
                              t.priority === "Critical" ? "bg-rose-950 text-rose-300" : "bg-sky-950 text-sky-300"
                            }`}>
                              {t.priority}
                            </span>
                          </div>

                          <p className={`text-xs mt-1 leading-relaxed ${t.completed ? "line-through text-slate-500" : "text-slate-300"}`}>
                            {t.task}
                          </p>
                        </div>
                      </div>

                      {/* Daily Metrics & AI SOP Button */}
                      <div className="flex items-center space-x-2 self-end sm:self-auto">
                        <div className="text-right text-[10px] text-slate-400 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800 hidden md:block">
                          <div>Time: <strong className="text-slate-200">{t.timeEst}</strong></div>
                          <div>Budget: <strong className="text-amber-400">{t.budgetEst}</strong></div>
                        </div>

                        <button
                          onClick={() => handleConsultDailyTaskAI(t)}
                          className="bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1"
                        >
                          <Bot className="w-3.5 h-3.5" />
                          <span>AI Daily SOP</span>
                        </button>
                      </div>
                    </div>

                    {/* Interactive Notes per Task */}
                    <div className="border-t border-slate-800/80 pt-2 text-xs flex items-center justify-between">
                      {editingNoteId === t.id ? (
                        <div className="flex items-center space-x-2 w-full">
                          <input
                            type="text"
                            value={tempNoteText}
                            onChange={(e) => setTempNoteText(e.target.value)}
                            placeholder="Add phone numbers, mandi quotes, or application IDs..."
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-100"
                          />
                          <button
                            onClick={() => handleSaveTaskNote(t.id)}
                            className="bg-emerald-500 text-slate-950 px-2.5 py-1 rounded-lg font-bold text-[11px]"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between w-full text-[11px]">
                          <span className="text-slate-400 italic truncate max-w-md">
                            {t.notes ? `📝 Note: "${t.notes}"` : "No notes yet for this task."}
                          </span>
                          <button
                            onClick={() => { setEditingNoteId(t.id); setTempNoteText(t.notes || ""); }}
                            className="text-amber-400 hover:underline flex items-center space-x-1 ml-2 flex-shrink-0"
                          >
                            <FileEdit className="w-3 h-3" />
                            <span>{t.notes ? "Edit" : "Add Note"}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal: AI Task SOP Consultation */}
            {taskAdviceModal && (
              <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full space-y-4 relative shadow-2xl max-h-[85vh] flex flex-col">
                  <button
                    onClick={() => setTaskAdviceModal(null)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                    <Bot className="w-5 h-5 text-amber-400" />
                    <div>
                      <h3 className="font-bold text-slate-100 text-sm">{taskAdviceModal.title}</h3>
                      <p className="text-[10px] text-slate-400">{taskAdviceModal.task}</p>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto text-xs text-slate-300 space-y-2 whitespace-pre-line leading-relaxed pr-1">
                    {isLoadingTaskAdvice ? (
                      <div className="flex items-center justify-center h-36 space-x-2 text-slate-400">
                        <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                        <span>Formulating Standard Operating Procedure & Scripts...</span>
                      </div>
                    ) : (
                      taskAdviceModal.sopText
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: CALCULATORS & LEDGER */}
        {activeTab === "tools" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                    <Calculator className="w-5 h-5 text-amber-400" />
                    <span>Margin Calculator & AI Pricing Doctor</span>
                  </h3>
                  <button
                    onClick={handleRunMarginDoctorAI}
                    disabled={isAnalyzingMargin}
                    className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-xl text-xs font-bold flex items-center space-x-1 disabled:opacity-50"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>{isAnalyzingMargin ? "Auditing..." : "Run AI Price Audit"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Product Cost (₹)</label>
                    <input
                      type="number"
                      value={costPrice}
                      onChange={(e) => setCostPrice(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Shipping / Packing (₹)</label>
                    <input
                      type="number"
                      value={shippingCost}
                      onChange={(e) => setShippingCost(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">GST Bracket (%)</label>
                    <select
                      value={gstPercent}
                      onChange={(e) => setGstPercent(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100"
                    >
                      <option value="0">0% (Exempt)</option>
                      <option value="5">5% (Apparel/Food)</option>
                      <option value="12">12% (Hardware)</option>
                      <option value="18">18% (Standard)</option>
                      <option value="28">28% (Luxury)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Selling Price (₹ with GST)</label>
                    <input
                      type="number"
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100"
                    />
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 grid grid-cols-2 gap-2 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Net Profit / Unit</span>
                    <span className={`text-base font-bold ${netProfitUnit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      ₹{netProfitUnit.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Net Margin</span>
                    <span className="text-base font-bold text-amber-400">{netMarginPercent}%</span>
                  </div>
                </div>

                {aiMarginAnalysis && (
                  <div className="bg-amber-950/20 border border-amber-500/30 p-3.5 rounded-2xl text-xs text-amber-200 leading-relaxed space-y-1">
                    <strong className="text-amber-400 block font-bold">AI Pricing Doctor Verdict:</strong>
                    <div className="whitespace-pre-line text-slate-300">{aiMarginAnalysis}</div>
                  </div>
                )}
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <span>Break-Even Volume Calculator</span>
                </h3>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Fixed Overhead (₹/mo)</label>
                    <input
                      type="number"
                      value={monthlyOverhead}
                      onChange={(e) => setMonthlyOverhead(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Selling Price / Unit</label>
                    <input
                      type="number"
                      value={unitRevenue}
                      onChange={(e) => setUnitRevenue(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Variable Cost / Unit</label>
                    <input
                      type="number"
                      value={unitVariableCost}
                      onChange={(e) => setUnitVariableCost(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100"
                    />
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">Required Monthly Volume</span>
                    <span className="text-xl font-black text-emerald-400">{breakEvenUnitsNeeded} Units</span>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    Unit Margin: <span className="text-slate-200 font-bold block text-sm">₹{unitContribution}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                    <IndianRupee className="w-5 h-5 text-amber-400" />
                    <span>Daily Cashflow & Udhaar Ledger</span>
                  </h3>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleRunLedgerAuditAI}
                    disabled={isAuditingLedger}
                    className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 disabled:opacity-50"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>{isAuditingLedger ? "Auditing..." : "Run AI Cashflow Audit"}</span>
                  </button>
                  <div className="bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 text-xs">
                    <span className="text-slate-400 block text-[10px]">Net Balance</span>
                    <span className={`text-base font-extrabold ${netLedgerBalance >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      ₹{netLedgerBalance.toLocaleString("en-IN")}
                    </span>
                  </div>
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
                  className="sm:col-span-3 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
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
                  onClick={() => {
                    if (!ledgerDesc || !ledgerAmount) return;
                    setLedgerEntries([
                      ...ledgerEntries,
                      { id: Date.now(), desc: ledgerDesc, amount: Number(ledgerAmount), type: ledgerType, date: "Today" }
                    ]);
                    setLedgerDesc("");
                    setLedgerAmount("");
                  }}
                  className="sm:col-span-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center justify-center p-2"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {aiLedgerAudit && (
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-1">
                  <strong className="text-amber-400 block font-bold">AI Financial Health Diagnosis:</strong>
                  <div className="whitespace-pre-line">{aiLedgerAudit}</div>
                </div>
              )}

              <div className="divide-y divide-slate-800 max-h-52 overflow-y-auto">
                {ledgerEntries.map((e) => (
                  <div key={e.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${e.type === "in" ? "bg-emerald-400" : "bg-rose-400"}`} />
                      <span className="text-slate-200">{e.desc}</span>
                      <span className="text-[10px] text-slate-500">({e.date})</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`font-bold ${e.type === "in" ? "text-emerald-400" : "text-rose-400"}`}>
                        {e.type === "in" ? "+" : "-"}₹{Number(e.amount).toLocaleString("en-IN")}
                      </span>
                      <button
                        onClick={() => setLedgerEntries(ledgerEntries.filter((x) => x.id !== e.id))}
                        className="text-slate-600 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: LIVE AI MARKET RADAR */}
        {activeTab === "market" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  <span>Live Indian SME Market Radar</span>
                </h2>
              </div>
              <button
                onClick={handleScanLiveMarketAI}
                disabled={isScanningMarket}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-2 shadow-md transition disabled:opacity-50"
              >
                {isScanningMarket ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Scanning Indian Market...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Scan Market Radar Now</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {marketTrends.map((t, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 shadow-xl">
                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
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

      {/* 24/7 DOCKED FLOATING BIZMENTOR CHAT */}
      <div className="fixed bottom-5 right-5 z-50">
        {!isChatOpen ? (
          <button
            onClick={() => setIsChatOpen(true)}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold px-4 py-3 rounded-full shadow-2xl flex items-center space-x-2 transition transform hover:scale-105"
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
              <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-slate-200 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                      msg.sender === "user" ? "bg-amber-500 text-slate-950 font-medium" : "bg-slate-800 text-slate-200"
                    }`}
                  >
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
                placeholder="Ask about location, GST, credit..."
                value={inputChat}
                onChange={(e) => setInputChat(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
              />
              <button onClick={handleSendChat} className="bg-amber-500 hover:bg-amber-400 text-slate-950 p-2 rounded-xl">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SUBSCRIPTION MODAL */}
      {showPaywallModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-6 relative shadow-2xl">
            <button
              onClick={() => setShowPaywallModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs px-3 py-1 rounded-full font-bold">
                BizNavigator Pro Upgrade
              </span>
              <h3 className="text-2xl font-black text-slate-100">
                Free limit reached ({FREE_USAGE_LIMIT}/{FREE_USAGE_LIMIT}). Upgrade to Pro for unlimited evaluations.
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Secure checkout via Razorpay. Your subscription will be activated upon payment verification in MongoDB.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-center space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-slate-400">Day Pass</span>
                  <div className="text-2xl font-extrabold text-slate-100 mt-1">₹49</div>
                  <span className="text-[10px] text-slate-500">24 Hours Access</span>
                </div>
                <button
                  onClick={() => {
                    window.open(PAYMENT_LINKS.dayPass, "_blank");
                    setShowPaywallModal(false);
                    setShowVerificationModal(true);
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-2 rounded-xl font-bold flex items-center justify-center space-x-1"
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
                  onClick={() => {
                    window.open(PAYMENT_LINKS.monthlyPro, "_blank");
                    setShowPaywallModal(false);
                    setShowVerificationModal(true);
                  }}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs py-2 rounded-xl font-bold flex items-center justify-center space-x-1 shadow-md"
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
                  onClick={() => {
                    window.open(PAYMENT_LINKS.quarterlyPro, "_blank");
                    setShowPaywallModal(false);
                    setShowVerificationModal(true);
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-2 rounded-xl font-bold flex items-center justify-center space-x-1"
                >
                  <span>Pay ₹599</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => {
                  setShowPaywallModal(false);
                  setShowVerificationModal(true);
                  setVerificationError("");
                }}
                className="text-xs text-slate-400 hover:text-amber-400 underline"
              >
                Already paid? Submit Razorpay Payment ID for verification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STRICT PAYMENT VERIFICATION MODAL */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 relative shadow-2xl">
            <button
              onClick={() => setShowVerificationModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">Strict Payment Verification</h3>
              <p className="text-xs text-slate-400">
                Provide your official <strong>Razorpay Payment ID</strong> (starts with <code>pay_</code>) from your payment receipt.
              </p>
            </div>

            {verificationError && (
              <div className="bg-rose-950/40 border border-rose-500/40 p-3 rounded-xl text-xs text-rose-300 flex items-start space-x-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
                <span>{verificationError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitVerification} className="space-y-4 pt-2 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Razorpay Payment ID <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. pay_Pxyz89234abcd"
                  value={inputPaymentId}
                  onChange={(e) => setInputPaymentId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
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
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold py-3 rounded-xl transition text-xs shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Submitting to MongoDB...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Submit for Admin Approval</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EXCLUSIVE ADMIN WORKS CONSOLE */}
      {showAdminConsoleModal && currentUser?.role === "admin" && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 sm:p-8 max-w-3xl w-full space-y-5 relative shadow-2xl max-h-[90vh] flex flex-col">
            <button
              onClick={() => setShowAdminConsoleModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-500/40 flex items-center justify-center text-rose-400">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-100 text-lg flex items-center space-x-2">
                    <span>Administrative Works Console (MongoDB Connected)</span>
                    <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/40">
                      MASTER ADMIN
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">Approve payments and toggle Pro access directly in MongoDB Atlas.</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-2 border-b border-slate-800 pb-2 text-xs">
              <button
                onClick={() => setAdminConsoleTab("txns")}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition ${
                  adminConsoleTab === "txns"
                    ? "bg-rose-500 text-slate-950"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>MongoDB Payment Verifications ({submittedTxns.length})</span>
              </button>
              <button
                onClick={() => setAdminConsoleTab("users")}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition ${
                  adminConsoleTab === "users"
                    ? "bg-rose-500 text-slate-950"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>MongoDB Users ({registeredUsersList.length})</span>
              </button>
            </div>

            {/* TAB CONTENT 1: MONGODB TRANSACTIONS */}
            {adminConsoleTab === "txns" && (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                {submittedTxns.length === 0 ? (
                  <div className="text-center py-10 text-slate-500">No payment verification logs found in MongoDB.</div>
                ) : (
                  submittedTxns.map((txn) => (
                    <div
                      key={txn._id || txn.id}
                      className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-amber-400">{txn.paymentId}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                              txn.status === "approved"
                                ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                                : txn.status === "rejected"
                                ? "bg-rose-950 text-rose-400 border border-rose-500/30"
                                : "bg-amber-950 text-amber-400 border border-amber-500/30"
                            }`}
                          >
                            {txn.status}
                          </span>
                        </div>
                        <div className="text-slate-400 text-[11px] mt-1">
                          User: <strong className="text-slate-200">{txn.userName}</strong> ({txn.userEmail}) • {txn.plan}
                        </div>
                        <div className="text-slate-500 text-[10px]">
                          {txn.createdAt ? new Date(txn.createdAt).toLocaleString("en-IN") : "Recent"}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {txn.status !== "approved" ? (
                          <button
                            onClick={() => handleAdminUpdateTxn(txn._id || txn.id, "approved")}
                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs transition"
                          >
                            Approve Pro
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAdminUpdateTxn(txn._id || txn.id, "rejected")}
                            className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 font-bold px-3 py-1.5 rounded-xl text-xs transition"
                          >
                            Revoke Pro
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB CONTENT 2: MONGODB USERS */}
            {adminConsoleTab === "users" && (
              <div className="flex-1 overflow-y-auto space-y-2.5 text-xs">
                {registeredUsersList.length === 0 ? (
                  <div className="text-slate-500 text-center py-10">No users found in MongoDB.</div>
                ) : (
                  registeredUsersList.map((usr, i) => (
                    <div
                      key={usr._id || i}
                      className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-200">{usr.name}</span>
                        <span className="text-slate-500 ml-2">({usr.emailOrPhone})</span>
                        <span className="text-[10px] text-amber-400 block">{usr.businessName}</span>
                      </div>
                      <button
                        onClick={() => handleAdminTogglePro(usr.emailOrPhone)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                          usr.isProUser
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-500/40"
                            : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                        }`}
                      >
                        {usr.isProUser ? "Pro Active (Click to Revoke)" : "Grant Pro Access"}
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
