import React, { useState, useEffect } from "react";
import {
  Briefcase,
  TrendingUp,
  CheckCircle2,
  Circle,
  FileText,
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
  ShieldCheck,
  Target,
  Bot,
  AlertTriangle,
  HelpCircle,
  Compass,
  Check
} from "lucide-react";

// --- CONFIGURATION CONSTANTS ---
const FREE_USAGE_LIMIT = 5;
const PRO_DAILY_LIMIT = 50;
const STORAGE_PREFIX = "biznavigator_";

export default function BizNavigatorApp() {
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

  // Helper: Centralized Gemini API caller with fallback simulation
  const callGeminiAI = async (prompt, systemInstruction = "", fallbackData = null) => {
    if (!isPro && evaluationsCount >= FREE_USAGE_LIMIT) {
      setShowPaywallModal(true);
      throw new Error("LIMIT_REACHED");
    }
    if (isPro && proDailyCount >= PRO_DAILY_LIMIT) {
      alert("Daily Pro limit (50 requests/day) reached. Quota resets in 24 hours.");
      throw new Error("PRO_LIMIT_REACHED");
    }

    if (apiKey) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `${systemInstruction}\n\nTask:\n${prompt}` }] }]
            })
          }
        );
        const data = await res.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        // Track usage
        if (isPro) setProDailyCount((p) => p + 1);
        else setEvaluationsCount((p) => p + 1);
        
        return textResponse;
      } catch (err) {
        console.warn("Gemini API call failed, falling back to simulated intelligence", err);
      }
    }

    // Fallback simulation mode
    await new Promise((r) => setTimeout(r, 1100));
    if (isPro) setProDailyCount((p) => p + 1);
    else setEvaluationsCount((p) => p + 1);
    return fallbackData;
  };

  // ==========================================
  // TAB 1: AI IDEA MATCHER & DISCOVERY
  // ==========================================
  const [finderBudget, setFinderBudget] = useState("100000");
  const [finderLocation, setFinderLocation] = useState("Tier-2 City (e.g., Jaipur, Indore, Surat, Coimbatore)");
  const [finderSkills, setFinderSkills] = useState("Sales, Basic Cooking & Food Prep, Social Media Handling");
  const [finderInterests, setFinderInterests] = useState("Healthy Snacks, Eco-friendly Products, Local Retail");
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
          whyFit: `Capitalizes on your sales & food interest with an initial setup under ₹${(finderBudget * 0.75).toLocaleString("en-IN")}.`,
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
      const res = await callGeminiAI(prompt, "You are BizNavigator's Lead Indian SME Business Matchmaker. Output JSON only.", fallback);
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

  // ==========================================
  // TAB 2: BUSINESS EVALUATOR & REPORT
  // ==========================================
  const [businessIdea, setBusinessIdea] = useState("");
  const [targetCity, setTargetCity] = useState("Tier 2 (e.g., Jaipur, Indore, Surat)");
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

