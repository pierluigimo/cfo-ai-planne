import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  createContext,
  useContext,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  Rocket,
  PieChart,
  FileText,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Wallet,
  BrainCircuit,
  Server,
  Download,
  X,
  History,
  UserPlus,
  Trash2,
} from "lucide-react";

// --- CONFIGURAZIONE E COSTANTI (ENTERPRISE THEME) ---

const COLORS = {
  bg: "#F8FAFC",
  surface: "#FFFFFF",
  input: "#FFFFFF",
  inputBorder: "#E2E8F0",
  cardBorder: "#E2E8F0",
  text: "#0F172A",
  textMuted: "#64748B",
  textLight: "#94A3B8",
  primary: "#0F172A",
  accent: "#2563EB",
  accentSoft: "#EFF6FF",
  success: "#16A34A",
  successBg: "#DCFCE7",
  danger: "#DC2626",
  dangerBg: "#FEE2E2",
  warning: "#D97706",
  warningBg: "#FEF3C7",
  purple: "#7C3AED",
  purpleBg: "#F3E8FF",
  cyan: "#0891B2",
  cyanBg: "#ECFEFF",
};

const LEGAL_DISCLAIMER =
  "DISCLAIMER LEGALE: Le presenti proiezioni finanziarie si basano su stime e ipotesi fornite dall'utente e rielaborate da algoritmi di intelligenza artificiale. I risultati passati o previsti non costituiscono garanzia di performance future. Il documento è generato a scopo di pianificazione interna e non sostituisce la consulenza professionale certificata.";

const WORKER_URLS = {
  fin: "https://financial-worker.pierluigimonaco2.workers.dev",
  mkt: "https://market-ai-worker.pierluigimonaco2.workers.dev",
  exec: "https://financial-worker.pierluigimonaco2.workers.dev",
};

const LanguageContext = createContext("it");

