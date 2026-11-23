import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ComposedChart, ReferenceLine
} from "recharts";
import {
  Ship, Users, TrendingUp, CalendarDays, Filter, RotateCcw,
  Download, Globe2, BedDouble, Wallet, ChevronDown, ChevronUp,
  LayoutDashboard, Plane, HeartHandshake, DoorOpen, MapPinned,
  Table2, Menu, X, PanelLeftClose, PanelLeftOpen, Search, ArrowUpDown
} from "lucide-react";

const SIDEBAR_MIN = 72;
const SIDEBAR_MAX = 300;
const SIDEBAR_DEFAULT = 240;
const SIDEBAR_COLLAPSED = 72;
const SIDEBAR_STORAGE_KEY = "belize-tourism-sidebar";
const MOBILE_BREAKPOINT = 980;

const NAV_ITEMS = [
  ["overview", "Overview", LayoutDashboard],
  ["arrivals", "International arrivals", Plane],
  ["motives", "Travel reasons", HeartHandshake],
  ["entry", "Entry methods", DoorOpen],
  ["markets", "Origin markets", MapPinned],
  ["spending", "Stay & spending", Wallet],
  ["cruises", "Cruise tourism", Ship],
  ["records", "Data records", Table2]
];

function readSidebarPrefs() {
  try {
    const raw = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (!raw) return { width: SIDEBAR_DEFAULT, collapsed: false };
    const parsed = JSON.parse(raw);
    const width = Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, Number(parsed.width) || SIDEBAR_DEFAULT));
    return { width, collapsed: Boolean(parsed.collapsed) };
  } catch {
    return { width: SIDEBAR_DEFAULT, collapsed: false };
  }
}

function saveSidebarPrefs(width, collapsed) {
  try {
    localStorage.setItem(
      SIDEBAR_STORAGE_KEY,
      JSON.stringify({ width, collapsed })
    );
  } catch {
    /* ignore quota / private mode */
  }
}

const AppSidebar = React.memo(function AppSidebar({ tab, onNavigate, mobileOpen, setMobileOpen }) {
  const prefs = useRef(null);
  if (!prefs.current) prefs.current = readSidebarPrefs();

  const sidebarRef = useRef(null);
  const widthRef = useRef(prefs.current.width);
  const collapsedRef = useRef(prefs.current.collapsed);
  const resizeRef = useRef({ active: false, startX: 0, startWidth: SIDEBAR_DEFAULT, liveWidth: SIDEBAR_DEFAULT });
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth <= MOBILE_BREAKPOINT
  );

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [setMobileOpen]);

  const applyDom = useCallback((width, collapsed) => {
    const el = sidebarRef.current;
    if (!el) return;
    el.style.width = `${width}px`;
    el.classList.toggle("collapsed", collapsed && !(window.innerWidth <= MOBILE_BREAKPOINT));
  }, []);

  const toggleCollapsed = useCallback(() => {
    if (window.innerWidth <= MOBILE_BREAKPOINT) return;
    const next = !collapsedRef.current;
    collapsedRef.current = next;
    const width = next
      ? SIDEBAR_COLLAPSED
      : (widthRef.current < SIDEBAR_MIN + 8 ? SIDEBAR_DEFAULT : widthRef.current);
    if (!next && widthRef.current < SIDEBAR_MIN + 8) widthRef.current = SIDEBAR_DEFAULT;
    applyDom(width, next);
    saveSidebarPrefs(widthRef.current, next);
  }, [applyDom]);

  const onResizeStart = useCallback((e) => {
    if (window.innerWidth <= MOBILE_BREAKPOINT) return;
    e.preventDefault();
    const startX = e.clientX ?? e.touches?.[0]?.clientX;
    const startWidth = collapsedRef.current ? SIDEBAR_COLLAPSED : widthRef.current;
    resizeRef.current = { active: true, startX, startWidth, liveWidth: startWidth };

    const el = sidebarRef.current;
    if (el) {
      el.classList.add("is-resizing");
      el.classList.remove("collapsed");
      el.style.width = `${startWidth}px`;
    }
    document.body.classList.add("sidebar-resizing");

    const onMove = (ev) => {
      if (!resizeRef.current.active) return;
      if (ev.cancelable) ev.preventDefault();
      const clientX = ev.clientX ?? ev.touches?.[0]?.clientX;
      if (clientX == null) return;
      const next = Math.min(
        SIDEBAR_MAX,
        Math.max(SIDEBAR_MIN, resizeRef.current.startWidth + (clientX - resizeRef.current.startX))
      );
      resizeRef.current.liveWidth = next;
      applyDom(next, next <= SIDEBAR_COLLAPSED + 4);
    };

    const onUp = () => {
      resizeRef.current.active = false;
      const live = resizeRef.current.liveWidth;
      const collapsed = live <= SIDEBAR_COLLAPSED + 4;
      if (collapsed) {
        collapsedRef.current = true;
      } else {
        collapsedRef.current = false;
        widthRef.current = live;
      }
      saveSidebarPrefs(widthRef.current, collapsedRef.current);

      sidebarRef.current?.classList.remove("is-resizing");
      document.body.classList.remove("sidebar-resizing");
      applyDom(collapsed ? SIDEBAR_COLLAPSED : widthRef.current, collapsed);

      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
  }, [applyDom]);

  const initialWidth = isMobile
    ? SIDEBAR_DEFAULT
    : (collapsedRef.current ? SIDEBAR_COLLAPSED : widthRef.current);

  return (
    <>
      {mobileOpen && <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />}
      <aside
        ref={sidebarRef}
        className={[
          "sidebar",
          collapsedRef.current && !isMobile ? "collapsed" : "",
          mobileOpen ? "open" : ""
        ].filter(Boolean).join(" ")}
        style={{ width: initialWidth }}
        aria-label="Admin navigation"
      >
        <div className="sidebar-brand">
          <div className="brand-icon"><Globe2 size={22} /></div>
          <div className="sidebar-brand-text">
            <strong>Belize Tourism</strong>
            <span>Analytics</span>
          </div>
          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={toggleCollapsed}
            aria-label="Toggle sidebar"
            title="Toggle sidebar"
          >
            <PanelLeftClose size={18} className="icon-collapse" />
            <PanelLeftOpen size={18} className="icon-expand" />
          </button>
        </div>

        <p className="sidebar-label">Navigation</p>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              className={tab === id ? "active" : ""}
              onClick={() => { onNavigate(id); setMobileOpen(false); }}
              data-tooltip={label}
              aria-label={label}
            >
              <Icon size={18} />
              <span className="nav-label">{label}</span>
            </button>
          ))}
        </nav>

        {!isMobile && (
          <div
            className="sidebar-resizer"
            onMouseDown={onResizeStart}
            onTouchStart={onResizeStart}
            role="separator"
            aria-orientation="vertical"
            aria-valuemin={SIDEBAR_MIN}
            aria-valuemax={SIDEBAR_MAX}
            aria-label="Resize sidebar"
          />
        )}
      </aside>
    </>
  );
});

