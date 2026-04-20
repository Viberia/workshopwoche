'use client';
import '../globals.css';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from "framer-motion";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function sanitizeFilename(name) {
  return String(name || "Export")
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Entfernt ungültige XML 1.0 Zeichen aus Strings (sonst kann Excel .xlsx nicht öffnen).
 * Erlaubt bleiben: Tab (\u0009), LF (\u000A), CR (\u000D)
 */
function sanitizeCellValue(v) {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") {
    return v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
  }
  return v; // Zahlen/Booleans/etc. unverändert lassen
}

function sanitizeRows(rows) {
  return rows.map((row) => {
    const out = {};
    for (const [k, v] of Object.entries(row || {})) {
      out[k] = sanitizeCellValue(v);
    }
    return out;
  });
}

function downloadExcel(filename, rows, exportTitle = "Export", opts = {}) {
  if (!Array.isArray(rows) || rows.length === 0) return;

  const {
    sheetName = "Daten",
    infoRows = null, // optional: eigene Info-Zeilen (AOA)
  } = opts;

  const safeBase = sanitizeFilename(filename).replace(/\.xlsx$/i, "");
  const finalName = `${safeBase}.xlsx`;

  // ✅ Excel-kompatibel machen
  const safeRows = sanitizeRows(rows);

  // Daten-Sheet
  const ws = XLSX.utils.json_to_sheet(safeRows);

  // Spaltenbreiten (robust, ohne riesiges Math.max(...spread))
  const keys = Object.keys(safeRows[0] || {});
  ws["!cols"] = keys.map((k) => {
    const headerLen = String(k).length;
    const maxCellLen = safeRows.reduce((m, r) => {
      const v = String(r?.[k] ?? "");
      return Math.max(m, v.length);
    }, headerLen);

    return { wch: Math.min(60, maxCellLen + 2) };
  });

  // Autofilter
  if (ws["!ref"]) ws["!autofilter"] = { ref: ws["!ref"] };

  // Info-Sheet
  const defaultInfo = [
    ["Export", sanitizeCellValue(exportTitle)],
    ["Exportiert am", new Date().toLocaleString("de-DE")],
  ];
  const info = XLSX.utils.aoa_to_sheet(infoRows || defaultInfo);
  info["!cols"] = [{ wch: 18 }, { wch: 50 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.utils.book_append_sheet(wb, info, "Info");

  const out = XLSX.write(wb, {
    bookType: "xlsx",
    type: "array",
    compression: true,
  });

  saveAs(
    new Blob([out], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    finalName
  );
}





/* =======================  DESIGN TOKENS – Aurora Campus  ======================= */
const TOK = {
  bg: '#0B1220',
  surface: '#1C2432',
  surfaceAlt: '#16202B',
  text: '#E6EEF5',
  textDim: '#A9B4C0',
  border: '#2A3442',
  gradFrom: '#2563EB',
  gradTo: '#22D3EE',
  info: '#60A5FA',
  okBg: '#0E2D1B', okText: '#86EFAC', okBorder: '#1C6E3B',
  warnBg: '#2E1B0B', warnText: '#FACC15', warnBorder: '#8A4B10',
  errBg: '#2C0B12', errText: '#F87171', errBorder: '#8A1C1C',
  capLow: '#22c55e', capMid: '#f59e0b', capHigh: '#ef4444',
};

/* ==========================  SAMPLE DATA (Demo)  =========================== */
const SAMPLE = [
  { id: 'w1', title: 'Robotics Basics', date: '12.11.2025', time: '10:00–12:00', room: 'B102',
    registered: 35, capacity: 40, status: 'confirmed', tags: ['Technik', 'Einführung'],
    participants: [{ id:'p1', name:'Anna Becker', class:'9b', status:'Bestätigt' },{ id:'p2', name:'Mehmet Kaya', class:'9a', status:'Bestätigt' }],
    notes: 'Bitte Laptops mitbringen.' },
  { id: 'w2', title: 'Physik-Experimente', date: '18.11.2025', time: '13:00–15:00', room: 'Lab1',
    registered: 12, capacity: 18, status: 'confirmed', tags: ['Naturwissenschaften'],
    participants: [], notes: '' },
  { id: 'w3', title: 'Kreatives Schreiben', date: '14.11.2025', time: '09:00–11:00', room: 'A201',
    registered: 0, capacity: 20, status: 'locked', tags: ['Sprache','Kreativ'], participants: [],
    notes: 'Material wird gestellt.' },
];

/* =============================  ICONS (Lucide-like) ============================ */
const Ic = {
  home: (p) => <svg width="24" height="24" viewBox="0 0 24 24" {...p} fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 10.5 12 4l9 6.5"/><path d="M5 10v9h14v-9"/><path d="M9 19v-6h6v6"/></svg>,
  hat:  (p) => <svg width="24" height="24" viewBox="0 0 24 24" {...p} fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M2 10l10-5 10 5-10 5-10-5Z"/><path d="M6 12v3c0 1.7 3.6 3 6 3s6-1.3 6-3v-3"/></svg>,
  users: (p) => (
   <svg width="24" height="24" viewBox="0 0 24 24" {...p}
        fill="none" stroke="currentColor" strokeWidth="1.6"
        strokeLinecap="round" strokeLinejoin="round">
     <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
     <circle cx="9" cy="7" r="4" />
     <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
     <path d="M16 3.13a4 4 0 0 1 0 7.75" />
   </svg>
 ),

cog: (p) => (
  <svg width="24" height="24" viewBox="0 0 24 24" {...p}
       fill="none" stroke="currentColor" strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 12a7.4 7.4 0 0 0-.1-1.3l2-1.6-2-3.4-2.4.7a7.5 7.5 0 0 0-2.2-1.3l-.4-2.5H9.7l-.4 2.5a7.5 7.5 0 0 0-2.2 1.3l-2.4-.7-2 3.4 2 1.6a7.4 7.4 0 0 0 0 2.6l-2 1.6 2 3.4 2.4-.7a7.5 7.5 0 0 0 2.2 1.3l.4 2.5h4.2l.4-2.5a7.5 7.5 0 0 0 2.2-1.3l2.4.7 2-3.4-2-1.6A7.4 7.4 0 0 0 19.4 12z"/>
  </svg>
),

  search:(p)=> <svg width="20" height="20" viewBox="0 0 24 24" {...p} fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7"/><path d="M21 21l-3.2-3.2"/></svg>,
  check:(p)=> <svg width="18" height="18" viewBox="0 0 24 24" {...p} fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  lock: (p)=> <svg width="18" height="18" viewBox="0 0 24 24" {...p} fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 1 1 8 0v3"/></svg>,
  download:(p)=><svg width="18" height="18" viewBox="0 0 24 24" {...p} fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/></svg>,
  plus:(p)=> <svg width="18" height="18" viewBox="0 0 24 24" {...p} fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>,
};

/* ================================  UTILS  ===================================== */
const cx  = (...c) => c.filter(Boolean).join(' ');
const pct = (used, total) => Math.max(0, Math.min(100, Math.round((used / Math.max(1, total)) * 100)));
const capColor = (r) => (r <= 0.7 ? TOK.capLow : r <= 0.85 ? TOK.capMid : TOK.capHigh);
// Hilfsfunktionen für WS-Slots
function extractSlotsFromString(value) {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => Number(s.replace(/\D/g, ""))) // "WS 3" -> 3
    .filter(Boolean);
}

function slotsOverlap(a, b) {
  return a.some((s) => b.includes(s));
}

function slotToDate(slotNumber) {
  if (slotNumber <= 2) return "2026-07-13"; // Mo
  if (slotNumber <= 4) return "2026-07-14"; // Di
  return "2026-07-15";                      // Mi
}

function makeUUID() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function dateAtLocalMidnight(dateStr) {
  // dateStr: "YYYY-MM-DD"
  if (!dateStr) return null;
  const d = new Date(`${dateStr}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function isWindowOpen(now, startStr, endStr) {
  const start = dateAtLocalMidnight(startStr);
  const end = dateAtLocalMidnight(endStr);

  if (!start || !end) return false; // wenn nicht konfiguriert: zu
  return now >= start && now < end;
}


// Welche WS gehören zu welchem Tag?
const DAY_SLOTS = {
  "2026-07-13": ["WS 1", "WS 2"], // Mo
  "2026-07-14": ["WS 3", "WS 4"], // Di
  "2026-07-15": ["WS 5", "WS 6"], // Mi
};

function isValidDayWorkshopSet(slotNums) {
  if (!Array.isArray(slotNums) || slotNums.length === 0) return false;

  const sorted = [...slotNums].sort((a, b) => a - b);

  // Erlaubte Tagespaare
  const validPairs = [
    [1,2],
    [3,4],
    [5,6]
  ];

  // Wir prüfen: lassen sich alle Slots in gültige 2er-Paare zerlegen?
  for (let i = 0; i < sorted.length; i += 2) {
    const pair = [sorted[i], sorted[i+1]];
    if (pair.includes(undefined)) return false;

    const ok = validPairs.some(
      ([x,y]) => x === pair[0] && y === pair[1]
    );

    if (!ok) return false;
  }

  return true;
}
function GradeDropdown({ value, onChange, min = 5 }) {
  const [open, setOpen] = useState(false);
  const grades = [5,6,7,8,9,10].filter(g => g >= min);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`
          w-full flex justify-between items-center
          bg-[#16202B] border border-[#2A3442]
          rounded-lg px-4 py-2 text-sm
          hover:border-[#3B82F6]
          focus:ring-2 focus:ring-[var(--g1)]
          transition
        `}
      >
        <span className={value ? "text-white" : "text-[#7a8796]"}>
          {value ? `Jgst ${value}` : "Bitte wählen"}
        </span>
        <span className="text-[#7a8796]">▾</span>
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="
            absolute z-20 mt-2 w-full
            bg-[#0F172A]
            border border-[#2A3442]
            rounded-lg
            shadow-xl
            overflow-hidden
          "
        >
          {grades.map(g => (
            <button
              key={g}
              type="button"
              onClick={() => {
                onChange(g);
                setOpen(false);
              }}
              className="
                w-full text-left px-4 py-2 text-sm
                hover:bg-[#1C2736]
                transition
              "
            >
              Jgst {g}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}




/* ============================  LIST VIEW (TABLE)  ============================ */
function ListView({
  workshops,
  profile,          // ✅ HIER
  filters,
  setFilters,
  selected,
  setSelected,
  onOpen,
  onLock,
  onExport
}) {

  const TOK = {
    border: '#2A3442',
    textDim: '#A9B4C0',
    surface: '#1C2432',
    surfaceAlt: '#16202B',
    g1: '#2563EB',
    g2: '#22D3EE',
  };

  return (
    <div className="space-y-5">
      {/* HEADER / FILTER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-[22px] font-semibold">Workshop-Liste ({workshops.length})</h2>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="bg-[#16202B] border border-[#2A3442] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--g1)] outline-none"
          >
            <option>Alle</option>
            <option>Freigegeben</option>
            <option>Gesperrt</option>
          </select>
        </div>

        <button className="btn btn-primary focus-aurora" onClick={onExport}>
          <Ic.download /> Exportieren
        </button>
      </div>

      {/* TABLE */}
      <div className="w-full overflow-x-auto touch-pan-x overscroll-x-contain">
  <table className="min-w-max w-full text-sm border-collapse">

          <thead style={{ background: TOK.surfaceAlt, color: TOK.textDim }}>
            <tr>
              <th className="px-4 py-3 text-left font-medium">Titel</th>
              <th className="px-4 py-3 text-left font-medium">Datum</th>
              <th className="px-4 py-3 text-left font-medium">Zeit</th>
              <th className="px-4 py-3 text-left font-medium">Raum</th>
              <th className="px-4 py-3 text-left font-medium">Belegt</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Aktionen</th>
            </tr>
          </thead>

          <tbody>
            {workshops.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-6 text-[#7b8895]">
                  Keine Workshops gefunden.
                </td>
              </tr>
            )}

            {workshops.map((w) => {
              const ratio = w.registered / Math.max(1, w.capacity);
              const percent = Math.round(ratio * 100);
              const critical = ratio > 0.85;

              return (
                <tr
                  key={w.id}
                  className="border-t border-[#2A3442] hover:bg-[#1C2736] transition-colors"
                >
                  {/* TITLE + TAGS */}
                  <td className="px-4 py-3 align-top">
                    <div className="font-medium text-[15px] text-white">{w.title}</div>
                    {w.tags && w.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {w.tags.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-[2px] text-[11px] rounded-md bg-[#1b2736] border border-[#2A3442] text-[#a9b4c0]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3 align-top text-[#d3d9e0]">{w.date}</td>
                  <td className="px-4 py-3 align-top text-[#d3d9e0]">{w.time}</td>
                  <td className="px-4 py-3 align-top text-[#d3d9e0]">{w.room}</td>

                  {/* Belegung */}
                  <td className="px-4 py-3 align-top tnum text-[#d3d9e0]">
                    <div className="flex items-center gap-2">
                      <span>{w.registered}/{w.capacity}</span>
                      <div className="flex-1 h-2 bg-[#1b2736] rounded overflow-hidden">
                        <div
                          style={{
                            width: `${percent}%`,
                            background: critical ? "#ef4444" : "#22c55e",
                          }}
                          className="h-full"
                        />
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 align-top">
                    {w.status === "confirmed" ? (
                      <span className="chip" style={{
                        background: "#0E2D1B",
                        color: "#86EFAC",
                        border: "1px solid #1C6E3B",
                      }}>
                        <Ic.check /> Freigegeben
                      </span>
                    ) : (
                      <span className="chip" style={{
                        background: "#2C0B12",
                        color: "#F87171",
                        border: "1px solid #8A1C1C",
                      }}>
                        <Ic.lock /> Gesperrt
                      </span>
                    )}
                  </td>

                  {/* Aktionen */}
                  <td className="px-4 py-3 align-top text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onOpen(w.id)}
                        className="btn btn-secondary focus-aurora"
                        style={{ height: 34, padding: "0 10px" }}
                      >
                        Öffnen
                      </button>
                     {(() => {
  const isOwner = profile?.id === w.owner_id;
  const isAdmin = profile?.role === "admin";

  if (w.status === "locked" && (isOwner || isAdmin) && !w.admin_locked) {
    return (
      <button
        onClick={() => onLock(w.id)}
        className="btn btn-tertiary"
      >
        Freigeben
      </button>
    );
  }

  if (w.status === "confirmed" && isAdmin) {
    return (
      <button
        onClick={() => onLock(w.id)}
        className="btn btn-tertiary"
      >
        Sperren
      </button>
    );
  }

  return null; // 👈 wichtig
})()}

                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ===========================  ROOT COMPONENT  ================================= */
export default function Page()
 {
useEffect(() => {
  const id = setInterval(() => setNow(new Date()), 30_000); // alle 30s reicht
  return () => clearInterval(id);
}, []);

  const supabase = React.useMemo(() => createClientComponentClient(), []);
  const inputRef = useRef(null);
  const [user, setUser] = useState(null);
  
  const [profile, setProfile] = useState(null);
  const [teacherCfg, setTeacherCfg] = useState({
  from: null,
  to: null,
  loading: true,
});

const [now, setNow] = useState(() => new Date());

const teacherWindowOpen = useMemo(() => {
  if (teacherCfg.loading) return false;
  return isWindowOpen(now, teacherCfg.from, teacherCfg.to);
}, [now, teacherCfg]);

const teacherWindowLabel = useMemo(() => {
  if (!teacherCfg.from || !teacherCfg.to) return "Zeitfenster nicht konfiguriert";
  return `${teacherCfg.from} bis ${teacherCfg.to}`;
}, [teacherCfg]);

  const [showNewModal, setShowNewModal] = useState(false);
const [selectedDate, setSelectedDate] = useState(null);
const [room, setRoom] = useState("");
const [searchRoom, setSearchRoom] = useState("");
const [step, setStep] = useState(1);
const [draft, setDraft] = useState({
  title: "",
  description: "",
  notes: "",
  tags: [],
  date: "",
  timeslots: [],
  asDayWorkshop: false,
  allowMultiBooking: false,
  capacity: 20,
  room: "",

  // ✅ NEU
  gradeFrom: "",
  gradeTo: "",
});


const capacityNumber = Number(draft.capacity);
const capacityIsEmpty = draft.capacity === "";
const capacityIsInvalid =
  !capacityIsEmpty && (isNaN(capacityNumber) || capacityNumber < 20);


const selectedSlotNumbers = React.useMemo(() => {
  if (!draft.timeslots.length) return [];
  return extractSlotsFromString(draft.timeslots.join(","));
}, [draft.timeslots]);


// ----------------------------------------------
// Prüfen, ob Raum blockiert ist
// ----------------------------------------------
function isRoomBlocked(room) {
  return blockedRooms.includes(room);
}




const ROOMS = {
  "R-Bereich": ["R06","R09","R10","R14","R15","R20","R22","R23","R25","R26","R38","R39","R43","R45","R47","R48","R49","R51","R52","R53","R54","R55","R56","R102","R103","R104","R105","R131","R132","R133","R134","R135","R137","R138","R139","R140","R142","R143","R144","R145","R146","R147","R148","R149","R225","R227","R228","R229","R231","R232","R233","R234","R235","R237","R239","R240","R242","R243","R244","R245","R311","R315","R316","R317","R319","R321","R322","R323","R324","R325","R327","R328","R329","R331","R332","R333","R334"],
  "Bibliothek": ["Bibi 01","Bibi 02","Bibi 03"],
  "Mensa / PZ": ["Mensa","PZ"],
  "Turnhallen": ["TH1","TH2","TH3","TH4","TH5","TH6","SH1"],
  "Außen / Spezial": ["Schulgarten","VR","Schulküche","Gummiplatz"],
};

const [menuOpen, setMenuOpen] = useState(false);
  const [view, setView] = useState('overview'); // 'overview' | 'list' | 'detail' | 'settings'
  const [workshops, setWorkshops] = useState([]);
  const [allConfirmedWorkshops, setAllConfirmedWorkshops] = useState([]);

const blockedRooms = React.useMemo(() => {
  if (!selectedSlotNumbers.length) return [];

  return allConfirmedWorkshops
    .filter((w) => {
      const otherSlots = extractSlotsFromString(w.time);
      return slotsOverlap(selectedSlotNumbers, otherSlots);
    })
    .map((w) => w.room);
}, [allConfirmedWorkshops, selectedSlotNumbers]);






  const [detail, setDetail] = useState(null);
  const [selected, setSelected] = useState([]);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ status:'Alle' });
  const [toast, setToast] = useState(null);

  const [confirm, setConfirm] = useState(null);
  const [undo, setUndo] = useState(null);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
useEffect(() => {
  const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') {
      window.location.href = '/login';
    }
  });
  return () => subscription.subscription.unsubscribe();
}, [supabase]);

useEffect(() => {
  if (view !== "detail" || !detail?.id) return;
  const updated = workshops.find((x) => x.id === detail.id);
  if (updated) setDetail(updated);
}, [workshops, view, detail?.id]);


const draftSlotNums = React.useMemo(
  () => extractSlotsFromString(draft.timeslots.join(",")),
  [draft.timeslots]
);

const canBeDayWorkshopUI = React.useMemo(
  () => isValidDayWorkshopSet(draftSlotNums),
  [draftSlotNums]
);



  /* ---------- Auth + Profil laden (nur Felder aus deinem SQL) ---------- */
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { user }, error } = await supabase.auth.getUser();


      if (!mounted) return;
      if (error) console.error(error);
      setUser(user || null);

      if (user) {
        const { data: prof, error: pErr } = await supabase
          .from('profiles')
          .select('id, full_name, role, created_at')
          .eq('id', user.id)
          .single();
        if (!mounted) return;
        if (pErr) console.error(pErr);
        setProfile(prof || null);
      }
    })();
    return () => { mounted = false; };
  }, [supabase]);
// Workshops aus Supabase laden
const loadWorkshops = React.useCallback(async () => {
  if (!profile) return;
  setLoading(true);

  let data, error;

  if (profile.role === "teacher") {
    ({ data, error } = await supabase
  .from("workshops_with_counts")
  .select("*")
  .eq("owner_id", profile.id)
  .order("created_at", { ascending: false }));
  } else {
    // Fallback (z.B. admin) – ohne registered (optional später erweitern)
    ({ data, error } = await supabase
      .from("workshops")
      .select(`
id,
title,
description,
notes,
date,
time,
room,
capacity,
status,
admin_locked,
owner_id,
created_at,
tags,
is_day_workshop,
repeat_group,
allow_multi_booking
`)
      .order("created_at", { ascending: false }));
  }

  if (error) {
    console.error("Fehler beim Laden der Workshops:", error);
    setWorkshops([]);
  } else {
    setWorkshops(data || []);
  }

  setLoading(false);
}, [supabase, profile]);

useEffect(() => {
  if (!profile) return;
  loadWorkshops();
}, [profile, loadWorkshops]);

useEffect(() => {
  if (!profile) return;

  let alive = true;

  (async () => {
    const { data, error } = await supabase
      .from("app_config")
      .select("teacher_admin_open_from, teacher_admin_cutoff_date")
      .eq("id", 1)
      .single();

    if (!alive) return;

    if (error) {
      console.error(error);
      setTeacherCfg({ from: null, to: null, loading: false });
      return;
    }

    setTeacherCfg({
      from: data.teacher_admin_open_from || null,
      to: data.teacher_admin_cutoff_date || null,
      loading: false,
    });
  })();

  return () => { alive = false; };
}, [supabase, profile]);





//alle freigegebenen Workshops laden (für Raum-Sperre)
useEffect(() => {
  if (!profile) return;

  async function loadConfirmed() {
    const { data, error } = await supabase
      .from("workshops")
      .select("id, date, time, room, status")
      .eq("status", "confirmed");

    if (error) {
      console.error("Fehler beim Laden:", JSON.stringify(error, null, 2));
      return;
    }

    setAllConfirmedWorkshops(data || []);
  }

  loadConfirmed();
}, [supabase, profile]);

async function adminUnlock(id) {
  const { error } = await supabase.rpc("admin_unlock_workshop", { _workshop_id: id });

  if (error) {
    console.error(error);
    showToast("Entsperren fehlgeschlagen.");
    return;
  }

  setWorkshops(prev =>
    prev.map(w => w.id === id ? { ...w, admin_locked: false } : w)
  );

  showToast("Workshop entsperrt.");
}


  /* ---------- Shortcuts (mit Tipp-Schutz) ---------- */
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      const isTyping = tag === 'input' || tag === 'textarea' || tag === 'select';
      if (isTyping) return;

      if (e.key === '/' && !e.metaKey && !e.ctrlKey) { e.preventDefault(); searchRef.current?.focus(); }
      const k = e.key?.toLowerCase();
      if (k === 'n') { e.preventDefault(); onCreateNew(); }
      if (k === 'e') { e.preventDefault(); onExport(); }
      if (k === 'f') { e.preventDefault(); setView('list'); }
      if (k === 's') {
        e.preventDefault();
if (k === 's') {
  e.preventDefault();

  // DETAIL: je nach Rolle/Owner
  if (view === 'detail' && detail?.id) {
    requestToggle(detail.id);
    return;
  }

  // LIST: bulkToggle ist aktuell nur UI-Dummy (ändert lokal!)
  // Wenn du es behalten willst, lass es. Sonst raus damit.
  if (view === 'list' && selected.length) {
    bulkToggle(selected);
    return;
  }
}

      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [view, detail, selected]);

  /* ---------- Filter ---------- */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return workshops.filter(w => {
      const byQ = !q || [
  w.title,
  w.date,
  w.time,
  ...(Array.isArray(w.tags) ? w.tags : [])
].some(s => String(s).toLowerCase().includes(q));

      const byStatus = filters.status === 'Alle'
        || (filters.status==='Freigegeben' && w.status==='confirmed')
        || (filters.status==='Gesperrt' && w.status==='locked');
      return byQ && byStatus;
    });
  }, [workshops, query, filters]);

  useEffect(() => { setLoading(true); const t=setTimeout(()=>setLoading(false), 300); return ()=>clearTimeout(t); }, [view]);

  /* ---------- Actions ---------- */
  function showToast(msg){ setToast(msg); setTimeout(()=>setToast(null), 2600); }
function onCreateNew() {
  setShowNewModal(true);
}

const hasTitle = !!draft.title.trim();
const hasDescription = !!draft.description.trim();

const hasValidGrades =
  Number.isInteger(draft.gradeFrom) &&
  Number.isInteger(draft.gradeTo) &&
  draft.gradeFrom <= draft.gradeTo;

// 🔒 Darf von Step 1 → Step 2
const canGoStep1 =
  hasTitle &&
  hasDescription &&
  hasValidGrades;


// Pflichtfelder-Check 
const canSave =
  !!draft.title.trim() &&
  !!draft.date &&
  draft.timeslots.length > 0 &&
  !!draft.room &&
  !capacityIsEmpty &&
  !capacityIsInvalid &&
  !!draft.gradeFrom &&
  !!draft.gradeTo;



//Speichern in eine Funktion auslagern (wird in Step 4 aufgerufen)
async function saveWorkshop({ omitNotes = false } = {}) {
  if (!profile?.id) {
    showToast("Profil noch nicht geladen.");
    return;
  }

  // Pflichtfelder
  if (!canSave) {
    showToast("Bitte alle Pflichtfelder korrekt ausfüllen.");
    return;
  }

  // Raum-Block-Regel
  if (isRoomBlocked(draft.room)) {
    showToast("Raum oder Workshop-Slot ist bereits durch einen freigegebenen Workshop belegt.");
    return;
  }

  // Hinweise (optional)
  const notesValue = omitNotes ? null : (draft.notes?.trim() || null);

  // Slots normalisieren
  const normalizeSlot = (s) => {
    const cleaned = s.replace(/\s+/g, "").toUpperCase();
    const nr = cleaned.replace("WS", "");                
    return `WS ${nr}`;                                  
  };

  const slots = [...draft.timeslots]
    .map(normalizeSlot)
    .sort((a, b) => Number(a.replace(/\D/g, "")) - Number(b.replace(/\D/g, "")));

  const slotNums = slots.map(s => Number(s.replace(/\D/g, ""))).filter(Boolean);

  const canBeDayWorkshop = isValidDayWorkshopSet(slotNums);
const isDayWorkshop = draft.asDayWorkshop && canBeDayWorkshop;


  let payload = [];

  if (isDayWorkshop) {
    // Slots in 2er-Gruppen schneiden
const dayPairs = [];
for (let i = 0; i < slots.length; i += 2) {
  dayPairs.push([slots[i], slots[i+1]]);
}

payload = dayPairs.map(pair => {
  const nums = pair.map(s => Number(s.replace(/\D/g,"")));
  return {
    title: draft.title.trim(),
    description: draft.description?.trim() || null,
    notes: notesValue,

grade_from: draft.gradeFrom ? Number(draft.gradeFrom) : null,
grade_to: draft.gradeTo ? Number(draft.gradeTo) : null,



    date: slotToDate(nums[0]),
    time: pair.join(","),
    room: draft.room,
    capacity: draft.capacity,
    tags: draft.tags,
    status: "locked",
    owner_id: profile.id,

    is_day_workshop: true,
    repeat_group: null,
    allow_multi_booking: false,
  };
});

  } else {
    const repeatGroup = slots.length > 1 ? makeUUID() : null;

    payload = slots.map((slot) => {
      const n = Number(slot.replace(/\D/g, ""));
      return {
        title: draft.title.trim(),
        description: draft.description?.trim() || null,
        notes: notesValue,

grade_from: draft.gradeFrom ? Number(draft.gradeFrom) : null,
grade_to: draft.gradeTo ? Number(draft.gradeTo) : null,


        date: slotToDate(n),
        time: slot,

        room: draft.room,
        capacity: draft.capacity,
        tags: draft.tags,
        status: "locked",
        owner_id: profile.id,

        is_day_workshop: false,
        repeat_group: repeatGroup,
        allow_multi_booking: slots.length > 1 ? !!draft.allowMultiBooking : false,
      };
    });
  }

  const { data, error } = await supabase
    .from("workshops")
    .insert(payload)
    .select();

  if (error) {
    console.error(error);
    showToast("Speichern fehlgeschlagen.");
    return;
  }

  setWorkshops((prev) => [...(data || []), ...prev]);

  setShowNewModal(false);
  setStep(1);
setDraft({
  title: "",
  description: "",
  notes: "",
  tags: [],
  date: "",
  timeslots: [],
  asDayWorkshop: false,
  allowMultiBooking: false,
  capacity: 20,
  room: "",
  gradeFrom: "",
  gradeTo: "",
});


  showToast("Workshop angelegt (gesperrt).");
}


  async function openDetail(id) {
  const w0 = workshops.find((x) => x.id === id) || null;
  setDetail(w0);
  setView("detail");


  const { data, error } = await supabase
    .from("workshops")
    .select("notes")
    .eq("id", id)
    .single();

  if (error) {
    // optional: console.log(error);
    return;
  }

  // Detail updaten
  setDetail((prev) => (prev && prev.id === id ? { ...prev, notes: data?.notes ?? null } : prev));

  setWorkshops((prev) =>
    prev.map((w) => (w.id === id ? { ...w, notes: data?.notes ?? null } : w))
  );
}

  function requestToggle(id) {
  const w = workshops.find(x => x.id === id);
  if (!w) return;

  const isOwner = profile?.id === w.owner_id;
  const isAdmin = profile?.role === "admin";

  // Lehrer darf nur freigeben
  if (isOwner && w.status === "locked" && !w.admin_locked) {
    setConfirm({ id, title: w.title, action: "teacher_release" });
    return;
  }

  // Admin darf sperren
  if (isAdmin && !w.admin_locked) {
    setConfirm({ id, title: w.title, action: "admin_lock" });
    return;
  }

  // Admin darf entsperren
  if (isAdmin && w.status === "locked" && w.admin_locked) {
    setConfirm({ id, title: w.title, action: "admin_unlock" });
    return;
  }
}

async function teacherRelease(id) {
  if (!teacherWindowOpen) {
    showToast(`Freigeben nur im Lehrer-Zeitfenster möglich: ${teacherWindowLabel}`);
    return;
  }

  const w = workshops.find(x => x.id === id);
  if (!w) return;

  const isOwner = profile?.id === w.owner_id;
  if (!isOwner || w.status !== "locked") return;

  const { error } = await supabase.rpc(
    "teacher_release_workshop",
    { _workshop_id: id }
  );

  if (error) {
    console.error(error);
    showToast("Freigeben nicht erlaubt.");
    return;
  }

  // 🔴 WICHTIG: KEIN setWorkshops hier
  await loadWorkshops();

  showToast("Workshop freigegeben.");
}


async function adminLock(id) {

  const { error } = await supabase.rpc(
    "admin_lock_workshop",
    { _workshop_id: id }
  );

  if (error) {
    showToast("Sperren fehlgeschlagen.");
    return;
  }

  await loadWorkshops();

  showToast("Workshop gesperrt.");
}



  function undoLast(){ if(!undo) return; const {id, prev} = undo; setWorkshops(prevWs => prevWs.map(w => w.id===id ? ({...w, status: prev}) : w)); setUndo(null); showToast('Rückgängig gemacht.'); }
  function increaseCapacity(id, delta=2){ setWorkshops(prev => prev.map(w => w.id===id ? ({...w, capacity: w.capacity + delta}) : w)); showToast('Kapazität erhöht.'); }
function onExport(participantsOverride) {
  const statusLabel = (s) =>
    s === "confirmed" ? "Freigegeben" : s === "locked" ? "Gesperrt" : (s ?? "—");

  // DETAILANSICHT: Teilnehmerliste exportieren
  if (view === "detail" && detail) {
    const list = Array.isArray(participantsOverride) ? participantsOverride : [];

    if (list.length === 0) {
      showToast("Keine Teilnehmer.");
      return;
    }

    const rows = list.map((p, i) => ({
      Nr: i + 1,
      Name: p.name ?? "—",
      Klasse: p.class ?? "—",
      Anmeldestatus: p.status ?? "—",
    }));

    downloadExcel(
      `${detail.title}-Teilnehmer.xlsx`,
      rows,
      detail.title,
      {
        sheetName: "Teilnehmer",
        infoRows: [
          ["Workshop", sanitizeCellValue(detail.title)],
          ["Exportiert am", new Date().toLocaleString("de-DE")],
        ],
      }
    );

    showToast("Teilnehmerliste exportiert (Excel)");
    return;
  }

  // LISTENANSICHT: Workshop-Liste exportieren (aktuell gefilterte Liste)
  const list = Array.isArray(filtered) ? filtered : [];

  if (list.length === 0) {
    showToast("Keine Workshops zum Export.");
    return;
  }

  const rows = list.map((w, i) => {
    const belegte = Number(w.registered ?? 0);
    const kap = Number(w.capacity ?? 0);
    const frei = Math.max(0, kap - belegte);

    return {
      Nr: i + 1,
      Titel: w.title ?? "—",
      Datum: w.date ?? "—",
      Zeit: String(w.time ?? "—").replace(/,\s*/g, " + "),
      Raum: w.room ?? "—",
      Kapazität: kap || "—",
      Belegt: belegte || 0,
      Frei: frei,
      Status: statusLabel(w.status),
      Tags: Array.isArray(w.tags) ? w.tags.join(", ") : "—",
    };
  });

  const today = new Date().toISOString().slice(0, 10);
  const filterText = filters?.status ? `Filter: ${filters.status}` : "Filter: —";

  downloadExcel(
    `Workshop-Export-${today}.xlsx`,
    rows,
    "Workshop-Liste",
    {
      sheetName: "Workshops",
      infoRows: [
        ["Export", "Workshop-Liste"],
        ["Anzahl", String(list.length)],
        [filterText, ""],
        ["Exportiert am", new Date().toLocaleString("de-DE")],
      ],
    }
  );

  showToast("Workshop-Liste exportiert (Excel)");

  
}





  return (
    <div className="h-screen " style={{ background:TOK.bg, color:TOK.text }}>
      {/* Hintergrund & Orbs – basierend auf global.css */}
    <div className="fixed inset-0 bg-[var(--bg)] text-slate-100 pointer-events-none">
      <div className="hidden md:block pointer-events-none absolute bottom-0 right-0 h-[20rem] w-[20rem] translate-x-1/3 translate-y-1/3 rounded-full bg-gradient-to-tr from-[var(--primary-2)] via-teal-500 to-[var(--primary)] opacity-20 orb orb2" />

<div>
{/* Linke Spalte */}
<div className="relative hidden md:flex items-center justify-center bg-gradient-to-r from-[#0b1020] to-[#0b1020]/80 overflow-hidden">
  {/* Orb jetzt innerhalb der linken Spalte → sichtbar */}


</div>
</div>
</div>


      {/* Global Styles */}
<style jsx global>{`
  :root {
    --bg: ${TOK.bg};
    --surface: ${TOK.surface};
    --surfaceAlt: ${TOK.surfaceAlt};
    --text: ${TOK.text};
    --textDim: ${TOK.textDim};
    --border: ${TOK.border};
    --g1: ${TOK.gradFrom};
    --g2: ${TOK.gradTo};
    --okBg: ${TOK.okBg};
    --okText: ${TOK.okText};
    --okBorder: ${TOK.okBorder};
    --warnBg: ${TOK.warnBg};
    --warnText: ${TOK.warnText};
    --warnBorder: ${TOK.warnBorder};
    --errBg: ${TOK.errBg};
    --errText: ${TOK.errText};
    --errBorder: ${TOK.errBorder};
    --radius-card: 16px;
    --radius-ctl: 12px;
    --shadow-card: 0 8px 24px rgba(0, 0, 0, .35);
  }

  html, body, #__next {
    height: 100%;
    background: var(--bg);
  }

  button,
  .btn,
  [role="button"],
  input[type="button"],
  input[type="submit"] {
    cursor: pointer;
  }

  .focus-aurora:focus-visible {
    outline: 2px solid var(--g1);
    box-shadow: 0 0 0 4px color-mix(in oklab, var(--g2) 55%, transparent);
  }

  .btn {
    height: 44px;
    padding: 0 16px;
    border-radius: var(--radius-ctl);
    font-size: 14px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    justify-content: center;
    transition: transform .14s ease, filter .14s ease, background .14s ease;
  }

  .btn-primary {
    background-image: linear-gradient(90deg, var(--g1), var(--g2));
    color: #fff;
    box-shadow: 0 6px 18px rgba(24, 119, 242, .25);
    position: relative;
    overflow: hidden;
  }

  .btn-primary::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(180deg, rgba(255, 255, 255, .08), rgba(255, 255, 255, 0));
    mix-blend-mode: screen;
  }

  .btn-primary:hover {
    filter: brightness(1.08);
    transform: translateY(-1px);
  }

  .btn-secondary {
    background: color-mix(in oklab, var(--surface) 88%, transparent);
    color: var(--text);
    border: 1px solid var(--border);
    box-shadow: 0 2px 8px rgba(0, 0, 0, .25) inset, 0 8px 18px rgba(0, 0, 0, .25);
  }

  .btn-secondary:hover {
    background: color-mix(in oklab, var(--surface) 92%, transparent);
  }

  .btn-tertiary {
    color: ${TOK.info};
    background: transparent;
  }

  .btn-tertiary:hover {
    text-decoration: underline;
  }

  .chip {
    border-radius: 8px;
    padding: 2px 8px;
    font-size: 12px;
    display: inline-flex;
    gap: 6px;
    align-items: center;
  }

  .card {
    position: relative;
    border-radius: var(--radius-card);
    background: linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.00)), var(--surface);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-card);
  }

  .card::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.03);
  }

  .card:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 28px rgba(0,0,0,.42);
  }

  .divider {
    height: 1px;
    background: var(--border);
    opacity: .7;
  }

  .row-hover:hover {
    background: rgba(255,255,255,.035);
  }

  .tnum {
    font-variant-numeric: tabular-nums;
    font-feature-settings: "tnum" 1;
  }

  .kbd {
    padding: 0 6px;
    border: 1px solid var(--border);
    border-bottom-width: 2px;
    border-radius: 6px;
    color: var(--textDim);
    font-size: 12px;
  }

  .skeleton {
    position: relative;
    overflow: hidden;
    background: #182233;
  }

  .skeleton::after {
    content: '';
    position: absolute;
    inset: 0;
    transform: translateX(-100%);
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.06), transparent);
    animation: shimmer 1.2s infinite;
  }

  @keyframes shimmer {
    100% { transform: translateX(100%); }
  }

  @keyframes slideOutDown {
    0% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(100%); }
  }
  /* Chrome, Edge, Safari, Opera */
  html::-webkit-scrollbar,
  body::-webkit-scrollbar {
    width: 0px;
    height: 0px;
  }

  /* Firefox */
  html, body {
    scrollbar-width: none;      /* keine sichtbare Leiste */
    -ms-overflow-style: none;   /* IE / alter Edge */
  }

  button,
  .btn,
  [role="button"],
  input[type="button"],
  input[type="submit"] {
    cursor: pointer;
  }
    
  /* Chrome, Edge, Safari */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type="number"] {
  -moz-appearance: textfield;
}

