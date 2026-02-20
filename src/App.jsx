import React, { useState, useMemo, useCallback, useEffect, useRef, createContext, useContext } from "react";
import { 
  ArrowLeft, ArrowRight, Rocket, BarChart3, PieChart, FileText, 
  TrendingUp, TrendingDown, AlertCircle, CheckCircle, RefreshCw, 
  Building2, Wallet, Users, LayoutDashboard, BrainCircuit, Search,
  Server, Sliders, Printer, Download, ChevronRight, X,
  History, ShieldAlert, Award, Edit2, Save, Globe, Megaphone,
  UserPlus, Trash2
} from "lucide-react";

// --- CONFIGURAZIONE E COSTANTI (BLACK SWAN THEME) ---

const COLORS = {
  bg: "#0A0A0A",          
  surface: "#171717",     
  input: "#0A0A0A",       
  inputBorder: "#404040", 
  cardBorder: "#262626",  
  text: "#F5F5F5",        
  textMuted: "#A3A3A3",   
  textLight: "#D4D4D4",   
  primary: "#D4AF37",     // Gold
  accent: "#D4AF37",      // Gold
  accentSoft: "rgba(212, 175, 55, 0.15)",  
  success: "#10B981",     
  successBg: "rgba(16, 185, 129, 0.15)",   
  danger: "#EF4444",      
  dangerBg: "rgba(239, 68, 68, 0.15)",    
  warning: "#F59E0B",     
  warningBg: "rgba(245, 158, 11, 0.15)",   
  purple: "#8B5CF6",      
  purpleBg: "rgba(139, 92, 246, 0.15)",    
  cyan: "#06B6D4",        
  cyanBg: "rgba(6, 182, 212, 0.15)",      
};

const LEGAL_DISCLAIMER = "DISCLAIMER LEGALE: Le presenti proiezioni finanziarie si basano su stime e ipotesi fornite dall'utente e rielaborate da algoritmi di intelligenza artificiale. I risultati passati o previsti non costituiscono garanzia di performance future. Il documento è generato a scopo di pianificazione interna e non sostituisce la consulenza professionale certificata.";

const WORKER_URLS = {
  fin: "https://financial-worker.pierluigimonaco2.workers.dev",
  mkt: "https://market-ai-worker.pierluigimonaco2.workers.dev",
  exec: "https://financial-worker.pierluigimonaco2.workers.dev" 
};

const LanguageContext = createContext("it");

// --- LOCALIZZAZIONE (i18n) ---

const i18n = {
  it: {
    steps: ["Azienda", "Team", "Economics", "Dashboard"],
    nav: ["Indietro", "Avanti", "Genera Dashboard"],
    actions: { edit: "Modifica", save: "Salva" },
    s1: {
      title: "La tua azienda",
      subtitle: "Informazioni di base per il Business Plan.",
      name: "Nome Azienda",
      sector: "Settore",
      desc: "Descrizione idea",
      descHint: "Es: Algoritmi di ottimizzazione rotte logistica green",
      capital: "Capitale Iniziale",
      suggestion: "Benchmark Settore",
      apply: "Applica Benchmark",
      target: "Target",
      targets: { b2b: "B2B — Aziende", b2c: "B2C — Consumatori", b2b2c: "B2B2C — Misto" },
      mixTitle: "Strategia Operativa (Marketing Mix)",
      mixProduct: "Prodotto",
      mixPlace: "Distribuzione",
      mixPromo: "Promozione"
    },
    sTeam: {
      title: "Fattibilità Imprenditoriale",
      subtitle: "Il Team è il primo fattore di valutazione per gli investitori.",
      addBtn: "Aggiungi",
      nameLabel: "Nome & Cognome",
      roleLabel: "Ruolo aziendale",
      bioLabel: "Bio / Competenze (Input AI)",
      bioHint: "Es: 'PhD in IA e 10 anni in logistica'",
      founder: "Socio Fondatore",
      manager: "Key Manager"
    },
    s2: {
      title: "Unit Economics",
      subtitle: "I numeri del tuo modello di business.",
      price: "Prezzo medio",
      costVar: "Costo variabile unitario",
      costFixed: "Costi fissi annuali",
      units: "Unità vendute Anno 1",
      growth: "Crescita annua",
      debtTitle: "Debito (opzionale)",
      debtCapital: "Quota capitale annua",
      debtInterest: "Quota interessi annua"
    },
    dashboard: {
      note: "Motore deterministico JS + Analisi AI",
      bep: "Break Even",
      margin: "Margine",
      burn: "Burn Rate",
      roi: "ROI / ROS",
      rev: "Fatturato",
      unit: "/u",
      month: "/mo",
      runway: "Runway",
      runwayInf: "Runway: ∞ ✓",
      cta: "SCARICA BUSINESS PLAN COMPLETO (PDF)",
      audit: "Audit Trail",
      history: "Cronologia Modifiche"
    },
    scenarios: ["Pessimistico", "Realistico", "Ottimistico"],
    tabs: ["Financial", "Mercato", "Exec. Summary"],
    bepCard: {
      title: "Break Even Analysis",
      subtitle: "Punto di equilibrio tra volumi e profitto",
      rev: "Ricavi",
      costsTot: "Costi Tot.",
      qty: "Quantità",
      forecast: "Previsione Y1"
    },
    marketCard: { title: "Analisi di Mercato", loading: "Scansione competitiva in corso..." },
    execCard: { title: "Executive Summary", readySub: "Analisi strategica generata dall'AI Strategist.", generate: "Genera Summary", regenerate: "Rigenera", ready: "Analisi Pronta", click: "Clicca per avviare.", generating: "Scrittura in corso..." },
    status: { live: "LIVE", sim: "SIMULAZIONE" },
    fallback: {
      fin: "Analisi finanziaria in elaborazione.",
      bepReached: "Pareggio raggiunto a",
      units: "unità",
      dscrOk: "DSCR solido.",
      dscrNo: "DSCR debole.",
      ebitda: "EBITDA previsto:",
      noRisk: "Solidità finanziaria verificata.",
      runway: "Autonomia:",
      months: "mesi",
      competitors: "Analisi Competitor",
      swot: "Analisi SWOT"
    },
    prompts: {
        fin: (d, b, ds, eb, cf, roi, ros, sc) => `Sei un analista finanziario senior. Analizza: ${d.nomeAzienda} (${d._sl}). BEP: ${b.bepUnita}u. EBITDA: €${Math.round(eb)}. DSCR: ${ds.dscr}. Scenario: ${sc}. Commenta in italiano professionale.`,
        mkt: (d) => `Analizza il mercato per ${d.nomeAzienda}, settore ${d._sl}. Descrizione: ${d.descrizione}. TAM/SAM/SOM e Competitor.`,
        exec: (d, b, ds, eb, rY, cf, roi, ros, m) => `Chief Strategy Officer. Executive Summary per ${d.nomeAzienda}. Idea: ${d.descrizione}. BEP ${b.bepUnita}u, DSCR ${ds.dscr}, EBITDA €${Math.round(eb)}. Focus su SWOT e Richiesta Capitale. Italiano.`
    },
    pdf: { 
        index: "Indice", 
        ch1: "1. Executive Summary", 
        ch2: "2. Il Team e la Governance", 
        ch3: "3. Analisi di Mercato (TAM/SAM/SOM)", 
        ch4: "4. Strategia Operativa e Roadmap", 
        ch5: "5. Piano Economico-Finanziario (PEF)",
        mix: "Marketing Mix (4P)",
        gantt: "Roadmap di Esecuzione (Gantt)",
        preview: "Anteprima Report Finale",
        print: "Stampa / Salva PDF",
        close: "Esci",
        pnlTitle: "Conto Economico Previsionale (5 Anni)",
        breakEvenTitle: "Analisi Break Even",
        breakEvenText: "Pareggio a {units} unità (Mese {month}).",
        creditTitle: "Bancabilità & Liquidità",
        maxNeed: "Fabbisogno Massimo",
        cashFlowTitle: "Cash Flow (24 mesi)",
        financeAiTitle: "Considerazioni AI Financial",
    },
    table: {
      title: "PEF — Proiezioni 5 Anni",
      item: "Voce",
      year: "Anno",
      rows: ["Ricavi", "Costi Var.", "Margine Contr.", "Costi Fissi", "EBITDA"],
      ebitdaMargin: "Margine EBITDA",
    },
    sectors: { 
      saas: "SaaS", ecom: "E-Commerce", risto: "Ristorazione", cons: "Consulenza", manif: "Manifattura", health: "Healthcare",
      realestate: "Real Estate", finance: "Finance & Banking", retail: "Retail", tech: "Tech & IT", energy: "Energia", edu: "Education", agro: "Agri-Tech", transp: "Logistica & Trasporti", media: "Media & Entertainment" 
    },
    hints: { 
      saas: "Cloud architecture", ecom: "Logistica store", risto: "Food operations", cons: "Human capital", manif: "Asset industriali", health: "Certificazioni",
      realestate: "Property Management", finance: "Capital Markets", retail: "B2C Sales", tech: "Hardware/Software", energy: "Rinnovabili", edu: "EdTech & Training", agro: "Smart Farming", transp: "Supply Chain", media: "Content Creation"
    }
  },
  
  en: {
    steps: ["Company", "Team", "Economics", "Dashboard"],
    nav: ["Back", "Next", "Generate Dashboard"],
    actions: { edit: "Edit", save: "Save" },
    s1: {
      title: "Your Company",
      subtitle: "Basic information.",
      name: "Company Name",
      sector: "Industry",
      desc: "Description",
      descHint: "E.g.: AI route optimization",
      capital: "Initial Capital",
      suggestion: "Industry Benchmark",
      apply: "Apply Benchmark",
      target: "Target",
      targets: { b2b: "B2B — Business", b2c: "B2C — Consumer", b2b2c: "B2B2C — Mixed" },
      mixTitle: "Operational Strategy (Marketing Mix)",
      mixProduct: "Product",
      mixPlace: "Place",
      mixPromo: "Promotion"
    },
    sTeam: {
      title: "Team Feasibility",
      subtitle: "Team is the key factor.",
      addBtn: "Add",
      nameLabel: "Name & Surname",
      roleLabel: "Company Role",
      bioLabel: "Bio / Skills (AI Input)",
      bioHint: "Describe key successes"
    },
    s2: {
      title: "Unit Economics",
      subtitle: "Business numbers.",
      price: "Avg Price",
      costVar: "Variable Cost",
      costFixed: "Fixed Costs",
      units: "Units Year 1",
      growth: "Annual Growth",
      debtTitle: "Debt (optional)",
      debtCapital: "Annual Principal",
      debtInterest: "Annual Interest"
    },
    dashboard: {
      note: "Deterministic JS + AI Insights",
      bep: "Break Even",
      margin: "Margin",
      burn: "Burn Rate",
      roi: "ROI / ROS",
      rev: "Revenue",
      unit: "/u",
      month: "/mo",
      runway: "Runway",
      runwayInf: "Runway: ∞ ✓",
      cta: "DOWNLOAD PDF",
      audit: "Audit Trail",
      history: "History"
    },
    scenarios: ["Pessimistic", "Realistic", "Optimistic"],
    tabs: ["Financial", "Market", "Exec. Summary"],
    bepCard: { title: "Break Even Point", forecast: "Forecast Y1" },
    marketCard: { title: "Market Analysis" },
    execCard: { title: "Executive Summary", readySub: "Strategic analysis generated by AI." },
    status: { live: "LIVE", sim: "SIMULATION" },
    fallback: { bepReached: "BEP at", units: "units", dscrOk: "Solid DSCR", dscrNo: "Weak DSCR", ebitda: "EBITDA:", noRisk: "No cash risk", fin: "Analysis", competitors: "Competitors", swot: "SWOT" },
    prompts: {
        fin: (d, b, ds, eb, cf, roi, ros, sc) => `You are a senior financial analyst. Analyze: ${d.nomeAzienda} (${d._sl}). BEP: ${b.bepUnita}u. EBITDA: €${Math.round(eb)}. DSCR: ${ds.dscr}. Scenario: ${sc}. Professional English commentary.`,
        mkt: (d) => `Analyze the market for ${d.nomeAzienda}, sector ${d._sl}. Description: ${d.descrizione}. TAM/SAM/SOM and competitors.`,
        exec: (d, b, ds, eb, rY, cf, roi, ros, m) => `Chief Strategy Officer. Executive Summary for ${d.nomeAzienda}. Idea: ${d.descrizione}. BEP ${b.bepUnita}u, DSCR ${ds.dscr}, EBITDA €${Math.round(eb)}. Focus on SWOT and capital request. English.`
    },
    pdf: { 
      index: "Index", 
      ch1: "1. Executive Summary", 
      ch2: "2. Team & Governance", 
      ch3: "3. Market Analysis (TAM/SAM/SOM)", 
      ch4: "4. Operating Strategy & Roadmap", 
      ch5: "5. Financial Plan (PEF)", 
      mix: "Marketing Mix (4P)",
      gantt: "Execution Roadmap (Gantt)",
      preview: "Final report preview",
      print: "Print / Save PDF",
      close: "Close",
      pnlTitle: "Projected Income Statement (5 Years)",
      breakEvenTitle: "Break-Even Analysis",
      breakEvenText: "Break-even at {units} units (Month {month}).",
      creditTitle: "Creditworthiness & Liquidity",
      maxNeed: "Maximum Funding Need",
      cashFlowTitle: "Cash Flow (24 months)",
      financeAiTitle: "AI Financial Considerations",
    },
    table: {
      title: "Financial Plan — 5-Year Projections",
      item: "Item",
      year: "Year",
      rows: ["Revenue", "Var. Costs", "Contribution Margin", "Fixed Costs", "EBITDA"],
      ebitdaMargin: "EBITDA Margin",
    },
    sectors: { 
      saas: "SaaS", ecom: "E-Commerce", risto: "Restaurant", cons: "Consulting", manif: "Manufacturing", health: "Healthcare",
      realestate: "Real Estate", finance: "Finance & Banking", retail: "Retail", tech: "Tech & IT", energy: "Energy", edu: "Education", agro: "Agri-Tech", transp: "Logistics & Transport", media: "Media & Entertainment"
    },
    hints: { 
      saas: "Software", ecom: "Store", risto: "Food", cons: "Consulting", manif: "Manufacturing", health: "Healthcare",
      realestate: "Property Management", finance: "Capital Markets", retail: "B2C Sales", tech: "Hardware/Software", energy: "Renewables", edu: "EdTech & Training", agro: "Smart Farming", transp: "Supply Chain", media: "Content Creation"
    }
  }
};

