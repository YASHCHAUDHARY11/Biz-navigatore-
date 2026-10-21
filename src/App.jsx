import React, { useState, useEffect } from "react";
import {
  Briefcase,
  TrendingUp,
  CheckCircle2,
  Circle,
  FileText,
  DollarSign,
  Calculator,
  MessageSquare,
  Bell,
  Sparkles,
  ArrowRight,
  Download,
  IndianRupee,
  Trash2,
  Plus,
  RefreshCw,
  Send,
  Zap,
  Award,
  BookOpen,
  X,
  Lightbulb,
  Clock,
  ShieldCheck,
  Target,
  Check
} from "lucide-react";

// --- CONFIGURATION CONSTANTS ---
const FREE_USAGE_LIMIT = 5;
const PRO_DAILY_LIMIT = 50;
const STORAGE_PREFIX = "biznavigator_";

export default function BizNavigatorApp() {
  // Navigation State (Default to new idea-finder tab or evaluator)
  const [activeTab, setActiveTab] = useState("idea-finder"); // 'idea-finder', 'evaluator', 'roadmap', 'tools', 'market'

  // User & Usage State
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem(`${STORAGE_PREFIX}gemini_key`) || ""
  );
  const [isPro, setIsPro] = useState(
    () => localStorage.getItem(`${STORAGE_PREFIX}is_pro`) === "true"
  );
  const [evaluationsCount, setEvaluationsCount] = useState(
    () => parseInt(localStorage.getItem(`${STORAGE_PREFIX}eval_count`)) || 0
  );
  const [proDailyCount, setProDailyCount] = useState(
    () => parseInt(localStorage.getItem(`${STORAGE_PREFIX}pro_count`)) || 0
  );
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [notificationNudge, setNotificationNudge] = useState(null);

  // ==========================================
  // TAB 1: AI IDEA MATCHER / DISCOVERY STATE
  // ==========================================
  const [finderBudget, setFinderBudget] = useState("100000");
  const [finderLocation, setFinderLocation] = useState("Tier-2 City (e.g., Jaipur, Indore, Surat, Coimbatore)");
  const [finderSkills, setFinderSkills] = useState("Sales, Basic Cooking & Food Prep, Social Media Handling");
  const [finderInterests, setFinderInterests] = useState("Healthy Snacks, Eco-friendly Products, Local Retail");
  const [finderTime, setFinderTime] = useState("Full-Time (8+ hrs/day)");
  const [finderRisk, setFinderRisk] = useState("Moderate (Balanced risk-return)");
  const [isFindingIdeas, setIsFindingIdeas] = useState(false);
  const [matchedIdeas, setMatchedIdeas] = useState(() => {
    const cached = localStorage.getItem(`${STORAGE_PREFIX}matched_ideas`);
    return cached ? JSON.parse(cached) : null;
  });

  // ==========================================
  // TAB 2: BUSINESS EVALUATOR STATE
  // ==========================================
  const [businessIdea, setBusinessIdea] = useState("");
  const [targetCity, setTargetCity] = useState("Tier 2 (e.g., Jaipur, Indore, Surat)");
  const [initialCapital, setInitialCapital] = useState("250000");
  const [customerSegment, setCustomerSegment] = useState("B2C College Students & Young Professionals");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(() => {
    const cached = localStorage.getItem(`${STORAGE_PREFIX}last_analysis`);
    return cached ? JSON.parse(cached) : null;
  });

  // ==========================================
  // TAB 3: ROADMAP & CHECKLIST STATE
  // ==========================================
  const [milestones, setMilestones] = useState(() => {
    const cached = localStorage.getItem(`${STORAGE_PREFIX}milestones`);
    return cached
      ? JSON.parse(cached)
      : [
          { id: "m1", day: "Day 1-2", task: "Conduct local market survey & competitor price audit", completed: true },
          { id: "m2", day: "Day 3-5", task: "Source 3 wholesale vendors (Indiamart/Local Mandi)", completed: false },
          { id: "m3", day: "Day 6-7", task: "Finalize custom eco-friendly packaging & sample batches", completed: false },
          { id: "m4", day: "Day 8-9", task: "Apply for MSME Udyam Registration & GST portal check", completed: false },
          { id: "m5", day: "Day 10+", task: "Launch WhatsApp Business Catalog and localized Instagram Ads", completed: false }
        ];
  });
  const [showCelebration, setShowCelebration] = useState(false);

  // ==========================================
  // TAB 4: DAILY BUSINESS TOOLS STATE
  // ==========================================
  // 1. Margin Calc
  const [costPrice, setCostPrice] = useState(250);
  const [shippingCost, setShippingCost] = useState(40);
  const [gstPercent, setGstPercent] = useState(18);
  const [sellingPrice, setSellingPrice] = useState(599);

  // 2. Break-Even Calc
  const [monthlyOverhead, setMonthlyOverhead] = useState(45000);
  const [unitRevenue, setUnitRevenue] = useState(500);
  const [unitVariableCost, setUnitVariableCost] = useState(220);

  // 3. Cashflow / Ledger
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

  // ==========================================
  // FLOATING 24/7 BIZMENTOR CHAT STATE
  // ==========================================
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "mentor",
      text: "Namaste! I am your 24/7 BizMentor AI. Need advice on handling customer udhaar (credit), negotiating vendor terms, or getting GST/Udyam setup in India? Ask away!"
    }
  ]);
  const [inputChat, setInputChat] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}is_pro`, isPro);
    localStorage.setItem(`${STORAGE_PREFIX}eval_count`, evaluationsCount);
    localStorage.setItem(`${STORAGE_PREFIX}pro_count`, proDailyCount);
    localStorage.setItem(`${STORAGE_PREFIX}milestones`, JSON.stringify(milestones));
    localStorage.setItem(`${STORAGE_PREFIX}ledger`, JSON.stringify(ledgerEntries));
  }, [isPro, evaluationsCount, proDailyCount, milestones, ledgerEntries]);

  // Contextual Reminders
  useEffect(() => {
    const pending = milestones.find((m) => !m.completed);
    if (pending) {
      setNotificationNudge(`Pending Priority: "${pending.day} - ${pending.task}"`);
    } else {
      setNotificationNudge("All active milestone roadmap tasks are completed!");
    }
  }, [milestones]);

  const checkUsageAndTrigger = () => {
    if (!isPro && evaluationsCount >= FREE_USAGE_LIMIT) {
      setShowPaywallModal(true);
      return false;
    }
    if (isPro && proDailyCount >= PRO_DAILY_LIMIT) {
      alert("Daily Pro limit (50 requests/day) reached. Resets in 24 hours.");
      return false;
    }
    return true;
  };

  const incrementUsage = () => {
    if (isPro) setProDailyCount((prev) => prev + 1);
    else setEvaluationsCount((prev) => prev + 1);
  };

  // ==========================================
  // HANDLER: AI IDEA GENERATION
  // ==========================================
  const handleGenerateIdeas = async (e) => {
    e.preventDefault();
    if (!checkUsageAndTrigger()) return;

    setIsFindingIdeas(true);

    const prompt = `You are BizNavigator's Lead Indian SME Business Matchmaker.