`}</style>



      {/* App Shell */}
      <div className="relative z-10 flex h-full">
        {/* Sidebar */}
        <aside style={{ width: 64, background: TOK.surfaceAlt, borderRight:`1px solid ${TOK.border}` }} className="hidden md:flex flex-col items-stretch md:relative">
          {[
            { key:'overview', icon:Ic.home, label:'Übersicht' },
            { key:'list', icon:Ic.hat, label:'Meine Workshops' },
            { key:'participants', icon:Ic.users, label:'Teilnehmer (Liste)' },
            { key:'settings', icon:Ic.cog, label:'Einstellungen' },
          ].map((it) => {
            const active =
              (view==='overview' && it.key==='overview') ||
              (view==='list' && it.key==='list') ||
              (view==='detail' && it.key==='participants') ||
              (view==='settings' && it.key==='settings');
            return (
              <button key={it.key} title={it.label}
                onClick={() => {
  if (it.key === "participants") {
    // Wenn wir schon in einem Workshop sind: Detail öffnen + Teilnehmer-Tab forcieren
    if (detail?.id) {
      window.__preferredTab = "Teilnehmer";
      setView("detail");
    } else {
      // Falls kein Workshop ausgewählt ist: zur Liste (oder Overview)
      setView("list");
    }
    return;
  }

  setView(it.key);
}}

                className={cx('relative h-16 flex items-center justify-center hover:bg-[#1C2432] focus-aurora')}
                aria-label={it.label}>
                {active && <span className="absolute left-0" style={{ width:3, height:28, background:'#22D3EE', borderRadius:2 }} />}
                <it.icon style={{ color: active ? TOK.text : TOK.textDim }} />
              </button>
            );
          })}
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="flex items-center justify-between md:justify-start gap-4 px-6 relative" style={{ height:64, borderBottom:`1px solid ${TOK.border}`, background:'transparent' }}>
            <div className="flex items-center gap-3">
  <button
    className="md:hidden flex items-center justify-center"
    onClick={() => setMenuOpen(true)}
  >
    <svg width="26" height="26" stroke="currentColor">
      <path d="M3 6h18M3 12h18M3 18h18" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  </button>
</div>
  <h1 className="text-[22px] font-semibold hidden md:block">

              {view==='overview' ? 'Übersicht'
               : view==='list' ? 'Meine Workshops'
               : view==='settings' ? 'Einstellungen'
               : (detail?.title || 'Workshop')}
            </h1>
            {/* Suche */}
            <div className="flex-1 flex justify-center md:justify-start w-full">
              <div className="flex items-center gap-2 px-3 card" style={{ width: '100%', maxWidth: 560, height: 44, borderRadius:12 }}>
                <Ic.search style={{ color:TOK.textDim }} />
                <input ref={searchRef} value={query} onChange={e=>setQuery(e.target.value)}
                  placeholder="Workshops durchsuchen…" aria-label="Workshops durchsuchen"
                  className="flex-1 bg-transparent outline-none text-[14px] placeholder-[#7a8796]" />
                <span className="kbd">/</span>
              </div>
            </div>
            {/* Profil */}
            <div className="flex items-center gap-3">
              <div className="text-sm" style={{ color:TOK.textDim }}>{user?.email || '—'}</div>
              <div className="flex items-center justify-center" style={{ width:36, height:36, borderRadius:18, background:TOK.gradFrom, color:'#fff', fontWeight:600 }}>
                {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-6">
            {view==='overview' && (loading ? <SkeletonCards /> :
              <Overview
  workshops={filtered}
  profile={profile}
  onNew={onCreateNew}
  onOpen={(id)=>openDetail(id)}
  onLock={(id)=>requestToggle(id)}
  onParticipants={(id)=>openDetail(id)}
  onIncrease={(id)=>increaseCapacity(id)}
  teacherWindowOpen={teacherWindowOpen}
  teacherWindowLabel={teacherWindowLabel}
/>



            )}

            {view==='list' && (loading ? <SkeletonTable /> :
<ListView
  workshops={filtered}
  profile={profile} 
  filters={filters}
  setFilters={setFilters}
  selected={selected}
  setSelected={setSelected}
  onExport={onExport}
  onOpen={(id)=>openDetail(id)}
  onLock={(id)=>requestToggle(id)}
/>

            )}

{view==='detail' && detail && (
  <DetailView
    w={detail}
    supabase={supabase}
    profile={profile}      
    onBack={()=>setView('list')}
    onExport={onExport}
    onLock={()=>requestToggle(detail.id)}
  />
)}


            {view==='settings' && (
              <SettingsView
                supabase={supabase}
                user={user}
                profile={profile}
                setProfile={setProfile}
                onToast={showToast}
              />
            )}
          </main>
        </div>
      </div>

      {/* Toast */}
      <div aria-live="polite" className="fixed top-4 right-4 z-50">
        {toast && <div className="card px-4 py-3">{toast}</div>}
      </div>

      {/* Undo Snackbar */}
      {undo && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <div className="card px-4 py-3 flex items-center gap-3">
            <span>Status geändert.</span>
            <button className="btn btn-secondary focus-aurora" onClick={undoLast}>
              Rückgängig
            </button>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45">
          <div className="card p-6 max-w-md w-full">
<h3 className="text-lg font-semibold mb-2">
  {confirm.action === "admin_lock" ? "Workshop sperren" : "Workshop freigeben"}
</h3>

<p className="mb-6" style={{ color: TOK.textDim }}>
  Du {confirm.action === "admin_lock" ? "sperrst" : "gibst frei"} „{confirm.title}“. Fortfahren?
</p>


            <div className="flex justify-end gap-3">
              <button
                className="btn btn-secondary focus-aurora"
                onClick={() => setConfirm(null)}
              >
                Abbrechen
              </button>

              <button
                className="btn btn-primary focus-aurora"
onClick={() => {
  const id = confirm.id;
  const action = confirm.action;

  setConfirm(null);

  if (action === "teacher_release") {
  teacherRelease(id);
} 
else if (action === "admin_lock") {
  adminLock(id);
} 
else if (action === "admin_unlock") {
  adminUnlock(id);
}
}}
              >
                {confirm.action === "lock" ? "Sperren" : "Freigeben"}
              </button>
            </div>
          </div>
        </div>
      )}
{menuOpen && (
  <div className="fixed inset-0 z-50 md:hidden bg-black/40" onClick={() => setMenuOpen(false)}>
    <div
      className="absolute left-0 top-0 h-full w-64 bg-[var(--surfaceAlt)] border-r border-[var(--border)] p-4 flex flex-col gap-2"
      onClick={(e) => e.stopPropagation()}
    >
      {[
        { key:'overview', icon:Ic.home, label:'Übersicht' },
        { key:'list', icon:Ic.hat, label:'Meine Workshops' },
        { key:'participants', icon:Ic.users, label:'Teilnehmer (Liste)' },
        { key:'settings', icon:Ic.cog, label:'Einstellungen' },
      ].map((it) => (
        <button
          key={it.key}
          onClick={() => { setView(it.key); setMenuOpen(false); }}
          className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[#1C2432]"
        >
          <it.icon style={{ width:22, height:22 }}/>
          <span className="text-sm">{it.label}</span>
        </button>
      ))}
    </div>
  </div>
)}

{showNewModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55">
    {/* MODAL OUTER – jetzt FLEX + max-h + kein scroll-block */}
    <div className="card w-full max-w-5xl max-h-[90vh] flex flex-col p-6 md:p-8 overflow-y-auto">

      {/* Header + Stepper bleibt fix */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-semibold">Neuen Workshop anlegen</h3>
        <button className="btn btn-secondary" onClick={() => setShowNewModal(false)}>
          Schließen
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-6">
  {[1, 2, 3, 4].map((n) => (
    <div
      key={n}
      className={`h-2 rounded ${step >= n ? "bg-[var(--g1)]" : "bg-[#2A3442]"}`}
    />
  ))}

  <div
    className="col-span-4 text-xs flex flex-wrap justify-between gap-2"
    style={{ color: TOK.textDim }}
  >
    <span>1 · Grunddaten</span>
    <span>2 · Tag & WS</span>
    <span>3 · Raum & Kapazität</span>
    <span>4 · Hinweise (optional)</span>
  </div>
</div>


      {/* BODY – Der WICHTIGE Fix → flex-1 + min-h-0 + overflow-y-auto */}
<div
  className={`
    grid grid-cols-1 md:grid-cols-[1fr_360px] gap-6
    flex-1 min-h-0
    ${
step === 1
  ? "overflow-visible"
  : "md:max-h-[75vh] md:overflow-visible"

}

  `}
>



        {/* LEFT: Steps */}
        <div className="space-y-5">
          {/* STEP 1 */}
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm mb-1" style={{ color: TOK.textDim }}>
                  Titel *
                </label>
                <input
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="Workshop-Titel"
                  className="w-full bg-[#16202B] border border-[#2A3442] rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[var(--g1)] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-1" style={{ color: TOK.textDim }}>
                  Beschreibung
                </label>
                <textarea
                  value={draft.description}
                  onChange={(e) =>
                    setDraft({ ...draft, description: e.target.value })
                  }
                  placeholder="Kurzbeschreibung..."
                  rows={4}
                  className="w-full bg-[#16202B] border border-[#2A3442] rounded-lg px-4 py-2 text-sm resize-none focus:ring-2 focus:ring-[var(--g1)] outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
<div className="grid grid-cols-2 gap-4">
  <div>
    <label className="block text-sm mb-1" style={{ color: TOK.textDim }}>
      Klassenstufe von *
    </label>

    <GradeDropdown
      value={draft.gradeFrom}
      onChange={(v) =>
        setDraft({ ...draft, gradeFrom: v, gradeTo: "" })
      }
    />
  </div>

  <div>
    <label className="block text-sm mb-1" style={{ color: TOK.textDim }}>
      Klassenstufe bis *
    </label>

    <GradeDropdown
      value={draft.gradeTo}
      min={draft.gradeFrom || 5}
      onChange={(v) =>
        setDraft({ ...draft, gradeTo: v })
      }
    />
  </div>
</div>

</div>


              <div className="flex justify-end pt-2">
<button
  className="btn btn-primary"
  onClick={() => setStep(2)}
  disabled={!canGoStep1}
  title={
    !hasTitle
      ? "Titel fehlt"
      : !hasDescription
      ? "Beschreibung ist Pflicht"
      : !hasValidGrades
      ? "Klassenstufen sind unvollständig oder ungültig"
      : ""
  }
>
  Weiter
</button>

              </div>
            </>
          )}

{step === 2 && (
  <>
    {/* TAG / DATUM WÄHLEN */}
    <div>
      <label className="block text-sm mb-2" style={{ color: TOK.textDim }}>
        Tag auswählen *
      </label>

      <div className="grid grid-cols-3 gap-3">
        {[
          { date: "2026-07-13", label: "Mo (WS 1 & 2)" },
          { date: "2026-07-14", label: "Di (WS 3 & 4)" },
          { date: "2026-07-15", label: "Mi (WS 5 & 6)" },
        ].map((opt) => {
          const active = draft.date === opt.date;
          return (
            <button
              key={opt.date}
              type="button"
              className={`btn btn-secondary focus-aurora ${active ? "ring-2 ring-[var(--g1)]" : ""}`}
              onClick={() =>
                setDraft((prev) => ({
                  ...prev,
                  date: opt.date,
                  allowMultiBooking: false,
                }))
              }
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>

    {/* SLOTS DES TAGS */}
    {draft.date && (
      <div className="mt-4">
        <label className="block text-sm mb-2" style={{ color: TOK.textDim }}>
          Workshop-Zeiten auswählen *
        </label>

        <div className="grid grid-cols-2 gap-3">
          {(DAY_SLOTS[draft.date] ?? []).map((slot) => {
            const checked = draft.timeslots.includes(slot);

            return (
              <label
                key={slot}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition
                  ${checked ? "bg-[#1C2736] border-[var(--g1)]" : "bg-[#16202B] border-[#2A3442] hover:bg-[#1A2534]"}
                `}
              >
                <input
                  type="checkbox"
                  className="accent-[var(--g1)]"
                  checked={checked}
                  onChange={() => {
                    setDraft((prev) => {
                      const isIn = prev.timeslots.includes(slot);
                      let next = isIn
                        ? prev.timeslots.filter((s) => s !== slot)
                        : [...prev.timeslots, slot];

                      // sortiert halten (WS 1 vor WS 2)
                      next = next.sort(
                        (a, b) => Number(a.replace(/\D/g, "")) - Number(b.replace(/\D/g, ""))
                      );

                      // allowMultiBooking nur sinnvoll bei 2 Slots + noDayWorkshop
                      const nextAllow =
                        next.length === 2 && prev.noDayWorkshop ? prev.allowMultiBooking : false;

                      return {
                        ...prev,
                        timeslots: next,
                        allowMultiBooking: nextAllow,
                      };
                    });
                  }}
                />
                <span>{slot}</span>
              </label>
            );
          })}
        </div>
      </div>
    )}

    {/* OPTIONEN */}