const COLORS = [
  "#2563eb", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4",
  "#f97316", "#84cc16", "#e11d48", "#6366f1", "#14b8a6", "#eab308"
];

const KPI_THEMES = [
  { bg: "linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)", border: "#2563eb", iconBg: "#2563eb" },
  { bg: "linear-gradient(135deg, #d1fae5 0%, #6ee7b7 100%)", border: "#059669", iconBg: "#059669" },
  { bg: "linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)", border: "#d97706", iconBg: "#d97706" },
  { bg: "linear-gradient(135deg, #fce7f3 0%, #f9a8d4 100%)", border: "#db2777", iconBg: "#db2777" },
  { bg: "linear-gradient(135deg, #ede9fe 0%, #c4b5fd 100%)", border: "#7c3aed", iconBg: "#7c3aed" },
  { bg: "linear-gradient(135deg, #cffafe 0%, #67e8f9 100%)", border: "#0891b2", iconBg: "#0891b2" }
];

const YEARS = Array.from({ length: 19 }, (_, i) => 2008 + i);
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DESTINATIONS = ["Belize", "Costa Rica", "El Salvador", "Guatemala", "Honduras", "Nicaragua", "Panama", "Dominican Republic"];
const ORIGINS = ["United States", "Canada", "Guatemala", "El Salvador", "Honduras", "Mexico", "Costa Rica", "Nicaragua", "Panama", "United Kingdom", "Germany", "Spain", "France", "Italy", "Netherlands", "Colombia", "Argentina", "Brazil", "Puerto Rico", "Peru"];
const REGIONS = ["North America", "Central America", "South America", "Europe", "Caribbean"];
const REASONS = ["Vacation, recreation and leisure", "Visiting family and friends", "Business", "Other", "Meetings and conventions"];
const ENTRY = ["Air", "Land", "Maritime"];

const fmt = n => Intl.NumberFormat("en-US").format(Math.round(n || 0));
const compact = n => Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n || 0);
const pct = n => `${Number(n || 0).toFixed(1)}%`;
const avg = (arr, fn) => arr.length ? arr.reduce((s, r) => s + fn(r), 0) / arr.length : 0;
const sum = (arr, fn) => arr.reduce((s, r) => s + fn(r), 0);

const groupSum = (arr, key, value) => {
  const m = new Map();
  arr.forEach(r => m.set(key(r), (m.get(key(r)) || 0) + value(r)));
  return [...m].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
};

const pickWeighted = (rnd, items) => {
  const total = items.reduce((s, x) => s + x[1], 0);
  let n = rnd() * total;
  for (const [v, w] of items) {
    n -= w;
    if (n <= 0) return v;
  }
  return items[items.length - 1][0];
};

// Stable seeded 10,000-row synthetic dataset
function makeData(count = 10000) {
  let seed = 20251123;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const rows = [];
  const originWeights = [
    ["United States", 34], ["Canada", 12], ["Guatemala", 9], ["El Salvador", 8],
    ["Honduras", 7], ["Mexico", 6], ["Costa Rica", 5], ["Nicaragua", 4],
    ["Panama", 4], ["United Kingdom", 2], ["Germany", 2], ["Spain", 1.5],
    ["France", 1.5], ["Italy", 1.2], ["Netherlands", 1], ["Colombia", 1],
    ["Argentina", 1], ["Brazil", 1], ["Puerto Rico", 1], ["Peru", 0.8]
  ];

  for (let i = 0; i < count; i++) {
    const year = 2008 + Math.floor(rnd() * 19);
    const month = 1 + Math.floor(rnd() * 12);
    const day = 1 + Math.floor(rnd() * 28);
    const type = rnd() < 0.77 ? "Overnight" : "Excursionist";
    const destination = pickWeighted(rnd, DESTINATIONS.map((d, j) => [d, [8, 9, 11, 15, 13, 8, 12, 24][j]]));
    const origin = pickWeighted(rnd, originWeights);
    const region = origin === "United States" || origin === "Canada" || origin === "Mexico" ? "North America" :
      ["Guatemala", "El Salvador", "Honduras", "Costa Rica", "Nicaragua", "Panama"].includes(origin) ? "Central America" :
      ["Colombia", "Argentina", "Brazil", "Peru"].includes(origin) ? "South America" :
      ["United Kingdom", "Germany", "Spain", "France", "Italy", "Netherlands"].includes(origin) ? "Europe" : "Caribbean";
    const reason = pickWeighted(rnd, REASONS.map((v, j) => [v, [64, 23, 5, 5, 3][j]]));
    const entry = pickWeighted(rnd, ENTRY.map((v, j) => [v, [78, 21, 1][j]]));
    const covid = year === 2020 ? (month < 4 ? 0.75 : 0.12) : year === 2021 ? 0.42 : year === 2022 ? 0.78 : 1;
    const trend = 0.62 + (year - 2008) * 0.035;
    const season = [1.12, 1.15, 1.2, 1.08, 0.9, 0.82, 0.88, 0.84, 0.78, 0.82, 0.96, 1.18][month - 1];
    const destFactor = destination === "Dominican Republic" ? 1.55 : destination === "Guatemala" ? 1.1 : 1;
    const arrivals = Math.max(1, Math.round((type === "Overnight" ? 260 : 105) * season * covid * trend * destFactor * (0.55 + rnd() * 0.9)));
    const stay = type === "Overnight" ? 4.8 + rnd() * 5.2 : 1;
    const spend = type === "Overnight" ? 65 + rnd() * 215 : 35 + rnd() * 105;
    const cruise = entry === "Maritime" || (type === "Excursionist" && rnd() < 0.2);
    const cruiseArrivals = cruise ? Math.round(arrivals * (0.2 + rnd() * 0.8)) : 0;

    rows.push({
      id: i + 1,
      date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      year,
      month,
      monthName: MONTHS[month - 1],
      origin,
      region,
      destination,
      type,
      reason,
      entry,
      arrivals,
      stay: +stay.toFixed(1),
      spend: +spend.toFixed(1),
      revenue: Math.round(arrivals * spend * stay),
      cruiseArrivals,
      cruiseCalls: cruise ? Math.max(0, Math.round(rnd() * 2)) : 0,
      occupancy: +(42 + rnd() * 52).toFixed(1),
      bookings: Math.max(1, Math.round(arrivals * (0.012 + rnd() * 0.025))),
      y: year
    });
  }
  return rows;
}