Generate 3 tailored, pragmatic Indian business ideas suited specifically to this person's profile:
- Capital / Budget: ₹${finderBudget}
- Location: ${finderLocation}
- Skills / Background: ${finderSkills}
- Passions / Interests: ${finderInterests}
- Commitment: ${finderTime}
- Risk Level: ${finderRisk}

Ensure ideas reflect actual Indian market dynamics (e.g., ONDC, WhatsApp Commerce, local Mandis, MSME schemes, college crowds, Indian festive seasons, Tier-2/3 spending power).

Return ONLY valid JSON without markdown formatting, following this schema:
{
  "ideas": [
    {
      "id": "idea_1",
      "title": "Short Catchy Business Name / Concept",
      "tagline": "One-line clear description",
      "matchScore": 94,
      "whyFit": "Why this specifically fits their skills and exact budget.",
      "estimatedCapex": "₹80,000",
      "monthlyPotential": "₹35,000 - ₹60,000",
      "targetAudience": "Office employees & college hostels",
      "firstStep": "Specific tangible Day 1 action in India (e.g. visit APMC mandi or list on Google Maps)"
    }
  ]
}`;

    try {
      let results;
      if (apiKey) {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: "application/json" }
            })
          }
        );
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        results = JSON.parse(text);
      } else {
        // High-fidelity fallback simulator for Indian Entrepreneurs
        await new Promise((r) => setTimeout(r, 1400));
        const numBudget = parseInt(finderBudget) || 100000;

        results = {
          ideas: [
            {
              id: "idea_1",
              title: numBudget < 50000 ? "Micro Cloud Kitchen & Tiffin Service" : "Specialty Chai & Quick-Bites Kiosk",
              tagline: "High-margin daily staple food business focused on office clusters & PG hostels.",
              matchScore: 96,
              whyFit: `Leverages your interest in food and customer connection with an accessible entry budget of ₹${(numBudget * 0.75).toLocaleString("en-IN")}.`,
              estimatedCapex: `₹${(numBudget * 0.65).toFixed(0)}`,
              monthlyPotential: "₹40,000 - ₹75,000 net profit",
              targetAudience: "Working bachelors, corporate tech park employees & students",
              firstStep: "Survey 3 corporate commercial complexes or PG clusters for location footfall."
            },
            {
              id: "idea_2",
              title: "Eco-Friendly Packaging & Custom Retail Bags Supply",
              tagline: "B2B supply of corrugated, kraft paper & biodegradable cloth bags to local merchants.",
              matchScore: 91,
              whyFit: "Matches your sales aptitude and taps into municipal plastic bans across Indian cities.",
              estimatedCapex: `₹${(numBudget * 0.85).toFixed(0)}`,
              monthlyPotential: "₹35,000 - ₹90,000 recurring retainers",
              targetAudience: "Local boutique clothing stores, sweet shops & cafes",
              firstStep: "Procure sample catalogs from wholesale industrial packaging units on Indiamart."
            },
            {
              id: "idea_3",
              title: "Hyperlocal WhatsApp D2C Daily Essentials & Gifting",
              tagline: "Curated gift hampers and regional dry snacks sold via WhatsApp community groups.",
              matchScore: 88,
              whyFit: "Low overhead, zero commercial rent; perfect for quick execution and fast cash conversion.",
              estimatedCapex: `₹${(numBudget * 0.4).toFixed(0)}`,
              monthlyPotential: "₹25,000 - ₹50,000 part-time",
              targetAudience: "Gated society residents, festival gift shoppers & local families",
              firstStep: "Build a 10-item curated WhatsApp Business catalog and run test broadcasts to neighbors."
            }
          ]
        };
      }

      setMatchedIdeas(results.ideas);
      localStorage.setItem(`${STORAGE_PREFIX}matched_ideas`, JSON.stringify(results.ideas));
      incrementUsage();
    } catch (err) {
      console.error(err);
      alert("Error generating business ideas. Please check inputs or Gemini API key.");
    } finally {
      setIsFindingIdeas(false);
    }
  };

  // Hand-off selected Idea to the Evaluator & Roadmap tab
  const handleSelectIdeaForRoadmap = (idea) => {
    setBusinessIdea(idea.title + " - " + idea.tagline);
    setInitialCapital(finderBudget);
    setTargetCity(finderLocation);
    setCustomerSegment(idea.targetAudience);
    setActiveTab("evaluator");
  };

  // ==========================================
  // HANDLER: BUSINESS FEASIBILITY EVALUATOR
  // ==========================================
  const handleEvaluateIdea = async (e) => {
    e.preventDefault();
    if (!checkUsageAndTrigger()) return;

    setIsAnalyzing(true);

    const systemPrompt = `You are BizNavigator, an elite Indian SME & Startup Strategist.