<div className="mt-4 card p-4">
 <label className="flex items-center gap-2 text-sm">
  <input
    type="checkbox"
    className="accent-[var(--g1)]"
    checked={draft.asDayWorkshop}
    onChange={(e) =>
      setDraft(prev => ({
        ...prev,
        asDayWorkshop: e.target.checked,
        allowMultiBooking: false
      }))
    }
  />
  <span>Als Tagesworkshop speichern (belegt beide Slots)</span>
</label>


{draft.timeslots.length === 2 && !canBeDayWorkshopUI && (
  <p className="text-xs mt-2" style={{ color: TOK.textDim }}>
    Hinweis: Diese Kombination ist <strong>kein Tagesworkshop</strong> (nur WS 1&2, 3&4, 5&6).  
    Sie wird als <strong>einzelne Slots</strong> gespeichert.
  </p>
)}


{draft.timeslots.length >= 2 && (!draft.asDayWorkshop || !canBeDayWorkshopUI) && (
  <label className="flex items-center gap-2 text-sm mt-3">
    <input
      type="checkbox"
      className="accent-[var(--g1)]"
      checked={draft.allowMultiBooking}
      onChange={(e) =>
        setDraft((prev) => ({
          ...prev,
          allowMultiBooking: e.target.checked,
        }))
      }
    />
    <span>Schüler darf mehrere Workshops belegen</span>
  </label>
)}