// --- LOCALIZZAZIONE (i18n) ---
// IMPORTANTISSIMO: non svuotare mai it. en può mancare o essere parziale.

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
      targets: {
        b2b: "B2B — Aziende",
        b2c: "B2C — Consumatori",
        b2b2c: "B2B2C — Misto",
      },
      mixTitle: "Strategia Operativa (Marketing Mix)",
      mixProduct: "Prodotto/Servizio",
      mixPlace: "Distribuzione",
      mixPromo: "Promozione",
    },
    sTeam: {
      title: "Fattibilità Imprenditoriale",
      subtitle: "Il Team è il primo fattore di valutazione per gli investitori.",
      addBtn: "Aggiungi Membro",
      bioLabel: "Bio / Competenze (Input AI)",
      bioHint: "Es: 'PhD in IA e 10 anni in logistica'",
      founder: "Socio Fondatore",
      manager: "Key Manager",
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
      debtInterest: "Quota interessi annua",
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
      history: "Cronologia Modifiche",
    },
    scenarios: ["Pessimistico", "Realistico", "Ottimistico"],
    tabs: ["Financial", "Mercato", "Exec. Summary"],
    bepCard: {
      title: "Break Even Analysis",
      subtitle: "Punto di equilibrio tra volumi e profitto",
      rev: "Ricavi",
      costsTot: "Costi Tot.",
      qty: "Quantità",
      forecast: "Previsione Y1",
    },
    marketCard: { title: "Analisi di Mercato", loading: "Scansione competitiva in corso..." },
    execCard: {
      title: "Executive Summary",
      readySub: "Analisi strategica generata dall'AI Strategist.",
      generate: "Genera Summary",
      regenerate: "Rigenera",
      ready: "Analisi Pronta",
      click: "Clicca per avviare.",
      generating: "Scrittura in corso...",
    },
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
      swot: "Analisi SWOT",
    },
    prompts: {
      fin: (d, b, ds, eb, cf, roi, ros, sc) =>
        `Sei un analista finanziario senior. Analizza: ${d.nomeAzienda} (${d._sl}). BEP: ${b.bepUnita}u. EBITDA: €${Math.round(
          eb
        )}. DSCR: ${ds.dscr}. Scenario: ${sc}. Commenta in italiano professionale.`,
      mkt: (d) =>
        `Analizza il mercato per ${d.nomeAzienda}, settore ${d._sl}. Descrizione: ${d.descrizione}. TAM/SAM/SOM e Competitor.`,
      exec: (d, b, ds, eb, rY, cf, roi, ros, m) =>
        `Chief Strategy Officer. Executive Summary per ${d.nomeAzienda}. Idea: ${d.descrizione}. BEP ${b.bepUnita}u, DSCR ${ds.dscr}, EBITDA €${Math.round(
          eb
        )}. Focus su SWOT e Richiesta Capitale. Italiano.`,
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
    },
    table: {
      title: "PEF — Proiezioni 5 Anni",
      item: "Voce",
      year: "Anno",
      rows: ["Ricavi", "Costi Var.", "Margine Contr.", "Costi Fissi", "EBITDA"],
    },
    sectors: {
      saas: "SaaS",
      ecom: "E-Commerce",
      risto: "Ristorazione",
      cons: "Consulenza",
      manif: "Manifattura",
      health: "Healthcare",
    },
    hints: {
      saas: "Cloud architecture",
      ecom: "Logistica store",
      risto: "Food operations",
      cons: "Human capital",
      manif: "Asset industriali",
      health: "Certificazioni",
    },
  },

  // EN COMPLETO (puoi ridurlo, ma NON cancellare it)
  en: {
    steps: ["Company", "Team", "Economics", "Dashboard"],
    nav: ["Back", "Next", "Generate Dashboard"],
    actions: { edit: "Edit", save: "Save" },
    s1: {
      title: "Your company",
      subtitle: "Basic information for the Business Plan.",
      name: "Company Name",
      sector: "Sector",
      desc: "Idea description",
      descHint: "E.g.: Green logistics route optimization algorithms",
      capital: "Initial Capital",
      suggestion: "Sector Benchmark",
      apply: "Apply Benchmark",
      target: "Target",
      targets: {
        b2b: "B2B — Companies",
        b2c: "B2C — Consumers",
        b2b2c: "B2B2C — Mixed",
      },
      mixTitle: "Operating Strategy (Marketing Mix)",
      mixProduct: "Product/Service",
      mixPlace: "Distribution",
      mixPromo: "Promotion",
    },
    sTeam: {
      title: "Entrepreneurial feasibility",
      subtitle: "The team is the primary factor for investors.",
      addBtn: "Add member",
      bioLabel: "Bio / Skills (AI input)",
      bioHint: "E.g.: 'PhD in AI and 10 years in logistics'",
      founder: "Co-Founder",
      manager: "Key Manager",
    },
    s2: {
      title: "Unit economics",
      subtitle: "The numbers of your business model.",
      price: "Average price",
      costVar: "Unit variable cost",
      costFixed: "Annual fixed costs",
      units: "Units sold Year 1",
      growth: "Annual growth",
      debtTitle: "Debt (optional)",
      debtCapital: "Annual principal",
      debtInterest: "Annual interest",
    },
    dashboard: {
      note: "Deterministic JS engine + AI analysis",
      bep: "Break Even",
      margin: "Margin",
      burn: "Burn Rate",
      roi: "ROI / ROS",
      rev: "Revenue",
      unit: "/u",
      month: "/mo",
      runway: "Runway",
      runwayInf: "Runway: ∞ ✓",
      cta: "DOWNLOAD FULL BUSINESS PLAN (PDF)",
      audit: "Audit Trail",
      history: "Change History",
    },
    scenarios: ["Pessimistic", "Realistic", "Optimistic"],
    tabs: ["Financial", "Market", "Exec. Summary"],
    bepCard: {
      title: "Break Even Analysis",
      subtitle: "Break-even point between volume and profit",
      rev: "Revenue",
      costsTot: "Total Costs",
      qty: "Quantity",
      forecast: "Y1 Forecast",
    },
    marketCard: { title: "Market Analysis", loading: "Competitive scan in progress..." },
    execCard: {
      title: "Executive Summary",
      readySub: "Strategic analysis generated by the AI Strategist.",
      generate: "Generate Summary",
      regenerate: "Regenerate",
      ready: "Analysis Ready",
      click: "Click to start.",
      generating: "Writing in progress...",
    },
    status: { live: "LIVE", sim: "SIMULATION" },
    fallback: {
      fin: "Financial analysis in progress.",
      bepReached: "Break-even reached at",
      units: "units",
      dscrOk: "Solid DSCR.",
      dscrNo: "Weak DSCR.",
      ebitda: "Forecast EBITDA:",
      noRisk: "Financial solidity verified.",
      runway: "Runway:",
      months: "months",
      competitors: "Competitor Analysis",
      swot: "SWOT Analysis",
    },
    prompts: {
      fin: (d, b, ds, eb, cf, roi, ros, sc) =>
        `You are a senior financial analyst. Analyze: ${d.nomeAzienda} (${d._sl}). BEP: ${b.bepUnita}u. EBITDA: €${Math.round(
          eb
        )}. DSCR: ${ds.dscr}. Scenario: ${sc}. Professional English commentary.`,
      mkt: (d) =>
        `Analyze the market for ${d.nomeAzienda}, sector ${d._sl}. Description: ${d.descrizione}. TAM/SAM/SOM and competitors.`,
      exec: (d, b, ds, eb, rY, cf, roi, ros, m) =>
        `Chief Strategy Officer. Executive Summary for ${d.nomeAzienda}. Idea: ${d.descrizione}. BEP ${b.bepUnita}u, DSCR ${ds.dscr}, EBITDA €${Math.round(
          eb
        )}. Focus on SWOT and capital request. English.`,
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
    },
    table: {
      title: "Financial Plan — 5-Year Projections",
      item: "Item",
      year: "Year",
      rows: ["Revenue", "Var. Costs", "Contribution Margin", "Fixed Costs", "EBITDA"],
    },
    sectors: {
      saas: "SaaS",
      ecom: "E-Commerce",
      risto: "Restaurant",
      cons: "Consulting",
      manif: "Manufacturing",
      health: "Healthcare",
    },
    hints: {
      saas: "Cloud architecture",
      ecom: "Store logistics",
      risto: "Food operations",
      cons: "Human capital",
      manif: "Industrial assets",
      health: "Certifications",
    },
  },
};