Evaluate this business idea with hyper-realistic Indian market realities:
Business Idea: ${businessIdea}
Location: ${targetCity}
Initial Budget: ₹${initialCapital}
Target Customer: ${customerSegment}

Return ONLY valid JSON without markdown:
{
  "viabilityScore": 8.5,
  "competitionScore": 7.0,
  "summary": "Brief 2-sentence market verdict.",
  "estimatedMarginPercent": "35-45%",
  "breakEvenMonths": "4 to 6 Months",
  "capex": [
    {"item": "Equipment / Setup", "cost": "₹60,000"},
    {"item": "Initial Inventory / Stock", "cost": "₹80,000"},
    {"item": "Licenses & Branding", "cost": "₹15,000"}
  ],
  "monthlyOpex": [
    {"item": "Shop / Cloud Rent or Space", "cost": "₹18,000"},
    {"item": "Digital & Offline Marketing", "cost": "₹12,000"},
    {"item": "Staff / Logistics", "cost": "₹20,000"}
  ],
  "licenses": ["GST Registration", "MSME Udyam Registration (Free)", "Local Municipal Trade License", "FSSAI (if food)"],
  "actionPlan": [
    {"day": "Day 1-3", "task": "Validate customer demand via sample surveys"},
    {"day": "Day 4-7", "task": "Identify suppliers in wholesale markets & check credit periods"},
    {"day": "Day 8-10", "task": "Apply for MSME Udyam Certificate & Open Current Bank Account"},
    {"day": "Day 11-15", "task": "Set up packaging, test UPI QR payments, and launch"}
  ]
}`;

    try {
      let resultData;
      if (apiKey) {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: systemPrompt }] }],
              generationConfig: { responseMimeType: "application/json" }
            })
          }
        );
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        resultData = JSON.parse(text);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1300));
        resultData = {
          viabilityScore: 8.4,
          competitionScore: 6.5,
          summary: `High domestic demand in ${targetCity}. Given your capital of ₹${parseInt(initialCapital).toLocaleString("en-IN")}, focus on lean direct-to-consumer distribution before taking on expensive long-term lease commitments.`,
          estimatedMarginPercent: "32% - 44%",
          breakEvenMonths: "5 to 6 Months",
          capex: [
            { item: "Machinery / Equipment / Kiosk", cost: `₹${(initialCapital * 0.35).toFixed(0)}` },
            { item: "Opening Raw Stock & Packaging", cost: `₹${(initialCapital * 0.40).toFixed(0)}` },
            { item: "Signage, UPI Soundbox & Tech", cost: `₹${(initialCapital * 0.15).toFixed(0)}` }
          ],
          monthlyOpex: [
            { item: "Space Rent / Utility Share", cost: "₹14,000 - ₹22,000" },
            { item: "Hyperlocal Marketing & WhatsApp", cost: "₹7,000 - ₹10,000" },
            { item: "Logistics, Delivery & Consumables", cost: "₹8,500" }
          ],
          licenses: [
            "MSME Udyam Registration (Crucial for priority bank loans)",
            "GSTIN Registration (Voluntary or mandatory if interstate)",
            "Municipal Trade License / Shop & Establishment Act",
            businessIdea.toLowerCase().includes("food") || businessIdea.toLowerCase().includes("chai")
              ? "FSSAI Basic Food Safety Registration"
              : "Trademark Application (Form TM-A)"
          ],
          actionPlan: [
            { day: "Day 1-2", task: `Field test customer willingness to pay in ${targetCity}` },
            { day: "Day 3-5", task: "Contact bulk vendors on Indiamart; negotiate 15-day payment credit" },
            { day: "Day 6-7", task: "Draft zero-cost MSME Udyam certificate online via udyamregistration.gov.in" },
            { day: "Day 8-10", task: "Set up Soundbox / UPI Merchant QR & unbox initial samples" },
            { day: "Day 11+", task: "Launch local referral discount strategy with immediate neighbors" }
          ]
        };
      }

      setAnalysisResult(resultData);
      localStorage.setItem(`${STORAGE_PREFIX}last_analysis`, JSON.stringify(resultData));

      // Auto populate roadmap
      const generatedMilestones = resultData.actionPlan.map((item, idx) => ({
        id: `gen_${Date.now()}_${idx}`,
        day: item.day,
        task: item.task,
        completed: false
      }));
      setMilestones(generatedMilestones);
      incrementUsage();
    } catch (err) {
      console.error(err);
      alert("Failed to analyze idea. Please check inputs or Gemini API key.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Milestone toggling
  const toggleMilestone = (id) => {
    const updated = milestones.map((m) => {
      if (m.id === id) {
        const next = !m.completed;
        if (next) {
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 2500);
        }
        return { ...m, completed: next };
      }
      return m;
    });
    setMilestones(updated);
  };

  // BizMentor Chat handler
  const handleSendChat = async () => {
    if (!inputChat.trim()) return;
    const userText = inputChat;
    setInputChat("");
    setChatMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setIsChatLoading(true);

    try {
      if (apiKey) {
        const prompt = `You are "BizMentor AI", an experienced Indian SME business advisor. Answer pragmatically for small business owners in India: ${userText}`;
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
          }
        );
        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        setChatMessages((prev) => [...prev, { sender: "mentor", text: reply }]);
      } else {
        await new Promise((r) => setTimeout(r, 800));
        let reply = "Always maintain a polite yet strict credit period (Udhaar) ledger. Offer a 2% immediate UPI cash discount to disincentivize credit requests.";
        if (userText.toLowerCase().includes("udhaar")) {
          reply = "To recover Udhaar gracefully: Send a scheduled WhatsApp note citing month-end CA reconciliation: 'Namaste Ji, our accounts audit is closing this week. Kindly clear your pending ₹X so we can ensure seamless stock availability.'";
        }
        setChatMessages((prev) => [...prev, { sender: "mentor", text: reply }]);
      }
    } catch (e) {
      setChatMessages((prev) => [...prev, { sender: "mentor", text: "Notice: Unable to reach Gemini API. Please check your network." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Razorpay Checkout
  const triggerRazorpayCheckout = (planName, amount) => {
    const confirmMock = window.confirm(
      `Razorpay Gateway Simulator:\nProceed with ₹${amount} for ${planName} via UPI / Netbanking?`
    );
    if (confirmMock) {
      setIsPro(true);
      setShowPaywallModal(false);
      alert("Transaction successful! Pro Access activated with 50 daily evaluations.");
    }
  };

  // Computations
  const completedMilestones = milestones.filter((m) => m.completed).length;
  const progressPercent = milestones.length > 0 ? Math.round((completedMilestones / milestones.length) * 100) : 0;
  const totalIn = ledgerEntries.filter((e) => e.type === "in").reduce((sum, item) => sum + Number(item.amount), 0);
  const totalOut = ledgerEntries.filter((e) => e.type === "out").reduce((sum, item) => sum + Number(item.amount), 0);
  const netLedgerBalance = totalIn - totalOut;

  // Margin math
  const totalUnitCost = Number(costPrice) + Number(shippingCost);
  const gstDeduction = Number(sellingPrice) * (Number(gstPercent) / (100 + Number(gstPercent)));
  const revenueExclGst = Number(sellingPrice) - gstDeduction;
  const netProfitUnit = revenueExclGst - totalUnitCost;
  const netMarginPercent = sellingPrice > 0 ? ((netProfitUnit / Number(sellingPrice)) * 100).toFixed(1) : 0;
  const unitContribution = Number(unitRevenue) - Number(unitVariableCost);
  const breakEvenUnitsNeeded = unitContribution > 0 ? Math.ceil(Number(monthlyOverhead) / unitContribution) : "N/A";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
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
            {isPro ? (
              <div className="flex items-center space-x-1.5 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1.5 rounded-full text-emerald-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pro ({proDailyCount}/{PRO_DAILY_LIMIT} Daily)</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">
                  Free evaluations: <strong className="text-amber-400">{evaluationsCount}/{FREE_USAGE_LIMIT}</strong>
                </span>
                <button
                  onClick={() => setShowPaywallModal(true)}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center shadow-md transition"
                >
                  <Zap className="w-3.5 h-3.5 mr-1" /> Upgrade
                </button>
              </div>
            )}

            <button
              onClick={() => setShowKeyModal(true)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs text-slate-300"
            >
              {apiKey ? "API Key Connected" : "Custom Key"}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 flex space-x-1 overflow-x-auto text-sm border-t border-slate-800/80 pt-1">
          {[
            { id: "idea-finder", label: "AI Idea Matcher", icon: Lightbulb, highlight: true },
            { id: "evaluator", label: "Business Evaluator", icon: Briefcase },
            { id: "roadmap", label: `Execution Roadmap (${progressPercent}%)`, icon: CheckCircle2 },
            { id: "tools", label: "SME Calculators & Ledger", icon: Calculator },
            { id: "market", label: "Weekly Market Intel", icon: FileText }
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
                <Icon className={`w-4 h-4 ${tab.highlight && !isActive ? "text-amber-400 animate-pulse" : ""}`} />
                <span>{tab.label}</span>
                {tab.highlight && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
                    NEW
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Floating Notification */}
      {notificationNudge && (
        <div className="bg-slate-900 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-200">
          <div className="max-w-7xl mx-auto flex items-center space-x-2">
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span>{notificationNudge}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-1">
        {/* ============================================================== */}
        {/* PAGE / TAB: AI IDEA MATCHER & DISCOVERY (NEW FEATURE)          */}
        {/* ============================================================== */}
        {activeTab === "idea-finder" && (
          <div className="space-y-8">
            {/* Header intro banner */}
            <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/30 rounded-3xl p-6 sm:p-8">
              <div className="max-w-3xl space-y-2">
                <span className="text-amber-400 font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Personalized Opportunity Engine</span>
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
                  Find the Perfect Indian Business for Your Budget & Skills
                </h1>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Not sure what to start? Enter your capital, hometown tier, talents, and hobbies. BizNavigator’s AI evaluates real-world Indian SME viability to recommend high-margin, practical business ventures.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Preference Input Form */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
                <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-3">
                  <Target className="w-5 h-5 text-amber-400" />
                  <span>Your Profile & Constraints</span>
                </h2>

                <form onSubmit={handleGenerateIdeas} className="space-y-4 text-xs">
                  {/* Budget */}
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Available Initial Investment (₹ INR)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-500 text-sm">₹</span>
                      <input
                        type="number"
                        required
                        value={finderBudget}
                        onChange={(e) => setFinderBudget(e.target.value)}
                        placeholder="e.g. 50000, 200000, 1000000"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="flex gap-2 mt-1.5">
                      {["₹25k (Micro)", "₹1 Lakh", "₹5 Lakhs", "₹15 Lakhs+"].map((tag) => {
                        const val = tag.includes("25k") ? "25000" : tag.includes("1 Lakh") ? "100000" : tag.includes("5 Lakhs") ? "500000" : "1500000";
                        return (
                          <button
                            type="button"
                            key={tag}
                            onClick={() => setFinderBudget(val)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-400 px-2 py-0.5 rounded text-[10px]"
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Location Tier */}
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Location / Geography in India
                    </label>
                    <select
                      value={finderLocation}
                      onChange={(e) => setFinderLocation(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
                    >
                      <option>Metro Tier-1 (Mumbai, Bengaluru, Delhi NCR, Hyderabad)</option>
                      <option>Tier-2 City (e.g., Jaipur, Indore, Surat, Coimbatore)</option>
                      <option>Tier-3 District Headquarter / Small Town</option>
                      <option>Rural / Agricultural Mandi Belt</option>
                      <option>Pan-India Online / Work-From-Home</option>
                    </select>
                  </div>

                  {/* Skills */}
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Your Skills & Strengths (What are you good at?)
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={finderSkills}
                      onChange={(e) => setFinderSkills(e.target.value)}
                      placeholder="e.g., Cooking, Direct Sales, Excel, Graphic Design, Vehicle Mechanics, Carpentry, Teaching"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Interests */}
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Passions & Niche Interests
                    </label>
                    <input
                      type="text"
                      required
                      value={finderInterests}
                      onChange={(e) => setFinderInterests(e.target.value)}
                      placeholder="e.g., Fitness & Gym, Healthy Food, Apparel, EV Charging, Handicrafts"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Time & Risk Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">
                        Time Commitment
                      </label>
                      <select
                        value={finderTime}
                        onChange={(e) => setFinderTime(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                      >
                        <option>Full-Time (8+ hrs/day)</option>
                        <option>Part-Time / Side Hustle (3-4 hrs)</option>
                        <option>Weekend-Only Venture</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">
                        Risk Tolerance
                      </label>
                      <select
                        value={finderRisk}
                        onChange={(e) => setFinderRisk(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                      >
                        <option>Conservative (Low capital risk)</option>
                        <option>Moderate (Balanced)</option>
                        <option>High Growth (Aggressive scale)</option>
                      </select>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isFindingIdeas}
                    className="w-full mt-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold py-3 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
                  >
                    {isFindingIdeas ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Matching Viable Indian Ventures...</span>
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

              {/* Right Column: Matched Ideas Cards */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="font-bold text-slate-200 text-base flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>AI Recommended Business Ventures</span>
                  </h3>
                  <span className="text-xs text-slate-400">
                    {matchedIdeas ? `${matchedIdeas.length} Custom Matches` : "Awaiting your profile"}
                  </span>
                </div>

                {matchedIdeas && matchedIdeas.length > 0 ? (
                  <div className="space-y-4">
                    {matchedIdeas.map((idea, index) => (
                      <div
                        key={idea.id || index}
                        className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 transition shadow-xl space-y-4 relative overflow-hidden"
                      >
                        {/* Match Score Badge */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold px-2.5 py-1 rounded-full flex items-center space-x-1">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>{idea.matchScore}% Compatibility</span>
                            </span>
                          </div>
                          <span className="text-xs text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                            Est. {idea.monthlyPotential}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xl font-extrabold text-slate-100">{idea.title}</h4>
                          <p className="text-xs text-slate-400 mt-1">{idea.tagline}</p>
                        </div>

                        {/* Why this fits */}
                        <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80 text-xs text-slate-300">
                          <strong className="text-amber-400">Why it matches you: </strong>
                          {idea.whyFit}
                        </div>

                        {/* Metrics Bar */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                            <span className="text-[10px] text-slate-500 block">Est. CapEx Needed</span>
                            <span className="font-bold text-slate-200">{idea.estimatedCapex}</span>
                          </div>
                          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                            <span className="text-[10px] text-slate-500 block">Target Customer</span>
                            <span className="font-bold text-slate-200 truncate block">{idea.targetAudience}</span>
                          </div>
                          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
                            <span className="text-[10px] text-slate-500 block">Day 1 Action</span>
                            <span className="font-bold text-amber-300 truncate block">{idea.firstStep}</span>
                          </div>
                        </div>

                        {/* Action CTA: Push to Evaluator */}
                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => handleSelectIdeaForRoadmap(idea)}
                            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition"
                          >
                            <span>Build 15-Day Roadmap for this Idea</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-80 border border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center p-8 text-center text-slate-500">
                    <Lightbulb className="w-12 h-12 text-slate-700 mb-3" />
                    <p className="text-sm font-semibold text-slate-400">No Ideas Generated Yet</p>
                    <p className="text-xs max-w-sm mt-1">
                      Fill out your budget, location, and talents on the left and click "Generate Curated Business Ideas" to discover customized ventures.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PAGE / TAB: BUSINESS EVALUATOR & FEASIBILITY REPORT           */}
        {/* ============================================================== */}
        {activeTab === "evaluator" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <span>Evaluate Indian SME Idea</span>
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">
                    Evaluated against Indian tax slabs, state trade licenses, and Tier 1/2/3 market realities.
                  </p>
                </div>

                <form onSubmit={handleEvaluateIdea} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Business Concept / Niche
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="e.g. Quick-service Chai & Samosa drive-thru near tech park; or Eco-friendly corrugated packaging supplier."
                      value={businessIdea}
                      onChange={(e) => setBusinessIdea(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Target City / Market Tier
                    </label>
                    <input
                      type="text"
                      value={targetCity}
                      onChange={(e) => setTargetCity(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Planned Initial Capital (₹ INR)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-500 text-sm">₹</span>
                      <input
                        type="number"
                        required
                        value={initialCapital}
                        onChange={(e) => setInitialCapital(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Target Customer Segment
                    </label>
                    <input
                      type="text"
                      value={customerSegment}
                      onChange={(e) => setCustomerSegment(e.target.value)}
                      placeholder="e.g. Local Retailers, College Youth, High-income Families"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isAnalyzing}
                    className="w-full mt-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold py-3 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Analyzing Indian Market Dynamics...</span>
                      </>
                    ) : (
                      <>
                        <span>Generate SME Feasibility Report</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Feasibility Report Output */}
              <div className="lg:col-span-7">
                {analysisResult ? (
                  <div id="printable-report" className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
                    <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 gap-2">
                      <div>
                        <span className="text-xs uppercase tracking-wider font-semibold text-amber-500">
                          Comprehensive Feasibility Assessment
                        </span>
                        <h3 className="text-xl font-bold text-slate-100">
                          {businessIdea ? businessIdea.substring(0, 45) + "..." : "Executive Market Dossier"}
                        </h3>
                      </div>
                      <button
                        onClick={() => window.print()}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download / Print PDF</span>
                      </button>
                    </div>

                    {/* Scores & Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl text-center">
                        <span className="text-xs text-slate-400 block">Viability Score</span>
                        <span className="text-2xl font-black text-emerald-400">
                          {analysisResult.viabilityScore}/10
                        </span>
                      </div>
                      <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl text-center">
                        <span className="text-xs text-slate-400 block">Competition</span>
                        <span className="text-2xl font-black text-amber-400">
                          {analysisResult.competitionScore}/10
                        </span>
                      </div>
                      <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl text-center">
                        <span className="text-xs text-slate-400 block">Est. Margin</span>
                        <span className="text-xl font-bold text-sky-400 mt-1 block">
                          {analysisResult.estimatedMarginPercent}
                        </span>
                      </div>
                      <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl text-center">
                        <span className="text-xs text-slate-400 block">Break-Even</span>
                        <span className="text-sm font-bold text-indigo-400 mt-1 block">
                          {analysisResult.breakEvenMonths}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 text-sm text-slate-300 leading-relaxed">
                      <strong className="text-amber-400">Verdict: </strong>
                      {analysisResult.summary}
                    </div>

                    {/* CapEx vs OpEx */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                        <h4 className="font-bold text-slate-200 mb-2 flex items-center justify-between">
                          <span>Setup CapEx (Initial Setup)</span>
                          <span className="text-amber-400">One-time</span>
                        </h4>
                        <ul className="space-y-1.5 text-slate-400">
                          {analysisResult.capex?.map((c, i) => (
                            <li key={i} className="flex justify-between border-b border-slate-800/60 pb-1">
                              <span>{c.item}</span>
                              <span className="font-semibold text-slate-200">{c.cost}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                        <h4 className="font-bold text-slate-200 mb-2 flex items-center justify-between">
                          <span>Estimated OpEx (Monthly Run-rate)</span>
                          <span className="text-rose-400">Recurring</span>
                        </h4>
                        <ul className="space-y-1.5 text-slate-400">
                          {analysisResult.monthlyOpex?.map((o, i) => (
                            <li key={i} className="flex justify-between border-b border-slate-800/60 pb-1">
                              <span>{o.item}</span>
                              <span className="font-semibold text-slate-200">{o.cost}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Registrations */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        Indian Registrations & Compliance Required
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.licenses?.map((lic, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs px-2.5 py-1 rounded-lg flex items-center space-x-1"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1" />
                            {lic}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => setActiveTab("roadmap")}
                        className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
                      >
                        <span>View Interactive Milestone Roadmap</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full border border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center p-8 text-center text-slate-500 min-h-[400px]">
                    <Briefcase className="w-12 h-12 text-slate-700 mb-3" />
                    <p className="text-sm font-semibold text-slate-400">No Idea Evaluated Yet</p>
                    <p className="text-xs max-w-sm mt-1">
                      Choose an idea from the <strong>AI Idea Matcher</strong> tab or enter your own concept on the left to generate the complete viability report.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PAGE / TAB: GAMIFIED EXECUTION CHECKLIST                       */}
        {/* ============================================================== */}
        {activeTab === "roadmap" && (
          <div className="max-w-4xl mx-auto space-y-6">
            {showCelebration && (
              <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50 animate-bounce">
                <div className="bg-amber-500 text-slate-950 font-black px-6 py-3 rounded-2xl shadow-2xl text-xl flex items-center space-x-2">
                  <Award className="w-8 h-8" />
                  <span>Milestone Completed! Shabash! 🚀</span>
                </div>
              </div>
            )}

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
                    <CheckCircle2 className="w-6 h-6 text-amber-400" />
                    <span>Launch Roadmap & Milestone Tracker</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Execute your business sequentially from validation to soft launch.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-amber-400">{progressPercent}%</span>
                  <span className="text-xs text-slate-400 block">Completed</span>
                </div>
              </div>

              <div className="w-full bg-slate-950 h-3 rounded-full mt-6 overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="mt-8 space-y-3">
                {milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    onClick={() => toggleMilestone(milestone.id)}
                    className={`flex items-start space-x-4 p-4 rounded-2xl border transition cursor-pointer ${
                      milestone.completed
                        ? "bg-emerald-950/20 border-emerald-500/30 text-slate-400"
                        : "bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-200"
                    }`}
                  >
                    <button className="mt-0.5 focus:outline-none">
                      {milestone.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-600" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded ${
                            milestone.completed
                              ? "bg-emerald-900/40 text-emerald-300"
                              : "bg-slate-800 text-amber-400"
                          }`}
                        >
                          {milestone.day}
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            milestone.completed ? "line-through text-slate-500" : "text-slate-100"
                          }`}
                        >
                          {milestone.task}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PAGE / TAB: BUSINESS TOOLS & CALCULATORS                       */}
        {/* ============================================================== */}
        {activeTab === "tools" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Margin & Markup */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                  <Calculator className="w-5 h-5 text-amber-400" />
                  <span>Profit Margin & Markup Calculator</span>
                </h3>
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
                      <option value="5">5% (Essentials / Apparel &lt; 1k)</option>
                      <option value="12">12% (Food, Hardware)</option>
                      <option value="18">18% (Standard Goods/Services)</option>
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
                    <span className="text-[10px] text-slate-400 block">Net Margin %</span>
                    <span className="text-base font-bold text-amber-400">{netMarginPercent}%</span>
                  </div>
                </div>
              </div>

              {/* Break-Even Units */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <span>Break-Even Units Calculator</span>
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
                    <label className="text-slate-400 block mb-1">Selling Price / Unit (₹)</label>
                    <input
                      type="number"
                      value={unitRevenue}
                      onChange={(e) => setUnitRevenue(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Variable Cost / Unit (₹)</label>
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
                    <span className="text-xl font-black text-emerald-400">
                      {breakEvenUnitsNeeded} Units / Month
                    </span>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    Contribution:
                    <span className="text-slate-200 font-bold block text-sm">
                      ₹{unitContribution} / unit
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Cashflow & Expense Ledger */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                    <IndianRupee className="w-5 h-5 text-amber-400" />
                    <span>Daily Cashflow & Udhaar Ledger</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Keep a pulse on daily collections and vendor payouts.
                  </p>
                </div>
                <div className="flex items-center space-x-4 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800">
                  <div className="text-xs">
                    <span className="text-slate-400 block">Today's Net Cash</span>
                    <span
                      className={`text-base font-extrabold ${
                        netLedgerBalance >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      ₹{netLedgerBalance.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <input
                  type="text"
                  placeholder="Transaction details (e.g. UPI sales, vendor cash payment)"
                  value={ledgerDesc}
                  onChange={(e) => setLedgerDesc(e.target.value)}
                  className="sm:col-span-6 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
                <input
                  type="number"
                  placeholder="Amount (₹)"
                  value={ledgerAmount}
                  onChange={(e) => setLedgerAmount(e.target.value)}
                  className="sm:col-span-3 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
                <select
                  value={ledgerType}
                  onChange={(e) => setLedgerType(e.target.value)}
                  className="sm:col-span-2 bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-xs text-slate-200"
                >
                  <option value="in">Cash In (+)</option>
                  <option value="out">Cash Out (-)</option>
                </select>
                <button
                  onClick={() => {
                    if (!ledgerDesc || !ledgerAmount) return;
                    setLedgerEntries([
                      ...ledgerEntries,
                      {
                        id: Date.now(),
                        desc: ledgerDesc,
                        amount: Number(ledgerAmount),
                        type: ledgerType,
                        date: "Today"
                      }
                    ]);
                    setLedgerDesc("");
                    setLedgerAmount("");
                  }}
                  className="sm:col-span-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center justify-center p-2"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="divide-y divide-slate-800 max-h-56 overflow-y-auto">
                {ledgerEntries.map((entry) => (
                  <div key={entry.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          entry.type === "in" ? "bg-emerald-400" : "bg-rose-400"
                        }`}
                      />
                      <span className="text-slate-200 font-medium">{entry.desc}</span>
                      <span className="text-[10px] text-slate-500">({entry.date})</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`font-bold ${
                          entry.type === "in" ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {entry.type === "in" ? "+" : "-"}₹{Number(entry.amount).toLocaleString("en-IN")}
                      </span>
                      <button
                        onClick={() =>
                          setLedgerEntries(ledgerEntries.filter((e) => e.id !== entry.id))
                        }
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

        {/* ============================================================== */}
        {/* PAGE / TAB: WEEKLY MARKET INTELLIGENCE                         */}
        {/* ============================================================== */}
        {activeTab === "market" && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <span>Curated Weekly SME Market Intelligence & Strategy</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Practical insights on logistics rates, wholesale procurement shifts, and seasonal festive planning across India.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3">
                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  Logistics & Sourcing
                </span>
                <h3 className="font-bold text-slate-100 text-sm">
                  ONDC Expansion & Hyperlocal Delivery Subsidies
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Small grocery and D2C sellers can utilize open network partner integrations (Shiprocket, Shadowfax) for deliveries under ₹35 per order within 5km radius.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3">
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  Compliance Alert
                </span>
                <h3 className="font-bold text-slate-100 text-sm">
                  Quarterly GST QRMP Filing & Input Tax Credit
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Traders with aggregate turnover up to ₹5 Crore can opt for QRMP to file returns once a quarter while making simple self-assessment challan payments monthly.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3">
                <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  Festive Strategy
                </span>
                <h3 className="font-bold text-slate-100 text-sm">
                  Advance Packaging Inventory Buffer Hack
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Corrugated box and raw paper rates spike by 8-12% heading into major retail festive seasons. Procure customized packaging 45 days in advance from Tier-2 manufacturing clusters.
                </p>
              </div>
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
                <span className="font-bold text-xs text-slate-200">BizMentor AI (Indian SME Guide)</span>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                      msg.sender === "user"
                        ? "bg-amber-500 text-slate-950 font-medium"
                        : "bg-slate-800 text-slate-200 border border-slate-700/60"
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
                placeholder="Ask about GST, credit, wholesale..."
                value={inputChat}
                onChange={(e) => setInputChat(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleSendChat}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 p-2 rounded-xl"
              >
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
            <button
              onClick={() => setShowPaywallModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs px-3 py-1 rounded-full font-bold">
                BizNavigator Premium
              </span>
              <h3 className="text-2xl font-black text-slate-100">
                Free limit reached. Upgrade to Pro for unlimited evaluations & operational tools.
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-center space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-slate-400">Day Pass</span>
                  <div className="text-2xl font-extrabold text-slate-100 mt-1">₹49</div>
                  <span className="text-[10px] text-slate-500">24 Hours Full Access</span>
                </div>
                <button
                  onClick={() => triggerRazorpayCheckout("Day Pass (₹49)", 49)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-2 rounded-xl font-bold transition"
                >
                  Get Day Pass
                </button>
              </div>

              <div className="bg-slate-950 border-2 border-amber-500/80 p-4 rounded-2xl text-center space-y-2 relative flex flex-col justify-between shadow-lg shadow-amber-500/10">
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full">
                  POPULAR
                </span>
                <div>
                  <span className="text-xs text-amber-400 font-semibold">Monthly Pro</span>
                  <div className="text-2xl font-black text-slate-100 mt-1">₹249</div>
                  <span className="text-[10px] text-slate-400">Unlimited checks & 24/7 AI chat</span>
                </div>
                <button
                  onClick={() => triggerRazorpayCheckout("Monthly Pro (₹249)", 249)}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs py-2 rounded-xl font-bold transition"
                >
                  Subscribe
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-center space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-slate-400">3 Months Pro</span>
                  <div className="text-2xl font-extrabold text-slate-100 mt-1">₹599</div>
                  <span className="text-[10px] text-emerald-400">Save 20% Overall</span>
                </div>
                <button
                  onClick={() => triggerRazorpayCheckout("3 Months Pro (₹599)", 599)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-2 rounded-xl font-bold transition"
                >
                  Get Quarterly
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: API KEY SETUP */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 relative">
            <button
              onClick={() => setShowKeyModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Google Gemini API Key</span>
            </h3>
            <p className="text-xs text-slate-400">
              BizNavigator provides high-fidelity offline Indian market estimations out of the box. Connect your Gemini Flash API key for live real-time analysis.
            </p>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => {
                  setApiKey("");
                  localStorage.removeItem(`${STORAGE_PREFIX}gemini_key`);
                  setShowKeyModal(false);
                }}
                className="px-3 py-1.5 rounded-xl text-xs text-rose-400 hover:bg-rose-950/30"
              >
                Clear
              </button>
              <button
                onClick={() => {
                  localStorage.setItem(`${STORAGE_PREFIX}gemini_key`, apiKey);
                  setShowKeyModal(false);
                }}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-1.5 rounded-xl text-xs"
              >
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