</div>

{/* STEP 2 NAV */}
<div className="flex justify-between pt-2">
  <button
    type="button"
    className="btn btn-secondary"
    onClick={() => setStep(1)}
  >
    Zurück
  </button>

  <button
    type="button"
    className="btn btn-primary"
    onClick={() => setStep(3)}
    disabled={!draft.date || draft.timeslots.length === 0}
    title={
      !draft.date
        ? "Bitte zuerst einen Tag auswählen."
        : draft.timeslots.length === 0
        ? "Bitte mindestens einen Workshop-Slot auswählen."
        : ""
    }
  >
    Weiter
  </button>
</div>

  </>
)}


          {/* STEP 3 */}
          {step === 3 && (
            <>
              {/* Raumwahl */}
              <div>
                <label
                  className="block text-sm mb-2 font-medium"
                  style={{ color: TOK.textDim }}
                >
                  Raum auswählen *
                </label>
                <input
                  value={searchRoom}
                  onChange={(e) => setSearchRoom(e.target.value)}
                  placeholder="Suche nach Raum ..."
                  className="w-full mb-4 bg-[#16202B] border border-[#2A3442] rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[var(--g1)] outline-none"
                />

                <div className="max-h-80 overflow-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {Object.values(ROOMS)
                    .flat()
                    .filter((r) =>
                      r.toLowerCase().includes(searchRoom.toLowerCase())
                    )
                    .sort()
                    .map((r) => (
<button
  key={r}
  type="button"
  onClick={() => !isRoomBlocked(r) && setDraft({ ...draft, room: r })}
  disabled={isRoomBlocked(r)}
  className={`px-2 py-2 rounded-md text-sm font-medium transition-all border flex items-center justify-center
    ${
      isRoomBlocked(r)
        ? "bg-[#2C0B12] border-[#8A1C1C] text-[#F87171] cursor-not-allowed opacity-60"
        : draft.room === r
        ? "bg-gradient-to-r from-[var(--g1)] to-[var(--g2)] text-white shadow-md"
        : "bg-[#1A2332] border-[#2A3442] text-gray-300 hover:bg-[#253145]"
    }`}
>
  {r}
</button>



                    ))}

                  {Object.values(ROOMS)
                    .flat()
                    .filter((r) =>
                      r.toLowerCase().includes(searchRoom.toLowerCase())
                    ).length === 0 && (
                    <div className="col-span-full text-center text-sm py-4 text-gray-500">
                      Kein Raum gefunden.
                    </div>
                  )}
                </div>

                {draft.room && (
                  <p className="text-xs mt-3" style={{ color: TOK.textDim }}>
                    Gewählter Raum: <strong>{draft.room}</strong>
                  </p>
                )}
              </div>

              {/* Kapazität */}
              <div className="mt-6">
                <label className="block text-sm mb-1" style={{ color: TOK.textDim }}>
                  Maximale Teilnehmerzahl *
                </label>
                <input
  type="number"
  value={draft.capacity}
  onChange={(e) => {
    const val = e.target.value;
    setDraft({
      ...draft,
      capacity: val === "" ? "" : Number(val),
    });
  }}
  className={`
    w-full bg-[#16202B] border rounded-lg px-4 py-2 text-sm outline-none
    focus:ring-2 focus:ring-[var(--g1)]
    ${capacityIsInvalid ? "border-red-500 ring-red-500" : "border-[#2A3442]"}
  `}
/>
{capacityIsInvalid && (
  <div className="text-xs mt-1 text-red-400">
    Mindestteilnehmerzahl ist 20.
  </div>
)}

                <div
                  className="text-xs mt-1"
                  style={{ color: TOK.textDim }}
                >
                </div>
              </div>

              {/* Tags */}
              <div className="mt-6">
                <label
                  className="block text-sm mb-1"
                  style={{ color: TOK.textDim }}
                >
                  Tags *
                </label>
                <div
                  className="flex flex-wrap items-center gap-2 bg-[#16202B] border border-[#2A3442] rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[var(--g1)]"
                  onClick={() => inputRef.current?.focus()}
                >
                  {draft.tags.map((t) => (
                    <span
                      key={t}
                      className="flex items-center gap-1 bg-[#1b2736] border border-[#2A3442] px-2 py-1 rounded-full text-xs"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() =>
                          setDraft((prev) => ({
                            ...prev,
                            tags: prev.tags.filter((tag) => tag !== t),
                          }))
                        }
                        className="text-[#aaa] hover:text-white"
                      >
                        ✕
                      </button>
                    </span>
                  ))}

                  <input
                    ref={inputRef}
                    type="text"
                    placeholder={
                      draft.tags.length === 0
                        ? "z. B. Technik, Kreativ, Sprache"
                        : ""
                    }
                    className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-gray-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        const tag = e.currentTarget.value.trim();
                        if (tag && !draft.tags.includes(tag)) {
                          setDraft((prev) => ({
                            ...prev,
                            tags: [...prev.tags, tag],
                          }));
                        }
                        e.currentTarget.value = "";
                      }

                      if (
                        e.key === "Backspace" &&
                        e.currentTarget.value === "" &&
                        draft.tags.length > 0
                      ) {
                        e.preventDefault();
                        setDraft((prev) => ({
                          ...prev,
                          tags: prev.tags.slice(0, -1),
                        }));
                      }
                    }}
                    onBlur={(e) => {
                      const tag = e.currentTarget.value.trim();
                      if (tag && !draft.tags.includes(tag)) {
                        setDraft((prev) => ({
                          ...prev,
                          tags: [...prev.tags, tag],
                        }));
                      }
                      e.currentTarget.value = "";
                    }}
                  />
                </div>

                <p
                  className="text-xs mt-1"
                  style={{ color: TOK.textDim }}
                >
                  Tippe mehrere Begriffe, bestätige mit <strong>Enter</strong>{" "}
                  oder <strong>Komma</strong>.
                </p>
              </div>

              {/* Save */}
              <div className="flex justify-between pt-4">
                <button className="btn btn-secondary" onClick={() => setStep(2)}>
                  Zurück
                </button>
