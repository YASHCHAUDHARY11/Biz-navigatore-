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
  CheckCircle,
  Gauge
} from "lucide-react";

// --- CONFIGURATION CONSTANTS, MONGODB API & CREDENTIALS ---
const API_BASE_URL = typeof window !== "undefined" && window.location.hostname === "localhost"
  ? "http://localhost:5000/api"
  : "/api";

const FREE_USAGE_LIMIT = 5;
const PRO_DAILY_LIMIT = 50;
const STORAGE_PREFIX = "biznavigator_";
const ADMIN_EMAIL = "admin@biznavigator.in";

const PAYMENT_LINKS = {
  dayPass: "https://rzp.io/rzp/BotR1EMB",       // ₹49
  monthlyPro: "https://rzp.io/rzp/IYMoJDwv",   // ₹249
  quarterlyPro: "https://rzp.io/rzp/wkdIZLD"   // ₹599
};

// Robust helper to extract clean JSON from LLM responses containing markdown/preambles
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

export default function BizNavigatorApp() {
  // Clear any legacy client-side Pro leakage on boot
  useEffect(() => {
    localStorage.removeItem(`${STORAGE_PREFIX}is_pro`);
  }, []);

  // 1. AUTHENTICATION & SESSION
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

  // Real Email OTP States
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
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}user`);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.role?.toLowerCase() === "admin") return "admin-works";
    }
    return "idea-finder";
  });

  const [lastAiError, setLastAiError] = useState("");
  const [proDailyCount, setProDailyCount] = useState(() => parseInt(localStorage.getItem(`${STORAGE_PREFIX}pro_count`)) || 0);

  const isAdminUser = Boolean(currentUser?.role?.toLowerCase() === "admin");

  const isUserPro = Boolean(
    currentUser && (
      isAdminUser ||
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

  // Sync DB records from backend API
  const fetchDbData = async () => {
    try {
      const txnsRes = await fetch(`${API_BASE_URL}/subscriptions/all`);
      if (txnsRes.ok) {
        const txns = await txnsRes.json();
        if (Array.isArray(txns)) setSubmittedTxns(txns);
      }
    } catch (err) {}

    try {
      if (currentUser?.role?.toLowerCase() === "admin") {
        const usersRes = await fetch(`${API_BASE_URL}/admin/users`);
        if (usersRes.ok) {
          const users = await usersRes.json();
          if (Array.isArray(users)) setRegisteredUsersList(users);
        }
      }
    } catch (err) {}
  };

  useEffect(() => {
    if (currentUser) fetchDbData();
  }, [currentUser]);

  // Timers for OTP
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

  // Active Venture State (Pipeline across tabs)
  const [selectedVenture, setSelectedVenture] = useState(() => {
    const cached = localStorage.getItem(`${STORAGE_PREFIX}selected_venture`);
    return cached ? JSON.parse(cached) : null;
  });

  useEffect(() => {
    if (selectedVenture) {
      localStorage.setItem(`${STORAGE_PREFIX}selected_venture`, JSON.stringify(selectedVenture));
    }
  }, [selectedVenture]);

  // ==============================================================
  // GEMINI AI CALLER (FOCUSES ENTIRELY ON VERCEL GEMINI_API_KEY)
  // ==============================================================
  const callGeminiAI = async (prompt, systemInstruction = "") => {
    if (!currentUser) throw new Error("AUTH_REQUIRED");

    if (!isAdminUser && !isUserPro && evaluationsCount >= FREE_USAGE_LIMIT) {
      setShowPaywallModal(true);
      throw new Error("LIMIT_REACHED");
    }

    setLastAiError("");

    // 1. Primary Route: Backend / Vercel API Route using process.env.GEMINI_API_KEY
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
          if (!isAdminUser && !isUserPro) {
            setCurrentUser((prev) => ({
              ...prev,
              evaluationsCount: (prev.evaluationsCount || 0) + 1
            }));
          }
          return serverData.text;
        }
        if (serverData.error) {
          setLastAiError(serverData.error);
        }
      }
    } catch (err) {
      console.warn("Server AI proxy call failed, attempting direct Vercel key if available:", err);
    }

    // 2. Direct Fallback via Vercel Client Environment Variable if present
    const envKey = (
      (typeof import.meta !== "undefined" && import.meta.env?.VITE_GEMINI_API_KEY) ||
      (typeof process !== "undefined" && (process.env?.GEMINI_API_KEY || process.env?.REACT_APP_GEMINI_API_KEY)) ||
      ""
    ).trim();

    if (envKey) {
      const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.5-flash"];
      for (const model of models) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${envKey}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": envKey
              },
              body: JSON.stringify({
                contents: [{ parts: [{ text: `${systemInstruction}\n\nTask:\n${prompt}` }] }],
                generationConfig: {
                  temperature: 0.7,
                  responseMimeType: "application/json"
                }
              })
            }
          );

          const data = await response.json();
          const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

          if (textResponse) {
            if (!isAdminUser && !isUserPro) {
              fetch(`${API_BASE_URL}/users/usage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ emailOrPhone: currentUser.emailOrPhone })
              }).catch(() => {});
            }
            return textResponse;
          }
        } catch (e) {
          console.warn(`Direct fetch failed for ${model}:`, e);
        }
      }
    }

    return null;
  };

  // ==============================================================
  // TAB 1: 6-INPUT DYNAMIC AI IDEA MATCHER
  // ==============================================================
  const [finderBudget, setFinderBudget] = useState("150000");
  const [finderLocation, setFinderLocation] = useState("Bengaluru (Tech & Startup Corridor)");
  const [finderSkills, setFinderSkills] = useState("Direct Sales, Cooking, Digital Marketing");
  const [finderInterests, setFinderInterests] = useState("Beverages, Organic Food, Packaging");
  const [finderTime, setFinderTime] = useState("Full-Time (8+ hrs/day)");
  const [finderRisk, setFinderRisk] = useState("Medium Risk (Balanced)");
  const [isFindingIdeas, setIsFindingIdeas] = useState(false);
  const [matchedIdeas, setMatchedIdeas] = useState(() => {
    const cached = localStorage.getItem(`${STORAGE_PREFIX}matched_ideas_dynamic`);
    return cached ? JSON.parse(cached) : null;
  });

  const handleGenerateIdeas = async (e) => {
    e.preventDefault();
    setIsFindingIdeas(true);
    setLastAiError("");

    const prompt = `Act as an elite Indian Startup & SME Strategist.
Generate 5 DISTINCT, CREATIVE, VIABLE Indian business ideas tailored specifically to these 6 USER INPUTS:
1. Budget / Capital: ₹${finderBudget}
2. Location: ${finderLocation}
3. Core Skills: ${finderSkills}
4. Passions & Interests: ${finderInterests}
5. Working Time: ${finderTime}
6. Risk Tolerance: ${finderRisk}

Evaluate all 6 inputs together.
Return ONLY valid JSON matching this exact schema:
{
  "ideas": [
    {
      "id": "idea_1",
      "title": "Specific Business Title",
      "tagline": "Catchy 1-line business pitch",
      "category": "Retail F&B / B2B Supply / D2C / Micro-Services / Manufacturing",
      "matchScore": 95,
      "whyFit": "Direct explanation of why this matches their ${finderSkills} skills, ₹${finderBudget} budget, ${finderTime} schedule, and ${finderRisk} appetite in ${finderLocation}.",
      "estimatedCapex": "₹${Math.round(parseInt(finderBudget) * 0.65).toLocaleString('en-IN')}",
      "monthlyPotential": "₹40,000 - ₹80,000 net profit",
      "targetAudience": "Target customer segment in ${finderLocation}",
      "firstStep": "Tangible Day 1 launch action in India"
    }
  ]
}`;

    const rawResponse = await callGeminiAI(prompt, "You are BizNavigator's Lead Indian SME Matchmaker. Return valid JSON only.");
    const parsedData = extractJsonFromText(rawResponse);

    if (parsedData?.ideas && Array.isArray(parsedData.ideas) && parsedData.ideas.length > 0) {
      setMatchedIdeas(parsedData.ideas);
      localStorage.setItem(`${STORAGE_PREFIX}matched_ideas_dynamic`, JSON.stringify(parsedData.ideas));
    } else {
      // Input-Driven Dynamic Synthesis based on their actual 6 parameters if network is offline
      const numBudget = parseInt(finderBudget) || 150000;
      const cleanLoc = finderLocation.split("(")[0].replace(/,/g, "").trim() || "India";
      const cleanSkill = finderSkills.split(",")[0].trim() || "Operations";
      const cleanInterest = finderInterests.split(",")[0].trim() || "Retail";

      const dynamicSynthesis = [
        {
          id: `dyn_1_${Date.now()}`,
          title: `Specialty ${cleanInterest} Counter & Retail Hub`,
          tagline: `High-volume localized retail concept serving ${cleanInterest} in ${cleanLoc}.`,
          category: "Retail Commercial",
          matchScore: 96,
          whyFit: `Directly leverages your passion for ${cleanInterest} and ${cleanSkill} skills. Designed to run comfortably within your ₹${numBudget.toLocaleString("en-IN")} budget under a ${finderRisk} profile.`,
          estimatedCapex: `₹${Math.round(numBudget * 0.65).toLocaleString("en-IN")}`,
          monthlyPotential: "₹45,000 - ₹85,000 net profit",
          targetAudience: `Walk-in commuters and neighborhood consumers in ${cleanLoc}`,
          firstStep: `Survey 3 commercial zones in ${cleanLoc} for footfall during your ${finderTime} window.`
        },
        {
          id: `dyn_2_${Date.now()}`,
          title: `B2B ${cleanInterest} Sourcing & Contract Distribution`,
          tagline: `Supplying verified ${cleanInterest} products and consumables to regional merchants.`,
          category: "B2B Supply Chain",
          matchScore: 92,
          whyFit: `Capitalizes on your ${cleanSkill} strength. Can be operated on a ${finderTime} schedule with recurring monthly billing retainers.`,
          estimatedCapex: `₹${Math.round(numBudget * 0.8).toLocaleString("en-IN")}`,
          monthlyPotential: "₹35,000 - ₹90,000 recurring retainers",
          targetAudience: `Commercial retailers, local traders, and independent firms in ${cleanLoc}`,
          firstStep: `Obtain wholesale catalog price sheets on Indiamart for ${cleanInterest}.`
        },
        {
          id: `dyn_3_${Date.now()}`,
          title: `Hyperlocal WhatsApp & D2C ${cleanInterest} Commerce`,
          tagline: `Curated direct-to-consumer batches delivered through neighborhood communities.`,
          category: "D2C Commerce",
          matchScore: 89,
          whyFit: `Zero commercial rent requirement; ideal for ${finderTime} commitment with low capital risk.`,
          estimatedCapex: `₹${Math.round(numBudget * 0.35).toLocaleString("en-IN")}`,
          monthlyPotential: "₹25,000 - ₹55,000 part-time",
          targetAudience: `Gated society residents, festive shoppers, and families in ${cleanLoc}`,
          firstStep: `Build a 10-item WhatsApp Business catalog highlighting curated ${cleanInterest}.`
        },
        {
          id: `dyn_4_${Date.now()}`,
          title: `${cleanSkill}-Driven Local Growth & Consulting Studio`,
          tagline: `Helping small business owners optimize their ${cleanSkill} and customer acquisition.`,
          category: "Asset-Light Services",
          matchScore: 87,
          whyFit: `Asset-light model requiring negligible hardware; perfect for a ${finderRisk} tolerance with immediate cash profitability.`,
          estimatedCapex: `₹${Math.round(numBudget * 0.2).toLocaleString("en-IN")}`,
          monthlyPotential: "₹30,000 - ₹70,000 monthly retainers",
          targetAudience: `Retail shop owners, professionals, and clinics in ${cleanLoc}`,
          firstStep: `Audit 10 local businesses in ${cleanLoc} to identify service gaps.`
        },
        {
          id: `dyn_5_${Date.now()}`,
          title: `Micro-Processing & Value-Add ${cleanInterest} Unit`,
          tagline: `Specialized small-batch manufacturing and packaging of high-demand items.`,
          category: "Micro-Manufacturing",
          matchScore: 84,
          whyFit: `High-margin production fitting your ₹${numBudget.toLocaleString("en-IN")} capital, tailored for dedicated ${finderTime} execution.`,
          estimatedCapex: `₹${Math.round(numBudget * 0.9).toLocaleString("en-IN")}`,
          monthlyPotential: "₹50,000 - ₹1,00,000 net profit",
          targetAudience: `Wholesalers and direct consumers across ${cleanLoc}`,
          firstStep: `Inspect micro-machinery rates from regional industrial manufacturers.`
        }
      ];

      setMatchedIdeas(dynamicSynthesis);
      localStorage.setItem(`${STORAGE_PREFIX}matched_ideas_dynamic`, JSON.stringify(dynamicSynthesis));
    }

    setIsFindingIdeas(false);
  };

  const handleChooseVenture = (idea) => {
    setSelectedVenture(idea);
    setBusinessIdea(`${idea.title} - ${idea.tagline}`);
    setInitialCapital(finderBudget);
    setTargetCity(finderLocation);
    setCustomerSegment(idea.targetAudience);
    setScoutConcept(idea.title);
    setScoutCity(finderLocation.split("(")[0].replace(/,/g, "").trim() || "Bengaluru");
    setActiveTab("location-scout");
    alert(`🚀 Venture Selected: "${idea.title}"!\n\nAll tools are now tailored to this business.`);
  };

  // --- TAB 2: LOCATION SCOUT ---
  const [scoutCity, setScoutCity] = useState("Bengaluru");
  const [scoutConcept, setScoutConcept] = useState("Specialty Chai Kiosk");
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

    const prompt = `Evaluate the best micro-locations in "${scoutCity}" for "${scoutConcept}".
Rent Budget: Up to ₹${scoutBudgetRent}/month | Desired Footfall: ${scoutTrafficType}
Return ONLY valid JSON:
{
  "cityOverview": "Commercial summary of ${scoutCity}.",
  "locations": [
    {
      "name": "Exact Commercial Street / Neighborhood",
      "zoneType": "High-Street / Tech Corridor",
      "suitabilityScore": 94,
      "estimatedRent": "₹110 - ₹160 / sq.ft (~₹22,000/mo)",
      "footfallProfile": "Demographic details",
      "competitionDensity": "Moderate",
      "peakHours": "8:30 AM - 11:00 AM & 4:30 PM - 8:30 PM",
      "idealFormat": "100-150 sq.ft takeaway counter",
      "verdict": "Why this zone converts."
    }
  ]
}`;

    const raw = await callGeminiAI(prompt, "You are BizNavigator's Commercial Location Evaluator. Return JSON only.");
    const parsed = extractJsonFromText(raw);

    if (parsed?.locations) {
      setScoutResults(parsed);
      localStorage.setItem(`${STORAGE_PREFIX}location_scout`, JSON.stringify(parsed));
    } else {
      const fallback = {
        cityOverview: `Strong retail consumption in ${scoutCity}. Focus on secondary high-footfall transit connectors near ${scoutTrafficType}.`,
        locations: [
          {
            name: `${scoutCity} Central Commercial Connector`,
            zoneType: "High-Footfall Commercial Corridor",
            suitabilityScore: 95,
            estimatedRent: `₹120 - ₹175 / sq.ft (~₹${parseInt(scoutBudgetRent) * 0.9}/mo)`,
            footfallProfile: `${scoutTrafficType} and evening transit crowds`,
            competitionDensity: "Moderate",
            peakHours: "9:00 AM - 11:30 AM & 5:00 PM - 9:00 PM",
            idealFormat: "Front-facing compact takeaway counter with UPI soundbox",
            verdict: "High daily traffic with repeat convenience purchases."
          }
        ]
      };
      setScoutResults(fallback);
      localStorage.setItem(`${STORAGE_PREFIX}location_scout`, JSON.stringify(fallback));
    }
    setIsScoutingLocations(false);
  };

  // --- TAB 3: BUSINESS EVALUATOR ---
  const [businessIdea, setBusinessIdea] = useState("");
  const [targetCity, setTargetCity] = useState("HSR Layout, Bengaluru");
  const [initialCapital, setInitialCapital] = useState("150000");
  const [customerSegment, setCustomerSegment] = useState("B2C Working Professionals");
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
  "summary": "2-sentence market verdict.",
  "estimatedMarginPercent": "35-45%",
  "breakEvenMonths": "4 to 6 Months",
  "capex": [{"item": "Machinery/Equipment", "cost": "₹60,000"}],
  "monthlyOpex": [{"item": "Shop / Cloud Rent", "cost": "₹18,000"}],
  "licenses": ["GST Registration", "MSME Udyam (Free)", "Trade License"]
}`;

    const raw = await callGeminiAI(prompt, "You are BizNavigator's Senior Indian SME Strategist. Return JSON only.");
    const parsed = extractJsonFromText(raw);

    if (parsed?.viabilityScore) {
      setAnalysisResult(parsed);
      localStorage.setItem(`${STORAGE_PREFIX}last_analysis`, JSON.stringify(parsed));
    } else {
      const numCap = parseInt(initialCapital) || 150000;
      setAnalysisResult({
        viabilityScore: 8.4,
        competitionScore: 6.8,
        summary: `Strong consumer demand in ${targetCity}. Given your capital of ₹${numCap.toLocaleString("en-IN")}, focus on lean direct distribution before taking on expensive long-term lease commitments.`,
        estimatedMarginPercent: "32% - 44%",
        breakEvenMonths: "5 to 6 Months",
        capex: [
          { item: "Machinery / Equipment / Setup", cost: `₹${Math.round(numCap * 0.35).toLocaleString("en-IN")}` },
          { item: "Opening Stock & Packaging", cost: `₹${Math.round(numCap * 0.40).toLocaleString("en-IN")}` }
        ],
        monthlyOpex: [
          { item: "Space Rent / Utility Share", cost: "₹14,000 - ₹22,000" },
          { item: "Logistics & Consumables", cost: "₹8,500" }
        ],
        licenses: ["MSME Udyam Registration (Free)", "GSTIN Registration", "FSSAI / Municipal Trade Permit"]
      });
    }
    setIsAnalyzing(false);
  };

  // --- TAB 4: SPRINT TASKS ---
  const [dailySprintTasks, setDailySprintTasks] = useState(() => {
    const cached = localStorage.getItem(`${STORAGE_PREFIX}daily_sprint`);
    return cached
      ? JSON.parse(cached)
      : [
          {
            id: "day_1",
            dayTitle: "Day 1: Ground Demand Validation",
            phase: "Phase 1: Validation",
            task: "Survey 20 target customers in target zone.",
            timeEst: "3.5 hrs",
            budgetEst: "₹300",
            priority: "Critical",
            completed: false,
            notes: ""
          }
        ];
  });

  const [roadmapFilter, setRoadmapFilter] = useState("all");
  const [taskAdviceModal, setTaskAdviceModal] = useState(null);
  const [isLoadingTaskAdvice, setIsLoadingTaskAdvice] = useState(false);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}daily_sprint`, JSON.stringify(dailySprintTasks));
  }, [dailySprintTasks]);

  const toggleDailyTask = (id) => {
    const updated = dailySprintTasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    setDailySprintTasks(updated);
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

    const raw = await callGeminiAI(prompt, "You are BizNavigator's Field Operations Manager.");
    setTaskAdviceModal({
      title: taskItem.dayTitle,
      task: taskItem.task,
      sopText: raw || "Arrive early at supplier markets. Ask for volume quotes. Never pay 100% advance."
    });
    setIsLoadingTaskAdvice(false);
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
  // AUTHENTICATION (STRICT BACKEND ROUTE)
  // ==========================================
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccessNotice("");
    setIsAuthLoading(true);

    const isAdminRequest =
      authMode === "admin" ||
      authEmailOrPhone.trim().toLowerCase() === "admin" ||
      authEmailOrPhone.trim().toLowerCase() === ADMIN_EMAIL;

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

      setCurrentUser(data.user);
      setAuthPassword("");

      if (data.user?.role?.toLowerCase() === "admin") {
        setActiveTab("admin-works");
        setShowAdminConsoleModal(true);
      } else {
        setActiveTab("idea-finder");
      }
      fetchDbData();
    } catch (err) {
      setAuthError(err.message || "Login failed. Check server connection and credentials.");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignupRequestOtp = async (e) => {
    e.preventDefault();
    setAuthError("");
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
      setAuthSuccessNotice(`A verification OTP has been sent to ${authEmailOrPhone}. Please check your inbox.`);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setIsSendingSignupOtp(false);
    }
  };

  const handleSignupVerifyAndRegister = async (e) => {
    e.preventDefault();
    setAuthError("");
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
      setAuthSuccessNotice(`OTP sent to ${authEmailOrPhone}. Please check your inbox.`);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleForgotVerifyAndReset = async (e) => {
    e.preventDefault();
    setAuthError("");

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
      setAuthMode("login");
      setAuthSuccessNotice("Password updated in MongoDB! Please log in with your new password.");
    } catch (err) {
      setAuthError(err.message);
    }
  };

  // ==========================================
  // AUTH WALL
  // ==========================================
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-8 font-sans selection:bg-amber-500 selection:text-black">
        <div className="w-full max-w-md space-y-6">
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
                onClick={() => { setAuthMode("forgot"); setOtpStep(1); setAuthError(""); setAuthSuccessNotice(""); }}
                className={`text-center py-2 text-[11px] font-bold transition border-b-2 flex items-center justify-center space-x-1 ${
                  authMode === "forgot" ? "border-amber-500 text-amber-400" : "border-transparent text-slate-400"
                }`}
              >
                <KeyRound className="w-3 h-3" />
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
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl transition text-xs flex items-center justify-center space-x-2"
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
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl transition text-xs"
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
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl transition text-xs flex items-center justify-center space-x-2"
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
                    <label className="block text-slate-300 font-semibold mb-1">New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="At least 4 characters"
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl transition text-xs"
                  >
                    Reset Password
                  </button>
                </form>
              )
            ) : (
              /* LOGIN & ADMIN LOGIN FORM */
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
                          onClick={() => { setAuthMode("forgot"); setOtpStep(1); setAuthError(""); }}
                          className="text-[11px] font-bold text-amber-400 hover:underline"
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
                  className={`w-full font-bold py-3 rounded-xl transition text-xs shadow-lg flex items-center justify-center space-x-2 ${
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
            {/* ADMIN WORKS HEADER BUTTON */}
            {isAdminUser ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1.5 bg-rose-950/80 border border-rose-500/40 px-3 py-1.5 rounded-full text-rose-400 text-xs font-bold">
                  <Crown className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">ADMIN</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    fetchDbData();
                    setActiveTab("admin-works");
                    setShowAdminConsoleModal(true);
                  }}
                  className="bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-md shadow-rose-500/20"
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
                  Free: <strong className="text-amber-400">{evaluationsCount}/{FREE_USAGE_LIMIT}</strong>
                </span>
                <button
                  onClick={() => setShowPaywallModal(true)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs"
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
            { id: "tools", label: "AI Calculators & Ledger", icon: Calculator },
            ...(isAdminUser
              ? [{ id: "admin-works", label: "Admin Works ⚙️", icon: Settings, highlight: true }]
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
                    fetchDbData();
                    setShowAdminConsoleModal(true);
                  }
                }}
                className={`flex items-center space-x-2 py-2.5 px-4 font-medium transition-all border-b-2 whitespace-nowrap ${
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
            <div>
              <span className="bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded text-[10px] mr-2">
                ACTIVE
              </span>
              <strong>{selectedVenture.title}</strong>
              <span className="text-slate-400 ml-2">({selectedVenture.category})</span>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => setActiveTab("location-scout")} className="text-amber-300 hover:underline">1. Scout 📍</button>
              <span>•</span>
              <button onClick={() => setActiveTab("evaluator")} className="text-amber-300 hover:underline">2. Feasibility 📊</button>
              <span>•</span>
              <button onClick={() => setActiveTab("roadmap")} className="text-amber-300 hover:underline">3. Sprint 🗓️</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Body */}
      <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-1">
        {/* TAB: ADMIN WORKS (WHEN SELECTED VIA TAB OR HEADER) */}
        {activeTab === "admin-works" && isAdminUser && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-slate-100 text-base flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  <span>Razorpay Payment Approvals & Audit (MongoDB)</span>
                </h3>
                <button
                  onClick={fetchDbData}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-lg text-xs flex items-center space-x-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sync DB</span>
                </button>
              </div>

              <div className="space-y-3">
                {submittedTxns.length === 0 ? (
                  <div className="text-slate-500 text-xs py-8 text-center">No payment submissions yet.</div>
                ) : (
                  submittedTxns.map((txn) => (
                    <div key={txn._id || txn.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-mono text-amber-400 font-bold">{txn.paymentId}</div>
                        <div className="text-slate-400">{txn.userName} ({txn.userEmail}) • {txn.plan}</div>
                      </div>
                      <div className="flex items-center space-x-2">
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
                            className="bg-emerald-500 text-slate-950 font-bold px-3 py-1.5 rounded-xl"
                          >
                            Approve Pro
                          </button>
                        ) : (
                          <span className="text-emerald-400 font-bold">Approved</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: 6-INPUT AI IDEA MATCHER */}
        {activeTab === "idea-finder" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Form with all 6 Inputs */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-3">
                  <Target className="w-5 h-5 text-amber-400" />
                  <span>Input Your 6 Parameters</span>
                </h2>

                <form onSubmit={handleGenerateIdeas} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">1. Budget (₹ INR)</label>
                    <input
                      type="number"
                      required
                      value={finderBudget}
                      onChange={(e) => setFinderBudget(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
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
                      <label className="block font-semibold text-slate-300 mb-1">6. Risk Level</label>
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
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 text-slate-950 font-bold py-3 rounded-xl transition text-xs shadow-lg flex items-center justify-center space-x-2 mt-2"
                  >
                    {isFindingIdeas ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Evaluating with Gemini AI...</span>
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

              {/* 5 Recommended Ideas */}
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
                          <strong className="text-amber-400">Why it matches your 6 inputs: </strong>
                          {idea.whyFit}
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            onClick={() => handleChooseVenture(idea)}
                            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5"
                          >
                            <span>{isSelected ? "Active Venture Selected 🚀" : "Choose This Idea & Build Plan 🚀"}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-72 border border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center p-8 text-center text-slate-500">
                    <Lightbulb className="w-10 h-10 text-slate-700 mb-2" />
                    <p className="text-sm font-semibold text-slate-400">Fill your 6 inputs to evaluate 5 ideas.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LOCATION SCOUT */}
        {activeTab === "location-scout" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <form onSubmit={handleEvaluateLocations} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Target City</label>
                    <input type="text" required value={scoutCity} onChange={(e) => setScoutCity(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Concept</label>
                    <input type="text" required value={scoutConcept} onChange={(e) => setScoutConcept(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Target Rent Budget (₹/mo)</label>
                    <input type="number" required value={scoutBudgetRent} onChange={(e) => setScoutBudgetRent(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100" />
                  </div>
                  <button type="submit" disabled={isScoutingLocations} className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl transition text-xs flex items-center justify-center space-x-2">
                    {isScoutingLocations ? <RefreshCw className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                    <span>Scout Best Micro-Locations</span>
                  </button>
                </form>
              </div>

              <div className="lg:col-span-7 space-y-4">
                {scoutResults?.locations?.map((loc, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <h4 className="font-bold text-slate-100 text-sm">{loc.name}</h4>
                      <span className="text-emerald-400 font-bold text-xs">{loc.suitabilityScore}% Match</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                      <div>Rent: <strong className="text-amber-300">{loc.estimatedRent}</strong></div>
                      <div>Footfall: <strong className="text-slate-200">{loc.footfallProfile}</strong></div>
                    </div>
                    <p className="text-xs text-slate-300 italic">"{loc.verdict}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BUSINESS EVALUATOR */}
        {activeTab === "evaluator" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <form onSubmit={handleEvaluateIdea} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Business Concept</label>
                  <textarea rows={3} required value={businessIdea} onChange={(e) => setBusinessIdea(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Target Location</label>
                  <input type="text" value={targetCity} onChange={(e) => setTargetCity(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Planned Capital (₹)</label>
                  <input type="number" value={initialCapital} onChange={(e) => setInitialCapital(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200" />
                </div>
                <button type="submit" disabled={isAnalyzing} className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl transition flex items-center justify-center space-x-2">
                  {isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Run Full Feasibility Audit</span>}
                </button>
              </form>
            </div>

            <div className="lg:col-span-7">
              {analysisResult && (
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
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: SPRINT TASKS */}
        {activeTab === "roadmap" && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="font-bold text-slate-100 text-sm flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Launch Sprint ({sprintProgressPercent}% Complete)</span>
                </h3>
              </div>

              <div className="space-y-3">
                {dailySprintTasks.map((t) => (
                  <div key={t.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-between items-center text-xs">
                    <div className="flex items-center space-x-3">
                      <button onClick={() => toggleDailyTask(t.id)}>
                        {t.completed ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Circle className="w-5 h-5 text-slate-600" />}
                      </button>
                      <div>
                        <div className="font-bold text-slate-200">{t.dayTitle}</div>
                        <div className="text-slate-400 text-[11px]">{t.task}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleConsultDailyTaskAI(t)}
                      className="bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-xl font-semibold flex items-center space-x-1"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>AI SOP</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CALCULATORS */}
        {activeTab === "tools" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
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

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="font-bold text-slate-100 text-sm">Break-Even Calculator</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Overhead/mo (₹)</label>
                  <input type="number" value={monthlyOverhead} onChange={(e) => setMonthlyOverhead(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-2 rounded-xl text-slate-100" />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Variable Cost/unit (₹)</label>
                  <input type="number" value={unitVariableCost} onChange={(e) => setUnitVariableCost(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-2 rounded-xl text-slate-100" />
                </div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl flex justify-between">
                <div>Break-Even Volume: <strong className="text-emerald-400">{breakEvenUnitsNeeded} Units/mo</strong></div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ADMIN CONSOLE MODAL */}
      {showAdminConsoleModal && isAdminUser && (
        <div className="fixed inset-0 bg-slate-950/85 z-[100] flex items-center justify-center p-4">
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
                  <div className="flex items-center space-x-2">
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
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