// --- CORE HOOKS ---

const useLanguage = () => useContext(LanguageContext);

function useTranslation() {
  const lang = useLanguage();
  const candidate = i18n?.[lang];
  // fallback robusto: se en è vuoto/parziale, almeno non esplode
  return candidate && Object.keys(candidate).length ? candidate : i18n.it;
}

function useSectors() {
  const t = useTranslation();
  return useMemo(() => {
    const s = t?.sectors || i18n.it.sectors;
    const h = t?.hints || i18n.it.hints;
    return {
      saas: { label: s.saas, cf: 120000, p: 49, cv: 5, cr: 0.4, hint: h.saas },
      ecom: { label: s.ecom, cf: 80000, p: 35, cv: 15, cr: 0.25, hint: h.ecom },
      risto: { label: s.risto, cf: 150000, p: 18, cv: 6, cr: 0.08, hint: h.risto },
      cons: { label: s.cons, cf: 60000, p: 150, cv: 20, cr: 0.2, hint: h.cons },
      manif: { label: s.manif, cf: 250000, p: 80, cv: 35, cr: 0.12, hint: h.manif },
      health: { label: s.health, cf: 300000, p: 200, cv: 60, cr: 0.3, hint: h.health },
    };
  }, [t]);
}

// --- WORKER CALL ---

async function callWorker(url, prompt) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await response.json();
    return data?.success ? { ok: true, content: data.content } : { ok: false };
  } catch {
    return { ok: false };
  }
}

// --- FINANCIAL ENGINE ---