// --- UTILITIES & HOOKS ---

const useLanguage = () => useContext(LanguageContext);

const getLocale = (lang) => (lang === "en" ? "en-US" : "it-IT");

const formatNumberByLang = (value, lang, options = {}) =>
  new Intl.NumberFormat(getLocale(lang), options).format(Number.isFinite(value) ? value : 0);

const formatCurrencyByLang = (value, lang) => {
  if (!Number.isFinite(value)) return "∞";
  return new Intl.NumberFormat(getLocale(lang), { maximumFractionDigits: 0 }).format(Math.round(value));
};

function useTranslation() {
  const lang = useLanguage();
  const candidate = i18n?.[lang];
  return candidate && Object.keys(candidate).length ? candidate : i18n.it;
}

async function callWorker(url, prompt) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await response.json();
    return data.success ? { ok: true, content: data.content } : { ok: false };
  } catch {
    return { ok: false };
  }
}

function useSectors() {
  const t = useTranslation();
  return useMemo(() => {
    const s = t?.sectors || i18n.it.sectors;
    const h = t?.hints || i18n.it.hints;
    return {
      saas: { label: s.saas, cf: 120000, p: 49,  cv: 5,  cr: 0.4,  hint: h.saas },
      ecom: { label: s.ecom, cf: 80000,  p: 35,  cv: 15, cr: 0.25, hint: h.ecom },
      risto:{ label: s.risto,cf: 150000, p: 18,  cv: 6,  cr: 0.08, hint: h.risto },
      cons: { label: s.cons, cf: 60000,  p: 150, cv: 20, cr: 0.2,  hint: h.cons },
      manif:{ label: s.manif,cf: 250000, p: 80,  cv: 35, cr: 0.12, hint: h.manif },
      health:{label: s.health,cf: 300000,p: 200, cv: 60, cr: 0.3,  hint: h.health },
      realestate: { label: s.realestate, cf: 500000, p: 5000, cv: 1500, cr: 0.1, hint: h.realestate },
      finance: { label: s.finance, cf: 200000, p: 500, cv: 50, cr: 0.25, hint: h.finance },
      retail: { label: s.retail, cf: 100000, p: 60, cv: 30, cr: 0.15, hint: h.retail },
      tech: { label: s.tech, cf: 150000, p: 120, cv: 25, cr: 0.35, hint: h.tech },
      energy: { label: s.energy, cf: 800000, p: 2000, cv: 800, cr: 0.12, hint: h.energy },
      edu: { label: s.edu, cf: 50000, p: 90, cv: 15, cr: 0.2, hint: h.edu },
      agro: { label: s.agro, cf: 120000, p: 40, cv: 15, cr: 0.18, hint: h.agro },
      transp: { label: s.transp, cf: 250000, p: 250, cv: 120, cr: 0.15, hint: h.transp },
      media: { label: s.media, cf: 90000, p: 30, cv: 5, cr: 0.28, hint: h.media }
    };
  }, [t]);
}

