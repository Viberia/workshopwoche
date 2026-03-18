'use client';

import '../globals.css';
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';


function useLogout() {
  const router = useRouter();

  async function logoutLocal() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  async function logoutEverywhere() {
    await fetch('/api/auth/logout-all', { method: 'POST' });
    await supabase.auth.signOut();
    router.replace('/login');
  }

  return { logoutLocal, logoutEverywhere };
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

/* =============================  ICONS (Lucide-like) ============================ */
const Ic = {
  home: (p) => <svg width="24" height="24" viewBox="0 0 24 24" {...p} fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 10.5 12 4l9 6.5"/><path d="M5 10v9h14v-9"/><path d="M9 19v-6h6v6"/></svg>,
  hat:  (p) => <svg width="24" height="24" viewBox="0 0 24 24" {...p} fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M2 10l10-5 10 5-10 5-10-5Z"/><path d="M6 12v3c0 1.7 3.6 3 6 3s6-1.3 6-3v-3"/></svg>,
  users: (p) => (
    <svg width="24" height="24" viewBox="0 0 24 24" {...p}
      fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  cog: (p) => (
    <svg width="24" height="24" viewBox="0 0 24 24" {...p}
      fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 12a7.4 7.4 0 0 0-.1-1.3l2-1.6-2-3.4-2.4.7a7.5 7.5 0 0 0-2.2-1.3l-.4-2.5H9.7l-.4 2.5a7.5 7.5 0 0 0-2.2 1.3l-2.4-.7-2 3.4 2 1.6a7.4 7.4 0 0 0 0 2.6l-2 1.6 2 3.4 2.4-.7a7.5 7.5 0 0 0 2.2 1.3l.4 2.5h4.2l.4-2.5a7.5 7.5 0 0 0 2.2-1.3l2.4.7 2-3.4-2-1.6A7.4 7.4 0 0 0 19.4 12z"/>
    </svg>
  ),
  search:(p)=> <svg width="20" height="20" viewBox="0 0 24 24" {...p} fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7"/><path d="M21 21l-3.2-3.2"/></svg>,
  check:(p)=> <svg width="18" height="18" viewBox="0 0 24 24" {...p} fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  lock: (p)=> <svg width="18" height="18" viewBox="0 0 24 24" {...p} fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 1 1 8 0v3"/></svg>,
  info:(p)=> <svg width="18" height="18" viewBox="0 0 24 24" {...p} fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>,

  filter: ({ className, ...p } = {}) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="19.9"
      height="19.9"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={["lucide lucide-funnel-icon lucide-funnel", className].filter(Boolean).join(" ")}
      {...p}
    >
      <path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z" />
    </svg>
  ),

  trash: (p) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    {...p}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </svg>
),

};



const cx  = (...c) => c.filter(Boolean).join(' ');
const pct = (used, total) => Math.max(0, Math.min(100, Math.round((used / Math.max(1, total)) * 100)));
const capColor = (r) => (r <= 0.7 ? TOK.capLow : r <= 0.85 ? TOK.capMid : TOK.capHigh);

function extractSlots(value) {
  if (!value) return [];
  return String(value)
    .split(',')
    .map(s => Number(s.replace(/\D/g, '')))
    .filter(Boolean);
}

function slotLabel(n){ return `WS ${n}`; }

function dayPairForSlot(n){
  if (n === 1 || n === 2) return [1,2];
  if (n === 3 || n === 4) return [3,4];
  return [5,6];
}

const getTimeValue = (w) => String(w?.time_slot ?? w?.time ?? "").trim();

const getWsSlots = (w) => {
  const t = getTimeValue(w);
  const matches = [...t.matchAll(/WS\s*([1-6])/g)];
  return [...new Set(matches.map(m => Number(m[1])).filter(Boolean))].sort((a,b)=>a-b);
};

const formatWsLabel = (w) => {
  const t = getTimeValue(w);
  if (!t) return "—";
  return t.split(",").map(s => s.trim()).filter(Boolean).join(" + ");
};

function parseGradeFromClass(cls) {
  const m = String(cls ?? "").match(/\d+/); // "9c" -> "9", "10a" -> "10"
  if (!m) return null;
  const n = parseInt(m[0], 10);
  return Number.isFinite(n) ? n : null;
}

function toInt(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function formatGradeRange(from, to) {
  const f = toInt(from);
  const t = toInt(to);

  if (!f && !t) return "Alle";
  if (f && t) return `Jgst ${f} – Jgst ${t}`;
  if (f) return `ab Jgst ${f}`;
  return `bis Jgst ${t}`;
}

function parseConfigDateTime(v, mode = "start") {
  // v kann sein:
  // - "2026-07-10" (DATE)
  // - "2026-07-10T08:00:00" (TIMESTAMP ohne TZ)
  // - "2026-07-10T08:00:00Z" oder "+02:00" (TIMESTAMP mit TZ)
  if (!v) return null;

  const s = String(v).trim();

  // DATE-only
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    if (mode === "start") return new Date(`${s}T00:00:00`);
    // Ende inklusiv -> Ende des Tages
    return new Date(`${s}T23:59:59.999`);
  }

  // TIMESTAMP (Date kann das direkt)
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;

  return d;
}

function isWindowOpen(now, startVal, endVal) {
  const start = parseConfigDateTime(startVal, "start");
  const end = parseConfigDateTime(endVal, "end");

  if (!start || !end) return false;

  // inklusives Ende
  return now >= start && now <= end;
}




