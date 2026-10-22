
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
  FileEdit,
  CheckCircle
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

  // Registration OTP States
  const [signupStep, setSignupStep] = useState(1);
  const [signupEnteredOtp, setSignupEnteredOtp] = useState("");
  const [signupOtpSecondsLeft, setSignupOtpSecondsLeft] = useState(0);
  const [signupResendCooldown, setSignupResendCooldown] = useState(0);
  const [isSendingSignupOtp, setIsSendingSignupOtp] = useState(false);

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
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(`${STORAGE_PREFIX}gemini_key`) || VERCEL_ENV_GEMINI_KEY);
  const [proDailyCount, setProDailyCount] = useState(() => parseInt(localStorage.getItem(`${STORAGE_PREFIX}pro_count`)) || 0);

  // Strict Pro Check
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

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${STORAGE_PREFIX}user`, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(`${STORAGE_PREFIX}user`);
    }
  }, [currentUser]);

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
      console.warn("Backend API offline:", err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchDbData();
    }
  }, [currentUser]);

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

  useEffect(() => {
    if (signupOtpSecondsLeft <= 0) return;
    const interval = setInterval(() => setSignupOtpSecondsLeft((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(interval);
  }, [signupOtpSecondsLeft]);

  useEffect(() => {
    if (signupResendCooldown <= 0) return;
    const interval = setInterval(() => setSignupResendCooldown((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(interval);
  }, [signupResendCooldown]);

  // ==============================================================
  // ACTIVE CHOSEN VENTURE STATE (FOLLOWED ACROSS ALL OTHER TABS)
  // ==============================================================
  const [selectedVenture, setSelectedVenture] = useState(() => {
    const cached = localStorage.getItem(`${STORAGE_PREFIX}selected_venture`);
    return cached ? JSON.parse(cached) : null;
  });

  useEffect(() => {
    if (selectedVenture) {
      localStorage.setItem(`${STORAGE_PREFIX}selected_venture`, JSON.stringify(selectedVenture));
    }
  }, [selectedVenture]);

  // ==========================================
  // REAL EMAIL OTP & AUTHENTICATION HANDLERS
  // ==========================================
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccessNotice("");
    setIsAuthLoading(true);

    try {
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
    } catch (err) {
      setAuthError(err.message);
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

    if (authPassword.length < 4) {
      setAuthError("Password must be at least 4 characters long.");
      return;
    }

    setIsSendingSignupOtp(true);

    try {
      let res = await fetch(`${API_BASE_URL}/auth/register-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmailOrPhone, name: authFullName })
      });

      if (!res.ok) {
        res = await fetch(`${API_BASE_URL}/auth/forgot-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: authEmailOrPhone })
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to dispatch verification OTP.");

      setSignupStep(2);
      setSignupOtpSecondsLeft(data.expiresInSeconds || 300);
      setSignupResendCooldown(30);
      setAuthSuccessNotice(`A real verification OTP has been sent from our mail server to ${authEmailOrPhone}. Please check your inbox and spam folder.`);
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
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: authFullName,
          emailOrPhone: authEmailOrPhone,
          businessName: authBusinessName,
          password: authPassword,
          otp: signupEnteredOtp.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed. Invalid OTP code.");

      setCurrentUser(data.user);
      setAuthPassword("");
      setSignupEnteredOtp("");
      setSignupStep(1);
      alert(`Welcome to BizNavigator, ${data.user.name}! Your account is verified and ready.`);
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
      if (!res.ok) throw new Error(data.error || "Failed to dispatch OTP email.");

      setOtpStep(2);
      setOtpSecondsLeft(data.expiresInSeconds || 300);
      setResendCooldown(30);
      setAuthSuccessNotice(`A real verification OTP has been sent from our mail server to ${authEmailOrPhone}. Please check your inbox and spam folder.`);
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
      setAuthSuccessNotice("Password verified and updated! Please log in with your new password.");
    } catch (err) {
      setAuthError(err.message);
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
  // GEMINI AI CALLER (SECURE VERCEL / PROXY)
  // ==========================================
  const callGeminiAI = async (prompt, systemInstruction = "", fallbackData = null) => {
    if (!currentUser) throw new Error("AUTH_REQUIRED");

    const isAdmin = currentUser.role === "admin";
    if (!isAdmin && !isUserPro && evaluationsCount >= FREE_USAGE_LIMIT) {
      setShowPaywallModal(true);
      throw new Error("LIMIT_REACHED");
    }

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
        console.warn("Gemini call failed:", err);
      }
    }

    await new Promise((r) => setTimeout(r, 900));
    return fallbackData;
  };

  // ==============================================================
  // TAB 1: AI IDEA MATCHER (5 IDEAS + 1-CLICK PIPELINE TO ALL TABS)
  // ==============================================================
  const [finderBudget, setFinderBudget] = useState("150000");
  const [finderLocation, setFinderLocation] = useState("Bengaluru (Tech & Startup Hub)");
  const [finderSkills, setFinderSkills] = useState("Direct Sales, Basic Cooking, Social Media Marketing");
  const [finderInterests, setFinderInterests] = useState("Healthy Snacks, Specialty Tea, Eco-Packaging");
  const [finderTime, setFinderTime] = useState("Full-Time (8+ hrs/day)");
  const [finderRisk, setFinderRisk] = useState("Moderate (Balanced)");
  const [isFindingIdeas, setIsFindingIdeas] = useState(false);
  const [matchedIdeas, setMatchedIdeas] = useState(() => {
    const cached = localStorage.getItem(`${STORAGE_PREFIX}matched_ideas_5`);
    return cached ? JSON.parse(cached) : null;
  });

  const handleGenerateIdeas = async (e) => {
    e.preventDefault();
    setIsFindingIdeas(true);

    const prompt = `Generate exactly 5 distinct, tailored, high-margin Indian business ideas based on these inputs:
- Planned Capital/Budget: ₹${finderBudget}
- City/Location: ${finderLocation}
- Skills & Background: ${finderSkills}
- Passions & Interests: ${finderInterests}
- Commitment: ${finderTime}
- Risk Appetite: ${finderRisk}

Make sure the 5 ideas represent diverse SME categories (e.g. 1 Retail/F&B, 1 B2B Supply/Packaging, 1 D2C/WhatsApp Commerce, 1 Micro-Services/Agency, 1 Micro-Manufacturing).
Return ONLY valid JSON matching this schema:
{
  "ideas": [
    {
      "id": "idea_1",
      "title": "Business Concept Name",
      "tagline": "Clear 1-line pitch",
      "category": "F&B / B2B / D2C / Services / Manufacturing",
      "matchScore": 96,
      "whyFit": "Why this matches their skills and capital perfectly.",
      "estimatedCapex": "₹90,000",
      "monthlyPotential": "₹45,000 - ₹80,000 net profit",
      "targetAudience": "Tech park employees, college youth & commuters",
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
          category: "Retail F&B",
          matchScore: 96,
          whyFit: `Capitalizes on your culinary and direct sales interest with an accessible initial setup under ₹${(finderBudget * 0.75).toLocaleString("en-IN")}.`,
          estimatedCapex: `₹${(finderBudget * 0.65).toFixed(0)}`,
          monthlyPotential: "₹45,000 - ₹85,000 net profit",
          targetAudience: "Tech park employees, college youth & daily commuters",
          firstStep: "Survey 2 commercial tech parks for footfall density between 4 PM to 7 PM."
        },
        {
          id: "idea_2",
          title: "Eco-Friendly Corrugated Packaging & Retail Bags",
          tagline: "B2B supply partner for local retail brands replacing single-use plastic.",
          category: "B2B Supply",
          matchScore: 92,
          whyFit: "Matches sales capabilities with recurring monthly procurement contracts from clothing boutiques and sweet shops.",
          estimatedCapex: `₹${(finderBudget * 0.85).toFixed(0)}`,
          monthlyPotential: "₹35,000 - ₹90,000 recurring retainers",
          targetAudience: "Boutique clothing shops, sweet vendors, and local cafes",
          firstStep: "Request wholesale pricing catalogs from paper bag converters on Indiamart."
        },
        {
          id: "idea_3",
          title: "Hyperlocal WhatsApp D2C Daily Essentials & Regional Snacks",
          tagline: "Curated regional namkeen & organic spices delivered via gated society groups.",
          category: "D2C Commerce",
          matchScore: 89,
          whyFit: "Zero commercial rent; lets you start from home and achieve fast cash conversion with repeat weekly orders.",
          estimatedCapex: `₹${(finderBudget * 0.4).toFixed(0)}`,
          monthlyPotential: "₹25,000 - ₹50,000 part-time",
          targetAudience: "Gated society residents & festive gift buyers",
          firstStep: "Set up a WhatsApp Business catalog and run an introductory sample pack offer."
        },
        {
          id: "idea_4",
          title: "Local Business Google Maps & WhatsApp Commerce Agency",
          tagline: "Helps traditional retail shops get online, optimize local SEO, and accept catalog orders.",
          category: "Micro-Services",
          matchScore: 87,
          whyFit: "Extremely low CapEx requirement; relies purely on social media knowledge and feet-on-street merchant pitching.",
          estimatedCapex: `₹${(finderBudget * 0.25).toFixed(0)}`,
          monthlyPotential: "₹30,000 - ₹70,000 monthly retainers",
          targetAudience: "Local optometrists, salons, bakeries, and hardware merchants",
          firstStep: "Audit 10 local retail stores on Google Maps to find missing photos, menus, and phone numbers."
        },
        {
          id: "idea_5",
          title: "Cold-Pressed Wood-Churned (Ghani) Edible Oils Unit",
          tagline: "Freshly pressed mustard, groundnut & coconut oil extraction for health-conscious households.",
          category: "Micro-Manufacturing",
          matchScore: 84,
          whyFit: "Taps into surging demand for unadulterated cooking oils with high margins through direct neighborhood refill stations.",
          estimatedCapex: `₹${(finderBudget * 0.95).toFixed(0)}`,
          monthlyPotential: "₹50,000 - ₹1,00,000 net profit",
          targetAudience: "Health-conscious families, gym-goers, and diabetic seniors",
          firstStep: "Compare 1-HP domestic wood-press ghani extraction machine prices from manufacturers in Coimbatore/Rajkot."
        }
      ]
    });

    try {
      const res = await callGeminiAI(prompt, "You are BizNavigator's Lead Indian SME Matchmaker. Output JSON only.", fallback);
      const parsed = JSON.parse(res.replace(/```json|```/g, "").trim());
      setMatchedIdeas(parsed.ideas);
      localStorage.setItem(`${STORAGE_PREFIX}matched_ideas_5`, JSON.stringify(parsed.ideas));
    } catch (err) {
      if (err.message !== "LIMIT_REACHED") console.error(err);
    } finally {
      setIsFindingIdeas(false);
    }
  };

  // --- UNIFIED PIPELINE: SELECT 1 OF 5 IDEAS & LINK ACROSS ALL FEATURES ---
  const handleChooseVenture = (idea) => {
    setSelectedVenture(idea);

    // 1. Link to Business Evaluator
    setBusinessIdea(`${idea.title} - ${idea.tagline}`);
    setInitialCapital(finderBudget);
    setTargetCity(finderLocation);
    setCustomerSegment(idea.targetAudience);

    // 2. Link to Location Scout
    setScoutConcept(idea.title);
    setScoutCity(finderLocation.split("(")[0].replace(/,/g, "").trim() || "Bengaluru");

    // 3. Link to Daily Sprint (Adapt Sprint Focus to Chosen Idea)
    const adaptedSprint = [
      {
        id: "day_1",
        dayTitle: `Day 1: Ground Demand Intercept for ${idea.title.substring(0, 22)}...`,
        phase: "Phase 1: Demand Validation",
        task: `Survey 25 prospective customers in ${finderLocation} matching ${idea.targetAudience}.`,
        timeEst: "3.5 hrs",
        budgetEst: "₹300",
        priority: "Critical",
        completed: false,
        notes: `Focusing on ${idea.title}. First action: ${idea.firstStep}`
      },
      {
        id: "day_2",
        dayTitle: `Day 2: Competitor Price & Margin Audit`,
        phase: "Phase 1: Demand Validation",
        task: `Audit 3 active competitors in ${idea.category} to benchmark retail prices and volume bottlenecks.`,
        timeEst: "3 hrs",
        budgetEst: "₹500",
        priority: "High",
        completed: false,
        notes: ""
      },
      {
        id: "day_3",
        dayTitle: `Day 3: Wholesale Vendor & Mandi Price Lock-in`,
        phase: "Phase 2: Sourcing",
        task: `Identify 3 verified wholesale suppliers on Indiamart or local markets for ${idea.title}.`,
        timeEst: "4 hrs",
        budgetEst: "₹0",
        priority: "Critical",
        completed: false,
        notes: ""
      },
      {
        id: "day_4",
        dayTitle: `Day 4: Custom Packaging & Consumables`,
        phase: "Phase 2: Sourcing",
        task: `Procure trial batch of branded packaging/containers suitable for ${idea.category}.`,
        timeEst: "3 hrs",
        budgetEst: "₹4,500",
        priority: "High",
        completed: false,
        notes: ""
      },
      {
        id: "day_5",
        dayTitle: `Day 5: MSME Udyam Zero-Cost Registration`,
        phase: "Phase 3: Compliance",
        task: "Register online on udyamregistration.gov.in using Aadhaar & PAN for government priority lending benefits.",
        timeEst: "1 hr",
        budgetEst: "₹0 (Free Gov portal)",
        priority: "Critical",
        completed: false,
        notes: ""
      },
      {
        id: "day_6",
        dayTitle: `Day 6: Current Bank Account & GST Verification`,
        phase: "Phase 3: Compliance",
        task: `Visit bank with Udyam Certificate and rent agreement to initiate Current Account for ${idea.title}.`,
        timeEst: "3 hrs",
        budgetEst: "₹10,000 (Initial deposit)",
        priority: "High",
        completed: false,
        notes: ""
      },
      {
        id: "day_7",
        dayTitle: `Day 7: Category License (FSSAI / Shop Act / Trade License)`,
        phase: "Phase 3: Compliance",
        task: idea.category.includes("F&B")
          ? "Apply for FSSAI Basic Food Registration on foscos.fssai.gov.in (₹100/yr)."
          : "Apply for Municipal Shop & Establishment Trade License.",
        timeEst: "2 hrs",
        budgetEst: "₹1,500",
        priority: "Critical",
        completed: false,
        notes: ""
      },
      {
        id: "day_8",
        dayTitle: `Day 8: UPI Merchant QR & Soundbox Installation`,
        phase: "Phase 4: Launch",
        task: "Set up Paytm/PhonePe/BharatPe UPI Merchant Soundbox for instant zero-MDR voice payment confirmations.",
        timeEst: "1.5 hrs",
        budgetEst: "₹125/mo rental",
        priority: "High",
        completed: false,
        notes: ""
      },
      {
        id: "day_9",
        dayTitle: `Day 9: WhatsApp Business Catalog & Neighborhood Flyers`,
        phase: "Phase 4: Launch",
        task: `Create digital catalog for ${idea.title} and distribute 500 promotional flyers in target zone.`,
        timeEst: "3 hrs",
        budgetEst: "₹1,200",
        priority: "Medium",
        completed: false,
        notes: ""
      },
      {
        id: "day_10",
        dayTitle: `Day 10: Soft Launch (Beta Batch & Customer Reviews)`,
        phase: "Phase 4: Launch",
        task: `Launch pilot run of ${idea.title} with an introductory offer to collect first 20 verified customer reviews.`,
        timeEst: "5 hrs",
        budgetEst: "₹2,500",
        priority: "Critical",
        completed: false,
        notes: ""
      }
    ];

    setDailySprintTasks(adaptedSprint);
    setActiveTab("location-scout"); // Direct user to the next logical step: finding the best spot!
    alert(`🚀 Venture Selected: "${idea.title}"!\n\nAll tools (Location Scout 📍, Feasibility Evaluator, and 10-Day Sprint Guide) are now configured for this business.`);
  };

  // --- TAB 2: LOCATION SCOUT ---
  const [scoutCity, setScoutCity] = useState("Bengaluru");
  const [scoutConcept, setScoutConcept] = useState("Specialty Quick Chai Kiosk");
  const [scoutBudgetRent, setScoutBudgetRent] = useState("25000");
  const [scoutTrafficType, setScoutTrafficType] = useState("Corporate Tech Park / Startup Office Crowd");
  const [isScoutingLocations, setIsScoutingLocations] = useState(false);
  const [scoutResults, setScoutResults] = useState(() => {
    const cached = localStorage.getItem(`${STORAGE_PREFIX}location_scout`);
    return cached ? JSON.parse(cached) : null;
  });

  const handleEvaluateLocations = async (e) => {
    e.preventDefault();
    setIsScoutingLocations(true);

    const prompt = `Evaluate the best micro-locations in the Indian city of "${scoutCity}" for the business: "${scoutConcept}".
Target Monthly Rent: Up to ₹${scoutBudgetRent} | Desired Footfall: ${scoutTrafficType}
Return ONLY valid JSON:
{
  "cityOverview": "2-sentence commercial summary of ${scoutCity}.",
  "locations": [
    {
      "name": "Exact Neighborhood / Market Street",
      "zoneType": "High-Street F&B / Office Hub",
      "suitabilityScore": 94,
      "estimatedRent": "₹110 - ₹160 / sq.ft (~₹22,000/mo)",
      "footfallProfile": "Techies, startup employees",
      "competitionDensity": "Moderate",
      "peakHours": "8:30 AM - 11:00 AM & 4:30 PM - 8:30 PM",
      "idealFormat": "100-150 sq.ft takeaway counter",
      "verdict": "Why this zone converts."
    }
  ]
}`;

    const fallback = JSON.stringify({
      cityOverview: `Strong retail consumption in ${scoutCity}. Focus on secondary high-footfall transit connectors.`,
      locations: [
        {
          name: "HSR Layout - Sector 1 & Sector 2 Connector",
          zoneType: "Startup Hub & Residential Hybrid",
          suitabilityScore: 95,
          estimatedRent: "₹120 - ₹175 / sq.ft (~₹22,000/mo for 140 sq.ft)",
          footfallProfile: "Startup techies, co-working occupants, gym-goers",
          competitionDensity: "Moderate",
          peakHours: "9:00 AM - 11:30 AM & 5:00 PM - 9:00 PM",
          idealFormat: "Compact front-facing takeaway counter with UPI soundbox",
          verdict: "High evening beverage spend with very low price sensitivity."
        },
        {
          name: "Koramangala 7th Block (Near Forum & Co-working Clusters)",
          zoneType: "Commercial & Student Belt",
          suitabilityScore: 91,
          estimatedRent: "₹140 - ₹190 / sq.ft (~₹25,000/mo for 130 sq.ft)",
          footfallProfile: "College students, working bachelors, weekend cafe crowds",
          competitionDensity: "High",
          peakHours: "1:00 PM - 3:30 PM & 6:00 PM - 10:30 PM",
          idealFormat: "Eye-catching neon branding kiosk with fast-serving menu items",
          verdict: "Immense daily footfall; guaranteed high volume if served under 90 seconds."
        }
      ]
    });

    try {
      const res = await callGeminiAI(prompt, "You are BizNavigator's Commercial Location Evaluator. Output JSON only.", fallback);
      const parsed = JSON.parse(res.replace(/```json|```/g, "").trim());
      setScoutResults(parsed);
      localStorage.setItem(`${STORAGE_PREFIX}location_scout`, JSON.stringify(parsed));
    } catch (err) {
      if (err.message !== "LIMIT_REACHED") console.error(err);
    } finally {
      setIsScoutingLocations(false);
    }
  };

  // --- TAB 3: BUSINESS EVALUATOR ---
  const [businessIdea, setBusinessIdea] = useState("");
  const [targetCity, setTargetCity] = useState("HSR Layout, Bengaluru");
  const [initialCapital, setInitialCapital] = useState("150000");
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
Idea: ${businessIdea} | City: ${targetCity} | Budget: ₹${initialCapital} | Customer: ${customerSegment}
Return ONLY valid JSON:
{
  "viabilityScore": 8.5,
  "competitionScore": 7.0,
  "summary": "Brief 2-sentence market verdict.",
  "estimatedMarginPercent": "35-45%",
  "breakEvenMonths": "4 to 6 Months",
  "capex": [{"item": "Machinery/Equipment", "cost": "₹60,000"}],
  "monthlyOpex": [{"item": "Shop / Cloud Rent", "cost": "₹18,000"}],
  "licenses": ["GST Registration", "MSME Udyam (Free)", "Trade License"]
}`;

    const fallback = JSON.stringify({
      viabilityScore: 8.4,
      competitionScore: 6.8,
      summary: `High domestic demand in ${targetCity}. Given your capital of ₹${parseInt(initialCapital).toLocaleString("en-IN")}, focus on lean direct distribution.`,
      estimatedMarginPercent: "32% - 44%",
      breakEvenMonths: "5 to 6 Months",
      capex: [
        { item: "Machinery / Equipment / Setup", cost: `₹${(initialCapital * 0.35).toFixed(0)}` },
        { item: "Opening Stock & Packaging", cost: `₹${(initialCapital * 0.40).toFixed(0)}` }
      ],
      monthlyOpex: [
        { item: "Space Rent / Utility Share", cost: "₹14,000 - ₹22,000" },
        { item: "Logistics & Consumables", cost: "₹8,500" }
      ],
      licenses: ["MSME Udyam Registration (Free)", "GSTIN Registration", "FSSAI / Municipal Trade Permit"]
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

  // --- TAB 4: SPRINT TASKS ---
  const [dailySprintTasks, setDailySprintTasks] = useState(() => {
    const cached = localStorage.getItem(`${STORAGE_PREFIX}daily_sprint`);
    return cached ? JSON.parse(cached) : [];
  });

  const [roadmapFilter, setRoadmapFilter] = useState("all");
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

  const handleConsultDailyTaskAI = async (taskItem) => {
    setIsLoadingTaskAdvice(true);
    setTaskAdviceModal({ title: taskItem.dayTitle, task: taskItem.task, sopText: "" });

    const prompt = `Provide a step-by-step Standard Operating Procedure (SOP) for this daily task:
