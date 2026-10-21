import React, { useState, useEffect, useRef } from "react";
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
  ShieldAlert,
  ArrowRight,
  Download,
  IndianRupee,
  HelpCircle,
  Trash2,
  Plus,
  RefreshCw,
  Send,
  Zap,
  Award,
  BookOpen,
  X
} from "lucide-react";

// --- CONFIGURATION CONSTANTS ---
const FREE_USAGE_LIMIT = 3;
const PRO_DAILY_LIMIT = 50;
const STORAGE_PREFIX = "biznavigator_";

export default function BizNavigatorApp() {
  // Navigation State
  const [activeTab, setActiveTab] = useState("evaluator"); // 'evaluator', 'roadmap', 'tools', 'market', 'chat'

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

  // Evaluator Form State
  const [businessIdea, setBusinessIdea] = useState("");
  const [targetCity, setTargetCity] = useState("Tier 2 (e.g., Jaipur, Indore, Surat)");
  const [initialCapital, setInitialCapital] = useState("250000");
  const [customerSegment, setCustomerSegment] = useState("B2C College Students & Young Professionals");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(() => {
    const cached = localStorage.getItem(`${STORAGE_PREFIX}last_analysis`);
    return cached ? JSON.parse(cached) : null;
  });

  // Roadmap State
  const [milestones, setMilestones] = useState(() => {
    const cached = localStorage.getItem(`${STORAGE_PREFIX}milestones`);
    return cached
      ? JSON.parse(cached)
      : [
          { id: "m1", day: "Day 1-2", task: "Conduct local market survey & competitor price audit", completed: true },
          { id: "m2", day: "Day 3-5", task: "Source 3 potential wholesale vendors (Indiamart/Local Mandi)", completed: false },
          { id: "m3", day: "Day 6-7", task: "Finalize custom eco-friendly packaging & sample batches", completed: false },
          { id: "m4", day: "Day 8-9", task: "Apply for MSME Udyam Registration & GST portal check", completed: false },
          { id: "m5", day: "Day 10+", task: "Launch WhatsApp Business Catalog and localized Instagram Ads", completed: false }
        ];
  });
  const [showCelebration, setShowCelebration] = useState(false);

  // Utility Suites State (Tools)
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

  // BizMentor Chat State
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

  // Contextual Reminders System
  useEffect(() => {
    const pending = milestones.find((m) => !m.completed);
    if (pending) {
      setNotificationNudge(`Pending Priority: "${pending.day} - ${pending.task}"`);
    } else {
      setNotificationNudge("All active milestone roadmap tasks are up to date! Great work.");
    }
  }, [milestones]);

  // Request Desktop Notification Permission
  const requestNotificationAlerts = () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notifications.");
      return;
    }
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification("BizNavigator Reminders Enabled! 🇮🇳", {
          body: "You will receive timely operational and compliance check alerts here.",
          icon: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
        });
      }
    });
  };

  // --- GEMINI API CALL FOR BUSINESS EVALUATOR ---
  const handleEvaluateIdea = async (e) => {
    e.preventDefault();

    // Check Usage Limits
    if (!isPro && evaluationsCount >= FREE_USAGE_LIMIT) {
      setShowPaywallModal(true);
      return;
    }
    if (isPro && proDailyCount >= PRO_DAILY_LIMIT) {
      alert("Daily Pro safety limit (50 checks/day) reached. Quota resets in 24 hours.");
      return;
    }

    setIsAnalyzing(true);

    const systemPrompt = `You are BizNavigator, an elite Indian SME & Startup Investment Strategist.
Evaluate the business idea with hyper-realistic Indian market realities (consider Tier-1/2/3 local consumer dynamics, Indian regulations like GST & MSME Udyam, local supply chains, and realistic margins).

Business Idea: ${businessIdea}
Location: ${targetCity}
Initial Budget: ₹${initialCapital}
Target Customer: ${customerSegment}

Return ONLY valid JSON without markdown fences matching this exact schema:
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
  "licenses": ["GST Registration (if > ₹40L turnover)", "MSME Udyam Registration (Free)", "Local Municipal Trade License", "FSSAI (Food Category)"],
  "actionPlan": [
    {"day": "Day 1-3", "task": "Validate demand with 30 target customers via sample surveys"},
    {"day": "Day 4-7", "task": "Identify suppliers in wholesale markets & check credit periods"},
    {"day": "Day 8-10", "task": "Apply for MSME Udyam Certificate & Open Current Bank Account"},
    {"day": "Day 11-15", "task": "Set up packaging, test UPI QR payments, and soft launch"}
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
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
        resultData = JSON.parse(textResponse);
      } else {
        // Fallback intelligent simulator for Indian Market if API Key not entered
        await new Promise((resolve) => setTimeout(resolve, 1400));
        resultData = {
          viabilityScore: 8.2,
          competitionScore: 6.8,
          summary: `High domestic demand in ${targetCity}. Given your budget of ₹${parseInt(initialCapital).toLocaleString("en-IN")}, focus on lean digital-first distribution and WhatsApp catalog commerce before heavy physical retail commitments.`,
          estimatedMarginPercent: "30% - 42%",
          breakEvenMonths: "5 to 7 Months",
          capex: [
            { item: "Machinery / Display / Equipment", cost: `₹${(initialCapital * 0.35).toFixed(0)}` },
            { item: "Opening Stock & Packaging", cost: `₹${(initialCapital * 0.40).toFixed(0)}` },
            { item: "Signage, Branding & Tech", cost: `₹${(initialCapital * 0.15).toFixed(0)}` }
          ],
          monthlyOpex: [
            { item: "Space Rent / Storage", cost: "₹15,000 - ₹25,000" },
            { item: "Local Ads & Influencer Barter", cost: "₹8,000 - ₹12,000" },
            { item: "Utilities, Delivery & Payment Gateway Fees", cost: "₹9,000" }
          ],
          licenses: [
            "MSME Udyam Registration (Crucial for priority bank loans)",
            "GSTIN Registration (Voluntary or mandatory if interstate)",
            "Municipal Trade License / Shop & Establishment Act",
            businessIdea.toLowerCase().includes("food") || businessIdea.toLowerCase().includes("cafe")
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

      // Auto update active milestones
      const generatedMilestones = resultData.actionPlan.map((item, idx) => ({
        id: `gen_${Date.now()}_${idx}`,
        day: item.day,
        task: item.task,
        completed: false
      }));
      setMilestones(generatedMilestones);

      // Increment Usage
      if (isPro) {
        setProDailyCount((prev) => prev + 1);
      } else {
        setEvaluationsCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to analyze idea. Please ensure valid inputs or check Gemini API key.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Milestone toggling with celebration
  const toggleMilestone = (id) => {
    const updated = milestones.map((m) => {
      if (m.id === id) {
        const nextState = !m.completed;
        if (nextState) {
          triggerCelebration();
        }
        return { ...m, completed: nextState };
      }
      return m;
    });
    setMilestones(updated);
  };

  const triggerCelebration = () => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  };

  // --- BIZMENTOR CHAT GEMINI HANDLER ---
  const handleSendChat = async () => {
    if (!inputChat.trim()) return;

    const userText = inputChat;
    setInputChat("");
    setChatMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setIsChatLoading(true);

    try {
      if (apiKey) {
        const prompt = `You are "BizMentor AI", an experienced Indian SME business advisor. Give short, direct, actionable, practical advice for an Indian small business owner. Address cultural and legal realities like handling polite udhaar recovery without losing customers, negotiating margins, GST input tax credit, local logistics (Delhivery/Shiprocket), or festive sales. Question: ${userText}`;
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }]
            })
          }
        );
        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I am analyzing this market condition.";
        setChatMessages((prev) => [...prev, { sender: "mentor", text: reply }]);
      } else {
        // Fallback intelligent response library
        await new Promise((res) => setTimeout(res, 900));
        let simulatedReply = "Always maintain a polite yet strict credit period (Udhaar) ledger. Introduce a 2% immediate UPI cash discount to disincentivize credit requests.";
        if (userText.toLowerCase().includes("udhaar") || userText.toLowerCase().includes("credit")) {
          simulatedReply = "To collect pending Udhaar diplomatically: Send an automated friendly WhatsApp reminder citing audit/GST reconciliation: 'Namaste Ji, our monthly account audit closes this weekend. Kindly clear your balance of ₹X so we can ensure uninterrupted delivery next week.'";
        } else if (userText.toLowerCase().includes("gst") || userText.toLowerCase().includes("tax")) {
          simulatedReply = "For turnover under ₹40 Lakhs (Goods) or ₹20 Lakhs (Services), GST is optional unless selling interstate via Amazon/Flipkart. If you have high B2B expenses, register to claim Input Tax Credit (ITC) on all purchase bills.";
        }
        setChatMessages((prev) => [...prev, { sender: "mentor", text: simulatedReply }]);
      }
    } catch (e) {
      setChatMessages((prev) => [
        ...prev,
        { sender: "mentor", text: "Notice: Unable to reach Gemini server. Please check your internet or API key." }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // --- RAZORPAY PAYMENT MOCK / INTEGRATION ---
  const triggerRazorpayCheckout = (planName, amount) => {
    // Razorpay standard client script trigger or fallback simulation
    const options = {
      key: "rzp_test_YourMockKeyHere",
      amount: amount * 100,
      currency: "INR",
      name: "BizNavigator Pro",
      description: `Upgrade: ${planName}`,
      handler: function (response) {
        setIsPro(true);
        setShowPaywallModal(false);
        alert(`Payment successful! Welcome to BizNavigator Pro. Payment ID: ${response.razorpay_payment_id || "TXN_OK"}`);
      },
      prefill: {
        name: "Indian Entrepreneur",
        email: "business@sme.in",
        contact: "9876543210"
      },
      theme: {
        color: "#2563eb"
      }
    };

    if (window.Razorpay) {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      // Direct mock unlock for immediate frictionless testing
      const confirmMock = window.confirm(
        `Razorpay Gateway Simulator:\nProceed with ₹${amount} for ${planName} via UPI / Netbanking / Cards?`
      );
      if (confirmMock) {
        setIsPro(true);
        setShowPaywallModal(false);
        alert("Transaction confirmed! Pro Access Activated. Enjoy 50 daily evaluations, PDF downloads & 24/7 BizMentor.");
      }
    }
  };

  // Calculated Milestone Progress
  const completedMilestones = milestones.filter((m) => m.completed).length;
  const progressPercent = milestones.length > 0 ? Math.round((completedMilestones / milestones.length) * 100) : 0;

  // Ledger Balance
  const totalIn = ledgerEntries.filter((e) => e.type === "in").reduce((sum, item) => sum + Number(item.amount), 0);
  const totalOut = ledgerEntries.filter((e) => e.type === "out").reduce((sum, item) => sum + Number(item.amount), 0);
  const netLedgerBalance = totalIn - totalOut;

  // Margin Calculator Computations
  const totalUnitCost = Number(costPrice) + Number(shippingCost);
  const gstDeduction = (Number(sellingPrice) * (Number(gstPercent) / (100 + Number(gstPercent))));
  const revenueExclGst = Number(sellingPrice) - gstDeduction;
  const netProfitUnit = revenueExclGst - totalUnitCost;
  const netMarginPercent = sellingPrice > 0 ? ((netProfitUnit / Number(sellingPrice)) * 100).toFixed(1) : 0;
  const markupPercent = totalUnitCost > 0 ? ((netProfitUnit / totalUnitCost) * 100).toFixed(1) : 0;

  // Break-even Unit Calculation
  const unitContribution = Number(unitRevenue) - Number(unitVariableCost);
  const breakEvenUnitsNeeded = unitContribution > 0 ? Math.ceil(Number(monthlyOverhead) / unitContribution) : "N/A";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Banner / Usage Status */}
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
            {/* Free vs Pro Badge */}
            {isPro ? (
              <div className="flex items-center space-x-1.5 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1.5 rounded-full text-emerald-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pro Member ({proDailyCount}/{PRO_DAILY_LIMIT} Daily)</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">
                  Free checks: <strong className="text-amber-400">{evaluationsCount}/{FREE_USAGE_LIMIT}</strong>
                </span>
                <button
                  onClick={() => setShowPaywallModal(true)}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center shadow-md transition"
                >
                  <Zap className="w-3.5 h-3.5 mr-1" /> Upgrade
                </button>
              </div>
            )}

            {/* Notification Alert Trigger */}
            <button
              onClick={requestNotificationAlerts}
              title="Enable Desktop Notifications"
              className="p-2 rounded-lg