const FinancialEngine = {
  calcBEP: (p, cv, cf) => {
    const m = p - cv;
    if (m <= 0) return { bepUnita: Infinity, bepFatturato: Infinity, margin: m, mcPerc: 0, errore: true };
    return { 
      bepUnita: Math.ceil(cf / m), 
      bepFatturato: Math.round(cf / (m / p)), 
      margin: m, 
      mcPerc: Math.round((m / p) * 10000) / 100, 
      errore: false 
    };
  },
  calcDSCR: (ebitda, cap, int) => {
    const r = ebitda * 0.76;
    const s = cap + int;
    if (s === 0) return { dscr: Infinity, giudizio: "ECCELLENTE", bancabile: true };
    const d = Math.round((r / s) * 100) / 100;
    return { dscr: d, giudizio: d >= 1.2 ? "BUONO" : "DEBOLE", bancabile: d >= 1.2 };
  },
  calcCashFlow: (cap, revs, vars, fixed, debt = 0) => {
    let cassa = cap, runway = null, burnSum = 0, burnMonths = 0;
    const flows = [];
    for (let m = 0; m < 60; m++) {
      const net = (revs[m] || 0) - ((vars[m] || 0) + fixed + debt);
      cassa += net;
      if (m < 24) flows.push({ mese: m + 1, ca: Math.round(cassa) });
      if (net < 0) { burnSum += Math.abs(net); burnMonths++; }
      if (cassa <= 0 && runway === null) runway = m + 1;
    }
    return { f: flows, rw: runway, br: burnMonths > 0 ? Math.round(burnSum / burnMonths) : 0 };
  },
  genProjections: (unitsY1, growth, price, costVar, mult = 1) => {
    const m = [];
    for (let i = 0; i < 60; i++) {
      const u = Math.round((unitsY1 / 12) * Math.pow(1 + growth, Math.floor(i / 12)) * mult);
      m.push({ r: u * price, cv: u * costVar });
    }
    return m;
  },
  calcROI: (u, c) => c === 0 ? 0 : Math.round((u / c) * 10000) / 100,
  formatMoney: (v, lang = "it") => {
    if (!Number.isFinite(v)) return "∞";
    const a = Math.abs(v);
    return (
      (v < 0 ? "-" : "") +
      (a >= 1e6
        ? `€${(a / 1e6).toFixed(1)}M`
        : a >= 1000
        ? `€${formatNumberByLang(Math.round(a / 1000), lang)}K`
        : `€${formatNumberByLang(Math.round(a), lang)}`)
    );
  }
};

const Fallbacks = {
  fin: (t, d, bep, ds, eb, cf, roi, ros, sc, lang = "it") =>
    `**${d.nomeAzienda} — Financial snapshot (${sc})**\n- **BEP:** ${Number.isFinite(bep.bepUnita) ? formatNumberByLang(bep.bepUnita, lang) : "∞"} ${t.fallback.units}\n- **EBITDA (Y1):** €${formatCurrencyByLang(eb, lang)}\n- **DSCR:** ${ds.dscr}\n- **Burn:** ${FinancialEngine.formatMoney(cf.br, lang)} /mo\n- **ROI (Y1):** ${roi}%`,
  mkt: (t, d, lang = "it") => lang === "it" ? 
    `### Analisi di Mercato: ${d.nomeAzienda}\n\n**1) Dimensionamento Mercato (TAM/SAM/SOM)**\n- Mercato in espansione con ottime prospettive di penetrazione nel segmento ${d.target}.\n\n**2) Competitor Analisi**\n- **Competitor A (Leader consolidato):** Punti di forza: Brand forte, suite completa. Debolezza: Costi elevati, complessità d'uso.\n- **Competitor B (Specialista di nicchia):** Punti di forza: Modelli avanzati per rischi specifici. Debolezza: Integrazioni limitate, mercato ristretto.\n- **Competitor C (Nuovo entrante):** Punti di forza: Interfaccia moderna, prezzi aggressivi. Debolezza: Base clienti piccola, feature set ridotto.\n\n**3) Analisi SWOT**\n- **Forza:** Innovazione tecnologica. **Debolezza:** Scala iniziale. **Opportunità:** Nuovi trend. **Minacce:** Concorrenza.` 
    : 
    `### Market Analysis: ${d.nomeAzienda}\n\n**1) Market Sizing (TAM/SAM/SOM)**\n- Expanding market with excellent penetration prospects in the ${d.target} segment.\n\n**2) Competitor Analysis**\n- **Competitor A (Consolidated Leader):** Strengths: Strong brand, complete suite. Weaknesses: High costs, complexity.\n- **Competitor B (Niche Specialist):** Strengths: Advanced models. Weaknesses: Limited integrations, restricted market.\n- **Competitor C (New Entrant):** Strengths: Modern UI, aggressive pricing. Weaknesses: Small customer base, reduced feature set.\n\n**3) SWOT Analysis**\n- **Strengths:** Tech innovation. **Weaknesses:** Initial scale. **Opportunities:** New trends. **Threats:** Competition.`,
  exec: (t, d, bep, ds, eb, cf, roi, ros, lang = "it") =>
    `## ${t.execCard.title}\n**${d.nomeAzienda}** — ${d.descrizione}\n- BEP: ${Number.isFinite(bep.bepUnita) ? formatNumberByLang(bep.bepUnita, lang) : "∞"} ${t.fallback.units}\n- EBITDA Y1: €${formatCurrencyByLang(eb, lang)}\n- DSCR: ${ds.dscr}\n- ROI Y1: ${roi}%\n*(Fallback mode — worker non disponibile)*`
};

// --- BASE UI COMPONENTS ---

const LoadingPulse = ({ text }) => (
  <div className="flex items-center gap-3 py-4 pl-1">
    <div className="relative flex h-3 w-3">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75" />
      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#D4AF37]" />
    </div>
    <span className="text-xs font-medium text-[#A3A3A3]">{text}</span>
  </div>
);

const InputField = ({ label, value, onChange, suffix, type = "text", hint }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest">{label}</label>
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(type === "number" ? parseFloat(e.target.value) || 0 : e.target.value)}
        className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#404040] text-[#F5F5F5] rounded-md text-sm focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-shadow"
      />
      {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A3A3A3] text-xs">{suffix}</span>}
    </div>
    {hint && <span className="text-[9px] text-[#A3A3A3] italic">{hint}</span>}
  </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#404040] text-[#F5F5F5] rounded-md text-sm outline-none appearance-none cursor-pointer focus:ring-1 focus:ring-[#D4AF37]"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </div>
);

const Card = ({ children, className = "" }) => (
  <div className={`bg-[#171717] border border-[#262626] rounded-xl shadow-md p-6 ${className}`}>{children}</div>
);

const Badge = ({ children, color = COLORS.accent }) => {
  const map = {
    [COLORS.success]: { bg: COLORS.successBg, text: COLORS.success },
    [COLORS.danger]: { bg: COLORS.dangerBg, text: COLORS.danger },
    [COLORS.warning]: { bg: COLORS.warningBg, text: COLORS.warning },
    [COLORS.purple]: { bg: COLORS.purpleBg, text: COLORS.purple },
    [COLORS.accent]: { bg: COLORS.accentSoft, text: COLORS.accent },
  };
  const s = map[color] || { bg: COLORS.accentSoft, text: color };
  return (
    <span
      style={{ backgroundColor: s.bg, color: s.text }}
      className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider"
    >
      {children}
    </span>
  );
};