<button
  className="btn btn-primary"
  onClick={() => setStep(4)}
  disabled={!canSave}
  title={
    capacityIsInvalid
      ? "Die Mindestteilnehmerzahl beträgt 20."
      : capacityIsEmpty
      ? "Bitte Teilnehmerzahl angeben."
      : ""
  }
>
  Weiter
</button>



              </div>
            </>
          )}
          {/* STEP 4 */}
{step === 4 && (
  <>
    <div>
      <label className="block text-sm mb-1" style={{ color: TOK.textDim }}>
        Hinweise
      </label>

      <textarea
        value={draft.notes}
        onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
        placeholder={"z. B.\n• Material\n• Treffpunkt\n• Voraussetzungen"}
        rows={9}
        className="w-full bg-[#16202B] border border-[#2A3442] rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--g1)] outline-none resize-y min-h-[220px]"
      />
    </div>

    <div className="flex justify-between pt-4">
      <button className="btn btn-secondary" onClick={() => setStep(3)}>
        Zurück
      </button>

      <div className="flex gap-2">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => saveWorkshop({ omitNotes: true })}
          disabled={!canSave}
        >
          Überspringen
        </button>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => saveWorkshop()}
          disabled={!canSave}
        >
          Workshop speichern
        </button>
      </div>
    </div>
  </>
)}

        </div>



        {/* Summary */}
        <aside className="card p-4 h-fit md:sticky top-6">
          <h4 className="font-semibold mb-3">Zusammenfassung</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span style={{ color: TOK.textDim }}>Titel:</span>{" "}
              {draft.title || "—"}
            </div>
            <div>
              <span style={{ color: TOK.textDim }}>Datum:</span>{" "}
              {draft.date || "—"}
            </div>
            <div>
  <span style={{ color: TOK.textDim }}>WS:</span>{" "}
  {draft.timeslots.length === 0 ? (
    "—"
  ) : (
    <>
      <div>{draft.timeslots.join(" + ")}</div>
    
{draft.timeslots.length >= 2 && canBeDayWorkshopUI && draft.asDayWorkshop && (
  <div className="text-xs mt-1" style={{ color: TOK.textDim }}>
    Tagesworkshop ({draft.timeslots.length / 2}×)
  </div>
)}

{(!draft.asDayWorkshop || !canBeDayWorkshopUI) && draft.timeslots.length >= 1 && (
  <div className="text-xs mt-1" style={{ color: TOK.textDim }}>
    Einzeln
  </div>
)}




    </>
  )}