/* ============================  LIST VIEW (TABLE)  ============================ */
function ListViewUI({ workshops, onOpen, slotFilter, onClearSlot, onSetSlot, onChoose, getChooseState, choosingId }) {
  const filtered = workshops; // ✅ ist bereits gefiltert (Query + Slot)

const [filterOpen, setFilterOpen] = useState(false);
const filterWrapRef = useRef(null);

useEffect(() => {
  function onDocClick(e) {
    if (!filterOpen) return;
    if (filterWrapRef.current && !filterWrapRef.current.contains(e.target)) {
      setFilterOpen(false);
    }
  }
  function onEsc(e) {
    if (e.key === "Escape") setFilterOpen(false);
  }

  document.addEventListener("mousedown", onDocClick);
  window.addEventListener("keydown", onEsc);
  return () => {
    document.removeEventListener("mousedown", onDocClick);
    window.removeEventListener("keydown", onEsc);
  };
}, [filterOpen]);


  return (
    <div className="space-y-5">
<div className="flex flex-wrap items-center justify-between gap-3">
  <div className="flex items-center gap-3">
    <div className="flex items-center gap-3">
      <h2 className="text-[22px] font-semibold">Workshop-Liste ({filtered.length})</h2>

      {slotFilter && (
        <span
          className="chip"
          style={{ background: TOK.surfaceAlt, color: TOK.textDim, border: `1px solid ${TOK.border}` }}
        >
          Filter: WS {slotFilter}
          <button
            className="ml-2"
            onClick={onClearSlot}
            title="Filter entfernen"
            style={{ color: TOK.textDim }}
          >
            ✕
          </button>
        </span>
      )}
    </div>
  </div>

  <div className="flex items-center gap-2">
    <div className="relative" ref={filterWrapRef}>
      <button
        className="btn btn-secondary focus-aurora"
        onClick={() => setFilterOpen(v => !v)}
        aria-expanded={filterOpen}
        aria-haspopup="menu"
        title="Filter"
        style={{ height: 44 }}
      >
        <Ic.filter />
        Filter
      </button>

      {filterOpen && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.14 }}
          className="card"
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 10px)",
            width: 260,
            padding: 10,
            zIndex: 60,
            background: TOK.surface,
            border: `1px solid ${TOK.border}`,
          }}
          role="menu"
        >
          <div className="text-xs px-2 pb-2" style={{ color: TOK.textDim }}>
            Filter auswählen
          </div>

          <button
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#1C2736] transition-colors flex items-center justify-between"
            onClick={() => { onClearSlot(); setFilterOpen(false); }}
            role="menuitem"
          >
            <span>Alle Workshops</span>
            {!slotFilter ? <Ic.check /> : null}
          </button>

          <div className="divider my-2" />

          {[1,2,3,4,5,6].map((n) => (
            <button
              key={n}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#1C2736] transition-colors flex items-center justify-between"
              onClick={() => { onSetSlot(n); setFilterOpen(false); }}
              role="menuitem"
            >
              <span>WS {n}</span>
              {slotFilter === n ? <Ic.check /> : null}
            </button>
          ))}
        </motion.div>
      )}
    </div>

  </div>