const FinancialEngine = {
  calcBEP: (p, cv, cf) => {
    const m = p - cv;
    if (m <= 0)
      return { bepUnita: Infinity, bepFatturato: Infinity, margin: m, mcPerc: 0, errore: true };
    return {
      bepUnita: Math.ceil(cf / m),
      bepFatturato: Math.round(cf / (m / p)),
      margin: m,
      mcPerc: Math.round((m / p) * 10000) / 100,
      errore: false,
    };
  },
  calcDSCR: (ebitda, cap, int) => {
    const r = ebitda * 0.76;
    const s = cap + int;
    if (s === 0) return { dscr: Infinity, giudizio: "ECCELLENTE", bancabile: true };
    const d = Math.round((r / s) * 100) / 100;
    return { dscr: d, giudizio: d >= 1.2 ? "BUONO" : "DEBOLE", bancabile: d >= 1.2 };
  },
  calcCashFlow: (cap, revs, vars, fixedAnnual, debtAnnual = 0) => {
    let cassa = cap;
    let runway = null;
    let burnSum = 0;
    let burnMonths = 0;
    const flows = [];

    const fixed = (fixedAnnual || 0) / 12;
    const debt = (debtAnnual || 0) / 12;

    for (let m = 0; m < 60; m++) {
      const net = (revs[m] || 0) - ((vars[m] || 0) + fixed + debt);
      cassa += net;
      if (m < 24) flows.push({ mese: m + 1, ca: Math.round(cassa) });
      if (net < 0) {
        burnSum += Math.abs(net);
        burnMonths++;
      }
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
  calcROI: (u, c) => (c === 0 ? 0 : Math.round((u / c) * 10000) / 100),
  formatMoney: (v) => {
    if (!Number.isFinite(v)) return "∞";
    const a = Math.abs(v);
    return (
      (v < 0 ? "-" : "") +
      (a >= 1e6
        ? `€${(a / 1e6).toFixed(1)}M`
        : a >= 1000
        ? `€${Math.round(a / 1000).toLocaleString()}K`
        : `€${Math.round(a).toLocaleString()}`)
    );
  },
};

// --- FALLBACKS ---

const Fallbacks = {
  fin: (t, d, bep, ds, eb, cf, roi, ros, sc) =>
    `**${d.nomeAzienda} — Financial snapshot (${sc})**
- **BEP:** ${Number.isFinite(bep.bepUnita) ? bep.bepUnita.toLocaleString() : "∞"} ${t.fallback.units}
- **EBITDA (Y1):** €${Math.round(eb).toLocaleString()}
- **DSCR:** ${ds.dscr}
- **Burn:** ${FinancialEngine.formatMoney(cf.br)} /mo
- **ROI (Y1):** ${roi}%`,
  mkt: (t, d) =>
    `## ${t.marketCard.title}
- ${t.fallback.competitors}
- ${t.fallback.swot}
*(Fallback mode — worker non disponibile)*`,
  exec: (t, d, bep, ds, eb, cf, roi, ros) =>
    `## ${t.execCard.title}
**${d.nomeAzienda}** — ${d.descrizione}
- BEP: ${Number.isFinite(bep.bepUnita) ? bep.bepUnita.toLocaleString() : "∞"} ${t.fallback.units}
- EBITDA Y1: €${Math.round(eb).toLocaleString()}
- DSCR: ${ds.dscr}
- ROI Y1: ${roi}%
*(Fallback mode — worker non disponibile)*`,
};

// --- BASE UI COMPONENTS ---

const LoadingPulse = ({ text }) => (
  <div className="flex items-center gap-3 py-4 pl-1">
    <div className="relative flex h-3 w-3">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" />
    </div>
    <span className="text-xs font-medium text-slate-500">{text}</span>
  </div>
);

const InputField = ({ label, value, onChange, suffix, type = "text", hint }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</label>
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(type === "number" ? parseFloat(e.target.value) || 0 : e.target.value)}
        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
      />
      {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">{suffix}</span>}
    </div>
    {hint && <span className="text-[9px] text-slate-400 italic">{hint}</span>}
  </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm outline-none appearance-none cursor-pointer"
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
  <div className={`bg-white border border-slate-200 rounded-xl shadow-sm p-6 ${className}`}>{children}</div>
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
  <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-sm h-full hover:shadow-md transition-all">
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
        {Icon && (
          <div
            className={`p-1.5 rounded-md ${
              isPositive === true
                ? "bg-green-50 text-green-600"
                : isPositive === false
                ? "bg-red-50 text-red-600"
                : "bg-slate-50 text-slate-500"
            }`}
          >
            <Icon size={14} />
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">{String(value)}</div>
    </div>
    {sub && (
      <div className="mt-3 pt-3 border-t border-slate-100 text-[10px] font-medium text-slate-500 uppercase">
        {String(sub)}
      </div>
    )}
  </div>
);

const AIStatus = ({ finMode, mktMode }) => (
  <div className="bg-slate-900 text-white rounded-lg p-3 shadow-md flex flex-col gap-2">
    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
      <Server size={10} /> AI Worker Status
    </div>
    <div className="flex items-center justify-between text-[10px]">
      <span>Finanza</span>
      <span className={finMode === "live" ? "text-green-400" : "text-slate-500"}>{finMode === "live" ? "LIVE" : "IDLE"}</span>
    </div>
    <div className="flex items-center justify-between text-[10px]">
      <span>Mercato</span>
      <span className={mktMode === "live" ? "text-green-400" : "text-slate-500"}>{mktMode === "live" ? "LIVE" : "IDLE"}</span>
    </div>
  </div>
);

const SimulationBadge = ({ mode }) => {
  const t = useTranslation();
  if (!mode) return null;
  return (
    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
      <span className={`w-1.5 h-1.5 rounded-full ${mode === "live" ? "bg-green-500" : "bg-amber-500"}`} />
      {mode === "live" ? t.status.live : t.status.sim}
    </div>
  );
};

const MarkdownRenderer = ({ content }) => {
  if (!content) return null;
  const stringContent = typeof content === "string" ? content : JSON.stringify(content);
  const html = stringContent
    .replace(/\*\*(.*?)\*\*/g, `<strong style="color:${COLORS.text};font-weight:700">$1</strong>`)
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
        `<table style="width:100%;border-collapse:collapse;margin:12px 0;background:#F8FAFC;border:1px solid ${COLORS.cardBorder};border-radius:6px;overflow:hidden">${m}</table>`
    )
    .replace(
      /^[\*\-] (.*$)/gm,
      `<div style="padding:4px 0 4px 20px;position:relative"><span style="position:absolute;left:4px;color:${COLORS.accent};font-weight:bold">•</span>$1</div>`
    )
    .replace(/\n\n/g, '<div style="height:12px"></div>')
    .replace(/\n/g, "<br/>");

  return <div className="text-sm leading-relaxed text-slate-600 font-sans" dangerouslySetInnerHTML={{ __html: html }} />;
};

// --- VISUALIZATION COMPONENTS ---

const BreakEvenChart = ({ bep, pv, cv, cf, projectedUnits }) => {
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
  const formatK = (v) => (v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : `${Math.round(v / 1000)}K`);

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
          <circle cx={bepX} cy={bepY} r={6} fill="white" stroke={COLORS.primary} strokeWidth={2} />
          <g transform={`translate(${bepX - 45}, ${bepY - 35})`}>
            <rect width={90} height={22} rx={4} fill={COLORS.primary} />
            <text x={45} y={15} textAnchor="middle" fill="white" fontWeight="bold">
              BEP: {bep.bepUnita.toLocaleString()} u.
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

const CashFlowChart = ({ flows }) => {
  if (!flows || !flows.length) return null;
  const W = 560,
    H = 210;
  const P = { t: 20, r: 20, b: 35, l: 60 };
  const denom = Math.max(1, flows.length - 1);
  const maxAbs = Math.max(...flows.map((f) => (isNaN(f.ca) ? 0 : Math.abs(f.ca))), 1);

  const x = (i) => P.l + (i / denom) * (W - P.l - P.r) - 5;
  const yVal = (v) => H - P.b - ((v + maxAbs) / (2 * maxAbs)) * (H - P.t - P.b);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-full font-sans text-[10px]">
      <line x1={P.l} y1={yVal(0)} x2={W - P.r} y2={yVal(0)} stroke="#CBD5E1" strokeDasharray="4 4" />
      {flows.slice(0, 24).map((f, i) => {
        const val = isNaN(f.ca) ? 0 : f.ca;
        const barY = val >= 0 ? yVal(val) : yVal(0);
        const h = Math.abs(yVal(val) - yVal(0));
        return <rect key={i} x={x(i)} y={barY} width={10} height={Math.max(1, h)} fill={val >= 0 ? COLORS.success : COLORS.danger} rx={1} opacity={0.8} />;
      })}
    </svg>
  );
};

// --- MULTI-PAGE PDF REPORT ---

const BusinessPlanReport = ({ data, t, bep, projections, cf, ds, eb, marketContent, execContent, onClose }) => {
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
    <div className="w-[210mm] min-h-[297mm] bg-white mx-auto p-[20mm] relative shadow-lg mb-8 print:shadow-none print:mb-0 print:break-after-page flex flex-col font-sans">
      <div className="flex-1">{children}</div>
      <div className="mt-auto pt-4 border-t border-slate-200 flex justify-between text-[10px] text-slate-400">
        <span className="font-bold">{data.nomeAzienda} — Confidential Business Plan</span>
        <span>Page {pageNumber}</span>
      </div>
      <div className="text-center text-[7px] text-slate-300 italic mt-3 uppercase tracking-tighter">{LEGAL_DISCLAIMER}</div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur overflow-y-auto">
      <div className="sticky top-0 z-50 bg-white p-4 shadow-md print:hidden flex justify-between items-center border-b border-slate-200">
        <div className="font-bold text-slate-900 flex items-center gap-2">
          <FileText className="text-blue-600" /> Anteprima Report Finale
        </div>
        <div className="flex gap-3">
          <button onClick={() => window.print()} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-blue-700 transition-all">
            Stampa / Salva PDF
          </button>
          <button onClick={onClose} className="bg-slate-200 px-6 py-2 rounded-lg font-bold hover:bg-slate-300 transition-all">
            Esci
          </button>
        </div>
      </div>

      <div className="py-10">
        <Page pageNumber={1}>
          <div className="h-full flex flex-col justify-center items-center text-center">
            <div className="w-40 h-40 bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-white text-7xl font-black mb-12 shadow-2xl">
              G
            </div>
            <h1 className="text-6xl font-serif font-black text-slate-900 mb-4 uppercase tracking-tighter">{data.nomeAzienda}</h1>
            <p className="text-2xl text-slate-500 mb-20 font-light">Business Plan & Financial Projections 2026-2030</p>
            <div className="border-t-2 border-b-2 border-slate-900 py-10 w-full max-w-lg">
              <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 tracking-[0.2em]">Prepared for</div>
              <div className="text-2xl font-bold text-slate-800">CEO / Founders / Investors</div>
              <div className="flex justify-around mt-10 text-[11px] font-bold text-slate-500 uppercase">
                <div>Date: 16/02/2026</div>
                <div>Version: 1.0</div>
              </div>
            </div>
          </div>
        </Page>

        <Page pageNumber={2}>
          <h2 className="text-3xl font-black text-slate-900 mb-16 border-b-8 border-slate-900 pb-4 inline-block">{t.pdf.index}</h2>
          <div className="space-y-8 max-w-2xl">
            {[{ t: t.pdf.ch1, p: 3 }, { t: t.pdf.ch2, p: 4 }, { t: t.pdf.ch3, p: 5 }, { t: t.pdf.ch4, p: 6 }, { t: t.pdf.ch5, p: 7 }].map(
              (item, i) => (
                <div key={i} className="flex justify-between items-baseline border-b border-slate-100 pb-2">
                  <span className="text-xl font-bold text-slate-700">{item.t}</span>
                  <span className="font-mono text-slate-400 font-bold">pg. {item.p}</span>
                </div>
              )
            )}
          </div>
        </Page>

        <Page pageNumber={3}>
          <h2 className="text-3xl font-bold text-slate-900 mb-10 border-b-2 border-slate-200 pb-4">{t.pdf.ch1}</h2>
          <MarkdownRenderer content={execContent || t.execCard.readySub} />
        </Page>

        <Page pageNumber={4}>
          <h2 className="text-3xl font-bold text-slate-900 mb-10 border-b-2 border-slate-200 pb-4">{t.pdf.ch2}</h2>
          <div className="grid grid-cols-1 gap-8">
            {data.team.map((m, i) => (
              <div key={i} className="flex gap-6 items-start border-b border-slate-100 pb-8 last:border-0">
                <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 text-3xl">
                  {m.name?.charAt(0) || "?"}
                </div>
                <div className="flex-1">
                  <div className="font-black text-2xl text-slate-900">{m.name}</div>
                  <div className="text-blue-600 font-bold uppercase tracking-widest text-sm mb-3">{m.role}</div>
                  <p className="text-slate-600 leading-relaxed italic">"{m.superpower}"</p>
                </div>
              </div>
            ))}
          </div>
        </Page>

        <Page pageNumber={5}>
          <h2 className="text-3xl font-bold text-slate-900 mb-10 border-b-2 border-slate-200 pb-4">{t.pdf.ch3}</h2>
          <MarkdownRenderer content={marketContent} />
        </Page>

        <Page pageNumber={6}>
          <h2 className="text-3xl font-bold text-slate-900 mb-10 border-b-2 border-slate-200 pb-4">{t.pdf.ch4}</h2>
          <div className="grid grid-cols-1 gap-6">
            {Object.entries(data.marketingMix || {}).map(([k, v]) => (
              <div key={k} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase">{k}</div>
                <div className="text-slate-800 font-bold">{v}</div>
              </div>
            ))}
          </div>
        </Page>

        <Page pageNumber={7}>
          <h2 className="text-3xl font-bold text-slate-900 mb-10 border-b-2 border-slate-200 pb-4">{t.pdf.ch5}</h2>
          <h3 className="text-lg font-bold text-slate-700 mb-4 italic">Conto Economico Previsionale (5 Anni)</h3>

          <table className="w-full text-xs font-mono border-collapse mb-10 border border-slate-200">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="p-3 text-left border border-slate-800">Voce</th>
                {years.map((_, i) => (
                  <th key={i} className="p-3 text-right border border-slate-800">
                    Y{i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Ricavi", key: "revenue" },
                { label: "Costi Variabili", key: "varCosts" },
                { label: "Margine Contr.", key: "mc" },
                { label: "Costi Fissi", key: "fixed" },
                { label: "EBITDA", key: "ebitda" },
              ].map((row) => (
                <tr key={row.key} className={row.key === "ebitda" ? "bg-slate-50 font-bold" : ""}>
                  <td className="p-3 border border-slate-200 font-sans">{row.label}</td>
                  {years.map((y, i) => (
                    <td key={i} className="p-3 text-right border border-slate-200 italic">
                      €{Math.round(y[row.key]).toLocaleString()}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-blue-50 font-bold">
                <td className="p-3 border border-slate-200 font-sans">EBITDA Margin</td>
                {years.map((y, i) => (
                  <td key={i} className="p-3 text-right border border-slate-200 font-mono">
                    {(y.margin * 100).toFixed(1)}%
                  </td>
                ))}
              </tr>
            </tbody>
          </table>

          <div className="grid grid-cols-2 gap-8">
            <Card className="bg-slate-50">
              <h4 className="font-bold text-slate-800 mb-2 uppercase text-xs tracking-wider">Break Even Analysis</h4>
              <p className="text-[10px] text-slate-500 mb-4 font-bold">
                Pareggio a {Number.isFinite(bep.bepUnita) ? bep.bepUnita.toLocaleString() : "∞"} unità (Mese {bepMonth || "N/D"}).
              </p>
              <BreakEvenChart bep={bep} pv={data.prezzoVendita} cv={data.costoVariabile} cf={data.costiFissi} />
            </Card>

            <Card className="bg-slate-50">
              <h4 className="font-bold text-slate-800 mb-2 uppercase text-xs tracking-wider">Bancabilità & Liquidità</h4>
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-xs">
                  <span>DSCR Index</span>
                  <span className="font-black text-blue-600 text-lg">{String(ds.dscr)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span>Fabbisogno Massimo</span>
                  <span className="font-black text-red-600 text-lg">€{Math.round(fabbisogno).toLocaleString()}</span>
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
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-900">{t.s1.title}</h2>
        <p className="text-slate-500 text-sm mt-1">{t.s1.subtitle}</p>
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

          <div className="mt-4 p-4 bg-blue-50 rounded-lg text-[10px] font-bold text-blue-700 uppercase tracking-wider">
            {t.s1.suggestion} {currentSector.label}: {t.s2.price} €{currentSector.p}
            <button
              onClick={() => {
                updateData("costiFissi", currentSector.cf);
                updateData("prezzoVendita", currentSector.p);
                updateData("costoVariabile", currentSector.cv);
                updateData("crescitaAnnua", currentSector.cr);
              }}
              className="w-full bg-white border border-blue-200 text-blue-600 py-2 rounded shadow-sm mt-2 font-bold"
            >
              {t.s1.apply}
            </button>
          </div>
        </Card>

        <Card className="md:col-span-2">
          <h3 className="text-xs font-bold mb-4 uppercase text-slate-500 tracking-widest">{t.s1.mixTitle}</h3>
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
  const [bio, setBio] = useState("");
  const [isAn, setIsAn] = useState(false);

  const add = () => {
    if (!name) return;
    setIsAn(true);
    setTimeout(() => {
      updateData("team", [...data.team, { name, role: "Key Member", superpower: bio || "Expert" }]);
      setName("");
      setBio("");
      setIsAn(false);
    }, 450);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto animate-in fade-in">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-900">{t.sTeam.title}</h2>
        <p className="text-slate-500 text-sm mt-1">{t.sTeam.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 border-t-4 border-blue-600">
          <InputField label="Nome & Cognome" value={name} onChange={setName} />
          <div className="mt-4" />
          <InputField label={t.sTeam.bioLabel} value={bio} onChange={setBio} hint={t.sTeam.bioHint} />
          <button
            onClick={add}
            disabled={!name || isAn}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold mt-4 flex justify-center items-center gap-2 transition-all hover:bg-blue-700 disabled:opacity-50"
          >
            {isAn ? <RefreshCw className="animate-spin" size={14} /> : <UserPlus size={14} />} {t.sTeam.addBtn}
          </button>
        </Card>

        <div className="md:col-span-2 flex flex-col gap-3">
          {data.team.map((m, i) => (
            <div key={i} className="bg-white border border-slate-200 p-4 rounded-xl flex justify-between items-center shadow-sm">
              <div>
                <div className="font-bold text-sm">{m.name}</div>
                <div className="text-[10px] text-blue-600 font-bold uppercase">{m.role}</div>
                <div className="text-xs text-slate-400 mt-1 italic">"{m.superpower}"</div>
              </div>
              <button
                onClick={() => {
                  const n = [...data.team];
                  n.splice(i, 1);
                  updateData("team", n);
                }}
                className="text-slate-300 hover:text-red-500 transition-colors"
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
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-900">{t.s2.title}</h2>
        <p className="text-slate-500 text-sm mt-1">{t.s2.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-t-4 border-blue-500">
          <InputField label={t.s2.price} value={data.prezzoVendita} onChange={(v) => updateData("prezzoVendita", v)} type="number" />
          <div className="mt-4" />
          <InputField label={t.s2.costVar} value={data.costoVariabile} onChange={(v) => updateData("costoVariabile", v)} type="number" />
        </Card>

        <Card className="border-t-4 border-blue-500">
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

        <Card className="border-t-4 border-slate-300 bg-slate-50">
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
    const content = res.ok ? res.content : Fallbacks.fin(t, dE, bep, ds, eb, cf, roi, 0, sc.label);
    setCom({ content, loading: false, mode: res.ok ? "live" : "fallback" });
  }, [t, dE, bep, ds, eb, cf, roi, sc.label]);

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
      const content = res.ok ? res.content : Fallbacks.exec(t, dE, bep, ds, eb, cf, roi, 0);
      setExec({ content, loading: false, mode: res.ok ? "live" : "fallback" });
      return content;
    },
    [t, dE, bep, ds, eb, proj, cf, roi, mkt.content]
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
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in duration-700">
      {showPdf && (
        <BusinessPlanReport
          data={dE}
          t={t}
          bep={bep}
          projections={proj}
          cf={cf}
          ds={ds}
          eb={eb}
          marketContent={mkt.content}
          execContent={exec.content}
          onClose={() => setShowPdf(false)}
        />
      )}

      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">{data.nomeAzienda}</h2>
          <Badge color={ds.bancabile ? COLORS.success : COLORS.danger}>Rating: {ds.giudizio}</Badge>
        </div>

        <div className="flex flex-col items-end gap-2">
          <button
            onClick={handleOpenPdf}
            disabled={isGeneratingPdf}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg flex items-center gap-2 transform hover:-translate-y-0.5 transition-all disabled:opacity-60"
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
              si === i ? "bg-slate-900 text-white shadow-md" : "bg-white text-slate-500 border-slate-200"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          label={t.dashboard.bep}
          value={Number.isFinite(bep.bepUnita) ? `${bep.bepUnita.toLocaleString()} u.` : "∞"}
          sub={`Fatt: ${FinancialEngine.formatMoney(bep.bepFatturato)}`}
          icon={AlertCircle}
        />
        <MetricCard label={t.dashboard.margin} value={`${bep.mcPerc}%`} sub={`€${bep.margin}/u`} icon={PieChart} />
        <MetricCard label={t.dashboard.burn} value={FinancialEngine.formatMoney(cf.br)} sub={cf.rw ? `Runway: ${cf.rw}mo` : "Runway: ∞"} icon={Wallet} />
        <MetricCard label="ROI Y1" value={`${roi}%`} icon={TrendingUp} />
      </div>

      <div className="flex gap-4 border-b">
        {[{ id: "financial", l: t.tabs[0] }, { id: "market", l: t.tabs[1] }, { id: "summary", l: t.tabs[2] }].map((tb) => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className={`pb-2 font-bold transition-all ${tab === tb.id ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-400"}`}
          >
            {tb.l}
          </button>
        ))}
      </div>

      {tab === "financial" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-left-4">
          <Card className="lg:col-span-2 bg-slate-50/50">
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-700">{t.bepCard.title}</h3>
              <Badge color={COLORS.accent}>Enterprise Model</Badge>
            </div>
            <BreakEvenChart bep={bep} pv={data.prezzoVendita} cv={data.costoVariabile} cf={data.costiFissi} projectedUnits={Math.round(data.unitaAnno1 * sc.mult)} />
          </Card>

          <Card className="bg-slate-900 text-white border-none shadow-xl h-full">
            <h3 className="text-xs font-bold mb-4 flex items-center gap-2 text-blue-400 uppercase tracking-widest">
              <BrainCircuit size={14} /> AI Insights
            </h3>
            {com.loading ? <LoadingPulse text={t.fallback.fin} /> : <MarkdownRenderer content={com.content} />}
          </Card>

          <Card className="lg:col-span-3 bg-slate-50/50">
            <h3 className="text-sm font-bold mb-4 text-slate-800 uppercase tracking-wider">Previsione Cassa (24 mesi)</h3>
            <CashFlowChart flows={cf.f} />
          </Card>
        </div>
      )}

      {tab === "market" && (
        <Card className="animate-in slide-in-from-right-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 uppercase tracking-widest">{t.marketCard.title}</h3>
            <SimulationBadge mode={mkt.mode} />
          </div>
          {mkt.loading ? <LoadingPulse text={t.marketCard.loading} /> : <MarkdownRenderer content={mkt.content} />}
        </Card>
      )}

      {tab === "summary" && (
        <Card className="animate-in slide-in-from-right-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 uppercase tracking-widest">{t.execCard.title}</h3>
            <button onClick={() => fExec()} className="text-xs font-bold text-blue-600 flex items-center gap-1">
              <RefreshCw size={12} /> {t.execCard.regenerate}
            </button>
          </div>

          {!exec.content && !exec.loading ? (
            <div className="text-center py-20 text-slate-400">
              <Rocket size={48} className="mx-auto mb-4 opacity-10" />
              <p>{t.execCard.ready}</p>
              <button onClick={() => fExec()} className="mt-4 bg-slate-900 text-white px-6 py-2 rounded font-bold">
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
  );
};

// --- APP ROOT ---
// NOTA: t qui lo calcoliamo "safe" senza hook, poi i componenti usano useTranslation() dentro Provider.

export default function App() {
  const [lang, setLang] = useState("it");
  const [step, setStep] = useState(0);

  const [data, setData] = useState({
    nomeAzienda: "GreenRoute AI",
    settore: "saas",
    descrizione: "Ottimizzazione rotte per logistica sostenibile flotta green.",
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
      { name: "Marco Bianchi", role: "CEO", superpower: "10+ anni logistica" },
      { name: "Sofia Neri", role: "CTO", superpower: "PhD IA" },
    ],
    marketingMix: { product: "Route Engine API", place: "Enterprise direct", promotion: "LinkedIn Content" },
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
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
        <header className="bg-white border-b h-16 flex items-center px-8 justify-between shadow-sm sticky top-0 z-40">
          <div className="flex items-center gap-2 font-bold text-lg">
            <div className="w-8 h-8 bg-slate-900 rounded-lg text-white flex items-center justify-center shadow-inner">C</div>
            <span>CFO AI Planner</span>
          </div>

          <div className="flex gap-4">
            <div className="relative">
              <button
                onClick={() => setShowAudit(!showAudit)}
                className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded hover:bg-slate-200 transition-all"
              >
                <History size={14} /> {t.dashboard.audit}
              </button>

              {showAudit && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-slate-200 shadow-xl rounded-xl p-4 z-[60] animate-in fade-in zoom-in-95">
                  <div className="flex justify-between items-center mb-3 text-xs font-bold uppercase text-slate-500">
                    <h4>{t.dashboard.history}</h4>
                    <button onClick={() => setShowAudit(false)}>
                      <X size={14} />
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2 text-[10px] font-mono">
                    {auditLog.length === 0 ? (
                      <div className="italic text-slate-400 text-center py-4">Nessuna modifica.</div>
                    ) : (
                      auditLog.map((l, i) => (
                        <div key={i} className="border-b border-slate-100 pb-2 last:border-0">
                          <div className="flex justify-between text-slate-400 mb-1">
                            <span>{l.ts}</span>
                            <span className="font-bold text-slate-700 uppercase">{l.field}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-red-500 line-through">{String(l.old)}</span>
                            <span className="text-green-600 font-bold">{String(l.new)}</span>
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
              className="text-xs font-bold border border-slate-200 px-4 py-1.5 rounded-lg hover:bg-slate-50 transition-all uppercase"
            >
              {lang}
            </button>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex justify-center mb-12">
            <div className="flex items-center bg-white p-1 rounded-full border border-slate-200 shadow-sm overflow-hidden">
              {steps.map((s, i) => (
                <button
                  key={i}
                  onClick={() => i <= step && setStep(i)}
                  className={`px-10 py-3 rounded-full text-xs font-bold transition-all ${
                    i === step ? "bg-slate-900 text-white shadow-lg" : i < step ? "text-green-600 bg-green-50" : "text-slate-400 opacity-50"
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
            {step === 3 && <Dashboard data={data} />}

            {step < 3 && (
              <div className="flex justify-between mt-12 pt-8 border-t border-slate-200 max-w-4xl mx-auto">
                <button
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                  className="flex items-center gap-2 px-6 py-3 font-bold text-sm text-slate-500 hover:text-slate-900 disabled:opacity-30 transition-all"
                >
                  <ArrowLeft size={16} /> {t.nav[0]}
                </button>

                <button
                  onClick={() => canNext && setStep((s) => s + 1)}
                  className={`bg-slate-900 hover:bg-slate-800 text-white px-12 py-3 rounded-xl font-bold shadow-xl flex items-center gap-2 transition-all transform hover:-translate-y-0.5 ${
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