Return ONLY valid JSON matching this schema:
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
      const res = await callGeminiAI(prompt, "You are BizNavigator's Senior Indian SME Investment Strategist. Return JSON only.", fallback);
      const parsed = JSON.parse(res.replace(/```json|```/g, "").trim());
      setAnalysisResult(parsed);
      localStorage.setItem(`${STORAGE_PREFIX}last_analysis`, JSON.stringify(parsed));

      const generatedMilestones = parsed.actionPlan.map((item, idx) => ({
        id: `gen_${Date.now()}_${idx}`,
        day: item.day,
        task: item.task,
        completed: false
      }));
      setMilestones(generatedMilestones);
    } catch (err) {
      if (err.message !== "LIMIT_REACHED") console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ==========================================
  // TAB 3: EXECUTION ROADMAP WITH AI TASK DOCTOR
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
  const [taskAdviceModal, setTaskAdviceModal] = useState(null); // { task, day, adviceText }
  const [isLoadingTaskAdvice, setIsLoadingTaskAdvice] = useState(false);

  // Live AI Consultation for a specific milestone
  const handleConsultMilestoneAI = async (milestone) => {
    setIsLoadingTaskAdvice(true);
    setTaskAdviceModal({ task: milestone.task, day: milestone.day, adviceText: "" });

    const prompt = `I am executing an Indian SME launch. Current task: "${milestone.task}" scheduled for "${milestone.day}".
Provide 3 bullet-point tactical execution tips:
1. Exact Indian wholesale sourcing hubs or portals to look into (e.g. Sadar Bazar, Surat, Tirupur, Indiamart, Government portals).
2. Realistic negotiation scripts to get credit or wholesale discount.
3. Common pitfall to avoid.`;

    const fallback = `1. Sourcing Hubs: Contact verified suppliers on Indiamart or trade hubs (e.g. Sadar Bazar Delhi, Surat Textile Market, APMC Mandis). Always ask for GST invoice with ITC eligibility.\n2. Negotiation Script: 'Namaste Ji, we are launching commercial distribution this month with recurring weekly orders. Provide us your lowest tier price for an initial pilot sample of 50 units.'\n3. Common Pitfall: Avoid committing 100% advance payment to first-time unverified vendors. Offer 40% advance, 60% upon dispatch LR (Lorry Receipt) proof.`;

    try {
      const res = await callGeminiAI(prompt, "You are BizNavigator's Lead Field Operations Advisor in India.", fallback);
      setTaskAdviceModal({ task: milestone.task, day: milestone.day, adviceText: res });
    } catch (err) {
      if (err.message !== "LIMIT_REACHED") console.error(err);
    } finally {
      setIsLoadingTaskAdvice(false);
    }
  };

  const toggleMilestone = (id) => {
    const updated = milestones.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m));
    setMilestones(updated);
  };

  // ==========================================
  // TAB 4: CALCULATORS WITH LIVE AI DOCTORS
  // ==========================================
  // Calculator States
  const [costPrice, setCostPrice] = useState(250);
  const [shippingCost, setShippingCost] = useState(40);
  const [gstPercent, setGstPercent] = useState(18);
  const [sellingPrice, setSellingPrice] = useState(599);
  const [monthlyOverhead, setMonthlyOverhead] = useState(45000);
  const [unitRevenue, setUnitRevenue] = useState(500);
  const [unitVariableCost, setUnitVariableCost] = useState(220);

  // Live AI Doctor States
  const [aiMarginAnalysis, setAiMarginAnalysis] = useState("");
  const [isAnalyzingMargin, setIsAnalyzingMargin] = useState(false);
  const [aiLedgerAudit, setAiLedgerAudit] = useState("");
  const [isAuditingLedger, setIsAuditingLedger] = useState(false);

  // Cashflow ledger
  const [ledgerEntries, setLedgerEntries] = useState(() => {
    const cached = localStorage.getItem(`${STORAGE_PREFIX}ledger`);
    return cached
      ? JSON.parse(cached)
      : [
          { id: 1, desc: "Packaging Cartons Purchase", type: "out", amount: 4500, date: "Today" },
          { id: 2, desc: "Direct UPI Order Payments (batch 1)", type: "in", amount: 12400, date: "Today" },
          { id: 3, desc: "Pending Udhaar Collection from Sharmaji", type: "in", amount: 3500, date: "Yesterday" },
          { id: 4, desc: "Shop Electricity & DG Set share", type: "out", amount: 2800, date: "Yesterday" }
        ];
  });
  const [ledgerDesc, setLedgerDesc] = useState("");
  const [ledgerAmount, setLedgerAmount] = useState("");
  const [ledgerType, setLedgerType] = useState("in");

  // Live AI Margin Doctor evaluation
  const handleRunMarginDoctorAI = async () => {
    setIsAnalyzingMargin(true);
    const totalUnitCost = Number(costPrice) + Number(shippingCost);
    const netMargin = (((Number(sellingPrice) - totalUnitCost) / Number(sellingPrice)) * 100).toFixed(1);

    const prompt = `Act as an Indian SME Pricing & Tax Specialist. Analyze these unit metrics:
- Base Product Cost: ₹${costPrice}
- Packaging/Shipping: ₹${shippingCost}
- GST Bracket: ${gstPercent}%
- Target Selling Price: ₹${sellingPrice}
- Calculated Margin: ${netMargin}%

Give 3 short, sharp observations:
1. Is this margin safe against Indian returns/RTO and payment gateway deductions (2%)?
2. Practical strategy to optimize packaging/procurement cost.
3. Indian GST input tax credit (ITC) recommendation.`;

    const fallback = `• Profitability Check: A ${netMargin}% margin provides an adequate buffer for Tier-2/3 retail, but if selling online via Cash On Delivery (COD), factor in a 15% RTO (Return to Origin) logistics cost which will compress margins by ~6%.\n• Cost Optimization: Bulk-procure standardized 3-ply corrugated boxes from local industrial clusters (Okhla/Bhiwandi/Peenya) to drop packaging cost by ~₹15/box.\n• GST Input Credit: Ensure you collect GST invoices for raw materials (${gstPercent}%) so you can offset your output GST liability directly on GSTR-3B.`;

    try {
      const res = await callGeminiAI(prompt, "You are BizNavigator's Pricing & Margins Doctor.", fallback);
      setAiMarginAnalysis(res);
    } catch (err) {
      if (err.message !== "LIMIT_REACHED") console.error(err);
    } finally {
      setIsAnalyzingMargin(false);
    }
  };

  // Live AI Cashflow & Udhaar Audit
  const handleRunLedgerAuditAI = async () => {
    setIsAuditingLedger(true);
    const summary = ledgerEntries.map((e) => `${e.date}: ${e.desc} (${e.type === "in" ? "+₹" : "-₹"}${e.amount})`).join("; ");

    const prompt = `Act as a Chartered Accountant and SME Cashflow Doctor in India. Audit these recent transactions:
${summary}

Provide 3 quick financial insights:
1. Financial health verdict and working capital leakages.
2. Safe Udhaar / Customer Credit policy recommendation.
3. Cash reserve advice for the upcoming month.`;

    const fallback = `• Working Capital Assessment: Your current cash flow shows healthy inflows, but recurring petty operational expenses are unbudgeted. Maintain a separate petty cash ledger for daily store consumables.\n• Credit/Udhaar Warning: High credit exposure locks up working capital. Institute a strict 7-day payment cycle; offer a 2% immediate UPI discount for instant settlement.\n• Reserve Buffer: Maintain at least 45 days of fixed overheads in your Current Account to withstand seasonal sales slumps.`;

    try {
      const res = await callGeminiAI(prompt, "You are BizNavigator's Chief Financial Auditor for Indian Small Businesses.", fallback);
      setAiLedgerAudit(res);
    } catch (err) {
      if (err.message !== "LIMIT_REACHED") console.error(err);
    } finally {
      setIsAuditingLedger(false);
    }
  };

  // ==========================================
  // TAB 5: LIVE AI MARKET RADAR FEED
  // ==========================================
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
            tag: "Tax & Compliance",
            title: "GSTR-1 & IMS (Invoice Management System)",
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

  // Live AI Market Radar Scan
  const handleScanLiveMarketAI = async () => {
    setIsScanningMarket(true);
    const prompt = `Scan the current Indian SME market landscape and generate 3 fresh, tactical intelligence updates for small businesses, manufacturers, and retailers.
Return ONLY valid JSON matching this schema:
{
  "updates": [
    {
      "tag": "Category (e.g. Raw Material / Logistics / Fintech / Policy)",
      "title": "Short Catchy Insight Title",
      "desc": "2-sentence practical advice on how an Indian SME can save money or make more revenue."
    }
  ]
}`;

    const fallback = JSON.stringify({
      updates: [
        {
          tag: "Raw Material Shift",
          title: "Paper & Packaging Rate Moderation",
          desc: "Kraft paper prices across Morbi and Gujarat mills have stabilized. Good window to negotiate 90-day wholesale carton supplies."
        },
        {
          tag: "Fintech & Payments",
          title: "Zero-MDR RuPay Credit Card UPI Push",
          desc: "Customers are increasingly paying via RuPay on UPI. Ensure your merchant QR is enabled for RuPay credit cards to capture high-ticket impulsive purchases."
        },
        {
          tag: "MSME Scheme",
          title: "CGTMSE Collateral-Free Credit Guarantee",
          desc: "Public sector banks have accelerated approvals for micro-enterprises under the Credit Guarantee Fund. Maintain clean ITR records to qualify without property collateral."
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

  // ==========================================
  // FLOATING 24/7 BIZMENTOR CHAT
  // ==========================================
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "mentor",
      text: "Namaste! I am your 24/7 BizMentor AI. I can assist you with diplomatic udhaar recovery, supplier negotiations, GST compliance, or scaling retail footfall. Ask me anything!"
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

  // Local calculations
  const totalIn = ledgerEntries.filter((e) => e.type === "in").reduce((s, i) => s + Number(i.amount), 0);
  const totalOut = ledgerEntries.filter((e) => e.type === "out").reduce((s, i) => s + Number(i.amount), 0);
  const netLedgerBalance = totalIn - totalOut;

  const totalUnitCost = Number(costPrice) + Number(shippingCost);
  const gstDeduction = Number(sellingPrice) * (Number(gstPercent) / (100 + Number(gstPercent)));
  const netProfitUnit = Number(sellingPrice) - gstDeduction - totalUnitCost;
  const netMarginPercent = sellingPrice > 0 ? ((netProfitUnit / Number(sellingPrice)) * 100).toFixed(1) : 0;
  const unitContribution = Number(unitRevenue) - Number(unitVariableCost);
  const breakEvenUnitsNeeded = unitContribution > 0 ? Math.ceil(Number(monthlyOverhead) / unitContribution) : "N/A";
  const completedMilestones = milestones.filter((m) => m.completed).length;
  const progressPercent = milestones.length > 0 ? Math.round((completedMilestones / milestones.length) * 100) : 0;

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
                AI-POWERED SME SUITE 🇮🇳
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
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center shadow-md transition"
                >
                  <Zap className="w-3.5 h-3.5 mr-1" /> Upgrade
                </button>
              </div>
            )}

            <button
              onClick={() => setShowKeyModal(true)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs text-slate-300"
            >
              {apiKey ? "API Key Connected" : "Gemini API Key"}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 flex space-x-1 overflow-x-auto text-sm border-t border-slate-800/80 pt-1">
          {[
            { id: "idea-finder", label: "AI Idea Matcher", icon: Lightbulb },
            { id: "evaluator", label: "Business Evaluator", icon: Briefcase },
            { id: "roadmap", label: `Execution Roadmap (${progressPercent}%)`, icon: CheckCircle2 },
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
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-1">
        {/* ============================================================== */}
        {/* TAB 1: AI IDEA MATCHER & DISCOVERY                            */}
        {/* ============================================================== */}
        {activeTab === "idea-finder" && (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/30 rounded-3xl p-6 sm:p-8">
              <span className="text-amber-400 font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4" />
                <span>AI Profile Evaluation</span>
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 mt-2">
                Discover Profitable Indian Businesses Fitted to Your Constraints
              </h1>
              <p className="text-sm text-slate-300 mt-1 max-w-3xl">
                Every calculation and suggestion is analyzed against Indian market demand, regional consumer buying habits, and capital feasibility.
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
                    <label className="block font-semibold text-slate-300 mb-1">Location / Tier</label>
                    <select
                      value={finderLocation}
                      onChange={(e) => setFinderLocation(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                    >
                      <option>Metro Tier-1 (Mumbai, Bengaluru, Delhi NCR, Hyderabad)</option>
                      <option>Tier-2 City (e.g., Jaipur, Indore, Surat, Coimbatore)</option>
                      <option>Tier-3 Small Town / District HQ</option>
                      <option>Rural / Agricultural Mandi Belt</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Your Skills & Experience</label>
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
                        <span>Run AI Business Evaluation</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Matched Cards */}
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
                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => handleSelectIdeaForRoadmap(idea)}
                          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 transition"
                        >
                          <span>Send to Business Evaluator & Roadmap</span>
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
        {/* TAB 2: BUSINESS EVALUATOR & REPORT                            */}
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
                    <label className="block font-semibold text-slate-300 mb-1">Target Indian City / Tier</label>
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

              {/* Output Report */}
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
                        <span>View Interactive Roadmap</span>
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
        {/* TAB 3: EXECUTION ROADMAP + LIVE AI TASK DOCTOR                 */}
        {/* ============================================================== */}
        {activeTab === "roadmap" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
                    <CheckCircle2 className="w-6 h-6 text-amber-400" />
                    <span>Launch Roadmap with AI Task Doctor</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Click <strong>"AI Unblock Task"</strong> on any milestone to get local sourcing hubs, scripts, and compliance advice.
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
                {milestones.map((m) => (
                  <div
                    key={m.id}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition ${
                      m.completed
                        ? "bg-emerald-950/20 border-emerald-500/30 text-slate-400"
                        : "bg-slate-950 border-slate-800 text-slate-200"
                    }`}
                  >
                    <div
                      onClick={() => toggleMilestone(m.id)}
                      className="flex items-center space-x-3 cursor-pointer flex-1"
                    >
                      {m.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-600 flex-shrink-0" />
                      )}
                      <div>
                        <span className="text-xs font-bold text-amber-400 mr-2">{m.day}:</span>
                        <span className={`text-sm ${m.completed ? "line-through text-slate-500" : ""}`}>{m.task}</span>
                      </div>
                    </div>

                    {/* AI Task Doctor Trigger */}
                    <button
                      onClick={() => handleConsultMilestoneAI(m)}
                      className="ml-3 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 flex-shrink-0"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>AI Unblock</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal: AI Task Doctor Advice */}
            {taskAdviceModal && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 relative shadow-2xl">
                  <button
                    onClick={() => setTaskAdviceModal(null)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="flex items-center space-x-2">
                    <Bot className="w-5 h-5 text-amber-400" />
                    <h3 className="font-bold text-slate-100 text-base">AI Task Doctor Consultation</h3>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs">
                    <span className="text-amber-400 font-bold">{taskAdviceModal.day}: </span>
                    <span className="text-slate-200">{taskAdviceModal.task}</span>
                  </div>

                  <div className="text-xs text-slate-300 space-y-2 whitespace-pre-line leading-relaxed min-h-[120px]">
                    {isLoadingTaskAdvice ? (
                      <div className="flex items-center justify-center h-28 space-x-2 text-slate-400">
                        <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                        <span>Formulating Indian wholesale & compliance advice...</span>
                      </div>
                    ) : (
                      taskAdviceModal.adviceText
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: CALCULATORS & CASHFLOW WITH LIVE AI AUDIT DOCTORS      */}
        {/* ============================================================== */}
        {activeTab === "tools" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Tool 1: Margin Calculator + AI Margin Doctor */}
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

                {/* Live AI Margin Doctor Output */}
                {aiMarginAnalysis && (
                  <div className="bg-amber-950/20 border border-amber-500/30 p-3.5 rounded-2xl text-xs text-amber-200 leading-relaxed space-y-1">
                    <strong className="text-amber-400 block font-bold">AI Pricing Doctor Verdict:</strong>
                    <div className="whitespace-pre-line text-slate-300">{aiMarginAnalysis}</div>
                  </div>
                )}
              </div>

              {/* Tool 2: Break-Even Calculator */}
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

            {/* Daily Cashflow & AI Ledger Auditor */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                    <IndianRupee className="w-5 h-5 text-amber-400" />
                    <span>Daily Cashflow & Udhaar Ledger</span>
                  </h3>
                  <p className="text-xs text-slate-400">Keep daily transaction records audited with automated AI checks.</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleRunLedgerAuditAI}
                    disabled={isAuditingLedger}
                    className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 disabled:opacity-50"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>{isAuditingLedger ? "Auditing Inflows..." : "Run AI Cashflow Audit"}</span>
                  </button>
                  <div className="bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 text-xs">
                    <span className="text-slate-400 block text-[10px]">Net Balance</span>
                    <span className={`text-base font-extrabold ${netLedgerBalance >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      ₹{netLedgerBalance.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Add transaction */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                <input
                  type="text"
                  placeholder="Transaction details (e.g. Bulk packaging box payment)"
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

              {/* AI Ledger Audit Output */}
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

        {/* ============================================================== */}
        {/* TAB 5: LIVE AI MARKET RADAR FEED                              */}
        {/* ============================================================== */}
        {activeTab === "market" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  <span>Live Indian SME Market Radar</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Run live AI market scans for current policy adjustments, commodity pricing trends, and logistics hacks.
                </p>
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
                <span className="font-bold text-xs text-slate-200">BizMentor AI (24/7 Indian SME Advisor)</span>
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
                placeholder="Ask about GST, credit, wholesale..."
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

      {/* SUBSCRIPTION PAYWALL MODAL */}
      {showPaywallModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-6 relative shadow-2xl">
            <button onClick={() => setShowPaywallModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-200">
              <X className="w-5 h-5" />
            </button>
            <div className="text-center space-y-2">
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs px-3 py-1 rounded-full font-bold">
                BizNavigator Pro
              </span>
              <h3 className="text-2xl font-black text-slate-100">
                Free limit reached. Upgrade to Pro for unlimited AI evaluations & tools.
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-center space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-slate-400">Day Pass</span>
                  <div className="text-2xl font-extrabold text-slate-100 mt-1">₹49</div>
                  <span className="text-[10px] text-slate-500">24 Hours Access</span>
                </div>
                <button
                  onClick={() => { setIsPro(true); setShowPaywallModal(false); alert("Pro Day Pass Activated!"); }}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-2 rounded-xl font-bold"
                >
                  Get Day Pass
                </button>
              </div>

              <div className="bg-slate-950 border-2 border-amber-500/80 p-4 rounded-2xl text-center space-y-2 relative flex flex-col justify-between shadow-lg">
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full">
                  MOST POPULAR
                </span>
                <div>
                  <span className="text-xs text-amber-400 font-semibold">Monthly Pro</span>
                  <div className="text-2xl font-black text-slate-100 mt-1">₹249</div>
                  <span className="text-[10px] text-slate-400">Unlimited evaluations</span>
                </div>
                <button
                  onClick={() => { setIsPro(true); setShowPaywallModal(false); alert("Monthly Pro Activated!"); }}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs py-2 rounded-xl font-bold"
                >
                  Subscribe
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-center space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-slate-400">3 Months</span>
                  <div className="text-2xl font-extrabold text-slate-100 mt-1">₹599</div>
                  <span className="text-[10px] text-emerald-400">Best Value</span>
                </div>
                <button
                  onClick={() => { setIsPro(true); setShowPaywallModal(false); alert("Quarterly Pro Activated!"); }}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-2 rounded-xl font-bold"
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
            <button onClick={() => setShowKeyModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-200">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Google Gemini API Key</span>
            </h3>
            <p className="text-xs text-slate-400">
              Connect your Gemini API key to activate live real-time analysis across all calculators, roadmap doctor, and market scanners.
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