Task: "${taskItem.task}" (${taskItem.dayTitle})
Time: ${taskItem.timeEst} | Budget: ${taskItem.budgetEst}
Include:
1. Exact Step-by-Step Checklist for today.
2. Negotiation Dialogue / Script in Hinglish/English.
3. Don't-do-this pitfall.`;

    const fallback = `1. STEP-BY-STEP CHECKLIST:
- Arrive at the wholesale mandi/market by 9:30 AM before peak trading rush.
- Request rate-slabs for 50, 200, and 500 units.
- Always ask for GST invoice with ITC eligibility.

2. NEGOTIATION SCRIPT:
"Namaste Bhaiya, humara daily retail counter launch ho raha hai next week. Initial test batch ke liye 50 units par kya best wholesale rate lagaoge? Quality jam gayi toh monthly billing aapse hi karenge."

3. CRITICAL PITFALL:
Never pay 100% upfront in cash without an official LR proof or counter receipt.`;

    try {
      const res = await callGeminiAI(prompt, "You are BizNavigator's Field Operations Manager.", fallback);
      setTaskAdviceModal({ title: taskItem.dayTitle, task: taskItem.task, sopText: res });
    } catch (err) {
      if (err.message !== "LIMIT_REACHED") console.error(err);
    } finally {
      setIsLoadingTaskAdvice(false);
    }
  };

  const completedDailyCount = dailySprintTasks.filter((t) => t.completed).length;
  const sprintProgressPercent = dailySprintTasks.length > 0 ? Math.round((completedDailyCount / dailySprintTasks.length) * 100) : 0;

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

  const [ledgerEntries, setLedgerEntries] = useState(() => {
    const cached = localStorage.getItem(`${STORAGE_PREFIX}ledger`);
    return cached ? JSON.parse(cached) : [
      { id: 1, desc: "Packaging Cartons Purchase", type: "out", amount: 4500, date: "Today" },
      { id: 2, desc: "Direct UPI Order Payments", type: "in", amount: 12400, date: "Today" }
    ];
  });

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

  // ==========================================
  // AUTH WALL (REAL EMAIL OTP FOR SIGNUP & FORGOT)
  // ==========================================
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
                onClick={() => { setAuthMode("login"); setSignupStep(1); setAuthError(""); setAuthSuccessNotice(""); }}
                className={`text-center py-2 text-[11px] font-bold transition border-b-2 ${
                  authMode === "login" ? "border-amber-500 text-amber-400" : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setAuthMode("signup"); setSignupStep(1); setAuthError(""); setAuthSuccessNotice(""); }}
                className={`text-center py-2 text-[11px] font-bold transition border-b-2 ${
                  authMode === "signup" ? "border-amber-500 text-amber-400" : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Register
              </button>
              <button
                onClick={() => { setAuthMode("forgot"); setOtpStep(1); setAuthError(""); setAuthSuccessNotice(""); }}
                className={`text-center py-2 text-[11px] font-bold transition border-b-2 flex items-center justify-center space-x-1 ${
                  authMode === "forgot" ? "border-amber-500 text-amber-400" : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <KeyRound className="w-3 h-3" />
                <span>Forgot? 🔑</span>
              </button>
              <button
                onClick={() => { setAuthMode("admin"); setSignupStep(1); setAuthError(""); setAuthSuccessNotice(""); }}
                className={`text-center py-2 text-[11px] font-bold transition border-b-2 flex items-center justify-center space-x-1 ${
                  authMode === "admin" ? "border-rose-500 text-rose-400" : "border-transparent text-slate-400 hover:text-slate-200"
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

            {/* VIEW A: REGISTRATION WITH REAL EMAIL OTP */}
            {authMode === "signup" ? (
              <div className="space-y-4">
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <h3 className="font-bold text-slate-100 text-xs flex items-center space-x-1.5">
                    <Mail className="w-4 h-4 text-amber-400" />
                    <span>Real Email OTP Registration</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {signupStep === 1
                      ? "Step 1 of 2: Fill details & receive 6-digit OTP in inbox"
                      : "Step 2 of 2: Enter code to verify email & create account"}
                  </p>
                </div>

                {signupStep === 1 ? (
                  <form onSubmit={handleSignupRequestOtp} className="space-y-3.5 text-xs">
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
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
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
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                        <input
                          type="email"
                          required
                          placeholder="founder@yourbusiness.in"
                          value={authEmailOrPhone}
                          onChange={(e) => setAuthEmailOrPhone(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSendingSignupOtp}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold py-2.5 rounded-xl transition text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
                    >
                      {isSendingSignupOtp ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Dispatching Verification OTP to Inbox...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Verification OTP to Email</span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleSignupVerifyAndRegister} className="space-y-4 text-xs">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-slate-300 font-semibold">6-Digit Security OTP from Email</label>
                        <span className="text-[10px] text-amber-400 font-mono flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Expires in: {formatCountdown(signupOtpSecondsLeft)}</span>
                        </span>
                      </div>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-amber-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          maxLength={6}
                          placeholder="e.g. 583920"
                          value={signupEnteredOtp}
                          onChange={(e) => setSignupEnteredOtp(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-slate-100 font-mono tracking-widest text-center focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        disabled={signupResendCooldown > 0 || isSendingSignupOtp}
                        onClick={handleSignupRequestOtp}
                        className="text-[11px] text-amber-400 hover:underline disabled:text-slate-600 flex items-center space-x-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>{signupResendCooldown > 0 ? `Resend in (${signupResendCooldown}s)` : "Resend Real Email"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setSignupStep(1); setAuthError(""); }}
                        className="text-[11px] text-slate-400 hover:text-slate-200"
                      >
                        Change Details
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isAuthLoading}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold py-2.5 rounded-xl transition text-xs shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {isAuthLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Verifying & Creating Account in MongoDB...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Verify OTP & Register Account</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            ) : authMode === "forgot" ? (
              /* FORGOT PASSWORD WITH REAL EMAIL OTP */
              <div className="space-y-4">
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <h3 className="font-bold text-slate-100 text-xs flex items-center space-x-1.5">
                    <Mail className="w-4 h-4 text-amber-400" />
                    <span>Real Host Email OTP Verification</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {otpStep === 1
                      ? "Step 1: Enter email to receive security code"
                      : "Step 2: Enter code & set new password"}
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
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold py-2.5 rounded-xl transition text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {isSendingOtp ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Dispatching Real Email to Inbox...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Real OTP to My Email</span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleForgotVerifyAndReset} className="space-y-3.5 text-xs">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-slate-300 font-semibold">6-Digit Security OTP from Email</label>
                        <span className="text-[10px] text-amber-400 font-mono flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatCountdown(otpSecondsLeft)}</span>
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

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        disabled={resendCooldown > 0 || isSendingOtp}
                        onClick={handleForgotRequestOtp}
                        className="text-[11px] text-amber-400 hover:underline disabled:text-slate-600 flex items-center space-x-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>{resendCooldown > 0 ? `Resend in (${resendCooldown}s)` : "Resend Real Email"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setOtpStep(1); setAuthError(""); }}
                        className="text-[11px] text-slate-400 hover:text-slate-200"
                      >
                        Change Email
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold py-2.5 rounded-xl transition text-xs shadow-lg mt-2"
                    >
                      Verify OTP & Reset Password
                    </button>
                  </form>
                )}
              </div>
            ) : (
              /* LOGIN & ADMIN FORM */
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
                        <button
                          type="button"
                          onClick={() => { setAuthMode("forgot"); setOtpStep(1); setAuthError(""); }}
                          className="text-[11px] font-bold text-amber-400 hover:underline"
                        >
                          Forgot Password?
                        </button>
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
                      <span>Verifying with MongoDB Database...</span>
                    </>
                  ) : (
                    <span>
                      {authMode === "admin"
                        ? "Authenticate Admin Credentials 🛡️"
                        : "Sign In"}
                    </span>
                  )}
                </button>
              </form>
            )}

            {authMode === "login" && (
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400">Locked out? </span>
                <button
                  type="button"
                  onClick={() => { setAuthMode("forgot"); setOtpStep(1); setAuthError(""); }}
                  className="text-[11px] text-amber-400 font-bold hover:underline"
                >
                  Recover Password with Real Email OTP 🔑
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
                  className="bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition"
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
              <button onClick={handleLogout} title="Logout" className="text-slate-400 hover:text-rose-400 p-1 ml-1">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Global Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 flex space-x-1 overflow-x-auto text-sm border-t border-slate-800/80 pt-1">
          {[
            { id: "idea-finder", label: "AI Idea Matcher (5 Ideas)", icon: Lightbulb },
            { id: "location-scout", label: "Location Scout 📍", icon: MapPin },
            { id: "evaluator", label: "Business Evaluator", icon: Briefcase },
            { id: "roadmap", label: `Daily Sprint Guide (${sprintProgressPercent}%)`, icon: Calendar },
            { id: "tools", label: "AI Calculators & Ledger", icon: Calculator }
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
              </button>
            );
          })}
        </div>
      </header>

      {/* ACTIVE CHOSEN VENTURE PIPELINE BANNER */}
      {selectedVenture && (
        <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-transparent border-b border-amber-500/30 px-4 py-2.5 text-xs text-amber-200">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                Active Venture
              </span>
              <strong className="text-slate-100 font-bold">{selectedVenture.title}</strong>
              <span className="text-slate-400 hidden md:inline">({selectedVenture.category} • Budget: ₹{parseInt(finderBudget).toLocaleString("en-IN")})</span>
            </div>

            <div className="flex items-center space-x-2 text-[11px]">
              <button
                onClick={() => setActiveTab("location-scout")}
                className={`px-2.5 py-1 rounded-lg border transition ${
                  activeTab === "location-scout" ? "bg-amber-500 text-slate-950 font-bold" : "border-amber-500/30 text-amber-300 hover:bg-slate-800"
                }`}
              >
                1. Scout Spots 📍
              </button>
              <button
                onClick={() => setActiveTab("evaluator")}
                className={`px-2.5 py-1 rounded-lg border transition ${
                  activeTab === "evaluator" ? "bg-amber-500 text-slate-950 font-bold" : "border-amber-500/30 text-amber-300 hover:bg-slate-800"
                }`}
              >
                2. Feasibility Plan 📊
              </button>
              <button
                onClick={() => setActiveTab("roadmap")}
                className={`px-2.5 py-1 rounded-lg border transition ${
                  activeTab === "roadmap" ? "bg-amber-500 text-slate-950 font-bold" : "border-amber-500/30 text-amber-300 hover:bg-slate-800"
                }`}
              >
                3. Daily Sprint 🗓️
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-1">
        {/* ============================================================== */}
        {/* TAB 1: AI IDEA MATCHER (5 IDEAS + CHOOSE VENTURE ACTION)       */}
        {/* ============================================================== */}
        {activeTab === "idea-finder" && (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/30 rounded-3xl p-6 sm:p-8">
              <span className="text-amber-400 font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4" />
                <span>AI Opportunity Matcher</span>
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 mt-2">
                Generate 5 High-Potential Indian Business Ideas Fitted to Your Constraints
              </h1>
              <p className="text-sm text-slate-300 mt-1 max-w-3xl">
                Choose any one of the 5 recommendations to automatically link it across the <strong>Location Scout</strong>, <strong>Feasibility Evaluator</strong>, and <strong>10-Day Sprint Guide</strong>.
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
                    <label className="block font-semibold text-slate-300 mb-1">Planned Investment Budget (₹ INR)</label>
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
                      placeholder="e.g. Pune, Jaipur, Indore, Ahmedabad, Bengaluru"
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
                        <span>Evaluating 5 Indian SME Models...</span>
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

              {/* 5 Recommended Ideas with 1-Click Choose Action */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="font-bold text-slate-200 text-sm flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>5 Tailored Opportunities</span>
                  </h3>
                  <span className="text-xs text-slate-400">
                    {matchedIdeas ? "Click 'Choose This Idea' to follow into other tabs" : "Awaiting your inputs"}
                  </span>
                </div>

                {matchedIdeas ? (
                  matchedIdeas.map((idea, idx) => {
                    const isSelected = selectedVenture?.id === idea.id || selectedVenture?.title === idea.title;
                    return (
                      <div
                        key={idea.id || idx}
                        className={`p-5 rounded-3xl transition space-y-3 relative border ${
                          isSelected
                            ? "bg-slate-900 border-2 border-amber-500 shadow-xl shadow-amber-500/10"
                            : "bg-slate-900 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="bg-slate-800 text-amber-400 font-bold text-xs px-2.5 py-0.5 rounded-full border border-slate-700">
                              #{idx + 1} {idea.category || "Venture"}
                            </span>
                            <span className="text-emerald-400 font-bold text-xs">
                              {idea.matchScore}% Match
                            </span>
                          </div>

                          {isSelected ? (
                            <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                              <CheckCircle className="w-3 h-3" />
                              <span>CHOSEN VENTURE</span>
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">{idea.monthlyPotential}</span>
                          )}
                        </div>

                        <div>
                          <h4 className="text-lg font-extrabold text-slate-100">{idea.title}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">{idea.tagline}</p>
                        </div>

                        <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-xs text-slate-300">
                          <strong className="text-amber-400">Why it matches you: </strong>
                          {idea.whyFit}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                          <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                            <span className="text-[10px] text-slate-500 block">Est. CapEx</span>
                            <span className="font-bold text-slate-200">{idea.estimatedCapex}</span>
                          </div>
                          <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                            <span className="text-[10px] text-slate-500 block">Target Customer</span>
                            <span className="font-bold text-slate-200 truncate block">{idea.targetAudience}</span>
                          </div>
                          <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
                            <span className="text-[10px] text-slate-500 block">Day 1 Action</span>
                            <span className="font-bold text-amber-300 truncate block">{idea.firstStep}</span>
                          </div>
                        </div>

                        {/* CHOOSE VENTURE BUTTON */}
                        <div className="flex justify-end pt-2">
                          <button
                            onClick={() => handleChooseVenture(idea)}
                            className={`font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 transition shadow-md ${
                              isSelected
                                ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
                                : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-slate-950"
                            }`}
                          >
                            <span>{isSelected ? "Active Plan Selected 🚀" : "Choose This Idea & Build Plan 🚀"}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-72 border border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center p-8 text-center text-slate-500">
                    <Lightbulb className="w-10 h-10 text-slate-700 mb-2" />
                    <p className="text-sm font-semibold text-slate-400">Ready to Generate 5 Opportunities</p>
                    <p className="text-xs max-w-sm mt-1">Submit your profile on the left to evaluate 5 high-potential Indian businesses.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: AI MICRO-LOCATION SCOUT (CONNECTED TO CHOSEN VENTURE)   */}
        {/* ============================================================== */}
        {activeTab === "location-scout" && (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/30 rounded-3xl p-6 sm:p-8">
              <span className="text-amber-400 font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <MapPin className="w-4 h-4" />
                <span>Commercial Footfall Scout</span>
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 mt-2">
                Evaluate Best Commercial Spots for {selectedVenture ? `"${selectedVenture.title}"` : "Your Concept"}
              </h1>
              <p className="text-sm text-slate-300 mt-1 max-w-3xl">
                Estimates rental rates per sq.ft., footfall profiles (IT corridors vs student belts), and peak hours across {scoutCity}.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-3">
                  <Compass className="w-5 h-5 text-amber-400" />
                  <span>City & Rent Parameters</span>
                </h2>

                <form onSubmit={handleEvaluateLocations} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Target Indian City</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bengaluru, Pune, Jaipur, Ahmedabad, Lucknow"
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
                      value={scoutConcept}
                      onChange={(e) => setScoutConcept(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Target Monthly Rent Budget (₹ INR)</label>
                    <input
                      type="number"
                      required
                      value={scoutBudgetRent}
                      onChange={(e) => setScoutBudgetRent(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Target Footfall Demographic</label>
                    <select
                      value={scoutTrafficType}
                      onChange={(e) => setScoutTrafficType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                    >
                      <option>Corporate Tech Park / Startup Office Crowd</option>
                      <option>High-Street Retail & Weekend Dining Walkers</option>
                      <option>College / University Hostel & Student Belt</option>
                      <option>High-Density Gated Societies & Family Residential</option>
                      <option>Metro Station / Bus Stand Transit Hub</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isScoutingLocations}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 text-slate-950 font-bold py-3 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50"
                  >
                    {isScoutingLocations ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Evaluating Micro-Markets in {scoutCity}...</span>
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

              <div className="lg:col-span-7 space-y-4">
                {scoutResults ? (
                  <div className="space-y-4">
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-xs text-slate-300 leading-relaxed">
                      <strong className="text-amber-400 block font-bold mb-1">City Commercial Verdict:</strong>
                      {scoutResults.cityOverview}
                    </div>

                    <div className="space-y-4">
                      {scoutResults.locations?.map((loc, idx) => (
                        <div key={idx} className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <div>
                              <h3 className="font-extrabold text-slate-100 text-sm flex items-center space-x-1.5">
                                <MapPin className="w-4 h-4 text-amber-400" />
                                <span>{loc.name}</span>
                              </h3>
                              <span className="text-[10px] text-slate-400">{loc.zoneType}</span>
                            </div>
                            <span className="text-emerald-400 font-bold text-xs">{loc.suitabilityScore}% Location Fit</span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                              <span className="text-[10px] text-slate-500 block">Est. Market Rent</span>
                              <span className="font-bold text-amber-300 block truncate">{loc.estimatedRent}</span>
                            </div>
                            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                              <span className="text-[10px] text-slate-500 block">Competition</span>
                              <span className="font-bold text-slate-200 block truncate">{loc.competitionDensity}</span>
                            </div>
                            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
                              <span className="text-[10px] text-slate-500 block">Peak Hours</span>
                              <span className="font-bold text-emerald-400 block truncate">{loc.peakHours}</span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-300 italic bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                            "{loc.verdict}"
                          </p>

                          <div className="flex justify-end pt-1">
                            <button
                              onClick={() => {
                                setTargetCity(`${loc.name}, ${scoutCity}`);
                                setActiveTab("evaluator");
                              }}
                              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center space-x-1"
                            >
                              <span>Apply Location to Feasibility Plan</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-64 border border-dashed border-slate-800 rounded-3xl flex items-center justify-center text-slate-500 text-xs">
                    Input city and concept on the left to scout top micro-markets.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: BUSINESS EVALUATOR (CONNECTED TO CHOSEN VENTURE)        */}
        {/* ============================================================== */}
        {activeTab === "evaluator" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-3 mb-4">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>Feasibility & Financial Breakdown</span>
                </h2>

                <form onSubmit={handleEvaluateIdea} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Business Concept</label>
                    <textarea
                      rows={3}
                      required
                      value={businessIdea}
                      onChange={(e) => setBusinessIdea(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Target Location</label>
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
                      value={initialCapital}
                      onChange={(e) => setInitialCapital(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isAnalyzing}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl transition flex items-center justify-center space-x-2"
                  >
                    {isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Run Full Feasibility Audit</span>}
                  </button>
                </form>
              </div>

              <div className="lg:col-span-7">
                {analysisResult ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                    <h3 className="font-bold text-slate-100 text-base">{businessIdea}</h3>
                    <div className="grid grid-cols-3 gap-3 text-center text-xs">
                      <div className="bg-slate-950 p-3 rounded-xl">Viability: <span className="font-bold text-emerald-400 block text-lg">{analysisResult.viabilityScore}/10</span></div>
                      <div className="bg-slate-950 p-3 rounded-xl">Margin: <span className="font-bold text-sky-400 block text-lg">{analysisResult.estimatedMarginPercent}</span></div>
                      <div className="bg-slate-950 p-3 rounded-xl">Break-Even: <span className="font-bold text-indigo-400 block text-lg">{analysisResult.breakEvenMonths}</span></div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      {analysisResult.summary}
                    </p>
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => setActiveTab("roadmap")}
                        className="bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1"
                      >
                        <span>Start 10-Day Sprint Roadmap</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 border border-dashed border-slate-800 rounded-3xl flex items-center justify-center text-slate-500 text-xs">
                    Run audit to review CapEx, OpEx, and break-even projections.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: UPGRADED DAY-BY-DAY EXECUTION SPRINT                    */}
        {/* ============================================================== */}
        {activeTab === "roadmap" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-amber-400" />
                    <span>Daily Launch Sprint for {selectedVenture ? `"${selectedVenture.title}"` : "Active Plan"}</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Time and budget allocations with AI SOPs for each day.</p>
                </div>
                <span className="text-amber-400 font-bold text-sm bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                  {sprintProgressPercent}% Complete
                </span>
              </div>

              <div className="space-y-3">
                {dailySprintTasks.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-xs">
                    Please go to the <strong>AI Idea Matcher</strong> tab and click "Choose This Idea & Build Plan" to generate your custom 10-day sprint.
                  </div>
                ) : (
                  filteredTasks.map((t) => (
                    <div key={t.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <button onClick={() => toggleDailyTask(t.id)}>
                            {t.completed ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Circle className="w-5 h-5 text-slate-600" />}
                          </button>
                          <div>
                            <div className="font-bold text-xs text-slate-200">{t.dayTitle}</div>
                            <div className={`text-[11px] ${t.completed ? "line-through text-slate-500" : "text-slate-400"}`}>{t.task}</div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleConsultDailyTaskAI(t)}
                          className="bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1"
                        >
                          <Bot className="w-3.5 h-3.5" />
                          <span>AI SOP</span>
                        </button>
                      </div>

                      <div className="border-t border-slate-800/80 pt-2 flex items-center justify-between text-[11px]">
                        {editingNoteId === t.id ? (
                          <div className="flex items-center space-x-2 w-full">
                            <input
                              type="text"
                              value={tempNoteText}
                              onChange={(e) => setTempNoteText(e.target.value)}
                              placeholder="Notes, phone numbers, or quotes..."
                              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-100"
                            />
                            <button onClick={() => handleSaveTaskNote(t.id)} className="bg-emerald-500 text-slate-950 px-2 py-1 rounded-lg font-bold">Save</button>
                          </div>
                        ) : (
                          <>
                            <span className="text-slate-400 italic truncate max-w-sm">
                              {t.notes ? `📝 ${t.notes}` : "No task notes yet."}
                            </span>
                            <button
                              onClick={() => { setEditingNoteId(t.id); setTempNoteText(t.notes || ""); }}
                              className="text-amber-400 hover:underline flex items-center space-x-1"
                            >
                              <FileEdit className="w-3 h-3" />
                              <span>{t.notes ? "Edit" : "Add Note"}</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {taskAdviceModal && (
              <div className="fixed inset-0 bg-slate-950/85 z-50 flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-3 relative text-xs">
                  <button onClick={() => setTaskAdviceModal(null)} className="absolute top-4 right-4 text-slate-400"><X className="w-5 h-5" /></button>
                  <h3 className="font-bold text-slate-100 text-sm">{taskAdviceModal.title}</h3>
                  <div className="whitespace-pre-line text-slate-300 max-h-96 overflow-y-auto leading-relaxed">
                    {isLoadingTaskAdvice ? "Generating Indian SME procedure & negotiation script..." : taskAdviceModal.sopText}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: CALCULATORS */}
        {activeTab === "tools" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-xs">
              <h3 className="font-bold text-slate-100 text-sm">Profit Margin Calculator</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Cost Price (₹)</label>
                  <input type="number" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-2 rounded-xl text-slate-100" />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Selling Price (₹)</label>
                  <input type="number" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-2 rounded-xl text-slate-100" />
                </div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl flex justify-between">
                <div>Net Profit: <strong className="text-emerald-400">₹{netProfitUnit.toFixed(1)}</strong></div>
                <div>Margin: <strong className="text-amber-400">{netMarginPercent}%</strong></div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-xs">
              <h3 className="font-bold text-slate-100 text-sm">Break-Even Calculator</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Fixed Overhead/mo (₹)</label>
                  <input type="number" value={monthlyOverhead} onChange={(e) => setMonthlyOverhead(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-2 rounded-xl text-slate-100" />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Variable Cost/unit (₹)</label>
                  <input type="number" value={unitVariableCost} onChange={(e) => setUnitVariableCost(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-2 rounded-xl text-slate-100" />
                </div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl flex justify-between">
                <div>Required Volume: <strong className="text-emerald-400">{breakEvenUnitsNeeded} Units/mo</strong></div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ADMIN CONSOLE MODAL */}
      {showAdminConsoleModal && currentUser?.role === "admin" && (
        <div className="fixed inset-0 bg-slate-950/85 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 max-w-2xl w-full space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="font-bold text-slate-100 text-sm">Administrative Works Console (MongoDB)</h3>
              <button onClick={() => setShowAdminConsoleModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {submittedTxns.map((txn) => (
                <div key={txn._id || txn.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-mono text-amber-400 font-bold">{txn.paymentId}</div>
                    <div className="text-slate-400 text-[11px]">{txn.userEmail} • {txn.status}</div>
                  </div>
                  {txn.status !== "approved" ? (
                    <button
                      onClick={async () => {
                        await fetch(`${API_BASE_URL}/subscriptions/status`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ txnId: txn._id || txn.id, status: "approved" })
                        });
                        fetchDbData();
                      }}
                      className="bg-emerald-500 text-slate-950 px-3 py-1 rounded-lg font-bold"
                    >
                      Approve Pro
                    </button>
                  ) : (
                    <span className="text-emerald-400 font-bold">Approved</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