const DATA = makeData(10000);

function Select({ label, value, onChange, options }) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="select-wrap">
        <select value={value} onChange={e => onChange(e.target.value)}>
          {options.map(o => (
            <option key={String(o.value)} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown size={14} />
      </div>
    </label>
  );
}

function Panel({ title, subtitle, children, filters, wide = false, tools, accentColor = "#2563eb" }) {
  return (
    <section className={`panel ${wide ? "wide" : ""}`} style={{ borderTop: `4px solid ${accentColor}` }}>
      <div className="panel-head">
        <div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {tools}
      </div>
      {filters && <div className="chart-filters">{filters}</div>}
      <div className="chart-area">{children}</div>
    </section>
  );
}

function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="tooltip">
      <b>{label}</b>
      {payload.map((p, i) => (
        <div key={i} className="tip-row">
          <i style={{ background: p.color || p.fill || COLORS[i % COLORS.length] }} />
          <span>{p.name}:</span>
          <strong>{typeof p.value === "number" ? fmt(p.value) : p.value}</strong>
        </div>
      ))}
    </div>
  );
}

function Kpi({ label, value, change, icon: Icon, themeIndex = 0 }) {
  const theme = KPI_THEMES[themeIndex % KPI_THEMES.length];
  return (
    <div className="kpi" style={{ background: theme.bg, borderLeft: `5px solid ${theme.border}` }}>
      <div className="kpi-top">
        <span>{label}</span>
        <div className="kpi-icon" style={{ background: theme.iconBg }}>
          <Icon size={17} color="#fff" />
        </div>
      </div>
      <strong>{value}</strong>
      <small className={change == null ? "neutral" : change >= 0 ? "positive" : "negative"}>
        {change == null ? "Synthetic indicator" : `${change >= 0 ? "+" : ""}${change.toFixed(1)}% vs previous year`}
      </small>
    </div>
  );
}