</div>


            <div>
              <span style={{ color: TOK.textDim }}>Raum:</span>{" "}
              {draft.room || "—"}
            </div>

            <div>
  <span style={{ color: TOK.textDim }}>Klassenstufen:</span>{" "}
  {draft.gradeFrom && draft.gradeTo
    ? `Jgst ${draft.gradeFrom} – Jgst ${draft.gradeTo}`
    : "—"}
</div>

            <div>
              <span style={{ color: TOK.textDim }}>Kapazität:</span>{" "}
              {draft.capacity}
            </div>
            <div>
              <span style={{ color: TOK.textDim }}>Tags:</span>{" "}
              {draft.tags.join(", ") || "—"}
            </div>
          </div>

          <div className="divider my-4" />

          <div className="text-xs" style={{ color: TOK.textDim }}>
            Regeln: Ein Tag (13.–15.07.), je 2 WS.
          </div>
        </aside>
      </div>
    </div>
  </div>
)}
</div>
  );      
 
}         



/* ============================  OVERVIEW (CARDS)  ============================== */
function Overview({
  workshops,
  profile,
  onNew,
  onOpen,
  onLock,
  onParticipants,
  onIncrease,
  teacherWindowOpen,
  teacherWindowLabel
}) {

  const crowded = workshops.filter(w => (w.registered/w.capacity) > .85);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[28px] font-semibold">Meine Workshops ({workshops.length})</h2>
        <button className="btn btn-primary focus-aurora" onClick={onNew}><Ic.plus/> Neuer Workshop</button>
      </div>

      {crowded.length>0 && (
        <div className="card p-4 flex items-center justify-between" role="status" aria-live="polite">
          <div><strong>Hinweis:</strong> „{crowded[0].title}“ hat <em>hohe Auslastung</em>.</div>
          <button className="chip" style={{ background:TOK.warnBg, color:TOK.warnText, border:`1px solid ${TOK.warnBorder}` }}
                  onClick={()=>onIncrease(crowded[0].id)}>Kapazität erhöhen</button>
        </div>
      )}

      <div className="grid gap-6" style={{ gridTemplateColumns:'repeat(auto-fill, minmax(340px, 1fr))' }}>
        {workshops.map(w =><Card
  key={w.id}
  w={w}
  profile={profile}
  onOpen={()=>onOpen(w.id)}
  onLock={()=>onLock(w.id)}
  teacherWindowOpen={teacherWindowOpen}
  teacherWindowLabel={teacherWindowLabel}
/>
)}
      </div>
    </div>
  );
}