const MetricCard = ({ label, value, sub, icon: Icon, isPositive }) => (
  <div className="bg-[#171717] border border-[#262626] rounded-xl p-5 flex flex-col justify-between shadow-md h-full hover:shadow-lg hover:border-[#404040] transition-all">
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-[#A3A3A3] uppercase tracking-wider">{label}</span>
        {Icon && (
          <div
            className={`p-1.5 rounded-md ${
              isPositive === true
                ? "bg-green-900 text-green-400"
                : isPositive === false
                ? "bg-red-900 text-red-400"
                : "bg-[#262626] text-[#D4AF37]"
            }`}
          >
            <Icon size={14} />
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-[#F5F5F5] font-mono tracking-tight">{String(value)}</div>
    </div>
    {sub && (
      <div className="mt-3 pt-3 border-t border-[#262626] text-[10px] font-medium text-[#A3A3A3] uppercase">
        {String(sub)}
      </div>
    )}
  </div>
);

const AIStatus = ({ finMode, mktMode }) => (
  <div className="bg-[#D4AF37] text-[#0A0A0A] rounded-lg p-3 shadow-md flex flex-col gap-2">
    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider mb-1">
      <Server size={10} /> AI Worker Status
    </div>
    <div className="flex items-center justify-between text-[10px] font-bold">
      <span>Finanza</span>
      <span className={finMode === "live" ? "text-green-900" : "text-[#0A0A0A]/60"}>{finMode === "live" ? "LIVE" : "IDLE"}</span>
    </div>
    <div className="flex items-center justify-between text-[10px] font-bold">
      <span>Mercato</span>
      <span className={mktMode === "live" ? "text-green-900" : "text-[#0A0A0A]/60"}>{mktMode === "live" ? "LIVE" : "IDLE"}</span>
    </div>
  </div>
);

const SimulationBadge = ({ mode }) => {
  const t = useTranslation();
  if (!mode) return null;
  return (
    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#262626] text-[#A3A3A3] border border-[#404040]">
      <span className={`w-1.5 h-1.5 rounded-full ${mode === "live" ? "bg-green-500" : "bg-amber-500"}`} />
      {mode === "live" ? t.status.live : t.status.sim}
    </div>
  );
};

const MarkdownRenderer = ({ content }) => {
  if (!content) return null;
  const stringContent = typeof content === "string" ? content : JSON.stringify(content);
  const html = stringContent
    .replace(/[\*\-•]\s*\n\s*/g, '- ') // Corregge gli a capo anomali imposti dall'AI dopo il pallino
    .replace(/\*\*(.*?)\*\*/g, `<strong style="color:${COLORS.primary};font-weight:700">$1</strong>`)
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(
      /^### (.*$)/gm,
      `<h4 style="font-size:13px;font-weight:700;color:${COLORS.primary};margin:16px 0 8px;text-transform:uppercase">$1</h4>`
    )
    .replace(
      /^## (.*$)/gm,
      `<h3 style="font-size:16px;font-weight:800;color:${COLORS.text};margin:24px 0 12px;border-bottom:1px solid ${COLORS.cardBorder};padding-bottom:6px">$1</h3>`
    )
    .replace(/^\|(.+)\|$/gm, (m) => {
      const c = m.split("|").filter((x) => x.trim());
      if (c.every((x) => /^[\s\-:]+$/.test(x))) return "";
      return `<tr>${c
        .map(
          (x) =>
            `<td style="padding:10px 12px;border:1px solid ${COLORS.cardBorder};font-size:12px;color:${COLORS.textMuted}">${x.trim()}</td>`
        )
        .join("")}</tr>`;
    })
    .replace(
      /(<tr>.*?<\/tr>\n?)+/gs,
      (m) =>
        `<table style="width:100%;border-collapse:collapse;margin:12px 0;background:#0A0A0A;border:1px solid ${COLORS.cardBorder};border-radius:6px;overflow:hidden">${m}</table>`
    )
    .replace(
      /^[\*\-•]\s*(.*$)/gm, // Supporta ora vari stili di punto elenco (*, -, •)
      `<div style="padding:4px 0 4px 20px;position:relative"><span style="position:absolute;left:4px;color:${COLORS.accent};font-weight:bold">•</span>$1</div>`
    )
    .replace(/\n\n/g, '<div style="height:12px"></div>')
    .replace(/\n/g, "<br/>");

  return <div className="text-sm leading-relaxed text-[#D4D4D4] font-sans" dangerouslySetInnerHTML={{ __html: html }} />;
};

// --- VISUALIZATION COMPONENTS ---

const BreakEvenChart = ({ bep, pv, cv, cf, projectedUnits, lang = "it" }) => {
  const W = 560,
    H = 280;
  const P = { t: 30, r: 30, b: 40, l: 65 };
  const pW = W - P.l - P.r;
  const pH = H - P.t - P.b;

  const safeBepUnits = Number.isFinite(bep.bepUnita) ? bep.bepUnita : 0;
  const maxQ = Math.max(Math.ceil(safeBepUnits * 1.5), Math.ceil((projectedUnits || 0) * 1.2), 100);
  const maxVal = Math.max(maxQ * pv, cf + maxQ * cv, 1) * 1.1;

  const x = (q) => P.l + (q / maxQ) * pW;
  const y = (v) => P.t + pH - (v / maxVal) * pH;
  const formatK = (v) =>
    v >= 1e6
      ? `${formatNumberByLang(v / 1e6, lang, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`
      : `${formatNumberByLang(Math.round(v / 1000), lang)}K`;

  const bepX = x(safeBepUnits);
  const bepY = y(Number.isFinite(bep.bepFatturato) ? bep.bepFatturato : 0);
  const projX = x(projectedUnits || 0);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-full font-sans text-[10px]">
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const v = (maxVal / 5) * i;
        return (
          <g key={i}>
            <line x1={P.l} y1={y(v)} x2={W - P.r} y2={y(v)} stroke={COLORS.cardBorder} strokeDasharray="3 3" />
            <text x={P.l - 10} y={y(v) + 3} textAnchor="end" fill={COLORS.textMuted}>
              €{formatK(Math.round(v))}
            </text>
          </g>
        );
      })}

      {!bep.errore && (
        <>
          <path
            d={`M ${bepX} ${bepY} L ${x(maxQ)} ${y(maxQ * pv)} L ${x(maxQ)} ${y(cf + maxQ * cv)} Z`}
            fill={COLORS.successBg}
            opacity={0.4}
          />
          <path d={`M ${x(0)} ${y(cf)} L ${bepX} ${bepY} L ${x(0)} ${y(0)} Z`} fill={COLORS.dangerBg} opacity={0.4} />
        </>
      )}

      <path d={`M ${x(0)} ${y(cf)} L ${x(maxQ)} ${y(cf + maxQ * cv)}`} stroke={COLORS.danger} strokeWidth={2.5} fill="none" />
      <path d={`M ${x(0)} ${y(0)} L ${x(maxQ)} ${y(maxQ * pv)}`} stroke={COLORS.primary} strokeWidth={2.5} fill="none" />

      {!bep.errore && Number.isFinite(bep.bepUnita) && bep.bepUnita !== 0 && (
        <g>
          <line x1={bepX} y1={y(0)} x2={bepX} y2={bepY} stroke={COLORS.textMuted} strokeDasharray="2 2" />
          <circle cx={bepX} cy={bepY} r={6} fill={COLORS.surface} stroke={COLORS.primary} strokeWidth={2} />
          <g transform={`translate(${bepX - 45}, ${bepY - 35})`}>
            <rect width={90} height={22} rx={4} fill={COLORS.primary} />
            <text x={45} y={15} textAnchor="middle" fill="#0A0A0A" fontWeight="bold">
              BEP: {formatNumberByLang(bep.bepUnita, lang)} u.
            </text>
          </g>
        </g>
      )}

      {projectedUnits > 0 && (
        <line x1={projX} y1={P.t} x2={projX} y2={H - P.b} stroke={COLORS.accent} strokeWidth={2} strokeDasharray="5 5" />
      )}
    </svg>
  );
};