function Donut({ data, centerLabel, centerValue }) {
  return (
    <div className="donut-wrap">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius="54%" outerRadius="78%" paddingAngle={3}>
            {data.map((d, i) => (
              <Cell key={d.name} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<Tip />} />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
      {centerValue && (
        <div className="donut-center">
          <span>{centerLabel}</span>
          <b>{centerValue}</b>
        </div>
      )}
    </div>
  );
}

function BarRows({ data, dataKey = "value", nameKey = "name", unit = "", multiColor = true, singleColor = COLORS[0] }) {
  return (
    <ResponsiveContainer>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 38, bottom: 4, left: 8 }}>
        <CartesianGrid strokeDasharray="2 4" horizontal={false} stroke="#e2e8f0" />
        <XAxis type="number" tickFormatter={compact} fontSize={11} />
        <YAxis type="category" dataKey={nameKey} width={114} fontSize={11} tickLine={false} />
        <Tooltip content={<Tip />} />
        <Bar dataKey={dataKey} name={unit || "Value"} radius={[0, 6, 6, 0]} label={{ position: "right", fontSize: 10, fill: "#334155", formatter: v => compact(v) }}>
          {data.map((_, i) => (
            <Cell key={i} fill={multiColor ? COLORS[i % COLORS.length] : singleColor} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function LocalFilters({ years, year, setYear, destination, setDestination, origin, setOrigin, type, setType, showType = true }) {
  return (
    <div className="local-filters">
      <Select label="Year" value={year} onChange={setYear} options={[{ value: "All", label: "All years" }, ...years.map(y => ({ value: String(y), label: String(y) }))]} />
      <Select label="Destination" value={destination} onChange={setDestination} options={[{ value: "All", label: "All destinations" }, ...DESTINATIONS.map(x => ({ value: x, label: x }))]} />
      <Select label="Origin" value={origin} onChange={setOrigin} options={[{ value: "All", label: "All origins" }, ...ORIGINS.map(x => ({ value: x, label: x }))]} />
      {showType && (
        <Select
          label="Visitor type"
          value={type}
          onChange={setType}
          options={[
            { value: "All", label: "All types" },
            { value: "Overnight", label: "Overnight tourists" },
            { value: "Excursionist", label: "Excursionists" }
          ]}
        />
      )}
    </div>
  );
}

function ChartCard({ title, subtitle, data, kind = "bar", dataKey = "value", nameKey = "name", filters, wide = false, accentColor = "#2563eb" }) {
  return (
    <Panel title={title} subtitle={subtitle} wide={wide} filters={filters} accentColor={accentColor}>
      {kind === "donut" ? (
        <Donut data={data} />
      ) : kind === "horizontal" ? (
        <BarRows data={data} dataKey={dataKey} nameKey={nameKey} multiColor />
      ) : (
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 14, right: 12, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey={nameKey} fontSize={10} interval={0} angle={-15} textAnchor="end" height={48} />
            <YAxis tickFormatter={compact} fontSize={10} />
            <Tooltip content={<Tip />} />
            <Bar dataKey={dataKey} name="Arrivals" radius={[5, 5, 0, 0]} label={{ position: "top", fontSize: 10, formatter: compact }}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </Panel>
  );
}

export default function App() {
  const [globalYear, setGlobalYear] = useState("2026");
  const [globalDestination, setGlobalDestination] = useState("All");
  const [globalOrigin, setGlobalOrigin] = useState("All");
  const [globalType, setGlobalType] = useState("All");
  const [tab, setTab] = useState("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [local, setLocal] = useState({});
  const [sort, setSort] = useState({ key: "arrivals", dir: "desc" });

  const years = YEARS;
  const globalRows = useMemo(
    () => DATA.filter(r =>
      (globalYear === "All" || r.year === +globalYear) &&
      (globalDestination === "All" || r.destination === globalDestination) &&
      (globalOrigin === "All" || r.origin === globalOrigin) &&
      (globalType === "All" || r.type === globalType)
    ),
    [globalYear, globalDestination, globalOrigin, globalType]
  );

  const latest = globalYear === "All" ? 2026 : +globalYear;
  const current = globalRows.filter(r => r.year === latest);
  const previous = globalRows.filter(r => r.year === latest - 1);
  const arrivals = sum(current, r => r.arrivals);
  const priorArrivals = sum(previous, r => r.arrivals);
  const growth = priorArrivals ? ((arrivals - priorArrivals) / priorArrivals) * 100 : 0;
  const cruiseCalls = sum(current, r => r.cruiseCalls);
  const cruiseVisitors = sum(current, r => r.cruiseArrivals);

  const setLF = (id, key, value) => setLocal(p => ({ ...p, [id]: { ...p[id], [key]: value } }));
  const getLocal = (id) => ({ year: globalYear, destination: globalDestination, origin: globalOrigin, type: globalType, ...(local[id] || {}) });
  const scoped = (id) => {
    const f = getLocal(id);
    return DATA.filter(r =>
      (f.year === "All" || r.year === +f.year) &&
      (f.destination === "All" || r.destination === f.destination) &&
      (f.origin === "All" || r.origin === f.origin) &&
      (f.type === "All" || r.type === f.type)
    );
  };

  const filtersFor = (id, showType = true) => {
    const f = getLocal(id);
    return (
      <LocalFilters
        years={years}
        {...f}
        setYear={v => setLF(id, "year", v)}
        setDestination={v => setLF(id, "destination", v)}
        setOrigin={v => setLF(id, "origin", v)}
        setType={v => setLF(id, "type", v)}
        showType={showType}
      />
    );
  };

  const yearly = useMemo(
    () => YEARS.map(y => {
      const a = globalRows.filter(r => r.year === y);
      return {
        year: y,
        Overnight: sum(a.filter(r => r.type === "Overnight"), r => r.arrivals),
        Excursionists: sum(a.filter(r => r.type === "Excursionist"), r => r.arrivals),
        total: sum(a, r => r.arrivals)
      };
    }),
    [globalRows]
  );

  const yoy = yearly.map((r, i) => ({
    ...r,
    growth: i && yearly[i - 1].total ? ((r.total - yearly[i - 1].total) / yearly[i - 1].total) * 100 : 0
  })).slice(1);

  const destinationData = groupSum(current, r => r.destination, r => r.arrivals);
  const typeData = groupSum(current, r => r.type, r => r.arrivals);
  const cruiseByDest = groupSum(current, r => r.destination, r => r.cruiseCalls);

  const filteredTable = useMemo(() => {
    const q = search.toLowerCase();
    return globalRows
      .filter(r => !q || [r.date, r.origin, r.destination, r.type, r.reason, r.entry, r.region].some(v => String(v).toLowerCase().includes(q)))
      .sort((a, b) => {
        const av = a[sort.key], bv = b[sort.key];
        return (av > bv ? 1 : av < bv ? -1 : 0) * (sort.dir === "asc" ? 1 : -1);
      });
  }, [globalRows, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredTable.length / pageSize));
  const visible = filteredTable.slice((page - 1) * pageSize, page * pageSize);

  const exportCsv = () => {
    const cols = ["date", "year", "month", "origin", "region", "destination", "type", "reason", "entry", "arrivals", "occupancy", "stay", "bookings", "spend", "revenue", "cruiseCalls", "cruiseArrivals"];
    const csv = [cols.join(","), ...globalRows.map(r => cols.map(c => JSON.stringify(r[c] ?? "")).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "belize-tourism-10k-data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setGlobalYear("2026");
    setGlobalDestination("All");
    setGlobalOrigin("All");
    setGlobalType("All");
    setSearch("");
    setPage(1);
    setLocal({});
  };

  return (
    <div className="app-shell">
      <AppSidebar
        tab={tab}
        onNavigate={setTab}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <main className="content">
        <header className="topbar">
          <div className="brand">
            <button className="menu-btn" onClick={() => setMobileOpen(v => !v)} aria-label="Toggle menu">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="brand-icon desktop-only"><Globe2 size={24} /></div>
            <div>
              <h1>Belize Tourism Analytics</h1>
              <p>Vibrant Tourism Intelligence & Statistical Dashboard</p>
            </div>
          </div>
        </header>

        <section className="global-filter">
          <div className="filter-title">
            <Filter size={17} />
            <b>Global filters</b>
            <span>Applies to overview, KPIs and data table</span>
          </div>
          <div className="global-fields">
            <Select label="Year" value={globalYear} onChange={v => { setGlobalYear(v); setPage(1); }} options={[{ value: "All", label: "All years" }, ...years.map(y => ({ value: String(y), label: String(y) }))]} />
            <Select label="Destination country" value={globalDestination} onChange={setGlobalDestination} options={[{ value: "All", label: "All destinations" }, ...DESTINATIONS.map(x => ({ value: x, label: x }))]} />
            <Select label="Origin country" value={globalOrigin} onChange={setGlobalOrigin} options={[{ value: "All", label: "All origins" }, ...ORIGINS.map(x => ({ value: x, label: x }))]} />
            <Select label="Visitor type" value={globalType} onChange={setGlobalType} options={[{ value: "All", label: "All types" }, { value: "Overnight", label: "Overnight tourists" }, { value: "Excursionist", label: "Excursionists" }]} />
            <button className="btn reset" onClick={reset}><RotateCcw size={14} /> Reset all</button>
          </div>
        </section>

        {tab === "overview" && (
        <>
          <div className="section-heading">
            <div>
              <h2>Tourism performance overview</h2>
              <p>Key indicators and destination performance for {globalYear === "All" ? "all selected years" : globalYear}</p>
            </div>
            <span className="record-count">{fmt(globalRows.length)} filtered records</span>
          </div>

          <div className="kpi-grid">
            <Kpi themeIndex={0} label="International visitor arrivals" value={compact(arrivals)} change={growth} icon={Users} />
            <Kpi themeIndex={1} label="Overnight visitors" value={compact(sum(current.filter(r => r.type === "Overnight"), r => r.arrivals))} change={null} icon={BedDouble} />
            <Kpi themeIndex={2} label="Cruise visitors" value={compact(cruiseVisitors)} change={null} icon={Ship} />
            <Kpi themeIndex={3} label="Average hotel occupancy" value={pct(avg(current, r => r.occupancy))} change={null} icon={TrendingUp} />
            <Kpi themeIndex={4} label="Average length of stay" value={`${avg(current.filter(r => r.type === "Overnight"), r => r.stay).toFixed(1)} days`} change={null} icon={CalendarDays} />
            <Kpi themeIndex={5} label="Estimated tourism revenue" value={`$${compact(sum(current, r => r.revenue))}`} change={growth} icon={Wallet} />
          </div>

          <div className="grid three">
            <ChartCard accentColor="#2563eb" title="Visitor arrivals by type" subtitle="Overnight tourists and excursionists" data={typeData} kind="donut" />
            <ChartCard accentColor="#10b981" title="Arrivals by destination country" subtitle="Top destination markets" data={destinationData.slice(0, 8)} kind="horizontal" />
            <Panel accentColor="#f59e0b" title="Year-over-year variation by destination" subtitle="Annual arrivals growth (%)">
              {(() => {
                const d = DESTINATIONS.map(name => {
                  const now = sum(current.filter(r => r.destination === name), r => r.arrivals);
                  const before = sum(previous.filter(r => r.destination === name), r => r.arrivals);
                  return { name, value: before ? +(((now - before) / before) * 100).toFixed(1) : 0 };
                });
                return <BarRows data={d} unit="Growth %" />;
              })()}
            </Panel>
          </div>

          <div className="grid two">
            <Panel accentColor="#6366f1" title="International visitor arrivals" subtitle="Yearly arrivals split by visitor type" wide>
              <ResponsiveContainer>
                <BarChart data={yearly}>
                  <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={compact} />
                  <Tooltip content={<Tip />} />
                  <Legend />
                  <Bar stackId="a" dataKey="Overnight" name="Overnight tourists" fill="#2563eb" radius={[0, 0, 0, 0]} />
                  <Bar stackId="a" dataKey="Excursionists" name="Excursionists" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Panel>

            <Panel accentColor="#ec4899" title="Year-over-year variation" subtitle="Annual percentage change">
              <ResponsiveContainer>
                <BarChart data={yoy}>
                  <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="year" />
                  <YAxis unit="%" />
                  <ReferenceLine y={0} stroke="#64748b" />
                  <Tooltip content={<Tip />} />
                  <Bar dataKey="growth" name="Growth %" radius={[4, 4, 0, 0]}>
                    {yoy.map((d, i) => (
                      <Cell key={i} fill={d.growth >= 0 ? "#10b981" : "#f43f5e"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Panel>
          </div>

          <div className="grid two">
            <Panel accentColor="#2563eb" title="Monthly visitor arrivals" subtitle="Overnight visitors, cruise visitors and previous-year comparison" filters={filtersFor("overview-monthly")}>
              {(() => {
                const a = scoped("overview-monthly");
                const d = MONTHS.map((month, i) => ({
                  month,
                  overnight: sum(a.filter(r => r.month === i + 1 && r.type === "Overnight"), r => r.arrivals),
                  cruise: sum(a.filter(r => r.month === i + 1), r => r.cruiseArrivals),
                  previous: sum(a.filter(r => r.month === i + 1 && r.year === latest - 1), r => r.arrivals)
                }));
                return (
                  <ResponsiveContainer>
                    <ComposedChart data={d}>
                      <defs>
                        <linearGradient id="overnightGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 4" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={compact} />
                      <Tooltip content={<Tip />} />
                      <Legend />
                      <Area dataKey="overnight" name="Overnight tourists" fill="url(#overnightGrad)" stroke="#2563eb" strokeWidth={2.5} />
                      <Bar dataKey="cruise" name="Cruise visitors" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      <Line dataKey="previous" name="Previous year" stroke="#ec4899" strokeWidth={2.5} strokeDasharray="5 4" dot={{ r: 3 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                );
              })()}
            </Panel>

            <Panel accentColor="#10b981" title="Hotel occupancy by month" subtitle="Average estimated occupancy rate (%)" filters={filtersFor("overview-occupancy")}>
              {(() => {
                const a = scoped("overview-occupancy");
                const d = MONTHS.map((month, i) => ({
                  month,
                  value: +avg(a.filter(r => r.month === i + 1), r => r.occupancy).toFixed(1)
                }));
                return (
                  <ResponsiveContainer>
                    <AreaChart data={d}>
                      <defs>
                        <linearGradient id="occGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 4" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[0, 100]} unit="%" />
                      <Tooltip content={<Tip />} />
                      <Area dataKey="value" name="Occupancy %" stroke="#10b981" fill="url(#occGrad)" strokeWidth={2.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                );
              })()}
            </Panel>

            <Panel accentColor="#f97316" title="Tourism revenue by month" subtitle="Estimated visitor expenditure in USD" filters={filtersFor("overview-revenue")}>
              {(() => {
                const a = scoped("overview-revenue");
                const d = MONTHS.map((month, i) => ({
                  month,
                  value: sum(a.filter(r => r.month === i + 1), r => r.revenue)
                }));
                return (
                  <ResponsiveContainer>
                    <BarChart data={d}>
                      <CartesianGrid strokeDasharray="3 4" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={compact} />
                      <Tooltip content={<Tip />} />
                      <Bar dataKey="value" name="Revenue (USD)" radius={[6, 6, 0, 0]}>
                        {d.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                );
              })()}
            </Panel>

            <Panel accentColor="#8b5cf6" title="Monthly tourism seasonality" subtitle="Average monthly arrivals across selected years" filters={filtersFor("overview-seasonality")}>
              {(() => {
                const a = scoped("overview-seasonality");
                const d = MONTHS.map((month, i) => ({
                  month,
                  value: Math.round(avg(YEARS.map(y => sum(a.filter(r => r.year === y && r.month === i + 1), r => r.arrivals)), v => v))
                }));
                return (
                  <ResponsiveContainer>
                    <LineChart data={d}>
                      <CartesianGrid strokeDasharray="3 4" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={compact} />
                      <Tooltip content={<Tip />} />
                      <Line type="monotone" dataKey="value" name="Average arrivals" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 5, fill: "#ec4899", stroke: "#fff", strokeWidth: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                );
              })()}
            </Panel>

            <Panel accentColor="#06b6d4" title="Average length of stay by origin" subtitle="Overnight visitor stay duration (days)" filters={filtersFor("overview-stay-origin")}>
              {(() => {
                const a = scoped("overview-stay-origin").filter(r => r.type === "Overnight");
                const d = groupSum(a, r => r.origin, r => r.stay)
                  .map(x => ({ name: x.name, value: +avg(a.filter(r => r.origin === x.name), r => r.stay).toFixed(1) }))
                  .sort((x, y) => y.value - x.value)
                  .slice(0, 10);
                return <BarRows data={d} unit="Days" />;
              })()}
            </Panel>

            <Panel accentColor="#f59e0b" title="Average daily spend by origin" subtitle="Estimated USD per visitor per day" filters={filtersFor("overview-spend-origin")}>
              {(() => {
                const a = scoped("overview-spend-origin");
                const d = ORIGINS.map(name => ({
                  name,
                  value: +avg(a.filter(r => r.origin === name), r => r.spend).toFixed(1)
                }))
                  .sort((x, y) => y.value - x.value)
                  .slice(0, 10);
                return <BarRows data={d} unit="USD/day" />;
              })()}
            </Panel>

            <Panel accentColor="#f59e0b" title="Cruise visitors by year" subtitle="Annual cruise passenger trend" filters={filtersFor("overview-cruise-year")}>
              {(() => {
                const a = scoped("overview-cruise-year");
                const d = YEARS.map(year => ({
                  year,
                  value: sum(a.filter(r => r.year === year), r => r.cruiseArrivals)
                }));
                return (
                  <ResponsiveContainer>
                    <BarChart data={d}>
                      <CartesianGrid strokeDasharray="3 4" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="year" />
                      <YAxis tickFormatter={compact} />
                      <Tooltip content={<Tip />} />
                      <Bar dataKey="value" name="Cruise visitors" radius={[5, 5, 0, 0]}>
                        {d.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                );
              })()}
            </Panel>

            <Panel accentColor="#ec4899" title="Arrivals by region of origin" subtitle="Source market mix" filters={filtersFor("overview-region")}>
              <Donut data={groupSum(scoped("overview-region"), r => r.region, r => r.arrivals)} />
            </Panel>
          </div>
        </>
      )}

      {tab === "arrivals" && (
        <>
          <div className="section-heading">
            <div>
              <h2>International visitor arrivals</h2>
              <p>Annual and year-over-year trend analysis</p>
            </div>
          </div>
          <div className="grid two">
            <Panel accentColor="#6366f1" title="International visitor arrivals by year" subtitle="Stacked arrivals: overnight tourists and excursionists" wide filters={filtersFor("arrivals")}>
              {(() => {
                const a = scoped("arrivals");
                const data = YEARS.map(y => ({
                  year: y,
                  Overnight: sum(a.filter(r => r.year === y && r.type === "Overnight"), r => r.arrivals),
                  Excursionists: sum(a.filter(r => r.year === y && r.type === "Excursionist"), r => r.arrivals)
                }));
                return (
                  <ResponsiveContainer>
                    <BarChart data={data}>
                      <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="year" />
                      <YAxis tickFormatter={compact} />
                      <Tooltip content={<Tip />} />
                      <Legend />
                      <Bar dataKey="Overnight" stackId="x" fill="#2563eb" />
                      <Bar dataKey="Excursionists" stackId="x" fill="#ec4899" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                );
              })()}
            </Panel>

            <Panel accentColor="#10b981" title="Year-over-year variation in arrivals" subtitle="Growth or decline versus previous year" wide filters={filtersFor("arrivals-yoy")}>
              {(() => {
                const a = scoped("arrivals-yoy");
                const vals = YEARS.map(y => sum(a.filter(r => r.year === y), r => r.arrivals));
                const d = YEARS.slice(1).map((y, i) => ({
                  year: y,
                  growth: vals[i] ? +(((vals[i + 1] - vals[i]) / vals[i]) * 100).toFixed(1) : 0
                }));
                return (
                  <ResponsiveContainer>
                    <BarChart data={d}>
                      <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="year" />
                      <YAxis unit="%" />
                      <ReferenceLine y={0} stroke="#64748b" />
                      <Tooltip content={<Tip />} />
                      <Bar dataKey="growth" name="Growth %" radius={[4, 4, 0, 0]}>
                        {d.map((r, i) => (
                          <Cell key={i} fill={r.growth >= 0 ? "#10b981" : "#f43f5e"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                );
              })()}
            </Panel>
          </div>
        </>
      )}

      {tab === "motives" && (
        <>
          <div className="section-heading">
            <div>
              <h2>Travel reason analysis</h2>
              <p>Visitor purpose distribution and destination-level comparison</p>
            </div>
          </div>
          <div className="grid two">
            <Panel accentColor="#8b5cf6" title="International tourists by reason for travel" subtitle="Weighted distribution of arrivals" filters={filtersFor("reason-donut")}>
              <Donut data={groupSum(scoped("reason-donut"), r => r.reason, r => r.arrivals)} />
            </Panel>
            <Panel accentColor="#ec4899" title="Travel reason by destination country" subtitle="100% stacked share by destination" wide filters={filtersFor("reason-stack")}>
              {(() => {
                const a = scoped("reason-stack");
                const d = DESTINATIONS.map(name => {
                  const rows = a.filter(r => r.destination === name);
                  const total = sum(rows, r => r.arrivals) || 1;
                  const o = { destination: name };
                  REASONS.forEach(x => {
                    o[x] = +(sum(rows.filter(r => r.reason === x), r => r.arrivals) / total * 100).toFixed(1);
                  });
                  return o;
                });
                return (
                  <ResponsiveContainer>
                    <BarChart data={d}>
                      <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="destination" fontSize={10} />
                      <YAxis domain={[0, 100]} unit="%" />
                      <Tooltip content={<Tip />} />
                      <Legend />
                      <Bar dataKey={REASONS[0]} stackId="a" fill="#10b981" />
                      <Bar dataKey={REASONS[1]} stackId="a" fill="#2563eb" />
                      <Bar dataKey={REASONS[2]} stackId="a" fill="#8b5cf6" />
                      <Bar dataKey={REASONS[3]} stackId="a" fill="#ec4899" />
                      <Bar dataKey={REASONS[4]} stackId="a" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                );
              })()}
            </Panel>
          </div>
          <p className="footnote"><b>Note:</b> Travel reason categories are generated mock classifications. Country-level shares are calculated from the selected synthetic records.</p>
        </>
      )}

      {tab === "entry" && (
        <>
          <div className="section-heading">
            <div>
              <h2>International arrivals by entry method</h2>
              <p>Air, land and maritime arrival patterns</p>
            </div>
          </div>
          <div className="grid two">
            <Panel accentColor="#06b6d4" title="Arrivals by entry method" subtitle="Overall share of arrivals" filters={filtersFor("entry-donut")}>
              <Donut data={groupSum(scoped("entry-donut"), r => r.entry, r => r.arrivals)} />
            </Panel>
            <Panel accentColor="#2563eb" title="Entry method by destination country" subtitle="100% stacked comparison" wide filters={filtersFor("entry-stack")}>
              {(() => {
                const a = scoped("entry-stack");
                const d = DESTINATIONS.map(name => {
                  const rows = a.filter(r => r.destination === name);
                  const total = sum(rows, r => r.arrivals) || 1;
                  const o = { destination: name };
                  ENTRY.forEach(x => {
                    o[x] = +(sum(rows.filter(r => r.entry === x), r => r.arrivals) / total * 100).toFixed(1);
                  });
                  return o;
                });
                return (
                  <ResponsiveContainer>
                    <BarChart data={d}>
                      <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="destination" fontSize={10} />
                      <YAxis domain={[0, 100]} unit="%" />
                      <Tooltip content={<Tip />} />
                      <Legend />
                      <Bar dataKey="Air" stackId="a" fill="#2563eb" />
                      <Bar dataKey="Maritime" stackId="a" fill="#ec4899" />
                      <Bar dataKey="Land" stackId="a" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                );
              })()}
            </Panel>
          </div>
        </>
      )}

      {tab === "markets" && (
        <>
          <div className="section-heading">
            <div>
              <h2>Origin market intelligence</h2>
              <p>Tourist source regions, intraregional arrivals and priority markets</p>
            </div>
          </div>
          <div className="grid two">
            <Panel accentColor="#2563eb" title="Arrivals by origin region" subtitle="Percentage distribution by region" filters={filtersFor("regions")}>
              <Donut data={groupSum(scoped("regions"), r => r.region, r => r.arrivals)} />
            </Panel>
            <Panel accentColor="#10b981" title="Top 20 arrivals by origin country" subtitle="Leading source markets" filters={filtersFor("top20")}>
              <BarRows data={groupSum(scoped("top20"), r => r.origin, r => r.arrivals).slice(0, 20)} />
            </Panel>
            <Panel accentColor="#f59e0b" title="SICA intraregional arrivals by destination" subtitle="Central American destination market share" filters={filtersFor("sica")}>
              {(() => {
                const a = scoped("sica").filter(r => ["Guatemala", "El Salvador", "Honduras", "Costa Rica", "Nicaragua", "Panama", "Belize"].includes(r.origin));
                return <Donut data={groupSum(a, r => r.destination, r => r.arrivals)} />;
              })()}
            </Panel>
            <Panel accentColor="#8b5cf6" title="Intraregional visitors by origin country" subtitle="Origin market volume" filters={filtersFor("intraregional")}>
              {(() => {
                const a = scoped("intraregional").filter(r => ["Guatemala", "El Salvador", "Honduras", "Costa Rica", "Nicaragua", "Panama", "Belize"].includes(r.origin));
                return <BarRows data={groupSum(a, r => r.origin, r => r.arrivals)} />;
              })()}
            </Panel>
            <Panel accentColor="#ec4899" title="Priority European source markets" subtitle="Arrivals from six selected European markets" filters={filtersFor("europe")}>
              {(() => {
                const eu = ["Spain", "United Kingdom", "Germany", "France", "Italy", "Netherlands"];
                const a = scoped("europe").filter(r => eu.includes(r.origin));
                return <BarRows data={groupSum(a, r => r.origin, r => r.arrivals)} />;
              })()}
            </Panel>
            <Panel accentColor="#06b6d4" title="European market share by destination" subtitle="Distribution of selected European origins" filters={filtersFor("europe-donut")}>
              {(() => {
                const eu = ["Spain", "United Kingdom", "Germany", "France", "Italy", "Netherlands"];
                return <Donut data={groupSum(scoped("europe-donut").filter(r => eu.includes(r.origin)), r => r.destination, r => r.arrivals)} />;
              })()}
            </Panel>
          </div>
          <p className="footnote"><b>Note:</b> Origin region is derived from the synthetic country-of-origin field. The intraregional and European market charts are mock market views, not official SICA reporting.</p>
        </>
      )}

      {tab === "spending" && (
        <>
          <div className="section-heading">
            <div>
              <h2>Stay duration & visitor spending</h2>
              <p>Destination-level averages and comparisons</p>
            </div>
          </div>
          <div className="grid two">
            <Panel accentColor="#6366f1" title="Average length of stay by destination" subtitle="Average days for overnight visitor records" wide filters={filtersFor("stay")}>
              {(() => {
                const a = scoped("stay").filter(r => r.type === "Overnight");
                const d = DESTINATIONS.map(name => ({
                  name,
                  value: +avg(a.filter(r => r.destination === name), r => r.stay).toFixed(1)
                }));
                return (
                  <ResponsiveContainer>
                    <BarChart data={d}>
                      <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" fontSize={10} />
                      <YAxis />
                      <Tooltip content={<Tip />} />
                      <Bar dataKey="value" name="Average stay (days)" radius={[6, 6, 0, 0]} label={{ position: "top" }}>
                        {d.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                );
              })()}
            </Panel>

            <Panel accentColor="#10b981" title="Average daily tourist spending by destination" subtitle="Estimated USD per visitor per day" wide filters={filtersFor("spend")}>
              {(() => {
                const a = scoped("spend");
                const d = DESTINATIONS.map(name => ({
                  name,
                  value: +avg(a.filter(r => r.destination === name), r => r.spend).toFixed(1)
                }));
                return (
                  <ResponsiveContainer>
                    <BarChart data={d}>
                      <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" fontSize={10} />
                      <YAxis tickFormatter={v => "$" + v} />
                      <Tooltip content={<Tip />} />
                      <Bar dataKey="value" name="Average daily spend (USD)" radius={[6, 6, 0, 0]} label={{ position: "top", formatter: v => "$" + v }}>
                        {d.map((_, i) => (
                          <Cell key={i} fill={COLORS[(i + 3) % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                );
              })()}
            </Panel>
          </div>
        </>
      )}

      {tab === "cruises" && (
        <>
          <div className="section-heading">
            <div>
              <h2>Cruise tourism analytics</h2>
              <p>Cruise ship calls, cruise visitor arrivals and destination mix</p>
            </div>
          </div>
          <div className="kpi-grid">
            <Kpi themeIndex={2} label="Cruise ship calls" value={fmt(cruiseCalls)} change={null} icon={Ship} />
            <Kpi themeIndex={0} label="Cruise visitor arrivals" value={compact(cruiseVisitors)} change={null} icon={Users} />
            <Kpi themeIndex={3} label="Cruise visitor share" value={pct(arrivals ? (cruiseVisitors / arrivals) * 100 : 0)} change={null} icon={TrendingUp} />
            <Kpi themeIndex={1} label="Cruise destinations" value={String(cruiseByDest.filter(x => x.value > 0).length)} change={null} icon={Globe2} />
          </div>
          <div className="grid two">
            <Panel accentColor="#f59e0b" title="Cruise ship calls by destination" subtitle="Share of cruise calls" filters={filtersFor("cruise-calls")}>
              <Donut data={groupSum(scoped("cruise-calls"), r => r.destination, r => r.cruiseCalls).filter(x => x.value > 0)} />
            </Panel>
            <Panel accentColor="#ec4899" title="Cruise visitors by destination" subtitle="Share of cruise visitor arrivals" filters={filtersFor("cruise-visitors")}>
              <Donut data={groupSum(scoped("cruise-visitors"), r => r.destination, r => r.cruiseArrivals).filter(x => x.value > 0)} />
            </Panel>
            <Panel accentColor="#f97316" title="Cruise ship calls by year" subtitle="Annual cruise ship arrivals" filters={filtersFor("cruise-year-calls")}>
              {(() => {
                const a = scoped("cruise-year-calls");
                const d = YEARS.map(year => ({
                  year,
                  value: sum(a.filter(r => r.year === year), r => r.cruiseCalls)
                }));
                return (
                  <ResponsiveContainer>
                    <BarChart data={d}>
                      <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip content={<Tip />} />
                      <Bar dataKey="value" name="Cruise calls" radius={[5, 5, 0, 0]}>
                        {d.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                );
              })()}
            </Panel>
            <Panel accentColor="#6366f1" title="Cruise visitor arrivals by year" subtitle="Annual cruise passenger trend" filters={filtersFor("cruise-year-visitors")}>
              {(() => {
                const a = scoped("cruise-year-visitors");
                const d = YEARS.map(year => ({
                  year,
                  value: sum(a.filter(r => r.year === year), r => r.cruiseArrivals)
                }));
                return (
                  <ResponsiveContainer>
                    <BarChart data={d}>
                      <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="year" />
                      <YAxis tickFormatter={compact} />
                      <Tooltip content={<Tip />} />
                      <Bar dataKey="value" name="Cruise visitors" radius={[5, 5, 0, 0]}>
                        {d.map((_, i) => (
                          <Cell key={i} fill={COLORS[(i + 4) % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                );
              })()}
            </Panel>
          </div>
        </>
      )}

      {tab === "records" && (
        <>
          <div className="section-heading">
            <div>
              <h2>Tourism data records</h2>
              <p>Search, sort and review the generated mock records</p>
            </div>
            <span className="record-count">{fmt(filteredTable.length)} matching rows</span>
          </div>
          <section className="table-panel">
            <div className="table-toolbar">
              <div className="table-search">
                <Search size={16} />
                <input
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search origin, destination, reason, date..."
                />
              </div>
              <div className="table-toolbar-actions">
                <Select
                  label="Rows per page"
                  value={String(pageSize)}
                  onChange={v => { setPageSize(+v); setPage(1); }}
                  options={[10, 20, 50, 100].map(n => ({ value: String(n), label: String(n) }))}
                />
                <button type="button" className="btn export" onClick={exportCsv}>
                  <Download size={15} /> Export CSV
                </button>
              </div>
            </div>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    {[
                      ["date", "Date", false],
                      ["year", "Year", true],
                      ["origin", "Origin", false],
                      ["destination", "Destination", false],
                      ["type", "Visitor type", false],
                      ["reason", "Travel reason", false],
                      ["entry", "Entry", false],
                      ["arrivals", "Arrivals", true],
                      ["occupancy", "Occupancy %", true],
                      ["stay", "Stay days", true],
                      ["bookings", "Bookings", true],
                      ["spend", "Daily spend", true],
                      ["revenue", "Est. revenue", true],
                      ["cruiseCalls", "Cruise calls", true]
                    ].map(([k, l, numeric]) => {
                      const active = sort.key === k;
                      return (
                        <th
                          key={k}
                          className={[numeric ? "num" : "", active ? "sorted" : ""].filter(Boolean).join(" ")}
                          onClick={() => setSort(s => ({ key: k, dir: s.key === k && s.dir === "desc" ? "asc" : "desc" }))}
                        >
                          <span className="th-inner">
                            {l}
                            {active ? (
                              sort.dir === "desc" ? <ChevronDown size={14} /> : <ChevronUp size={14} />
                            ) : (
                              <ArrowUpDown size={13} className="th-sort-idle" />
                            )}
                          </span>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {visible.length === 0 ? (
                    <tr className="empty-row">
                      <td colSpan={14}>No records match your search or filters.</td>
                    </tr>
                  ) : visible.map(r => (
                    <tr key={r.id}>
                      <td className="mono">{r.date}</td>
                      <td className="num">{r.year}</td>
                      <td className="strong">{r.origin}</td>
                      <td>{r.destination}</td>
                      <td>
                        <span className={`badge ${r.type === "Overnight" ? "overnight" : "excursion"}`}>
                          {r.type}
                        </span>
                      </td>
                      <td className="reason-cell">{r.reason}</td>
                      <td>
                        <span className={`badge ${r.entry.toLowerCase()}`}>
                          {r.entry}
                        </span>
                      </td>
                      <td className="num strong">{fmt(r.arrivals)}</td>
                      <td className="num">{r.occupancy.toFixed(1)}%</td>
                      <td className="num">{r.stay.toFixed(1)}</td>
                      <td className="num">{fmt(r.bookings)}</td>
                      <td className="num">${r.spend.toFixed(1)}</td>
                      <td className="num strong revenue">${compact(r.revenue)}</td>
                      <td className="num">{r.cruiseCalls}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pagination">
              <span className="page-meta">
                Showing <b>{filteredTable.length ? ((page - 1) * pageSize + 1) : 0}–{Math.min(page * pageSize, filteredTable.length)}</b> of <b>{fmt(filteredTable.length)}</b>
              </span>
              <div className="page-controls">
                <button type="button" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
                <span className="page-pill">Page {page} / {totalPages}</span>
                <button type="button" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
              </div>
            </div>
          </section>
        </>
      )}

        <footer>Belize Tourism Analytics · Synthetic demo dataset · 10,000 records · Built with React and Recharts</footer>
      </main>
    </div>
  );
}