</div>


      <div className="w-full overflow-x-auto touch-pan-x overscroll-x-contain">
        <table className="min-w-max w-full text-sm border-collapse">
          <thead style={{ background: TOK.surfaceAlt, color: TOK.textDim }}>
            <tr>
              <th className="px-4 py-3 text-left font-medium">Titel</th>
              <th className="px-4 py-3 text-left font-medium">Datum</th>
              <th className="px-4 py-3 text-left font-medium">WS</th>
              <th className="px-4 py-3 text-left font-medium">Raum</th>
              <th className="px-4 py-3 text-left font-medium">Plätze</th>
              <th className="px-4 py-3 text-left font-medium">Typ</th>
              <th className="px-4 py-3 text-right font-medium">Aktionen</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-6 text-[#7b8895]">
                  Keine Workshops gefunden.
                </td>
              </tr>
            )}

            {filtered.map((w) => {
              const ratio = w.registered / Math.max(1, w.capacity);
              const percent = Math.round(ratio * 100);
              const critical = ratio > 0.85;
              const slots = extractSlots(w.time);
              const isFull = w.registered >= w.capacity;

              return (
                <tr key={w.id} className="border-t border-[#2A3442] hover:bg-[#1C2736] transition-colors">
                  <td className="px-4 py-3 align-top">
                    <div className="font-medium text-[15px] text-white">{w.title}</div>
                    {w.tags?.length ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {w.tags.map((t) => (
                          <span key={t} className="px-2 py-[2px] text-[11px] rounded-md bg-[#1b2736] border border-[#2A3442] text-[#a9b4c0]">
                            {t}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </td>

                  <td className="px-4 py-3 align-top text-[#d3d9e0]">{w.date}</td>
                  <td className="px-4 py-3 align-top text-[#d3d9e0]">{w.time}</td>
                  <td className="px-4 py-3 align-top text-[#d3d9e0]">{w.room}</td>

                  <td className="px-4 py-3 align-top tnum text-[#d3d9e0]">
                    <div className="flex items-center gap-2">
                      <span>{w.registered}/{w.capacity}</span>
                      <div className="flex-1 h-2 bg-[#1b2736] rounded overflow-hidden">
                        <div
                          style={{
                            width: `${percent}%`,
                            background: critical ? '#ef4444' : '#22c55e',
                          }}
                          className="h-full"
                        />
                      </div>
                    </div>
                    {isFull && (
                      <div className="mt-1 text-xs" style={{ color: TOK.errText }}>
                        Voll
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3 align-top">
                    {w.is_day_workshop ? (
                      <span className="chip" style={{ background: TOK.warnBg, color: TOK.warnText, border: `1px solid ${TOK.warnBorder}` }}>
                        <Ic.info /> Tagesworkshop
                      </span>
                    ) : (
                      <span className="chip" style={{ background: TOK.surfaceAlt, color: TOK.textDim, border: `1px solid ${TOK.border}` }}>
  Einzel
</span>

                    )}
                  </td>

                  <td className="px-4 py-3 align-top text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onOpen(w.id)}
                        className="btn btn-secondary focus-aurora"
                        style={{ height: 34, padding: '0 10px' }}
                      >
                        Details
                      </button>
                      {(() => {
  const st = getChooseState(w);
  const busy = choosingId === w.id;
  const disabled = st.disabled || busy;

  return (
    <button
      onClick={() => onChoose(w)}
      disabled={disabled}
      title={st.reason || ""}
      className={`btn btn-primary focus-aurora ${disabled ? "opacity-60 cursor-not-allowed grayscale" : ""}`}
      style={{ height: 36 }}
    >
      {busy ? "Wähle..." : st.label}
    </button>
  );
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

/* ============================  OVERVIEW (CARDS)  ============================== */
function OverviewUI({ workshops, myChoices, onOpen, choosingId, onChoose, getChooseState }) {
  const coveredSlots = useMemo(() => {
    const ids = new Set(myChoices.map(c => c.workshopId));
    const chosen = workshops.filter(w => ids.has(w.id));
    const covered = new Set();
    chosen.forEach(w => extractSlots(w.time).forEach(s => covered.add(s)));
    return covered;
  }, [workshops, myChoices]);

  const slots = [1,2,3,4,5,6];
  const done = slots.filter(s => coveredSlots.has(s)).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[28px] font-semibold">Übersicht</h2>
        </div>

        <div className="card px-4 py-3" style={{ borderRadius: 14 }}>
          <div className="text-sm"><strong>{done}</strong>/6 WS-Slots belegt</div>
        </div>
      </div>

      {/* KEIN Slot-Grid mehr */}

      <div className="grid gap-6" style={{ gridTemplateColumns:'repeat(auto-fill, minmax(340px, 1fr))' }}>
{workshops.map((w) => (
  <WorkshopCardUI
    key={w.id}
    w={w}
    onOpen={() => onOpen(w.id)}   // ✅ openDetail erwartet eine ID
    choosingId={choosingId}
    onChoose={onChoose}          // ✅ kommt jetzt als Prop rein
    getChooseState={getChooseState}
  />
))}

      </div>
    </div>
  );
}


function WorkshopCardUI({ w, onOpen, choosingId, onChoose, getChooseState }) {
  const ratio = w.registered / Math.max(1, w.capacity);
  const percent = pct(w.registered, w.capacity);
  const bar = capColor(ratio);
  const danger = ratio > 0.85;
  const isFull = w.registered >= w.capacity;

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
      <div className="flex justify-between items-start gap-3">
        <h3 className="text-2xl font-semibold leading-snug">
          {w.title}
        </h3>
        <span className={`w-3 h-3 rounded-full mt-2 ${isFull ? 'bg-red-500' : 'bg-green-400'}`} title={isFull ? 'Voll' : 'Plätze frei'} />
      </div>

      <div className="grid grid-cols-3 text-xs gap-2 opacity-65">
        <span>{w.room}</span>
        <span>{w.date}</span>
        <span>{w.time}</span>
      </div>

      <div className="flex flex-col gap-2 mt-1">
        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full transition" style={{ width: `${percent}%`, background: danger ? '#FF5A5A' : bar }} />
        </div>
        <div className="flex justify-between text-sm opacity-75">
          <span>{w.registered}/{w.capacity} belegt</span>
          <span className={danger ? 'text-red-400' : ''}>{isFull ? 'Voll' : 'Plätze frei'}</span>
        </div>
      </div>

      {w.tags?.length ? (
        <div className="flex flex-wrap gap-2">
          {w.tags.map(t => (
            <span key={t} className="px-2 py-1 text-xs rounded-md bg-[#1b2736] border border-[#2A3442] text-[#a9b4c0]">
              {t}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-auto flex gap-3 pt-4 border-t border-white/10">
        <button
          onClick={onOpen}
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
{(() => {
  const st = getChooseState(w);
  const busy = choosingId === w.id;
  const disabled = st.disabled || busy;

  return (
    <button
      onClick={() => onChoose(w)}
      disabled={disabled}
      title={st.reason || ""}
      className={`btn btn-primary focus-aurora ${disabled ? "opacity-60 cursor-not-allowed grayscale" : ""}`}
    >
      {busy ? "Wähle..." : st.label}
    </button>
  );
})()}

      </div>
    </article>
  );
}

/* ===========================  DETAIL VIEW (TABS)  ============================= */
function DetailViewUI({ w, onBack, onChoose, getChooseState, choosingId }) {
  const [tab, setTab] = useState('Details');
  const registered = w.registered ?? 0;
  const ratio = registered / Math.max(1, w.capacity);
  const percent = pct(registered, w.capacity);
  const bar = capColor(ratio);
  const danger = ratio > 0.85;
  const isFull = registered >= w.capacity;

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="btn btn-secondary focus-aurora">← Zurück</button>

      <section className="card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[22px] font-semibold">{w.title}</h2>
            <div className="mt-1" style={{ color: TOK.textDim }}>
              {w.date} • {(w.time_slot ?? w.time ?? "—")} • Raum {w.room}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {w.is_day_workshop ? (
              <span className="chip" style={{ background: TOK.warnBg, color: TOK.warnText, border: `1px solid ${TOK.warnBorder}` }}>
                <Ic.info /> Tagesworkshop
              </span>
            ) : (
              <span className="chip" style={{ background: TOK.surfaceAlt, color: TOK.textDim, border: `1px solid ${TOK.border}` }}>
                Einzel
              </span>
            )}

            {isFull ? (
              <span className="chip" style={{ background: TOK.errBg, color: TOK.errText, border: `1px solid ${TOK.errBorder}` }}>
                <Ic.lock /> Voll
              </span>
            ) : (
              <span className="chip" style={{ background: TOK.okBg, color: TOK.okText, border: `1px solid ${TOK.okBorder}` }}>
                <Ic.check /> Plätze frei
              </span>
            )}

{(() => {
  const st = getChooseState(w);
  const busy = choosingId === w.id;
  const disabled = st.disabled || busy;

  return (
    <button
      className={`btn btn-primary focus-aurora ${disabled ? "opacity-60 cursor-not-allowed grayscale" : ""}`}
      onClick={() => onChoose(w)}
      disabled={disabled}
      title={st.reason || ""}
    >
      {busy ? "Wähle..." : st.label}
    </button>
  );
})()}

          </div>
        </div>

        <div className="mt-4">
          <div className="tnum text-sm">{registered}/{w.capacity} ({percent}%)</div>
          <div className="mt-2 h-2 bg-[#1b2736] rounded overflow-hidden">
            <div
              className="h-full"
              style={{ width: `${percent}%`, background: danger ? TOK.capHigh : bar }}
            />
          </div>
        </div>
      </section>

      <div className="flex items-center gap-2">
        {['Details','Hinweise'].map(name => (
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
        {tab === 'Details' && (
          <div className="space-y-2">
            <Row label="Titel" value={w.title} />
            <Row label="Datum" value={w.date} />
            <Row label="WS" value={w.time_slot ?? w.time ?? "—"} />
            <Row label="Raum" value={w.room} />
            <Row label="Typ" value={w.is_day_workshop ? 'Tagesworkshop (2 Slots)' : 'Einzel (1 Slot)'} />
            <Row label="Tags" value={(w.tags || []).join(', ') || '—'} />
            <Row label="Beschreibung" value={w.description || '—'} />
            <Row
  label="Klassenstufen"
  value={formatGradeRange(w.grade_from, w.grade_to)}
/>

          </div>
        )}

      

       {tab === "Hinweise" && (
  <div className="space-y-2">
    <div className="text-sm font-medium">Hinweise</div>

    {w.notes?.trim() ? (
      <div
        className="text-sm leading-relaxed whitespace-pre-wrap"
        style={{ color: TOK.text }}
      >
        {w.notes.trim()}
      </div>
    ) : (
      <p className="text-sm" style={{ color: TOK.textDim }}>
        Keine Hinweise hinterlegt.
      </p>
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
      <div className="w-40" style={{ color: TOK.textDim }}>{label}</div>
      <div>{value}</div>
    </div>
  );
}


/* ==============================  MY CHOICES UI  =============================== */
function MyChoicesUI({ workshops, myChoices, onOpen, onCancel, cancellingId }) {
  const byId = useMemo(() => Object.fromEntries(workshops.map(w => [w.id, w])), [workshops]);

  const coveredSlots = useMemo(() => {
    const covered = new Set();
    myChoices.forEach(c => {
      const w = byId[c.workshopId];
      if (!w) return;
      extractSlots(w.time).forEach(s => covered.add(s));
    });
    return covered;
  }, [myChoices, byId]);

  const missing = [1,2,3,4,5,6].filter(s => !coveredSlots.has(s));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[28px] font-semibold">Meine Wahl</h2>
        </div>

        <div className="card px-4 py-3" style={{ borderRadius: 14 }}>
          <div className="text-sm">
            Offene Slots: <strong>{missing.length}</strong>
          </div>
          <div className="text-xs mt-1" style={{ color: TOK.textDim }}>
            {missing.length ? `Fehlt: ${missing.map(slotLabel).join(', ')}` : 'Alles belegt'}
          </div>
        </div>
      </div>

      <section className="card p-5">
        <div className="text-sm mb-3" style={{ color: TOK.textDim }}>
          Gewählte Workshops
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ color: TOK.textDim }}>
              <tr>
                <th className="text-left px-3 py-2">WS</th>
                <th className="text-left px-3 py-2">Workshop</th>
                <th className="text-left px-3 py-2">Typ</th>
                <th className="text-left px-3 py-2">Raum</th>
                <th className="text-right px-3 py-2">Aktion</th>
              </tr>
            </thead>
            <tbody>
              {myChoices.map((c) => {
                const w = byId[c.workshopId];
                if (!w) return null;
                const slots = extractSlots(w.time).map(slotLabel).join(', ');
                return (
                  <tr key={c.workshopId} className="row-hover" style={{ height: 48 }}>
                    <td className="px-3 tnum">{slots}</td>
                    <td className="px-3">{w.title}</td>
                    <td className="px-3">{w.is_day_workshop ? 'Tagesworkshop' : 'Einzel'}</td>
                    <td className="px-3">{w.room}</td>
                   <td className="px-3">
  <div className="flex items-center justify-end gap-2">
    <button
      className="btn btn-secondary focus-aurora"
      style={{ height: 34, padding: "0 10px" }}
      onClick={() => onOpen(w.id)}
    >
      Details
    </button>

    <button
      className="btn focus-aurora"
      onClick={() => onCancel?.(c.workshopId)}
      disabled={cancellingId === c.workshopId}
      title="Workshop abwählen"
      style={{
        height: 34,
        padding: "0 10px",
        background: TOK.errBg,
        color: TOK.errText,
        border: `1px solid ${TOK.errBorder}`,
        opacity: cancellingId === c.workshopId ? 0.6 : 1,
      }}
    >
      <Ic.trash />
      {cancellingId === c.workshopId ? "Lösche..." : "Löschen"}
    </button>
  </div>
</td>

                  </tr>
                );
              })}

              {myChoices.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-4" style={{ color: TOK.textDim }}>
                    Noch keine Auswahl.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* ==============================  SETTINGS VIEW  =============================== */
function SettingsViewUI({ user }) {
  const { logoutLocal, logoutEverywhere } = useLogout();

  const email = user?.email ?? '—';

  const lastLogin = user?.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleString('de-DE')
    : '—';





  return (
    <div className="max-w-xl mx-auto space-y-10">
      <div>
        <h2 className="text-3xl font-semibold">Einstellungen</h2>
        <p className="text-sm text-[#9CA3AF] mt-1">
         Verwalte dein Konto und deine Anmeldung
        </p>
      </div>

      <section className="card p-6 space-y-5">
<div className="flex items-center gap-4 pb-4 border-b border-[#2A3442]">
  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--g1)] text-white text-lg font-semibold">
    {email[0]?.toUpperCase() ?? '?'}
  </div>

  <div>
    <div className="font-medium text-lg text-white">{email}</div>
    <div className="text-sm text-[#9CA3AF]">
      Letzter Login: {lastLogin}
    </div>
  </div>
</div>


        <div className="flex flex-col gap-3 pt-3">


<button
  onClick={logoutLocal}
  className="
    w-full px-4 py-3 rounded-lg
    bg-[#1E293B] text-white text-sm
    cursor-pointer
    transition-all duration-200 ease-out
    hover:bg-[#334155] hover:-translate-y-[1px] hover:shadow-[0_10px_22px_rgba(0,0,0,0.35)]
    active:bg-[#475569] active:translate-y-0
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22D3EE] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1220]
  "
>
  Abmelden (dieses Gerät)
</button>

<button
  onClick={logoutEverywhere}
  className="
    w-full px-4 py-3 rounded-lg
    bg-[#334155] text-white text-sm
    cursor-pointer
    transition-all duration-200 ease-out
    hover:bg-[#475569] hover:-translate-y-[1px] hover:shadow-[0_10px_22px_rgba(0,0,0,0.35)]
    active:bg-[#64748B] active:translate-y-0
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22D3EE] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1220]
  "
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

// ============================ SMART SEARCH (Name/Tag/Raum/Zeit) ============================

function key(v) {
  return String(v ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // Umlaute
    .replace(/[\s\-_:]/g, "")       // 🔥 Leerzeichen, -, _, :
    .trim();
}


function buildSearchIndex(workshops) {
  const tags = new Set();
  const rooms = new Set();

  workshops.forEach((w) => {
    (Array.isArray(w.tags) ? w.tags : []).forEach((t) => {
      const k = key(t);
      if (k) tags.add(k);
    });

    const rk = key(w.room);
    if (rk) rooms.add(rk);
  });

  return { tags, rooms };
}

/**
 * Regeln:
 * 1) Wenn die GESAMTE Query exakt ein Tag ist -> Tag-Filter (nur Tag)
 * 2) Wenn die GESAMTE Query exakt ein Raum ist -> Raum-Filter (nur Raum)
 * 3) Sonst tokenweise:
 *    - Tokens, die exakt Tags/Räume sind -> entsprechende Filter
 *    - ws3 / ws:3 / slot3 / zeit3 / "3" (wenn allein) -> Slot/Zeit-Filter
 *    - "10:30" oder "12.11.2025" -> Zeitterm (matcht time oder date)
 *    - Rest -> Name/Titel-Term (contains im Titel)
 */
function parseSmartSearch(query, index) {
  const q = query.trim();
  const qk = key(q);

  const out = {
    tags: new Set(),
    rooms: new Set(),
    slots: new Set(),
    timeTerms: [],
    nameTerms: [],
  };

  if (!qk) return out;

  // Whole-query exact match (wichtig für Räume mit Leerzeichen)
  if (index.tags.has(qk)) {
    out.tags.add(qk);
    return out;
  }
  if (index.rooms.has(qk)) {
    out.rooms.add(qk);
    return out;
  }

  // Tokenize: Whitespace + Kommas
  const tokens = q.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);

  const slotFromToken = (tok) => {
    const t = key(tok);

    // ws3 / ws-3 / ws:3 / slot3 / zeit3 ...
    const m = t.match(/^(?:ws|slot|zeit)(\d+)$/);

      t.match(/^(?:ws|slot|zeit)\s*(\d+)$/);

    if (m) return Number(m[1]);

    // Wenn nur "3" eingegeben wird (einzelnes Token), als WS interpretieren
    if (/^\d+$/.test(t) && tokens.length === 1) return Number(t);

    return null;
  };

  for (const tok of tokens) {
    const tk = key(tok);
    if (!tk) continue;

    if (index.tags.has(tk)) {
      out.tags.add(tk);
      continue;
    }
    if (index.rooms.has(tk)) {
      out.rooms.add(tk);
      continue;
    }

    const slot = slotFromToken(tok);
    if (slot && slot >= 1 && slot <= 6) {
      out.slots.add(slot);
      continue;
    }

    // Uhrzeit / Datum als Zeitterm
    if (/^\d{1,2}:\d{2}$/.test(tok) || /^\d{1,2}\.\d{1,2}\.\d{2,4}$/.test(tok)) {
      out.timeTerms.push(tok);
      continue;
    }

    // Fallback: Name/Titel
    out.nameTerms.push(tok);
  }

  return out;
}

function matchesSmartWorkshop(w, parsed) {
  const tags = Array.isArray(w.tags) ? w.tags.map(key) : [];
  const room = key(w.room);
  const title = key(w.title);
  const time = key(w.time_slot ?? w.time);
  const date = key(w.date);
  const slots = extractSlots(w.time_slot ?? w.time);

  // Exakt-Filter (Tags/Raum)
  for (const t of parsed.tags) {
    if (!tags.includes(t)) return false;
  }
  for (const r of parsed.rooms) {
    if (key(room) !== key(r)) return false;
  }

  // Slot/Zeit-Filter
  for (const s of parsed.slots) {
    if (!slots.includes(s)) return false;
  }

  // Zeit-/Datums-Terme müssen in time oder date vorkommen
  for (const tt of parsed.timeTerms) {
    const tkey = key(tt);
    if (!time.includes(tkey) && !date.includes(tkey)) return false;
  }

  // Name/Titel: alle Terme müssen im Titel vorkommen (contains)
  for (const nt of parsed.nameTerms) {
    const nkey = key(nt);
    if (!title.includes(nkey)) return false;
  }

  return true;
}


/* ===========================  ROOT COMPONENT  ================================= */
export default function Page() {
  
const [now, setNow] = useState(() => new Date());

useEffect(() => {
  const id = setInterval(() => setNow(new Date()), 30_000); // alle 30s reicht
  return () => clearInterval(id);
}, []);

  const [menuOpen, setMenuOpen] = useState(false);
  const [view, setView] = useState('overview'); // overview | list | my | detail | settings
  const [query, setQuery] = useState('');
  const [slotFilter, setSlotFilter] = useState(null); // 1..6 | null
  const [detailId, setDetailId] = useState(null);
  const searchRef = useRef(null);
  const [userEmail, setUserEmail] = useState('—');
const [myRegs, setMyRegs] = useState([]);
const [user, setUser] = useState(null);
const [confirmCancel, setConfirmCancel] = useState(null);
const [profile, setProfile] = useState(null);
const [profileLoaded, setProfileLoaded] = useState(false);
const [studentGrade, setStudentGrade] = useState(null);
const [appConfig, setAppConfig] = useState(null);



const [choosingId, setChoosingId] = useState(null);

async function loadMyRegs() {
  const { data, error } = await supabase
    .from("registrations")
    .select("id, workshop_id, status");

  if (error) {
    console.error("loadMyRegs error:", error?.message, error?.details, error?.hint, error?.code);
    return;
  }

  setMyRegs(data || []);
}



const userInitial = useMemo(() => {
  if (!userEmail || userEmail === '—') return '?';
  return userEmail[0].toUpperCase();
}, [userEmail]);

useEffect(() => {
  let cancelled = false;

  (async () => {
    const { data, error } = await supabase.auth.getUser();
    if (cancelled) return;

    if (error) {
      console.error("auth.getUser failed:", error);
      setProfileLoaded(true);
      return;
    }

    const u = data?.user ?? null;
    setUser(u);
    setUserEmail(u?.email ?? "—");

    if (!u?.id) {
      setProfileLoaded(true);
      return;
    }

    // Profil laden (class)
    const { data: prof, error: pErr } = await supabase
      .from("profiles")
      .select("id, class")
      .eq("id", u.id)
      .single();

    if (cancelled) return;

    if (pErr) console.error("load profile error:", pErr);

    setProfile(prof || null);
    setStudentGrade(parseGradeFromClass(prof?.class));
    setProfileLoaded(true);

    // meine Registrierungen laden
    await loadMyRegs(u.id);
  })();

  return () => {
    cancelled = true;
  };
}, []);

useEffect(() => {
  async function loadConfig() {
    const { data, error } = await supabase
      .from("app_config")
      .select("*")
      .single();

    if (error) {
      console.error("load app_config error:", error);
      return;
    }

    setAppConfig(data);
  }

  loadConfig();
}, []);



const [workshops, setWorkshops] = useState([]);
const [loadingWorkshops, setLoadingWorkshops] = useState(true);
const [workshopsError, setWorkshopsError] = useState(null);


// 🔎 Zentrale Suche (wie im Teacher-Dashboard): Titel/Datum/Zeit/Tags
const searchIndex = useMemo(() => buildSearchIndex(workshops), [workshops]);

const workshopsByQuery = useMemo(() => {
  const q = query.trim();
  if (!q) return workshops;

  const parsed = parseSmartSearch(q, searchIndex);
  return workshops.filter((w) => matchesSmartWorkshop(w, parsed));
}, [workshops, query, searchIndex]);


// (Optional, aber sinnvoll) Slot-Filter nur für die Liste kombinieren
const workshopsForList = useMemo(() => {
  let rows = workshopsByQuery;

  if (slotFilter) {
   rows = rows.filter((w) => getWsSlots(w).includes(slotFilter));
  }

  return rows;
}, [workshopsByQuery, slotFilter]);

const myChoices = React.useMemo(() => {
  return myRegs.map((r) => ({
    workshopId: r.workshop_id,
    status: r.status,
  }));
}, [myRegs]);

const workshopsById = React.useMemo(() => {
  return new Map((workshops || []).map(w => [w.id, w]));
}, [workshops]);

const myWorkshopIds = React.useMemo(() => {
  return new Set(myRegs.map(r => r.workshop_id));
}, [myRegs]);

const occupiedSlots = React.useMemo(() => {
  const set = new Set();
  for (const r of myRegs) {
    const w = workshopsById.get(r.workshop_id);
    if (!w) continue;
    for (const s of getWsSlots(w)) set.add(s); // getWsSlots hast du schon
  }
  return set;
}, [myRegs, workshopsById]);

const myRepeatGroups = React.useMemo(() => {
  const set = new Set();
  for (const r of myRegs) {
    const w = workshopsById.get(r.workshop_id);
    if (w?.repeat_group) set.add(w.repeat_group);
  }
  return set;
}, [myRegs, workshopsById]);

const studentWindowOpen = useMemo(() => {
  if (!appConfig) return false;

  return isWindowOpen(
    now,
appConfig.student_booking_open_from,
appConfig.student_booking_cutoff_date

  );
}, [appConfig, now]);


function getChooseState(w) {
  if (!w?.id) return { disabled: true, label: "—", reason: "Ungültiger Workshop" };

  if (!studentWindowOpen) {
  return {
    disabled: true,
    label: "Geschlossen",
    reason: "Der Wahlzeitraum ist aktuell geschlossen.",
  };
}


  // ✅ Klassenstufen-Regel
  const gFrom = toInt(w.grade_from);
  const gTo   = toInt(w.grade_to);

  if (gFrom || gTo) {
    if (!profileLoaded) {
      return { disabled: true, label: "Lädt...", reason: "Dein Profil wird noch geladen." };
    }

    if (!studentGrade) {
      return {
        disabled: true,
        label: "Nicht erlaubt",
        reason: "Deine Klasse ist nicht hinterlegt. Bitte im Profil setzen lassen."
      };
    }

    const min = gFrom ?? -Infinity;
    const max = gTo ?? Infinity;
    const ok = studentGrade >= min && studentGrade <= max;

    // ✅ Standard-Logik: NUR in Range wählbar
    if (!ok) {
      return {
        disabled: true,
        label: "Nicht erlaubt",
        reason: `Dieser Workshop ist nur für ${formatGradeRange(gFrom, gTo)}. Du bist Jgst ${studentGrade}.`
      };
    }
  }

  // Schon gewählt
  if (myWorkshopIds.has(w.id)) {
    return { disabled: true, label: "Gewählt", reason: "Diesen Workshop hast du bereits gewählt." };
  }

  // Voll
  const reg = Number(w.registered ?? 0);
  const cap = Number(w.capacity ?? 0);
  if (cap > 0 && reg >= cap) {
    return { disabled: true, label: "Voll", reason: "Dieser Workshop ist bereits voll." };
  }

  // Repeat-Group
  if (w.repeat_group && !w.allow_multi_booking && myRepeatGroups.has(w.repeat_group)) {
    return {
      disabled: true,
      label: "Schon gewählt",
      reason: "Du darfst diesen mehrfach angebotenen Workshop nur einmal wählen.",
    };
  }

  // Slot-Konflikt
  const ws = getWsSlots(w);
  const conflict = ws.some(s => occupiedSlots.has(s));
  if (conflict) {
    return {
      disabled: true,
      label: "Slot belegt",
      reason: "Du hast in diesem Zeitfenster bereits einen Workshop gewählt.",
    };
  }

  return { disabled: false, label: "Wählen", reason: "" };
}


async function chooseWorkshop(w) {
  if (!user?.id) {
    alert("Du bist nicht eingeloggt.");
    return;
  }

  const st = getChooseState(w);
  if (st.disabled) {
    if (st.reason) alert(st.reason);
    return;
  }

  try {
    setChoosingId(w.id);

    const { error } = await supabase
      .from("registrations")
      .insert([
        {
          user_id: user.id,
          workshop_id: w.id,
          status: "confirmed", // wichtig: nicht 'canceled'
        },
      ]);

    if (error) {
      console.error(error);
      alert(error.message || "Wählen fehlgeschlagen.");
      return;
    }

    // Nach Wahl: eigene Registrierungen + Workshop-Liste neu laden
    await loadMyRegs(user.id);
    await loadConfirmedWorkshops();
  } finally {
    setChoosingId(null);
  }
}

const [cancelingId, setCancelingId] = useState(null);

async function cancelWorkshopChoice(workshopId) {
  setConfirmCancel(workshopId);
}



async function loadConfirmedWorkshops() {
  setLoadingWorkshops(true);
  setWorkshopsError(null);

  const { data, error } = await supabase.rpc("list_visible_workshops");


  if (error) {
    console.error("list_confirmed_workshops failed:", error);
    setWorkshopsError(error.message || "Fehler beim Laden");
    setWorkshops([]);
    setLoadingWorkshops(false);
    return;
  }

  const mapped = (data || []).map((w) => {
    const rawDate = w.date ? new Date(w.date) : null;
    const dateLabel = rawDate ? rawDate.toLocaleDateString("de-DE") : "—";
    const timeValue = String(w?.time_slot ?? w?.time ?? "").trim();

    return {
      ...w,
      date: dateLabel,
      time: timeValue,
      registered: w.registered ?? 0,
    };
  });

  setWorkshops(mapped);
  setLoadingWorkshops(false);
}

useEffect(() => {
  function onKeyDown(e) {
    // Nur "/" (Shift+7 auf DE-Tastatur)
    if (e.key !== "/") return;

    // Nicht auslösen, wenn man gerade tippt
    const el = document.activeElement;
    const isTyping =
      el &&
      (el.tagName === "INPUT" ||
        el.tagName === "TEXTAREA" ||
        el.isContentEditable);

    if (isTyping) return;

    e.preventDefault();

    // Suche fokussieren
    searchRef.current?.focus();
  }

  window.addEventListener("keydown", onKeyDown);
  return () => window.removeEventListener("keydown", onKeyDown);
}, []);


useEffect(() => {
  let alive = true;

  (async () => {
    await loadConfirmedWorkshops();
  })();

  return () => { alive = false; };
}, [supabase]);



  const detail = useMemo(() => workshops.find(w => w.id === detailId) || null, [workshops, detailId]);

  function openDetail(id){
    setDetailId(id);
    setView('detail');
  }

  function selectSlot(slot) {
  setSlotFilter(prev => (prev === slot ? null : slot)); // same slot toggles off
  setQuery("");              // optional, aber sinnvoll
  setDetailId(null);         // sauber
  setView("list");           // ab in die Workshop-Liste
}

function clearSlotFilter() {
  setSlotFilter(null);
}


  const headerTitle =
    view === 'overview' ? 'Übersicht' :
    view === 'list' ? 'Workshops' :
    view === 'my' ? 'Meine Wahl' :
    view === 'settings' ? 'Einstellungen' :
    (detail?.title || 'Workshop');

  return (
    <div className="h-screen" style={{ background: TOK.bg, color: TOK.text }}>
      {/* Hintergrund / Orbs */}
      <div className="fixed inset-0 bg-[var(--bg)] text-slate-100 pointer-events-none">
        <div className="hidden md:block pointer-events-none absolute bottom-0 right-0 h-[20rem] w-[20rem] translate-x-1/3 translate-y-1/3 rounded-full bg-gradient-to-tr from-[var(--primary-2)] via-teal-500 to-[var(--primary)] opacity-20 orb orb2" />
      </div>
      

      {/* Global Styles (wie Teacher-Dashboard) */}
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

        html, body, #__next { height: 100%; background: var(--bg); }

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
.btn { cursor: pointer; }
.btn:disabled { cursor: not-allowed; }

        .btn-primary:hover { filter: brightness(1.08); transform: translateY(-1px); }
        .btn-primary:disabled { opacity: .55; cursor: not-allowed; transform: none; filter: none; }

        .btn-secondary {
          background: color-mix(in oklab, var(--surface) 88%, transparent);
          color: var(--text);
          border: 1px solid var(--border);
          box-shadow: 0 2px 8px rgba(0, 0, 0, .25) inset, 0 8px 18px rgba(0, 0, 0, .25);
        }
        .btn-secondary:hover { background: color-mix(in oklab, var(--surface) 92%, transparent); }
        .btn-secondary:disabled { opacity: .55; cursor: not-allowed; }

        .btn-tertiary { color: ${TOK.info}; background: transparent; }
        .btn-tertiary:hover { text-decoration: underline; }
        .btn-tertiary:disabled { opacity: .55; cursor: not-allowed; text-decoration: none; }

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

        .divider { height: 1px; background: var(--border); opacity: .7; }
        .row-hover:hover { background: rgba(255,255,255,.035); }

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
          button,
a,
label,
[role="button"],
input[type="button"],
input[type="submit"],
input[type="reset"],
input[type="checkbox"],
input[type="radio"],
select {
  cursor: pointer !important;
}

button:disabled,
.btn:disabled,
[role="button"][aria-disabled="true"],
input:disabled,
select:disabled {
  cursor: not-allowed !important;
}


        /* Scrollbar hidden (wie bei dir) */
        html::-webkit-scrollbar, body::-webkit-scrollbar { width: 0px; height: 0px; }
        html, body { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>

      {/* App Shell */}
      <div className="relative z-10 flex h-full">
        {/* Sidebar */}
        <aside
          style={{ width: 64, background: TOK.surfaceAlt, borderRight: `1px solid ${TOK.border}` }}
          className="hidden md:flex flex-col items-stretch"
        >
          {[
            { key: 'overview', icon: Ic.home, label: 'Übersicht' },
            { key: 'list', icon: Ic.hat, label: 'Workshops' },
            { key: 'my', icon: Ic.users, label: 'Meine Wahl' },
            { key: 'settings', icon: Ic.cog, label: 'Einstellungen' },
          ].map((it) => {
            const active = view === it.key || (view === 'detail' && it.key === 'list');
            return (
              <button
                key={it.key}
                title={it.label}
                onClick={() => setView(it.key)}
                className={cx('relative h-16 flex items-center justify-center cursor-pointer transition-colors duration-150 hover:bg-[#1C2432] focus-aurora')}
                aria-label={it.label}
              >
                {active && <span className="absolute left-0" style={{ width: 3, height: 28, background: '#22D3EE', borderRadius: 2 }} />}
                <it.icon style={{ color: active ? TOK.text : TOK.textDim }} />
              </button>
            );
          })}
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header
            className="flex items-center justify-between md:justify-start gap-4 px-6 relative"
            style={{ height: 64, borderBottom: `1px solid ${TOK.border}`, background: 'transparent' }}
          >
            <div className="flex items-center gap-3">
              <button className="md:hidden flex items-center justify-center" onClick={() => setMenuOpen(true)}>
                <svg width="26" height="26" stroke="currentColor">
                  <path d="M3 6h18M3 12h18M3 18h18" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <h1 className="text-[22px] font-semibold hidden md:block">
              {headerTitle}
            </h1>

            {/* Suche */}
            <div className="flex-1 flex justify-center md:justify-start w-full">
              <div className="flex items-center gap-2 px-3 card" style={{ width: '100%', maxWidth: 560, height: 44, borderRadius: 12 }}>
                <Ic.search style={{ color: TOK.textDim }} />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Workshops durchsuchen…"
                  aria-label="Workshops durchsuchen"
                  className="flex-1 bg-transparent outline-none text-[14px] placeholder-[#7a8796]"
                />
                <span className="kbd">/</span>
              </div>
            </div>

            {/* Profil (UI) */}
<div className="flex items-center gap-3">
  <div
    className="text-sm max-w-[260px] truncate"
    style={{ color: TOK.textDim }}
    title={userEmail}
  >
    {userEmail}
  </div>
  <div
    className="flex items-center justify-center"
    style={{ width: 36, height: 36, borderRadius: 18, background: TOK.gradFrom, color: '#fff', fontWeight: 600 }}
    title={userEmail}
  >
    {userInitial}
  </div>
</div>

          </header>

          {/* Content */}
          <main  className="flex-1 overflow-y-auto p-6">
{appConfig && !studentWindowOpen && (
  <div
    className="card p-4 mb-4"
    style={{
      border: `1px solid ${TOK.warnBorder}`,
      background: TOK.warnBg,
      color: TOK.warnText,
    }}
  >
    Wahlzeitraum geschlossen:{" "}
    {String(appConfig.student_booking_open_from)} bis{" "}
    {String(appConfig.student_booking_cutoff_date)}
  </div>
)}


            {loadingWorkshops && (
  <div className="card p-4">Lade Workshops…</div>
)}

{!loadingWorkshops && workshopsError && (
  <div className="card p-4" style={{ color: TOK.errText }}>
    {workshopsError}
  </div>
)}

            {view === 'overview' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .18 }}>
                <OverviewUI
  workshops={workshopsByQuery}
  myChoices={myChoices}
  onOpen={openDetail}
  choosingId={choosingId}
  onChoose={chooseWorkshop}
  getChooseState={getChooseState}
/>


              </motion.div>
            )}

            {view === 'list' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .18 }}>
<ListViewUI
  workshops={workshopsForList}
  onOpen={openDetail}
  slotFilter={slotFilter}
  onClearSlot={() => setSlotFilter(null)}
  onSetSlot={(s) => setSlotFilter(s)}
  onChoose={chooseWorkshop}
  getChooseState={getChooseState}
  choosingId={choosingId}
/>


  </motion.div>
)}

{view === 'my' && (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .18 }}>
    <MyChoicesUI
      workshops={workshops}
      myChoices={myChoices}
      onOpen={openDetail}
      onCancel={cancelWorkshopChoice}
      cancellingId={cancelingId}
    />
  </motion.div>
)}


            {view === 'detail' && detail && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .18 }}>
                <DetailViewUI
  w={detail}
  onBack={() => setView('list')}
  onChoose={chooseWorkshop}
  getChooseState={getChooseState}
  choosingId={choosingId}
/>

              </motion.div>
            )}

            {view === 'settings' && (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
    <SettingsViewUI user={user} />
  </motion.div>
)}

          </main>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/40" onClick={() => setMenuOpen(false)}>
          <div
            className="absolute left-0 top-0 h-full w-64 bg-[var(--surfaceAlt)] border-r border-[var(--border)] p-4 flex flex-col gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {[
              { key: 'overview', icon: Ic.home, label: 'Übersicht' },
              { key: 'list', icon: Ic.hat, label: 'Workshops' },
              { key: 'my', icon: Ic.users, label: 'Meine Wahl' },
              { key: 'settings', icon: Ic.cog, label: 'Einstellungen' },
            ].map((it) => (
              <button
                key={it.key}
                onClick={() => { setView(it.key); setMenuOpen(false); }}
                className="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors duration-150 hover:bg-[#1C2432]"
              >
                <it.icon style={{ width: 22, height: 22 }} />
                <span className="text-sm">{it.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
 {confirmCancel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setConfirmCancel(null)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md rounded-xl border border-[#2A3442] bg-[#0F172A] p-5 shadow-xl">
            <div className="text-lg font-semibold mb-2">
              Workshop abwählen?
            </div>

            <p className="text-sm mb-5" style={{ color: TOK.textDim }}>
              Deine Auswahl wird aufgehoben und der Workshop ist danach wieder frei wählbar.
            </p>

            <div className="flex justify-end gap-2">
              <button
                className="btn btn-tertiary"
                onClick={() => setConfirmCancel(null)}
              >
                Abbrechen
              </button>

              <button
                className="btn focus-aurora"
                style={{
                  background: TOK.errBg,
                  color: TOK.errText,
                  border: `1px solid ${TOK.errBorder}`,
                }}
                onClick={async () => {
                  const workshopId = confirmCancel;
                  setConfirmCancel(null);
                  setCancelingId(workshopId);

                  const { error } = await supabase
  .from("registrations")
  .delete()
  .eq("user_id", user.id)
  .eq("workshop_id", workshopId);


                  setCancelingId(null);

                  if (error) {
                    alert("Löschen fehlgeschlagen.");
                    return;
                  }

// Optimistisch sofort aus UI entfernen
setMyRegs((prev) => prev.filter((r) => r.workshop_id !== workshopId));

// Danach einmal sauber aus DB neu ziehen (damit occupiedSlots sicher stimmt)
await loadMyRegs(user.id);

// Counts/Slots aktualisieren
await loadConfirmedWorkshops();


                }}
              >
                <Ic.trash />
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