const CashFlowChart = ({ flows, lang = "it" }) => {
  if (!flows || !flows.length) return null;
  const W = 560,
    H = 210;
  const P = { t: 20, r: 20, b: 35, l: 60 };
  const denom = Math.max(1, flows.length - 1);
  const maxAbs = Math.max(...flows.map((f) => (isNaN(f.ca) ? 0 : Math.abs(f.ca))), 1);

  const x = (i) => P.l + (i / denom) * (W - P.l - P.r) - 5;
  const yVal = (v) => H - P.b - ((v + maxAbs) / (2 * maxAbs)) * (H - P.t - P.b);
  const formatCompactMoney = (v) => FinancialEngine.formatMoney(v, lang).replace("€", "");

  const linePath = flows
    .slice(0, 24)
    .map((f, i) => `${i === 0 ? "M" : "L"} ${x(i) + 5} ${yVal(isNaN(f.ca) ? 0 : f.ca)}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-full font-sans text-[10px]">
      <defs>
        <linearGradient id="cashBars" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#B49020" stopOpacity="0.75" />
        </linearGradient>
      </defs>

      {[maxAbs, maxAbs / 2, 0, -maxAbs / 2, -maxAbs].map((tick, idx) => (
        <g key={idx}>
          <line x1={P.l} y1={yVal(tick)} x2={W - P.r} y2={yVal(tick)} stroke={COLORS.cardBorder} strokeDasharray="3 3" />
          <text x={P.l - 8} y={yVal(tick) + 3} textAnchor="end" fill={COLORS.textMuted} fontSize="9">
            {formatCompactMoney(tick)}
          </text>
        </g>
      ))}

      <line x1={P.l} y1={yVal(0)} x2={W - P.r} y2={yVal(0)} stroke="#525252" strokeDasharray="4 4" />
      {flows.slice(0, 24).map((f, i) => {
        const val = isNaN(f.ca) ? 0 : f.ca;
        const barY = val >= 0 ? yVal(val) : yVal(0);
        const h = Math.abs(yVal(val) - yVal(0));
        const showLabel = i % 3 === 0 || i === 23;
        return (
          <g key={i}>
            <rect x={x(i)} y={barY} width={10} height={Math.max(1, h)} fill={val >= 0 ? "url(#cashBars)" : COLORS.danger} rx={2} opacity={0.9} />
            {showLabel && (
              <>
                <text x={x(i) + 5} y={val >= 0 ? barY - 4 : barY + h + 10} textAnchor="middle" fill={COLORS.textMuted} fontSize="8" fontWeight="700">
                  {formatCompactMoney(val)}
                </text>
                <text x={x(i) + 5} y={H - P.b + 12} textAnchor="middle" fill={COLORS.textLight} fontSize="8">
                  M{f.mese}
                </text>
              </>
            )}
          </g>
        );
      })}

      <path d={linePath} stroke={COLORS.textMuted} strokeWidth={1.5} fill="none" opacity={0.5} />
    </svg>
  );
};

// --- MULTI-PAGE PDF REPORT ---

const BusinessPlanReport = ({ data, t, lang, bep, projections, cf, ds, eb, marketContent, execContent, financialContent, onClose }) => {
  const years = [0, 1, 2, 3, 4].map((y) => {
    const slice = projections.slice(y * 12, (y + 1) * 12);
    const revenue = slice.reduce((s, m) => s + (m.r || 0), 0);
    const varCosts = slice.reduce((s, m) => s + (m.cv || 0), 0);
    const mc = revenue - varCosts;
    const fixed = data.costiFissi;
    const ebitda = mc - fixed;
    const margin = revenue > 0 ? ebitda / revenue : 0;
    return { revenue, varCosts, mc, fixed, ebitda, margin };
  });

  const fixedM = data.costiFissi / 12;
  let cum = 0;
  let bepMonth = null;
  for (let i = 0; i < 12; i++) {
    const m = projections[i];
    if (!m) continue;
    cum += m.r - m.cv - fixedM;
    if (cum >= 0 && bepMonth === null) bepMonth = i + 1;
  }

  const minCash = Math.min(...cf.f.map((x) => x.ca));
  const fabbisogno = minCash < 0 ? Math.abs(minCash) : 0;

  const Page = ({ children, pageNumber }) => (
    <div className="w-[210mm] min-h-[297mm] bg-[#0A0A0A] text-[#F5F5F5] mx-auto p-[20mm] relative shadow-2xl mb-8 print:w-[210mm] print:h-[297mm] print:shadow-none print:m-0 print:break-after-page flex flex-col font-sans overflow-hidden border border-[#262626] print:border-none">
      <div className="flex-1">{children}</div>
      <div className="mt-auto pt-4 border-t border-[#404040] flex justify-between text-[10px] text-[#A3A3A3]">
        <span className="font-bold text-[#D4AF37]">{data.nomeAzienda} — The Black Swan Playbook</span>
        <span>Page {pageNumber}</span>
      </div>
      <div className="text-center text-[7px] text-[#525252] italic mt-3 uppercase tracking-tighter">{LEGAL_DISCLAIMER}</div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur overflow-y-auto print:static print:inset-auto print:w-full print:h-auto print:overflow-visible print:bg-[#0A0A0A] print:p-0 print:m-0">
      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          body { 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
            background: #0A0A0A !important; 
            color: #F5F5F5 !important; 
          }
        }
      `}</style>
      
      <div className="sticky top-0 z-50 bg-[#171717] p-4 shadow-md print:hidden flex justify-between items-center border-b border-[#262626]">
        <div className="font-bold text-[#D4AF37] flex items-center gap-2">
          <FileText className="text-[#D4AF37]" /> {t.pdf.preview}
        </div>
        <div className="flex gap-3">
          <button onClick={() => window.print()} className="bg-[#D4AF37] text-black px-6 py-2 rounded-lg font-bold shadow-md hover:bg-[#B49020] transition-all">
            {t.pdf.print}
          </button>
          <button onClick={onClose} className="bg-[#262626] text-[#F5F5F5] px-6 py-2 rounded-lg font-bold hover:bg-[#404040] transition-all">
            {t.pdf.close}
          </button>
        </div>
      </div>

      <div className="py-10 print:py-0 print:m-0">
        <Page pageNumber={1}>
          <div className="h-full flex flex-col justify-center items-center text-center">
            <div className="w-40 h-40 bg-[#D4AF37] rounded-[2.5rem] flex items-center justify-center text-[#0A0A0A] text-7xl font-black mb-12 shadow-[0_0_50px_rgba(212,175,55,0.3)]">
              {data.nomeAzienda ? data.nomeAzienda.charAt(0).toUpperCase() : ""}
            </div>
            <h1 className="text-6xl font-serif font-black text-[#D4AF37] mb-4 uppercase tracking-tighter">{data.nomeAzienda}</h1>
            <p className="text-2xl text-[#A3A3A3] mb-20 font-light tracking-wide">The Black Swan CFO Playbook</p>
            <div className="border-t-2 border-b-2 border-[#D4AF37] py-10 w-full max-w-lg">
              <div className="text-xs font-black text-[#A3A3A3] uppercase tracking-[0.2em] mb-4">Prepared for</div>
              <div className="text-2xl font-bold text-[#F5F5F5]">Executive Board</div>
              <div className="flex justify-around mt-10 text-[11px] font-bold text-[#D4AF37] uppercase">
                <div>Date: {new Date().toLocaleDateString(getLocale(lang))}</div>
                <div>Version: 1.0</div>
              </div>
            </div>
          </div>
        </Page>

        <Page pageNumber={2}>
          <h2 className="text-3xl font-black text-[#D4AF37] mb-16 border-b-4 border-[#D4AF37] pb-4 inline-block">{t.pdf.index}</h2>
          <div className="space-y-8 max-w-2xl">
            {[{ t: t.pdf.ch1, p: 3 }, { t: t.pdf.ch2, p: 4 }, { t: t.pdf.ch3, p: 5 }, { t: t.pdf.ch4, p: 6 }, { t: t.pdf.ch5, p: 7 }].map(
              (item, i) => (
                <div key={i} className="flex justify-between items-baseline border-b border-[#262626] pb-2">
                  <span className="text-xl font-bold text-[#D4D4D4]">{item.t}</span>
                  <span className="font-mono text-[#D4AF37] font-bold">pg. {item.p}</span>
                </div>
              )
            )}
          </div>
        </Page>

        <Page pageNumber={3}>
          <h2 className="text-3xl font-bold text-[#D4AF37] mb-10 border-b border-[#404040] pb-4">{t.pdf.ch1}</h2>
          <MarkdownRenderer content={execContent || t.execCard.readySub} />
        </Page>

        <Page pageNumber={4}>
          <h2 className="text-3xl font-bold text-[#D4AF37] mb-10 border-b border-[#404040] pb-4">{t.pdf.ch2}</h2>
          <div className="grid grid-cols-1 gap-8">
            {data.team.map((m, i) => (
              <div key={i} className="flex gap-6 items-start border-b border-[#262626] pb-8 last:border-0">
                <div className="w-20 h-20 bg-[#171717] border border-[#404040] rounded-2xl flex items-center justify-center font-black text-[#D4AF37] text-3xl shadow-lg">
                  {m.name?.charAt(0) || "?"}
                </div>
                <div className="flex-1">
                  <div className="font-black text-2xl text-[#F5F5F5]">{m.name}</div>
                  <div className="text-[#D4AF37] font-bold uppercase tracking-widest text-sm mb-3">{m.role}</div>
                  <p className="text-[#A3A3A3] leading-relaxed italic">"{m.superpower}"</p>
                </div>
              </div>
            ))}
          </div>
        </Page>

        <Page pageNumber={5}>
          <h2 className="text-3xl font-bold text-[#D4AF37] mb-10 border-b border-[#404040] pb-4">{t.pdf.ch3}</h2>
          <MarkdownRenderer content={marketContent} />
        </Page>

        <Page pageNumber={6}>
          <h2 className="text-3xl font-bold text-[#D4AF37] mb-10 border-b border-[#404040] pb-4">{t.pdf.ch4}</h2>
          <div className="grid grid-cols-1 gap-6">
            {Object.entries(data.marketingMix || {}).map(([k, v]) => (
              <div key={k} className="p-4 bg-[#171717] rounded-lg border border-[#404040]">
                <div className="text-[10px] font-bold text-[#D4AF37] uppercase mb-1">{k}</div>
                <div className="text-[#F5F5F5] font-bold">{v}</div>
              </div>
            ))}
          </div>
        </Page>

        <Page pageNumber={7}>
          <h2 className="text-3xl font-bold text-[#D4AF37] mb-10 border-b border-[#404040] pb-4">{t.pdf.ch5}</h2>
          <h3 className="text-lg font-bold text-[#F5F5F5] mb-4 italic">{t.pdf.pnlTitle}</h3>

          <table className="w-full text-xs font-mono border-collapse mb-10 border border-[#404040]">
            <thead>
              <tr className="bg-[#D4AF37] text-[#0A0A0A]">
                <th className="p-3 text-left border border-[#404040]">{t.table.item}</th>
                {years.map((_, i) => (
                  <th key={i} className="p-3 text-right border border-[#404040]">
                    Y{i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: t.table.rows[0], key: "revenue" },
                { label: t.table.rows[1], key: "varCosts" },
                { label: t.table.rows[2], key: "mc" },
                { label: t.table.rows[3], key: "fixed" },
                { label: t.table.rows[4], key: "ebitda" },
              ].map((row) => (
                <tr key={row.key} className={row.key === "ebitda" ? "bg-[#171717] font-bold" : ""}>
                  <td className="p-3 border border-[#404040] font-sans text-[#D4D4D4]">{row.label}</td>
                  {years.map((y, i) => (
                    <td key={i} className="p-3 text-right border border-[#404040] italic text-[#A3A3A3]">
                      €{formatCurrencyByLang(y[row.key], lang)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-[#D4AF37]/20 font-bold">
                <td className="p-3 border border-[#404040] font-sans text-[#D4AF37]">{t.table.ebitdaMargin}</td>
                {years.map((y, i) => (
                  <td key={i} className="p-3 text-right border border-[#404040] font-mono text-[#D4AF37]">
                    {(y.margin * 100).toFixed(1)}%
                  </td>
                ))}
              </tr>
            </tbody>
          </table>

          <div className="mb-8">
            <h4 className="font-bold text-[#D4AF37] mb-2 uppercase text-xs tracking-wider">{t.pdf.financeAiTitle}</h4>
            <div className="bg-[#171717] border border-[#404040] rounded-lg p-4">
              <MarkdownRenderer content={financialContent || t.fallback.fin} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <Card className="bg-[#171717]">
              <h4 className="font-bold text-[#D4AF37] mb-2 uppercase text-xs tracking-wider">{t.pdf.breakEvenTitle}</h4>
              <p className="text-[10px] text-[#A3A3A3] mb-4 font-bold">
                {t.pdf.breakEvenText
                  .replace("{units}", Number.isFinite(bep.bepUnita) ? formatNumberByLang(bep.bepUnita, lang) : "∞")
                  .replace("{month}", bepMonth || "N/A")}
              </p>
              <BreakEvenChart bep={bep} pv={data.prezzoVendita} cv={data.costoVariabile} cf={data.costiFissi} lang={lang} />
            </Card>

            <Card className="bg-[#171717]">
              <h4 className="font-bold text-[#D4AF37] mb-2 uppercase text-xs tracking-wider">{t.pdf.creditTitle}</h4>
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#A3A3A3]">DSCR Index</span>
                  <span className="font-black text-[#D4AF37] text-lg">{String(ds.dscr)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#A3A3A3]">{t.pdf.maxNeed}</span>
                  <span className="font-black text-red-500 text-lg">€{formatCurrencyByLang(fabbisogno, lang)}</span>
                </div>
              </div>
            </Card>
          </div>
        </Page>
      </div>
    </div>
  );
};

// --- WIZARD STEPS ---

const StepCompany = ({ data, updateData }) => {
  const t = useTranslation();
  const sectors = useSectors();
  const currentSector = useMemo(() => sectors[data.settore] || sectors.saas, [sectors, data.settore]);

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto animate-in fade-in">
      <div className="border-b border-[#262626] pb-4">
        <h2 className="text-2xl font-bold text-[#F5F5F5]">{t.s1.title}</h2>
        <p className="text-[#A3A3A3] text-sm mt-1">{t.s1.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <InputField label={t.s1.name} value={data.nomeAzienda} onChange={(v) => updateData("nomeAzienda", v)} />
          <div className="mt-4" />
          <SelectField
            label={t.s1.sector}
            value={data.settore}
            onChange={(v) => updateData("settore", v)}
            options={Object.entries(sectors).map(([k, v]) => ({ value: k, label: v.label }))}
          />
          <div className="mt-4" />
          <SelectField
            label={t.s1.target}
            value={data.target}
            onChange={(v) => updateData("target", v)}
            options={Object.entries(t.s1.targets).map(([k, v]) => ({ value: k.toUpperCase(), label: v }))}
          />
        </Card>

        <Card>
          <InputField label={t.s1.desc} value={data.descrizione} onChange={(v) => updateData("descrizione", v)} hint={t.s1.descHint} />
          <div className="mt-4" />
          <InputField
            label={t.s1.capital}
            value={data.capitaleIniziale}
            onChange={(v) => updateData("capitaleIniziale", v)}
            type="number"
            suffix="€"
          />

          <div className="mt-4 p-4 bg-[#D4AF37]/10 rounded-lg text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider border border-[#D4AF37]/30">
            {t.s1.suggestion} {currentSector.label}: {t.s2.price} €{currentSector.p}
            <button
              onClick={() => {
                updateData("costiFissi", currentSector.cf);
                updateData("prezzoVendita", currentSector.p);
                updateData("costoVariabile", currentSector.cv);
                updateData("crescitaAnnua", currentSector.cr);
              }}
              className="w-full bg-[#D4AF37] text-[#0A0A0A] py-2 rounded shadow-sm mt-2 font-bold hover:bg-[#B49020] transition-colors"
            >
              {t.s1.apply}
            </button>
          </div>
        </Card>

        <Card className="md:col-span-2">
          <h3 className="text-xs font-bold mb-4 uppercase text-[#D4AF37] tracking-widest">{t.s1.mixTitle}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField
              label={t.s1.mixProduct}
              value={data.marketingMix.product}
              onChange={(v) => updateData("marketingMix", { ...data.marketingMix, product: v })}
            />
            <InputField
              label={t.s1.mixPlace}
              value={data.marketingMix.place}
              onChange={(v) => updateData("marketingMix", { ...data.marketingMix, place: v })}
            />
            <InputField
              label={t.s1.mixPromo}
              value={data.marketingMix.promotion}
              onChange={(v) => updateData("marketingMix", { ...data.marketingMix, promotion: v })}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

const StepTeam = ({ data, updateData }) => {
  const t = useTranslation();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [isAn, setIsAn] = useState(false);

  const add = () => {
    if (!name) return;
    setIsAn(true);
    setTimeout(() => {
      updateData("team", [...data.team, { name, role: role || "Key Member", superpower: bio || "Expert" }]);
      setName("");
      setRole("");
      setBio("");
      setIsAn(false);
    }, 450);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto animate-in fade-in">
      <div className="border-b border-[#262626] pb-4">
        <h2 className="text-2xl font-bold text-[#F5F5F5]">{t.sTeam.title}</h2>
        <p className="text-[#A3A3A3] text-sm mt-1">{t.sTeam.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 border-t-4 border-[#D4AF37]">
          <InputField label={t.sTeam.nameLabel} value={name} onChange={setName} />
          <div className="mt-4" />
          <InputField label={t.sTeam.roleLabel} value={role} onChange={setRole} />
          <div className="mt-4" />
          <InputField label={t.sTeam.bioLabel} value={bio} onChange={setBio} hint={t.sTeam.bioHint} />
          <button
            onClick={add}
            disabled={!name || isAn}
            className="w-full bg-[#D4AF37] text-[#0A0A0A] py-3 rounded-lg font-bold mt-4 flex justify-center items-center gap-2 transition-all hover:bg-[#B49020] disabled:opacity-50"
          >
            {isAn ? <RefreshCw className="animate-spin" size={14} /> : <UserPlus size={14} />} {t.sTeam.addBtn}
          </button>
        </Card>

        <div className="md:col-span-2 flex flex-col gap-3">
          {data.team.map((m, i) => (
            <div key={i} className="bg-[#171717] border border-[#262626] p-4 rounded-xl flex justify-between items-center shadow-sm">
              <div>
                <div className="font-bold text-sm text-[#F5F5F5]">{m.name}</div>
                <div className="text-[10px] text-[#D4AF37] font-bold uppercase">{m.role}</div>
                <div className="text-xs text-[#A3A3A3] mt-1 italic">"{m.superpower}"</div>
              </div>
              <button
                onClick={() => {
                  const n = [...data.team];
                  n.splice(i, 1);
                  updateData("team", n);
                }}
                className="text-[#525252] hover:text-red-500 transition-colors"
                aria-label="Remove"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StepEconomics = ({ data, updateData }) => {
  const t = useTranslation();
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto animate-in fade-in">
      <div className="border-b border-[#262626] pb-4">
        <h2 className="text-2xl font-bold text-[#F5F5F5]">{t.s2.title}</h2>
        <p className="text-[#A3A3A3] text-sm mt-1">{t.s2.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-t-4 border-[#D4AF37]">
          <InputField label={t.s2.price} value={data.prezzoVendita} onChange={(v) => updateData("prezzoVendita", v)} type="number" />
          <div className="mt-4" />
          <InputField label={t.s2.costVar} value={data.costoVariabile} onChange={(v) => updateData("costoVariabile", v)} type="number" />
        </Card>

        <Card className="border-t-4 border-[#D4AF37]">
          <InputField label={t.s2.costFixed} value={data.costiFissi} onChange={(v) => updateData("costiFissi", v)} type="number" />
          <div className="mt-4" />
          <InputField label={t.s2.units} value={data.unitaAnno1} onChange={(v) => updateData("unitaAnno1", v)} type="number" />
          <div className="mt-4" />
          <InputField
            label={t.s2.growth}
            value={Math.round(data.crescitaAnnua * 100)}
            onChange={(v) => updateData("crescitaAnnua", v / 100)}
            type="number"
            suffix="%"
          />
        </Card>

        <Card className="border-t-4 border-[#404040] bg-[#1F1F1F]">
          <InputField label={t.s2.debtCapital} value={data.quotaCapitale} onChange={(v) => updateData("quotaCapitale", v)} type="number" />
          <div className="mt-4" />
          <InputField label={t.s2.debtInterest} value={data.quotaInteressi} onChange={(v) => updateData("quotaInteressi", v)} type="number" />
        </Card>
      </div>
    </div>
  );
};

// --- DASHBOARD ---

const Dashboard = ({ data }) => {
  const t = useTranslation();
  const lang = useLanguage();
  const sectors = useSectors();
  const [si, setSi] = useState(1);
  const [tab, setTab] = useState("financial");
  const [showPdf, setShowPdf] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const [com, setCom] = useState({ content: null, loading: false, mode: null });
  const [mkt, setMkt] = useState({ content: null, loading: false, mode: null });
  const [exec, setExec] = useState({ content: null, loading: false, mode: null });

  const scenarios = useMemo(
    () => [
      { label: t.scenarios[0], mult: 0.7 },
      { label: t.scenarios[1], mult: 1 },
      { label: t.scenarios[2], mult: 1.3 },
    ],
    [t]
  );
  const sc = scenarios[si];

  const dE = useMemo(() => ({ ...data, _sl: sectors[data.settore]?.label || data.settore }), [data, sectors]);

  const bep = useMemo(() => FinancialEngine.calcBEP(data.prezzoVendita, data.costoVariabile, data.costiFissi), [data]);
  const proj = useMemo(
    () => FinancialEngine.genProjections(data.unitaAnno1, data.crescitaAnnua, data.prezzoVendita, data.costoVariabile, sc.mult),
    [data, sc]
  );
  const cf = useMemo(
    () =>
      FinancialEngine.calcCashFlow(
        data.capitaleIniziale,
        proj.map((p) => p.r),
        proj.map((p) => p.cv),
        data.costiFissi,
        data.quotaCapitale + data.quotaInteressi
      ),
    [data, proj]
  );
  const eb = useMemo(() => (proj?.[0]?.r ? proj.slice(0, 12).reduce((s, p) => s + p.r - p.cv, 0) : 0) - data.costiFissi, [proj, data]);
  const ds = useMemo(() => FinancialEngine.calcDSCR(eb, data.quotaCapitale, data.quotaInteressi), [eb, data]);
  const roi = FinancialEngine.calcROI(eb * 0.76, data.capitaleIniziale);

  const fFin = useCallback(async () => {
    setCom((p) => ({ ...p, loading: true }));
    const res = await callWorker(WORKER_URLS.fin, t.prompts.fin(dE, bep, ds, eb, cf, roi, 0, sc.label));
    const content = res.ok ? res.content : Fallbacks.fin(t, dE, bep, ds, eb, cf, roi, 0, sc.label, lang);
    setCom({ content, loading: false, mode: res.ok ? "live" : "fallback" });
  }, [t, dE, bep, ds, eb, cf, roi, sc.label, lang]);

  const fMkt = useCallback(async () => {
    setMkt((p) => ({ ...p, loading: true }));
    const res = await callWorker(WORKER_URLS.mkt, t.prompts.mkt(dE));
    const content = res.ok ? res.content : Fallbacks.mkt(t, dE);
    setMkt({ content, loading: false, mode: res.ok ? "live" : "fallback" });
    return content;
  }, [t, dE]);

  const fExec = useCallback(
    async (marketOverride) => {
      setExec((p) => ({ ...p, loading: true }));
      const market = marketOverride ?? mkt.content;
      const res = await callWorker(WORKER_URLS.exec, t.prompts.exec(dE, bep, ds, eb, proj?.[0]?.r ?? 0, cf, roi, 0, market));
      const content = res.ok ? res.content : Fallbacks.exec(t, dE, bep, ds, eb, cf, roi, 0, lang);
      setExec({ content, loading: false, mode: res.ok ? "live" : "fallback" });
      return content;
    },
    [t, dE, bep, ds, eb, proj, cf, roi, mkt.content, lang]
  );

  useEffect(() => {
    fFin();
    fMkt();
  }, [fFin, fMkt]);

  const handleOpenPdf = async () => {
    setIsGeneratingPdf(true);
    const market = mkt.content || (await fMkt());
    if (!exec.content) await fExec(market);
    setIsGeneratingPdf(false);
    setShowPdf(true);
  };

  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in duration-700 print:pb-0 print:gap-0">
      {showPdf && (
        <BusinessPlanReport
          data={dE}
          t={t}
          lang={lang}
          bep={bep}
          projections={proj}
          cf={cf}
          ds={ds}
          eb={eb}
          marketContent={mkt.content}
          execContent={exec.content}
          financialContent={com.content}
          onClose={() => setShowPdf(false)}
        />
      )}

      <div className={showPdf ? "print:hidden flex flex-col gap-6" : "flex flex-col gap-6"}>
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-[#F5F5F5]">{data.nomeAzienda}</h2>
            <Badge color={ds.bancabile ? COLORS.success : COLORS.danger}>Rating: {ds.giudizio}</Badge>
          </div>

          <div className="flex flex-col items-end gap-2">
            <button
              onClick={handleOpenPdf}
              disabled={isGeneratingPdf}
              className="bg-[#D4AF37] text-[#0A0A0A] px-6 py-3 rounded-lg font-bold shadow-lg flex items-center gap-2 transform hover:-translate-y-0.5 transition-all disabled:opacity-60"
            >
              {isGeneratingPdf ? <RefreshCw className="animate-spin" size={18} /> : <Download size={18} />}
              {t.dashboard.cta}
            </button>
            <AIStatus finMode={com.mode} mktMode={mkt.mode} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {scenarios.map((s, i) => (
            <button
              key={i}
              onClick={() => setSi(i)}
              className={`py-2 rounded-lg font-bold text-xs border transition-all ${
                si === i ? "bg-[#D4AF37] text-[#0A0A0A] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)]" : "bg-[#171717] text-[#A3A3A3] border-[#404040]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            label={t.dashboard.bep}
            value={Number.isFinite(bep.bepUnita) ? `${formatNumberByLang(bep.bepUnita, lang)} u.` : "∞"}
            sub={`Fatt: ${FinancialEngine.formatMoney(bep.bepFatturato, lang)}`}
            icon={AlertCircle}
          />
          <MetricCard label={t.dashboard.margin} value={`${bep.mcPerc}%`} sub={`€${bep.margin}/u`} icon={PieChart} />
          <MetricCard label={t.dashboard.burn} value={FinancialEngine.formatMoney(cf.br, lang)} sub={cf.rw ? `Runway: ${cf.rw}mo` : "Runway: ∞"} icon={Wallet} />
          <MetricCard label="ROI Y1" value={`${roi}%`} icon={TrendingUp} />
        </div>

        <div className="flex gap-4 border-b border-[#262626]">
          {[{ id: "financial", l: t.tabs[0] }, { id: "market", l: t.tabs[1] }, { id: "summary", l: t.tabs[2] }].map((tb) => (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              className={`pb-2 font-bold transition-all ${tab === tb.id ? "border-b-2 border-[#D4AF37] text-[#D4AF37]" : "text-[#A3A3A3]"}`}
            >
              {tb.l}
            </button>
          ))}
        </div>

        {tab === "financial" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-left-4">
            <Card className="lg:col-span-2 bg-[#171717]">
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-sm font-bold text-[#F5F5F5]">{t.bepCard.title}</h3>
                <Badge color={COLORS.accent}>Enterprise Model</Badge>
              </div>
              <BreakEvenChart
                bep={bep}
                pv={data.prezzoVendita}
                cv={data.costoVariabile}
                cf={data.costiFissi}
                projectedUnits={Math.round(data.unitaAnno1 * sc.mult)}
                lang={lang}
              />
            </Card>

            <Card className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4D4D4] shadow-xl h-full">
              <h3 className="text-xs font-bold mb-4 flex items-center gap-2 text-[#D4AF37] uppercase tracking-widest">
                <BrainCircuit size={14} /> AI Insights
              </h3>
              {com.loading ? <LoadingPulse text={t.fallback.fin} /> : <MarkdownRenderer content={com.content} />}
            </Card>

            <Card className="lg:col-span-3 bg-[#171717]">
              <h3 className="text-sm font-bold mb-4 text-[#F5F5F5] uppercase tracking-wider">{t.pdf.cashFlowTitle}</h3>
              <CashFlowChart flows={cf.f} lang={lang} />
            </Card>
          </div>
        )}

        {tab === "market" && (
          <Card className="animate-in slide-in-from-right-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-[#F5F5F5] uppercase tracking-widest">{t.marketCard.title}</h3>
              <SimulationBadge mode={mkt.mode} />
            </div>
            {mkt.loading ? <LoadingPulse text={t.marketCard.loading} /> : <MarkdownRenderer content={mkt.content} />}
          </Card>
        )}

        {tab === "summary" && (
          <Card className="animate-in slide-in-from-right-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-[#F5F5F5] uppercase tracking-widest">{t.execCard.title}</h3>
              <button onClick={() => fExec()} className="text-xs font-bold text-[#D4AF37] flex items-center gap-1 hover:text-[#B49020]">
                <RefreshCw size={12} /> {t.execCard.regenerate}
              </button>
            </div>

            {!exec.content && !exec.loading ? (
              <div className="text-center py-20 text-[#A3A3A3]">
                <Rocket size={48} className="mx-auto mb-4 opacity-20 text-[#D4AF37]" />
                <p>{t.execCard.ready}</p>
                <button onClick={() => fExec()} className="mt-4 bg-[#D4AF37] text-[#0A0A0A] px-6 py-2 rounded font-bold hover:bg-[#B49020] transition-colors">
                  {t.execCard.generate}
                </button>
              </div>
            ) : exec.loading ? (
              <LoadingPulse text={t.execCard.generating} />
            ) : (
              <MarkdownRenderer content={exec.content} />
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

// --- APP ROOT ---

export default function App() {
  const [lang, setLang] = useState("it");
  const [step, setStep] = useState(0);

  const [data, setData] = useState({
    nomeAzienda: "Black Swan Enterprise",
    settore: "saas",
    descrizione: "Advanced Financial Strategies & Risk Management",
    capitaleIniziale: 150000,
    target: "B2B",
    prezzoVendita: 135,
    costoVariabile: 15,
    costiFissi: 140000,
    unitaAnno1: 2200,
    crescitaAnnua: 0.4,
    quotaCapitale: 0,
    quotaInteressi: 0,
    team: [
      { name: "Marco Bianchi", role: "CEO", superpower: "10+ anni in Strategic Advisory" },
      { name: "Sofia Neri", role: "CTO", superpower: "Risk Optimization Expert" },
    ],
    marketingMix: { product: "Black Swan Engine", place: "Enterprise direct", promotion: "Executive Network" },
  });

  const [auditLog, setAuditLog] = useState([]);
  const [showAudit, setShowAudit] = useState(false);

  const t = i18n?.[lang] && Object.keys(i18n[lang]).length ? i18n[lang] : i18n.it;

  const updateData = (f, v) => {
    if (JSON.stringify(data[f]) === JSON.stringify(v)) return;
    setAuditLog((p) => [{ ts: new Date().toLocaleTimeString(), field: f, old: data[f], new: v }, ...p].slice(0, 30));
    setData((p) => ({ ...p, [f]: v }));
  };

  const steps = t.steps;
  const canNext = step === 0 ? (data.nomeAzienda || "").length > 0 : step === 2 ? data.prezzoVendita > 0 : true;

  return (
    <LanguageContext.Provider value={lang}>
      <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] font-sans selection:bg-[#D4AF37]/30 print:bg-[#0A0A0A]">
        <header className="bg-[#171717] border-b border-[#262626] h-16 flex items-center px-8 justify-between shadow-md sticky top-0 z-40 print:hidden">
          <div className="flex items-center gap-3 font-bold text-lg text-[#D4AF37]">
            <div className="w-8 h-8 bg-[#D4AF37] rounded-lg text-[#0A0A0A] flex items-center justify-center shadow-[0_0_10px_rgba(212,175,55,0.3)]">
              {data.nomeAzienda ? data.nomeAzienda.charAt(0).toUpperCase() : ""}
            </div>
            <span>CFO Black Swan Planner</span>
          </div>

          <div className="flex gap-4">
            <div className="relative">
              <button
                onClick={() => setShowAudit(!showAudit)}
                className="flex items-center gap-2 text-xs font-bold text-[#A3A3A3] bg-[#262626] px-3 py-1.5 rounded hover:bg-[#404040] hover:text-[#F5F5F5] transition-all"
              >
                <History size={14} /> {t.dashboard.audit}
              </button>

              {showAudit && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-[#171717] border border-[#404040] shadow-2xl rounded-xl p-4 z-[60] animate-in fade-in zoom-in-95">
                  <div className="flex justify-between items-center mb-3 text-xs font-bold uppercase text-[#A3A3A3]">
                    <h4>{t.dashboard.history}</h4>
                    <button onClick={() => setShowAudit(false)} className="hover:text-[#F5F5F5]">
                      <X size={14} />
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2 text-[10px] font-mono pr-2">
                    {auditLog.length === 0 ? (
                      <div className="italic text-[#525252] text-center py-4">Nessuna modifica.</div>
                    ) : (
                      auditLog.map((l, i) => (
                        <div key={i} className="border-b border-[#262626] pb-2 last:border-0">
                          <div className="flex justify-between text-[#A3A3A3] mb-1">
                            <span>{l.ts}</span>
                            <span className="font-bold text-[#D4AF37] uppercase">{l.field}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-red-400 line-through truncate max-w-[45%]">{String(l.old)}</span>
                            <span className="text-green-400 font-bold truncate max-w-[45%]">{String(l.new)}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setLang(lang === "it" ? "en" : "it")}
              className="text-xs font-bold border border-[#404040] text-[#F5F5F5] px-4 py-1.5 rounded-lg hover:bg-[#262626] transition-all uppercase"
            >
              {lang}
            </button>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-6 py-10 print:p-0 print:m-0">
          <div className="flex justify-center mb-12 print:hidden">
            <div className="flex items-center bg-[#171717] p-1 rounded-full border border-[#262626] shadow-sm overflow-hidden">
              {steps.map((s, i) => (
                <button
                  key={i}
                  onClick={() => i <= step && setStep(i)}
                  className={`px-10 py-3 rounded-full text-xs font-bold transition-all ${
                    i === step ? "bg-[#D4AF37] text-[#0A0A0A] shadow-[0_0_15px_rgba(212,175,55,0.2)]" : i < step ? "text-[#D4AF37] bg-[#D4AF37]/10" : "text-[#525252] opacity-50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <main>
            {step === 0 && <StepCompany data={data} updateData={updateData} />}
            {step === 1 && <StepTeam data={data} updateData={updateData} />}
            {step === 2 && <StepEconomics data={data} updateData={updateData} />}
            {step === 3 && <Dashboard data={data} updateData={updateData} />}

            {step < 3 && (
              <div className="flex justify-between mt-12 pt-8 border-t border-[#262626] max-w-4xl mx-auto print:hidden">
                <button
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                  className="flex items-center gap-2 px-6 py-3 font-bold text-sm text-[#A3A3A3] hover:text-[#F5F5F5] disabled:opacity-30 transition-all"
                >
                  <ArrowLeft size={16} /> {t.nav[0]}
                </button>

                <button
                  onClick={() => canNext && setStep((s) => s + 1)}
                  className={`bg-[#D4AF37] hover:bg-[#B49020] text-[#0A0A0A] px-12 py-3 rounded-xl font-bold shadow-[0_0_20px_rgba(212,175,55,0.15)] flex items-center gap-2 transition-all transform hover:-translate-y-0.5 ${
                    canNext ? "" : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  {step === 2 ? t.nav[2] : t.nav[1]} <ArrowRight size={16} />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </LanguageContext.Provider>
  );
}