function Card({ w, profile, onOpen, onLock, teacherWindowOpen, teacherWindowLabel }) {
    const isOwner = profile?.id === w.owner_id;
  const isAdmin = profile?.role === "admin";
  const ratio = w.registered / Math.max(1, w.capacity);
  const percent = pct(w.registered, w.capacity);
  const isLocked = w.status !== "confirmed";
const adminLocked = w.admin_locked === true;
  const capacityCritical = ratio > 0.85;
  const rest = w.capacity - w.registered;
  const showRestBadge = rest > 0 && ratio > 0.70;

  return (
    <article
      className="
        rounded-2xl p-7 flex flex-col gap-6
        w-full max-w-[420px] min-h-[360px]
        bg-[rgba(255,255,255,0.04)]
        backdrop-blur-[10px]
        border border-white/10
        shadow-[0_4px_20px_rgba(0,0,0,0.35)]
        hover:-translate-y-1
        hover:shadow-[0_8px_26px_rgba(0,0,0,0.45)]
        transition-all
      "
    >
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <h3 className="text-2xl font-semibold leading-snug line-clamp-2">
          {w.title}
        </h3>
        <span
          className={`w-3 h-3 rounded-full mt-1 ${
            isLocked ? "bg-red-500" : "bg-green-400"
          }`}
        />
      </div>

      {/* INFO GRID */}
      <div className="grid grid-cols-3 text-xs gap-2 opacity-65">
        <span>{w.room}</span>
        <span>{w.date}</span>
        <span>{w.time}</span>
      </div>

      {/* PROGRESS */}
      <div className="flex flex-col gap-2 mt-1">
        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full transition"
            style={{
              width: `${percent}%`,
              background: capacityCritical ? "#FF5A5A" : "#37C776",
            }}
          />
        </div>

        <div className="flex justify-between text-sm opacity-75">
          <span>
            {w.registered}/{w.capacity} belegt
          </span>
          <span className={capacityCritical ? "text-red-400" : ""}>
            {rest === w.capacity
              ? "Noch frei"
              : capacityCritical
              ? "Fast voll"
              : "Plätze frei"}
          </span>
        </div>
      </div>

      {/* TAGS — neu positioniert */}
      {w.tags && w.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-1">
          {w.tags.map((t) => (
            <span
              key={t}
              className="px-2 py-1 text-xs rounded-md bg-[#1b2736] border border-[#2A3442] text-[#a9b4c0]"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {/* RESTPLÄTZE-BADGE */}
      {showRestBadge && (
        <div
          className="
          text-xs text-red-400 bg-red-400/10 border border-red-400/30
          px-3 py-1 rounded-lg w-fit font-medium
        "
        >
          {rest} Plätze übrig
        </div>
      )}

{/* CTA FOOTER */}
<div className="mt-auto flex gap-3 pt-4 border-t border-white/10">
  <button
    onClick={() => {
      window.__preferredTab =
        w.participants?.length > 0 ? "Teilnehmer" : "Details";
      onOpen(w.id);
    }}
    className="
      flex-1 py-3 text-sm font-medium
      rounded-lg text-white
      bg-gradient-to-r from-[#1e64ff] to-[#4fc0ff]
      hover:opacity-90 focus-aurora
      transition
    "
  >
    Öffnen
  </button>

  {/* ✅ NUR Freigeben (Lehrer/Owner), NIE Sperren auf Cards */}
{isLocked && isOwner && !adminLocked && (
  <button
    onClick={() => teacherWindowOpen && onLock(w.id)}
    disabled={!teacherWindowOpen}
    title={!teacherWindowOpen ? `Freigeben nur im Zeitfenster: ${teacherWindowLabel}` : ""}
    className="
      px-4 py-3 rounded-lg text-sm font-medium
      border border-white/30 text-white/75
      hover:text-white hover:border-white/50
      transition flex items-center gap-2
    "
    style={!teacherWindowOpen ? { opacity: .45, cursor: "not-allowed" } : undefined}
  >
    <Ic.check /> Freigeben
  </button>
)}

</div>

    </article>
  );

}


/* ===========================  DETAIL VIEW (TABS)  ============================= */
function DetailView({ supabase, w, profile, onBack, onExport, onLock }) {
  const [tab, setTab] = useState('Details');
  const [participants, setParticipants] = useState([]);

useEffect(() => {
  if (!w?.id) return;

  let alive = true;

  async function loadParticipants() {
    const { data, error } = await supabase.rpc("list_workshop_participants", {
      _workshop_id: w.id,
    });

    if (!alive) return;

    if (error) {
      console.error("Fehler beim Laden der Teilnehmer:", error);
      setParticipants([]);
      return;
    }

setParticipants(
  (data || []).map((r) => ({
    // ✅ eindeutige ID für React keys
    id: r.user_id ?? `${r.full_name}-${r.created_at}`,

    name: r.full_name ?? "—",

    // ✅ Klasse: kommt aus SQL als school_class (oder fallback)
    class: r.school_class ?? r.class ?? "—",

    status: r.status ?? "—",
  }))
);

  }

  loadParticipants();

  const ch = supabase
    .channel(`teacher-regs-${w.id}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "registrations", filter: `workshop_id=eq.${w.id}` },
      () => loadParticipants()
    )
    .subscribe();

  return () => {
    alive = false;
    supabase.removeChannel(ch);
  };
}, [w?.id, supabase]);



const registered = w.registered ?? 0;       // ← Fix!
const percent = pct(registered, w.capacity);
const ratio = registered / Math.max(1, w.capacity);

  const bar = capColor(ratio);
  const danger = ratio > .85;

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="btn btn-secondary focus-aurora">← Zurück</button>

      <section className="card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[22px] font-semibold">{w.title}</h2>
            <div className="mt-1" style={{ color:TOK.textDim }}>{w.date} • {w.time} • Raum {w.room}</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {w.status==='confirmed'
              ? <span className="chip" style={{ background:TOK.okBg, color:TOK.okText, border:`1px solid ${TOK.okBorder}` }}><Ic.check/> Freigegeben</span>
              : <span className="chip" style={{ background:TOK.errBg, color:TOK.errText, border:`1px solid ${TOK.errBorder}` }}><Ic.lock/> Gesperrt</span>
            }
            {/* LEHRER */}
{profile?.id === w.owner_id && !w.admin_locked && (
  <>
    {w.status === "confirmed" ? (
      <span className="text-xs text-red-400 opacity-60">
        
      </span>
    ) : (
      <button className="btn btn-secondary" onClick={onLock}>
        Freigeben
      </button>
    )}
  </>
)}

{/* ADMIN */}
{profile?.role === "admin" && w.status === "confirmed" && (
  <button className="btn btn-secondary" onClick={onLock}>
    Sperren
  </button>
)}


            <button
  className="btn btn-primary focus-aurora"
  onClick={() => onExport(participants)}
>
  Teilnehmerliste exportieren
</button>

          </div>
        </div>

        <div className="mt-4">
          <div className="tnum text-sm">
  {registered}/{w.capacity} ({percent}%)
</div>

          <div className="progress mt-2">
            <div className={cx('progress-bar', danger && 'danger')}
                 style={{ width:`${percent}%`, background:`linear-gradient(90deg, ${bar}, ${bar})` }} />
          </div>
        </div>
      </section>

<div className="flex items-center gap-2">
  {['Details', 'Teilnehmer', 'Hinweise'].map((name) => (
    <button
      key={name}
      onClick={() => setTab(name)}
      className={cx('btn focus-aurora', tab === name ? 'btn-secondary' : 'btn-tertiary')}
    >
      {name}
    </button>
  ))}
</div>


      <section className="card p-4">
        {tab==='Details' && (
          <div className="space-y-2">
            <Row label="Titel" value={w.title} />
            <Row label="Datum" value={w.date} />
            <Row label="Zeit" value={w.time} />
            <Row label="Raum" value={w.room} />
            <Row label="Tags" value={(w.tags || []).join(', ') || '—'} />
            <Row label="Beschreibung" value={w.description || '—'} />
            <Row
  label="Klassenstufen"
  value={
    w.grade_from && w.grade_to
      ? `Jgst ${w.grade_from} – Jgst ${w.grade_to}`
      : "—"
  }
/>
          </div>
        )}

        {tab==='Teilnehmer' && (
          <div>
            <div className="text-sm mb-3" style={{ color:TOK.textDim }}>Teilnehmer ({participants.length})</div>
            <div className="overflow-auto">
              <table className="w-full">
                <thead style={{ color:TOK.textDim, fontSize:14 }}>
                  <tr><th className="text-left px-3 py-2">#</th><th className="text-left px-3 py-2">Name</th><th className="text-left px-3 py-2">Klasse</th><th className="text-left px-3 py-2">Anmeldestatus</th></tr>
                </thead>
                <tbody>
                  {participants.length===0 && <tr><td colSpan="4" className="px-3 py-4" style={{ color:TOK.textDim }}>Noch keine Teilnehmer vorhanden.</td></tr>}
                  {participants.map((p,i)=>(
                    <tr key={p.id} className="row-hover" style={{ height:48 }}>
                      <td className="px-3 tnum">{i+1}</td>
                      <td className="px-3">{p.name}</td>
                      <td className="px-3">{p.class}</td>
                      <td className="px-3">{p.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'Hinweise' && (
  <div className="space-y-2">
    <div className="text-sm font-medium">Hinweise</div>

    {w.notes?.trim() ? (
      <div className="whitespace-pre-wrap text-sm">
        {w.notes}
      </div>
    ) : (
      <div className="text-sm" style={{ color: TOK.textDim }}>
        Keine Hinweise hinterlegt.
      </div>
    )}
  </div>
)}

      </section>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex gap-4 py-2">
      <div className="w-40" style={{ color:TOK.textDim }}>{label}</div>
      <div>{value}</div>
    </div>
  );
}

/* ==============================  SKELETONS  =================================== */
function SkeletonCards(){
  return (
    <div className="grid gap-6" style={{ gridTemplateColumns:'repeat(auto-fill, minmax(340px, 1fr))' }}>
      {Array.from({length:6}).map((_,i)=>(
        <div key={i} className="card p-4">
          <div className="skeleton h-5 w-1/2 rounded mb-3" />
          <div className="skeleton h-4 w-1/3 rounded mb-4" />
          <div className="skeleton h-2 w-full rounded mb-1" />
          <div className="skeleton h-2 w-2/3 rounded" />
          <div className="mt-4 flex gap-2">
            <div className="skeleton h-9 w-24 rounded" />
            <div className="skeleton h-9 w-24 rounded" />
            <div className="skeleton h-9 w-28 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
function SkeletonTable() {
  return (
    <div className="card overflow-x-auto overflow-y-visible">
      <table className="w-full">
        <thead>
          <tr>
            {Array.from({ length: 6 }).map((_, i) => (
              <th key={i} className="px-4 py-3">
                <div className="skeleton h-4 w-24 rounded" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }).map((_, i) => (
            <tr key={i}>
              {Array.from({ length: 6 }).map((_, j) => (
                <td key={j} className="px-4 py-3">
                  <div className="skeleton h-4 w-full rounded" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ========================  SETTINGS VIEW (Supabase)  ========================== */
function SettingsView({ supabase, user, onToast }) {
  const email = user?.email ?? "—";
  const lastLogin = user?.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleString()
    : "—";

  async function handlePasswordReset() {
    if (!email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/reset-password`,
    });
    if (error) {
      console.error(error);
      onToast?.("E-Mail konnte nicht gesendet werden.");
      return;
    }
    onToast?.("Password-Reset E-Mail gesendet.");
  }

  async function signOutCurrent() {
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) {
      console.error(error);
      onToast?.("Abmelden fehlgeschlagen.");
      return;
    }
    onToast?.("Abgemeldet.");
    window.location.href = "/login";
  }

  async function signOutEverywhere() {
    const { error } = await supabase.auth.signOut({ scope: "global" });
    if (error) {
      console.error(error);
      onToast?.("Abmelden überall fehlgeschlagen.");
      return;
    }
    onToast?.("Alle Sitzungen beendet.");
    window.location.href = "/login";
  }

  return (
    <div className="max-w-xl mx-auto space-y-10">
      <div>
        <h2 className="text-3xl font-semibold">Einstellungen</h2>
        <p className="text-sm text-[#9CA3AF] mt-1">
          Verwalte dein Konto und deine Anmeldung
        </p>
      </div>

      {/* Profilanzeige */}
      <section className="card p-6 space-y-5">
        <div className="flex items-center gap-4 pb-4 border-b border-[#2A3442]">
          <div
            className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--g1)] text-white text-lg font-semibold"
          >
            {email[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <div className="font-medium text-lg text-white">{email}</div>
            <div className="text-sm text-[#9CA3AF]">
              Letzter Login: {lastLogin}
            </div>
          </div>
        </div>


        {/* Buttons */}
        <div className="flex flex-col gap-3 pt-3">
          <button
            onClick={signOutCurrent}
            className="w-full px-4 py-3 rounded-lg bg-[#1E293B] text-white text-sm transition-colors duration-150 hover:bg-[#334155] active:bg-[#475569]"
          >
             Abmelden (dieses Gerät)
          </button>

          <button
            onClick={signOutEverywhere}
            className="w-full px-4 py-3 rounded-lg bg-[#334155] text-white text-sm transition-colors duration-150 hover:bg-[#475569] active:bg-[#64748B]"
          >
             Überall abmelden
          </button>
        </div>
      </section>

      <p className="text-xs text-[#A9B4C0] text-center">
        Alle Aktionen werden sofort wirksam. <br />
        „Überall abmelden“ beendet alle Sitzungen auf sämtlichen Geräten.
      </p>
    </div>
  );
}
