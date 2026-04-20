'use client';

import '../globals.css';
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";


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

/* ==============================  ICONS (Lucide-like)  ============================== */
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
  info:(p)=> (
  <svg width="18" height="18" viewBox="0 0 24 24" {...p} fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 16v-4"/>
    <path d="M12 8h.01"/>
  </svg>
),

calendarFold: (p) => (
  <svg width="24" height="24" viewBox="0 0 24 24" {...p}
    fill="none" stroke="currentColor" strokeWidth="1.6"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 20a2 2 0 0 0 2 2h10a2.4 2.4 0 0 0 1.706-.706l3.588-3.588A2.4 2.4 0 0 0 21 16V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"/>
    <path d="M15 22v-5a1 1 0 0 1 1-1h5"/>
    <path d="M8 2v4"/>
    <path d="M16 2v4"/>
    <path d="M3 10h18"/>
  </svg>
),



  download:(p)=><svg width="18" height="18" viewBox="0 0 24 24" {...p} fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/></svg>,
  plus:(p)=> <svg width="18" height="18" viewBox="0 0 24 24" {...p} fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>,
};

/* ================================  UTILS  ===================================== */
const cx  = (...c) => c.filter(Boolean).join(' ');
const pct = (used, total) => Math.max(0, Math.min(100, Math.round((used / Math.max(1, total)) * 100)));
const capColor = (r) => (r <= 0.7 ? TOK.capLow : r <= 0.85 ? TOK.capMid : TOK.capHigh);

function toInt(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function extractGrade(cls) {
  const match = String(cls).match(/\d+/)
  return match ? Number(match[0]) : null
}

function formatGradeRange(from, to) {
  const f = toInt(from);
  const t = toInt(to);

  if (!f && !t) return "Alle";
  if (f && t) return `Jgst ${f} – Jgst ${t}`;
  if (f) return `ab Jgst ${f}`;
  return `bis Jgst ${t}`;
}

/* ==========================  SAMPLE DATA (Admin Dummy)  ======================== */
const SAMPLE_WORKSHOPS = [
  { id:'w1', title:'Robotics Basics', date:'2026-07-13', time_slot:'WS 1, WS 2', room:'B102', registered:35, capacity:40, status:'confirmed', tags:['Technik','Einführung'], owner_name:'Lehrer:in Becker' },
  { id:'w2', title:'Physik-Experimente', date:'2026-07-14', time_slot:'WS 3', room:'Lab1', registered:12, capacity:18, status:'confirmed', tags:['Naturwissenschaften'], owner_name:'Lehrer:in Kaya' },
  { id:'w3', title:'Kreatives Schreiben', date:'2026-07-15', time_slot:'WS 5', room:'A201', registered:0, capacity:20, status:'locked', tags:['Sprache','Kreativ'], owner_name:'Lehrer:in Müller' },
  { id:'w4', title:'Kunst & Design', date:'2026-07-15', time_slot:'WS 6', room:'R20', registered:18, capacity:20, status:'confirmed', tags:['Kunst'], owner_name:'Lehrer:in Schmidt' },
];

const SAMPLE_USERS = [
  { id:'u1', name:'Anna Becker', email:'anna.becker@schule.de', role:'teacher', created_at:'2025-10-02', status:'active' },
  { id:'u2', name:'Mehmet Kaya', email:'mehmet.kaya@schule.de', role:'teacher', created_at:'2025-10-08', status:'active' },
  { id:'u3', name:'Max Mustermann', email:'max@schule.de', role:'student', created_at:'2025-11-01', status:'active' },
  { id:'u4', name:'Sperrfall Test', email:'lock@schule.de', role:'student', created_at:'2025-11-06', status:'blocked' },
];



/* ============================  LIST VIEW (TABLE)  ============================ */
function WorkshopsListView({ workshops, filters, setFilters, onOpen, onExport })
 {
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
              const ratio = (w.registered ?? 0) / Math.max(1, w.capacity ?? 0);
              const percent = Math.round(ratio * 100);
              const critical = ratio > 0.85;

              return (
                <tr key={w.id} className="border-t border-[#2A3442] hover:bg-[#1C2736] transition-colors">
                  {/* TITLE + TAGS */}
                  <td className="px-4 py-3 align-top">
                    <div className="font-medium text-[15px] text-white">{w.title}</div>
                    <div className="text-xs mt-1" style={{ color: TOK.textDim }}>{w.owner_name}</div>

                    {Array.isArray(w.tags) && w.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
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
                  <td className="px-4 py-3 align-top text-[#d3d9e0]">{w.time_slot}</td>
                  <td className="px-4 py-3 align-top text-[#d3d9e0]">{w.room}</td>

                  {/* Belegung */}
                  <td className="px-4 py-3 align-top tnum text-[#d3d9e0]">
                    <div className="flex items-center gap-2">
                      <span>{w.registered}/{w.capacity}</span>
                      <div className="flex-1 h-2 bg-[#1b2736] rounded overflow-hidden">
                        <div
                          style={{ width: `${percent}%`, background: critical ? "#ef4444" : "#22c55e" }}
                          className="h-full"
                        />
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 align-top">
                    {w.status === "confirmed" ? (
                      <span className="chip" style={{ background: TOK.okBg, color: TOK.okText, border: `1px solid ${TOK.okBorder}` }}>
                        <Ic.check /> Freigegeben
                      </span>
                    ) : (
                      <span className="chip" style={{ background: TOK.errBg, color: TOK.errText, border: `1px solid ${TOK.errBorder}` }}>
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

/* =============================  OVERVIEW (CARDS)  ============================= */
function AdminOverview({ workshops, onOpen }) {
  const total = workshops.length;
  const confirmed = workshops.filter(w => w.status === 'confirmed').length;
  const crowded = workshops.filter(
    w => ((w.registered ?? 0) / Math.max(1, w.capacity ?? 0)) > 0.85
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[28px] font-semibold">Admin-Übersicht</h2>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))' }}>
        <Kpi title="Workshops" value={total} sub="gesamt" />
      </div>

      {crowded.length > 0 && (
        <div className="card p-4 flex items-center justify-between">
          <div>
            <strong>Hinweis:</strong> „{crowded[0].title}“ ist <em>fast voll</em>.
          </div>
          <button
            className="chip"
            style={{ background:TOK.warnBg, color:TOK.warnText, border:`1px solid ${TOK.warnBorder}` }}
            onClick={() => onOpen(crowded[0].id)}
          >
            Öffnen
          </button>
        </div>
      )}

      <div className="grid gap-6" style={{ gridTemplateColumns:'repeat(auto-fill, minmax(340px, 1fr))' }}>
        {workshops.map(w => (
<WorkshopCard
  key={w.id}
  w={w}
  onOpen={() => onOpen(w.id)}
/>

        ))}
      </div>
    </div>
  );
}


function useLogout(supabase) {
  const router = useRouter();

  async function logoutLocal() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  async function logoutEverywhere() {
    await supabase.auth.signOut({ scope: 'global' });
    router.replace('/login');
  }

  return { logoutLocal, logoutEverywhere };
}




function Kpi({ title, value, sub, warn=false }) {
  return (
    <div className="card p-5">
      <div className="text-sm" style={{ color: TOK.textDim }}>{title}</div>
      <div className="text-[34px] font-semibold mt-1">{value}</div>
      <div className="text-xs mt-2" style={{ color: warn ? TOK.warnText : TOK.textDim }}>
        {sub}
      </div>
    </div>
  );
}

function WorkshopCard({ w, onOpen, onToggle }) {
  const registered = w.registered ?? 0;
  const capacity = w.capacity ?? 0;
  const ratio = registered / Math.max(1, capacity);
  const percent = pct(registered, capacity);
  const isLocked = w.status !== "confirmed";
  const capacityCritical = ratio > 0.85;
  const rest = capacity - registered;
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
        <h3 className="text-2xl font-semibold leading-snug line-clamp-2">{w.title}</h3>
        <span className={`w-3 h-3 rounded-full mt-1 ${isLocked ? "bg-red-500" : "bg-green-400"}`} />
      </div>

      {/* INFO GRID */}
      <div className="grid grid-cols-3 text-xs gap-2 opacity-65">
        <span>{w.room}</span>
        <span>{w.date}</span>
        <span>{w.time_slot}</span>
      </div>

      <div className="text-xs" style={{ color: TOK.textDim }}>{w.owner_name}</div>

      {/* PROGRESS */}
      <div className="flex flex-col gap-2 mt-1">
        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full transition" style={{ width: `${percent}%`, background: capacityCritical ? "#FF5A5A" : "#37C776" }} />
        </div>

        <div className="flex justify-between text-sm opacity-75">
          <span>{registered}/{capacity} belegt</span>
          <span className={capacityCritical ? "text-red-400" : ""}>
            {rest === capacity ? "Noch frei" : capacityCritical ? "Fast voll" : "Plätze frei"}
          </span>
        </div>
      </div>

      {/* TAGS */}
      {Array.isArray(w.tags) && w.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-1">
          {w.tags.map((t) => (
            <span key={t} className="px-2 py-1 text-xs rounded-md bg-[#1b2736] border border-[#2A3442] text-[#a9b4c0]">
              {t}
            </span>
          ))}
        </div>
      )}

      {/* REST BADGE */}
      {showRestBadge && (
        <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/30 px-3 py-1 rounded-lg w-fit font-medium">
          {rest} Plätze übrig
        </div>
      )}
            {/* ACTIONS */}
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
      </div>

    </article>
  );
}

/* ============================  USERS VIEW (TABLE)  ============================ */
function UsersView({ users, onAssignSlot }) {
  // ── local tab state ──────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = React.useState("students"); // "students" | "staff"
  const [expandedId, setExpandedId] = React.useState(null);     // row expanded to show missing slots

  // ── split by role ────────────────────────────────────────────────────────
  const students = React.useMemo(
    () => users.filter((u) => (u.role ?? "").toLowerCase() === "student"),
    [users]
  );
  const staff = React.useMemo(
    () => users.filter((u) => (u.role ?? "").toLowerCase() !== "student"),
    [users]
  );

  // ── helpers ──────────────────────────────────────────────────────────────
  const toggle = (id) => setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h2 className="text-[22px] font-semibold">Benutzer ({users.length})</h2>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl"
             style={{ background: TOK.surfaceAlt, border: `1px solid ${TOK.border}` }}>
          {[
            { key: "students", label: `Schüler (${students.length})` },
            { key: "staff",    label: `Lehrer / Admins (${staff.length})` },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className="btn focus-aurora"
              style={{
                height: 36,
                padding: "0 14px",
                fontSize: 13,
                background: activeTab === t.key ? TOK.surface : "transparent",
                color: activeTab === t.key ? TOK.text : TOK.textDim,
                border: activeTab === t.key ? `1px solid ${TOK.border}` : "1px solid transparent",
                borderRadius: 10,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          TAB 1 – SCHÜLER with slot-completion status
         ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "students" && (
<StudentTable
  students={students}
  expandedId={expandedId}
  onToggleExpand={toggle}
onAssignSlot={onAssignSlot}
/>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB 2 – LEHRER / ADMINS (unchanged from original)
         ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "staff" && (
        <div className="card overflow-x-auto">
          <table className="min-w-max w-full text-sm border-collapse">
            <thead style={{ background: TOK.surfaceAlt, color: TOK.textDim }}>
              <tr>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">E-Mail</th>
                <th className="px-4 py-3 text-left font-medium">Rolle</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Erstellt</th>
              </tr>
            </thead>
            <tbody>
              {staff.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center" style={{ color: TOK.textDim }}>
                    Keine Einträge.
                  </td>
                </tr>
              )}
              {staff.map((u) => (
                <tr key={u.id} className="border-t border-[#2A3442] hover:bg-[#1C2736] transition-colors">
                  <td className="px-4 py-3">{u.full_name || u.name || "—"}</td>
                  <td className="px-4 py-3 text-[#d3d9e0]">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="chip"
                          style={{ background: "#0F172A", border: `1px solid ${TOK.border}`, color: TOK.textDim }}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.status === "active" ? (
                      <span className="chip"
                            style={{ background: TOK.okBg, color: TOK.okText, border: `1px solid ${TOK.okBorder}` }}>
                        <Ic.check /> aktiv
                      </span>
                    ) : (
                      <span className="chip"
                            style={{ background: TOK.errBg, color: TOK.errText, border: `1px solid ${TOK.errBorder}` }}>
                        <Ic.lock /> blockiert
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#d3d9e0]">{u.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


// ─── StudentTable ─────────────────────────────────────────────────────────────
//  Renders the Schüler tab with per-student slot-completion status.
//  This is a separate component to keep UsersView readable.

function StudentTable({ students, expandedId, onToggleExpand, onAssignSlot }) {
  // Count summary stats
  const complete   = students.filter((s) => s.is_complete).length;
  const incomplete = students.length - complete;

  return (
    <div className="space-y-4">
      {/* Summary pills */}
      <div className="flex flex-wrap gap-3">
        <div className="card px-4 py-3 flex items-center gap-3" style={{ borderRadius: 12 }}>
          <span style={{ color: TOK.textDim, fontSize: 13 }}>Vollständig</span>
          <span className="chip"
                style={{ background: TOK.okBg, color: TOK.okText, border: `1px solid ${TOK.okBorder}`, fontSize: 13, fontWeight: 600 }}>
            {complete}
          </span>
        </div>
        <div className="card px-4 py-3 flex items-center gap-3" style={{ borderRadius: 12 }}>
          <span style={{ color: TOK.textDim, fontSize: 13 }}>Unvollständig</span>
          <span className="chip"
                style={{ background: incomplete > 0 ? TOK.errBg : TOK.surfaceAlt,
                         color:      incomplete > 0 ? TOK.errText : TOK.textDim,
                         border:     `1px solid ${incomplete > 0 ? TOK.errBorder : TOK.border}`,
                         fontSize: 13, fontWeight: 600 }}>
            {incomplete}
          </span>
        </div>
        <div className="card px-4 py-3 flex items-center gap-3" style={{ borderRadius: 12 }}>
          <span style={{ color: TOK.textDim, fontSize: 13 }}>Gesamt</span>
          <span className="chip"
                style={{ background: TOK.surfaceAlt, color: TOK.text,
                         border: `1px solid ${TOK.border}`, fontSize: 13, fontWeight: 600 }}>
            {students.length}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="min-w-max w-full text-sm border-collapse">
          <thead style={{ background: TOK.surfaceAlt, color: TOK.textDim }}>
            <tr>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">E-Mail</th>
              <th className="px-4 py-3 text-left font-medium">Klasse</th>
              <th className="px-4 py-3 text-left font-medium">Slots</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium"></th>
            </tr>
          </thead>

          <tbody>
            {students.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center" style={{ color: TOK.textDim }}>
                  Keine Schüler gefunden.
                </td>
              </tr>
            )}

            {students.map((s) => {
              const covered  = s.covered_slots  ?? 0;
              const required = s.required_slots ?? 6;
              const missing  = s.missing_slots  ?? [];
              const complete = s.is_complete    ?? false;
              const pct      = Math.round((covered / Math.max(1, required)) * 100);
              const isExpanded = expandedId === s.user_id;

              return (
                <React.Fragment key={s.user_id}>
                  {/* ── Main row ── */}
                  <tr
                    className="border-t border-[#2A3442] hover:bg-[#1C2736] transition-colors cursor-pointer"
                    onClick={() => !complete && onToggleExpand(s.user_id)}
                    title={complete ? undefined : "Klicken für fehlende Slots"}
                  >
                    {/* Name */}
                    <td className="px-4 py-3 font-medium text-white">
                      {s.full_name || "—"}
                    </td>

                    {/* E-Mail */}
                    <td className="px-4 py-3" style={{ color: TOK.textDim }}>
                      {s.email || "—"}
                    </td>

                    {/* Klasse */}
                    <td className="px-4 py-3" style={{ color: TOK.textDim }}>
                      {s.class || "—"}
                    </td>

                    {/* Slot progress bar */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2" style={{ minWidth: 120 }}>
                        <span className="tnum text-xs" style={{ color: TOK.textDim, minWidth: 32 }}>
                          {covered}/{required}
                        </span>
                        <div className="flex-1 h-2 rounded-full overflow-hidden"
                             style={{ background: TOK.surfaceAlt, minWidth: 60 }}>
                          <div
                            className="h-full transition-all"
                            style={{
                              width: `${pct}%`,
                              background: complete ? TOK.capLow : covered > 0 ? TOK.capMid : TOK.capHigh,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Status chip */}
                    <td className="px-4 py-3">
                      {complete ? (
                        <span className="chip"
                              style={{ background: TOK.okBg, color: TOK.okText, border: `1px solid ${TOK.okBorder}` }}>
                          <Ic.check /> gewählt
                        </span>
                      ) : (
                        <span className="chip"
                              style={{ background: TOK.errBg, color: TOK.errText, border: `1px solid ${TOK.errBorder}` }}>
                          <Ic.lock /> nicht gewählt
                        </span>
                      )}
                    </td>

                    {/* Expand toggle (only for incomplete rows) */}
                    <td className="px-4 py-3 text-right">
                      {!complete && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onToggleExpand(s.user_id); }}
                          className="btn btn-tertiary focus-aurora"
                          style={{ height: 28, padding: "0 8px", fontSize: 12 }}
                          title="Fehlende Slots anzeigen"
                        >
                          {isExpanded ? "▲" : "▼"}
                        </button>
                      )}
                    </td>
                  </tr>

                  {/* ── Expanded detail: missing slots ── */}
                  {isExpanded && !complete && (
                    <tr className="border-t border-[#2A3442]"
                        style={{ background: TOK.surfaceAlt }}>
                      <td colSpan={6} className="px-6 py-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-xs font-medium" style={{ color: TOK.textDim }}>
                            Fehlende Slots:
                          </span>
                          {missing.length > 0 ? (
missing.map((slot) => (
  <button
    key={slot}
    onClick={(e) => {
      e.stopPropagation()
      onAssignSlot(s, slot)
    }}
    className="chip"
    style={{
      background: TOK.warnBg,
      color: TOK.warnText,
      border: `1px solid ${TOK.warnBorder}`,
      fontSize: 12,
      cursor: "pointer"
    }}
  >
    + WS {slot}
  </button>
))
                          ) : (
                            <span className="text-xs" style={{ color: TOK.textDim }}>—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function DateField({ label, value, onChange }) {
  return (
    <label className="space-y-1 block cursor-pointer">
      <div className="text-xs" style={{ color: TOK.textDim }}>
        {label}
      </div>

      <div
        className="
          relative
          flex items-center
          bg-[#16202B]
          border border-[#2A3442]
          rounded-xl
          px-4 py-3
          text-sm
          hover:border-[#3a4656]
          transition
        "
      >
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="
            bg-transparent
            outline-none
            w-full
            text-white
            cursor-pointer
          "
        />

        <span className="absolute right-3 opacity-60 pointer-events-none">
          <Ic.calendarFold width={18} height={18} />
        </span>
      </div>
    </label>
  );
}



function ConfigView({ supabase, showToast }) {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  // Lehrer
  const [teacherFrom, setTeacherFrom] = useState("");
  const [teacherTo, setTeacherTo] = useState("");

  // Schüler
  const [studentFrom, setStudentFrom] = useState("");
  const [studentTo, setStudentTo] = useState("");

  async function loadConfig() {
    setLoading(true);

    const { data, error } = await supabase
      .from("app_config")
      .select("*")
      .eq("id", 1)
      .single();

    if (error) {
      console.error(error);
      showToast("Konfiguration konnte nicht geladen werden.");
      setLoading(false);
      return;
    }

    setTeacherFrom(data.teacher_admin_open_from || "");
    setTeacherTo(data.teacher_admin_cutoff_date || "");
    setStudentFrom(data.student_booking_open_from || "");
    setStudentTo(data.student_booking_cutoff_date || "");

    setLoading(false);
  }

  useEffect(() => {
    loadConfig();
  }, []);

  async function saveConfig() {
    if (
      !teacherFrom || !teacherTo ||
      !studentFrom || !studentTo
    ) {
      showToast("Bitte alle Datumsfelder setzen.");
      return;
    }

    if (teacherFrom >= teacherTo) {
      showToast("Lehrer-Enddatum muss nach dem Start liegen.");
      return;
    }

    if (studentFrom >= studentTo) {
      showToast("Schüler-Enddatum muss nach dem Start liegen.");
      return;
    }

    setBusy(true);

    const { error } = await supabase.rpc("set_app_config_dates", {
      _teacher_from: teacherFrom,
      _teacher_to: teacherTo,
      _student_from: studentFrom,
      _student_to: studentTo,
    });

    if (error) {
      console.error(error);
      showToast("Speichern fehlgeschlagen.");
      setBusy(false);
      return;
    }

    showToast("Konfiguration gespeichert.");
    setBusy(false);
    await loadConfig();
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
     <div>
  <h2 className="text-3xl font-semibold">Konfiguration</h2>
  <p className="text-sm mt-1" style={{ color: TOK.textDim }}>
    Zeitfenster für Lehrer und Schüler festlegen
  </p>
</div>


      <div className="card p-8 space-y-8">
        {loading ? (
          <div className="text-sm" style={{ color: TOK.textDim }}>
            Lade Konfiguration…
          </div>
        ) : (
          <>
            {/* LEHRER */}
<div className="space-y-4">
  <div className="text-base font-semibold">
    Lehrer-Bearbeitungsfenster
  </div>

  <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 1fr" }}>

                <DateField
  label="Start"
  value={teacherFrom}
  onChange={setTeacherFrom}
/>


                <DateField
  label="Ende"
  value={teacherTo}
  onChange={setTeacherTo}
/>
              </div>
            </div>

            <div className="h-px bg-white/5" />

            {/* SCHÜLER */}
<div className="space-y-4">
  <div className="text-base font-semibold">
    Schüler-Buchungsfenster
  </div>

  <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 1fr" }}>

<DateField
  label="Start"
  value={studentFrom}
  onChange={setStudentFrom}
/>

<DateField
  label="Ende"
  value={studentTo}
  onChange={setStudentTo}
/>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                className="btn btn-primary focus-aurora"
                onClick={saveConfig}
                disabled={busy}
              >
                Speichern
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}



function SettingsViewUI({ user, supabase }) {
  const { logoutLocal, logoutEverywhere } = useLogout(supabase);


  const email = user?.email ?? '—';

  let lastLogin = "—";

if (user?.last_sign_in_at) {
  const d = new Date(user.last_sign_in_at);
  lastLogin = d.toLocaleString("de-DE");
}


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
            className="btn btn-secondary focus-aurora"
          >
            Abmelden (dieses Gerät)
          </button>

          <button
            onClick={logoutEverywhere}
            className="btn btn-secondary focus-aurora"
          >
            Überall abmelden
          </button>
        </div>
      </section>
    </div>
  );
}

/* ===========================  DETAIL VIEW (Admin Dummy)  =========================== */
function DetailView({ w, onBack, onToggle, onExport }) {
  const [tab, setTab] = useState("Details");

  const registered = w.registered ?? 0;
  const capacity = w.capacity ?? 0;

  const ratio = registered / Math.max(1, capacity);
  const percent = pct(registered, capacity);
  const bar = capColor(ratio);
  const danger = ratio > 0.85;

  const isFull = capacity > 0 && registered >= capacity;
  const timeLabel = (w.time_slot ?? w.time ?? "—");
  function Row({ label, value }) {
  return (
    <div className="flex gap-4 py-2">
      <div className="w-40" style={{ color: TOK.textDim }}>
        {label}
      </div>
      <div>{value}</div>
    </div>
  );
}


  return (
    <div className="space-y-4">
      <button onClick={onBack} className="btn btn-secondary focus-aurora">
        ← Zurück
      </button>

      <section className="card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[22px] font-semibold">{w.title}</h2>
            <div className="mt-1" style={{ color: TOK.textDim }}>
              {w.date} • {timeLabel} • Raum {w.room}
            </div>
              {w.owner_name && (
    <div className="mt-1 text-sm" style={{ color: TOK.textDim }}>
      Leitung: {w.owner_name}
    </div>
  )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Typ wie Student */}
            {w.is_day_workshop ? (
              <span
                className="chip"
                style={{
                  background: TOK.warnBg,
                  color: TOK.warnText,
                  border: `1px solid ${TOK.warnBorder}`,
                }}
              >
                <Ic.info /> Tagesworkshop
              </span>
            ) : (
              <span
                className="chip"
                style={{
                  background: TOK.surfaceAlt,
                  color: TOK.textDim,
                  border: `1px solid ${TOK.border}`,
                }}
              >
                Einzel
              </span>
            )}

            {/* Plätze wie Student */}
            {isFull ? (
              <span
                className="chip"
                style={{
                  background: TOK.errBg,
                  color: TOK.errText,
                  border: `1px solid ${TOK.errBorder}`,
                }}
              >
                <Ic.lock /> Voll
              </span>
            ) : (
              <span
                className="chip"
                style={{
                  background: TOK.okBg,
                  color: TOK.okText,
                  border: `1px solid ${TOK.okBorder}`,
                }}
              >
                <Ic.check /> Plätze frei
              </span>
            )}

            {/* Admin-Status + Aktion */}
            <span
              className="chip"
              style={{
                background: w.status === "confirmed" ? TOK.okBg : TOK.errBg,
                color: w.status === "confirmed" ? TOK.okText : TOK.errText,
                border: `1px solid ${w.status === "confirmed" ? TOK.okBorder : TOK.errBorder}`,
              }}
            >
              {w.status === "confirmed" ? <><Ic.check /> Freigegeben</> : <><Ic.lock /> Gesperrt</>}
            </span>

            {onToggle ? (
              <button
                className="btn btn-secondary focus-aurora"
                onClick={onToggle}
                style={{ height: 44 }}
              >
                {w.status === "confirmed" ? "Sperren" : "Freigeben"}
              </button>
            ) : null}

            {onExport ? (
              <button className="btn btn-primary focus-aurora" onClick={onExport}>
                <Ic.download /> Teilnehmer exportieren
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-4">
          <div className="tnum text-sm">
            {registered}/{capacity} ({percent}%)
          </div>

          {/* Progress wie Student */}
          <div className="mt-2 h-2 bg-[#1b2736] rounded overflow-hidden">
            <div
              className="h-full"
              style={{ width: `${percent}%`, background: danger ? TOK.capHigh : bar }}
            />
          </div>
        </div>
      </section>

      {/* Tabs 1:1 wie Student */}
{/* Tabs 1:1 wie Student */}
<div className="flex items-center gap-2">
  {["Details", "Hinweise", "Teilnehmer"].map((name) => (

          <button
            key={name}
            onClick={() => setTab(name)}
            className={cx("btn focus-aurora", tab === name ? "btn-secondary" : "btn-tertiary")}
          >
            {name}
          </button>
        ))}
      </div>

      <section className="card p-4">
        {tab === "Details" && (
          <div className="space-y-2">
            <Row label="Titel" value={w.title} />
            <Row label="Datum" value={w.date} />
            <Row label="WS" value={timeLabel} />
            <Row label="Raum" value={w.room} />
            <Row
              label="Typ"
              value={w.is_day_workshop ? "Tagesworkshop (2 Slots)" : "Einzel (1 Slot)"}
            />
            <Row
              label="Klassenstufen"
              value={formatGradeRange(w.grade_from, w.grade_to)}
            />
            <Row label="Tags" value={(w.tags || []).join(", ") || "—"} />
            <Row label="Beschreibung" value={w.description || "—"} />
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

        {tab === "Teilnehmer" && (
  <ParticipantsTab workshopId={w.id} />
)}

      </section>
    </div>
  );
}

function ParticipantsTab({ workshopId }) {
  const supabase = createClientComponentClient();
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      setLoading(true);

      const { data, error } = await supabase.rpc(
        "list_workshop_participants",
        { _workshop_id: workshopId }
      );

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      setRows(data || []);
      setLoading(false);
    }

    load();
  }, [workshopId, supabase]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        Teilnehmer ({rows.length})
      </h3>

      {loading && <div>Lade Teilnehmer…</div>}

      {!loading && (
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left px-3 py-2">Name</th>
              <th className="text-left px-3 py-2">Klasse</th>
              <th className="text-left px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.user_id} className="border-t border-[#2A3442]">
                <td className="px-3 py-2">{r.full_name || "—"}</td>
                <td className="px-3 py-2">{r.class || "—"}</td>
                <td className="px-3 py-2">{r.status}</td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={3} className="px-3 py-4 text-[#7b8895]">
                  Keine Teilnehmer.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}


/* ===========================  ASSIGN MODAL  =========================== */

function AssignModal({ target, workshops, onAssign, onClose }) {
  const { student, slot } = target;

  const [search, setSearch]         = React.useState("");
  const [filter, setFilter]         = React.useState("all");
  const [sort, setSort]             = React.useState("name");
  const [confirming, setConfirming] = React.useState(null);
  const searchRef                   = React.useRef(null);

  React.useEffect(() => { setTimeout(() => searchRef.current?.focus(), 60); }, []);

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  /* ── Identische Logik wie vorher ── */
  const processed = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = workshops.map((w) => {
      const reg  = w.registered ?? 0;
      const cap  = w.capacity   ?? 0;
      const ratio = cap === 0 ? 1 : reg / cap;
      const free  = cap - reg;
      const availability = ratio >= 1 ? "full" : ratio >= 0.85 ? "warning" : "free";
      return { ...w, reg, cap, ratio, free, availability };
    });
    if (q) {
      result = result.filter((w) =>
        [w.title, w.room, w.owner_name, w.description, ...(w.tags || [])]
          .some((s) => String(s ?? "").toLowerCase().includes(q))
      );
    }
    if (filter === "free")    result = result.filter((w) => w.availability === "free");
    if (filter === "warning") result = result.filter((w) => w.availability === "warning");
    if (filter === "full")    result = result.filter((w) => w.availability === "full");
    if (sort === "name") result.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "asc")  result.sort((a, b) => a.ratio - b.ratio);
    if (sort === "desc") result.sort((a, b) => b.ratio - a.ratio);
    return result;
  }, [workshops, search, filter, sort]);

  const counts = React.useMemo(() => ({
    all:     workshops.length,
    free:    workshops.filter((w) => (w.registered ?? 0) / Math.max(1, w.capacity ?? 0) < 0.85).length,
    warning: workshops.filter((w) => { const r = (w.registered ?? 0) / Math.max(1, w.capacity ?? 0); return r >= 0.85 && r < 1; }).length,
    full:    workshops.filter((w) => (w.registered ?? 0) >= (w.capacity ?? 0) && (w.capacity ?? 0) > 0).length,
  }), [workshops]);

  const FILTERS = [
    { key: "all",     label: "Alle",      color: null,      bg: null },
    { key: "free",    label: "Frei",      color: "#22c55e", bg: "rgba(34,197,94,0.1)"  },
    { key: "warning", label: "Fast voll", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    { key: "full",    label: "Voll",      color: "#ef4444", bg: "rgba(239,68,68,0.1)"  },
  ];

const SORTS = [];

  return (
    <>
      {/* ─── Inline styles ─── */}
      <style>{`
        .am-backdrop { animation: am-fade-in 0.18s ease; }
        .am-shell    { animation: am-slide-up 0.22s cubic-bezier(0.22, 1, 0.36, 1); }
        @keyframes am-fade-in  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes am-slide-up { from { opacity: 0; transform: translateY(14px) scale(0.98); } to { opacity: 1; transform: none; } }

        .am-card {
          border-radius: 12px;
          padding: 18px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          display: flex; flex-direction: column;
          transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
          position: relative; overflow: hidden;
        }
        .am-card::before {
          content: ''; position: absolute;
          top: 0; left: 0; right: 0; height: 2px;
          opacity: 0; transition: opacity 0.15s;
        }
        .am-card:hover { border-color: rgba(255,255,255,0.12); box-shadow: 0 6px 24px rgba(0,0,0,0.35); transform: translateY(-1px); }
        .am-card:hover::before { opacity: 1; }
        .am-card--free::before    { background: linear-gradient(90deg, #22c55e, #4ade80); }
        .am-card--warning::before { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
        .am-card--full { opacity: 0.38; pointer-events: none; filter: grayscale(0.4); }
        .am-card--confirming { border-color: rgba(37,99,235,0.55) !important; box-shadow: 0 0 0 2px rgba(37,99,235,0.18), 0 6px 24px rgba(0,0,0,0.35) !important; }
        .am-card--confirming::before { background: linear-gradient(90deg, #2563EB, #22D3EE); opacity: 1; }

        .am-btn-assign {
          width: 100%; height: 38px; border-radius: 7px;
          font-size: 13px; font-weight: 600; letter-spacing: 0.04em;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px;
          transition: background 0.13s, border-color 0.13s, color 0.13s, transform 0.1s;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09);
          color: rgba(148,163,184,0.8);
        }
        .am-btn-assign:hover { background: rgba(37,99,235,0.16); border-color: rgba(37,99,235,0.45); color: #93c5fd; transform: translateY(-1px); }
        .am-btn-assign:active { transform: scale(0.98); }

        .am-btn-confirm {
          flex: 1; height: 38px; border-radius: 7px;
          font-size: 13px; font-weight: 700; letter-spacing: 0.03em;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px;
          background: linear-gradient(90deg, #2563EB, #22D3EE); border: none; color: #fff;
          box-shadow: 0 2px 10px rgba(37,99,235,0.35);
          transition: filter 0.12s, transform 0.1s;
          animation: am-fade-in 0.14s ease;
        }
        .am-btn-confirm:hover { filter: brightness(1.1); transform: translateY(-1px); }

        .am-btn-cancel {
          width: 32px; height: 38px; border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 16px; line-height: 1;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09);
          color: rgba(100,116,139,0.8);
          transition: background 0.12s, color 0.12s, border-color 0.12s;
          animation: am-fade-in 0.14s ease;
        }
        .am-btn-cancel:hover { background: rgba(239,68,68,0.1); color: #f87171; border-color: rgba(239,68,68,0.28); }

        .am-search:focus-within { border-color: rgba(37,99,235,0.5) !important; box-shadow: 0 0 0 2px rgba(37,99,235,0.12) !important; }

        .am-chip {
          height: 28px; padding: 0 9px; border-radius: 7px; font-size: 13px; font-weight: 500;
          display: flex; align-items: center; gap: 5px; cursor: pointer;
          border: 1px solid transparent;
          transition: all 0.12s;
        }
        .am-chip:hover { border-color: rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); }

        .am-tag {
          padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 500;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
          color: rgba(100,116,139,0.9); white-space: nowrap;
        }

        .am-track { width: 100%; height: 6px; border-radius: 99px; background: rgba(255,255,255,0.06); overflow: hidden; }
        .am-fill  { height: 100%; border-radius: 99px; transition: width 0.4s cubic-bezier(0.4,0,0.2,1); }

        .am-sep { width: 1px; height: 18px; background: rgba(255,255,255,0.06); flex-shrink: 0; }

        .am-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
gap: 16px;
          gap: 10px;
          align-items: start;
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="am-backdrop fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: "rgba(4, 7, 13, 0.85)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      >
        {/* Shell */}
        <div
          className="am-shell relative flex flex-col"
          style={{
            width: "min(96vw, 1400px)",
            maxHeight: "90vh",
            background: "linear-gradient(155deg, #1f2a3d 0%, #16202f 100%)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 18,
            boxShadow: "0 40px 100px rgba(0,0,0,0.75), inset 0 0 0 1px rgba(255,255,255,0.025)",
            overflow: "hidden",
          }}
          onClick={(e) => e.stopPropagation()}
        >

          {/* ══ HEADER ══ */}
          <div style={{
            padding: "16px 18px 13px",
            borderBottom: "1px solid rgba(255,255,255,0.055)",
            flexShrink: 0,
          }}>

            {/* Row 1: Title + close */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3 min-w-0">

                {/* Slot pill */}
                <div style={{
                  flexShrink: 0, height: 34, padding: "0 11px",
                  borderRadius: 9,
                  background: "linear-gradient(135deg, rgba(37,99,235,0.22), rgba(34,211,238,0.12))",
                  border: "1px solid rgba(37,99,235,0.3)",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="#60a5fa" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <path d="M16 2v4M8 2v4M3 10h18"/>
                  </svg>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#93c5fd", letterSpacing: "0.04em" }}>
                    WS {slot}
                  </span>
                </div>

                <div className="min-w-0">
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#dde6f0", lineHeight: 1.2 }}>
                    Workshop zuweisen
                  </div>
                  <div style={{ fontSize: 13, color: "#9fb3c8", marginTop: 2 }}>
                    für&nbsp;
                    <span style={{ color: "#7b92ad", fontWeight: 500 }}>
                      {student.full_name || student.email || "Schüler:in"}
                    </span>
                  </div>
                </div>
              </div>

              <button
                className="focus-aurora"
                onClick={onClose}
                title="Schließen (Esc)"
                style={{
                  flexShrink: 0, width: 30, height: 30, borderRadius: 7,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                  color: "#4b5e70", cursor: "pointer",
                  transition: "background 0.12s, color 0.12s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#f87171"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "#4b5e70"; }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Row 2: Controls */}
            <div className="flex flex-wrap items-center gap-2">

              {/* Search */}
              <div
                className="am-search flex items-center gap-2 flex-1"
                style={{
                  minWidth: 160, maxWidth: 300, height: 34, padding: "0 10px",
                  background: "rgba(255,255,255,0.035)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8,
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3b4f66" strokeWidth="2" style={{ flexShrink: 0 }}>
                  <circle cx="11" cy="11" r="7"/><path d="M21 21l-3.2-3.2"/>
                </svg>
                <input
                  ref={searchRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Workshop suchen…"
                  style={{ flex: 1, background: "transparent", outline: "none", border: "none", fontSize: 12, color: "#b0bec5" }}
                />
                {search && (
                  <button onClick={() => setSearch("")}
                    style={{ background: "none", border: "none", color: "#9fb3c8", cursor: "pointer", fontSize: 14, lineHeight: 1 }}>
                    ×
                  </button>
                )}
              </div>

              <div className="am-sep" />

              {/* Filter chips */}
              <div className="flex items-center gap-1">
                {FILTERS.map((f) => {
                  const active = filter === f.key;
                  return (
                    <button key={f.key} onClick={() => setFilter(f.key)}
                      className="am-chip focus-aurora"
                      style={{
                        background: active ? (f.bg ?? "rgba(255,255,255,0.07)") : "transparent",
                        borderColor: active ? (f.color ? `${f.color}3a` : "rgba(255,255,255,0.13)") : "transparent",
                        color: active ? (f.color ?? "#b0bec5") : "#9fb3c8",
                      }}
                    >
                      {f.color && (
                        <span style={{
                          width: 6, height: 6, borderRadius: "50%", background: f.color, flexShrink: 0,
                          boxShadow: active ? `0 0 6px ${f.color}99` : "none",
                        }} />
                      )}
                      {f.label}
                      <span style={{
                        padding: "0 4px", height: 14, borderRadius: 3,
                        fontSize: 9, fontWeight: 700,
                        display: "flex", alignItems: "center",
                        background: active ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)",
                        color: active ? (f.color ?? "#b0bec5") : "#7b92ad",
                      }}>
                        {counts[f.key]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Count */}
              <div style={{ marginLeft: "auto", fontSize: 13, color: "#7b92ad", whiteSpace: "nowrap" }}>
                {processed.length === workshops.length
                  ? `${workshops.length} Workshops`
                  : `${processed.length} von ${workshops.length}`}
              </div>
            </div>
          </div>

          {/* ══ GRID ══ */}
          <div style={{
            flex: 1, overflowY: "auto", padding: "14px 18px 18px",
            scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.07) transparent",
          }}>
            {processed.length === 0 ? (
              <div style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                padding: "56px 20px", gap: 10,
              }}>
                <div style={{ fontSize: 34, opacity: 0.18 }}>🔍</div>
                <div style={{ fontSize: 12, color: "#7b92ad", fontWeight: 500 }}>Keine Workshops gefunden</div>
                {(search || filter !== "all") && (
                  <button onClick={() => { setSearch(""); setFilter("all"); }}
                    style={{ fontSize: 13, color: "#3b6bbf", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", marginTop: 2 }}>
                    Filter zurücksetzen
                  </button>
                )}
              </div>
            ) : (
              <div className="am-grid">
                {processed.map((w) => (
                  <AssignWorkshopCard
                    key={w.id}
                    w={w}
                    confirming={confirming === w.id}
                    onConfirm={() => setConfirming(w.id)}
                    onAssign={() => { setConfirming(null); onAssign(w.id); }}
                    onCancelConfirm={() => setConfirming(null)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ══ FOOTER ══ */}
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.05)",
            padding: "11px 18px",
            flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
            background: "rgba(0,0,0,0.18)",
          }}>
            <div style={{ fontSize: 13, color: "#6b819a", display: "flex", alignItems: "center", gap: 5 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
              </svg>
              „Zuweisen" klicken → Zuweisung bestätigen
            </div>
            <button
              onClick={onClose}
              className="focus-aurora"
              style={{
                height: 32, padding: "0 12px", borderRadius: 7, fontSize: 13,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                color: "#7b92ad", cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
                transition: "background 0.12s",
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
              Abbrechen
            </button>
          </div>

        </div>
      </div>
    </>
  );
}


/* ─── AssignWorkshopCard ──────────────────────────────────────────────────── */
function AssignWorkshopCard({ w, confirming, onConfirm, onAssign, onCancelConfirm }) {
  const percent    = Math.round(w.ratio * 100);
  const isFull     = w.availability === "full";
  const isWarning  = w.availability === "warning";

  const barColor   = isFull ? "#ef4444" : isWarning ? "#f59e0b" : "#22c55e";
  const barGlow    = isFull ? "rgba(239,68,68,0.3)"  : isWarning ? "rgba(245,158,11,0.3)" : "rgba(34,197,94,0.3)";

  const badgeColor  = isFull ? "#ef4444" : isWarning ? "#f59e0b" : "#22c55e";
  const badgeBg     = isFull ? "rgba(239,68,68,0.09)"  : isWarning ? "rgba(245,158,11,0.09)" : "rgba(34,197,94,0.09)";
  const badgeBorder = isFull ? "rgba(239,68,68,0.22)"  : isWarning ? "rgba(245,158,11,0.22)" : "rgba(34,197,94,0.22)";
  const badgeLabel  = isFull ? "Voll" : isWarning ? "Fast voll" : w.free === 1 ? "1 frei" : `${w.free} frei`;

  const cardClass = `am-card am-card--${isFull ? "full" : isWarning ? "warning" : "free"} ${confirming ? "am-card--confirming" : ""}`;

  return (
    <div className={cardClass}>

      {/* ── 1. Header: Title + Meta ── */}
      <div style={{ marginBottom: 9 }}>
        <div style={{
          fontSize: 16, fontWeight: 700, color: "#E6EEF5", lineHeight: 1.35, marginBottom: 8,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {w.title}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1" style={{ fontSize: 12, color: "#7b92ad" }}>
          {w.time_slot && (
            <span className="flex items-center gap-1" style={{ color: "#4e79b0", fontWeight: 600 }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
              </svg>
              {w.time_slot}
            </span>
          )}
          {w.room && (
            <span className="flex items-center gap-1">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              {w.room}
            </span>
          )}
          {w.owner_name && (
            <span className="flex items-center gap-1">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4"/><path d="M4 20a8 8 0 0 1 16 0"/>
              </svg>
              {w.owner_name}
            </span>
          )}
        </div>
      </div>

      {/* ── 2. Description + Tags ── */}
      <div style={{ marginBottom: 10 }}>
{w.description && (
  <div
    style={{
      fontSize: 14,
      color: "#d6e2f0",
      lineHeight: 1.55,
      marginBottom: 10,
      display: "-webkit-box",
      WebkitLineClamp: 3,
      WebkitBoxOrient: "vertical",
      overflow: "hidden"
    }}
  >
    {w.description}
  </div>
)}
        {Array.isArray(w.tags) && w.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {w.tags.slice(0, 4).map((t) => <span key={t} className="am-tag">{t}</span>)}
            {w.tags.length > 4 && <span className="am-tag" style={{ color: "#6b819a" }}>+{w.tags.length - 4}</span>}
          </div>
        )}
        {!w.description && (!Array.isArray(w.tags) || w.tags.length === 0) && (
          <div style={{ fontSize: 12, color: "#6b819a", fontStyle: "italic" }}>Keine Beschreibung</div>
        )}
      </div>

      {/* ── 3. Capacity block ── */}
      <div style={{
        padding: "8px 9px", borderRadius: 7,
        background: "rgba(0,0,0,0.22)",
        border: "1px solid rgba(255,255,255,0.035)",
        marginBottom: 9,
      }}>
        <div className="am-track" style={{ marginBottom: 5 }}>
          <div className="am-fill" style={{
            width: `${percent}%`,
            background: `linear-gradient(90deg, ${barColor}cc, ${barColor})`,
            boxShadow: percent > 8 ? `0 0 6px ${barGlow}` : "none",
          }} />
        </div>
        <div className="flex items-center justify-between">
          <span style={{ fontSize: 13, fontWeight: 600, color: "#7b92ad", fontVariantNumeric: "tabular-nums" }}>
            {w.reg}
            <span style={{ fontWeight: 400, color: "#7b92ad" }}>/{w.cap}</span>
            <span style={{ fontSize: 9, color: "#6b819a", marginLeft: 3 }}>({percent}%)</span>
          </span>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 3,
            padding: "3px 10px", borderRadius: 99,
            fontSize: 12, fontWeight: 700,
            background: badgeBg, color: badgeColor, border: `1px solid ${badgeBorder}`,
          }}>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: badgeColor, flexShrink: 0 }} />
            {badgeLabel}
          </span>
        </div>
      </div>

      {/* ── 4. Action ── */}
      {!isFull && (
        confirming ? (
          <div className="flex gap-2" style={{ animation: "am-fade-in 0.14s ease" }}>
            <button className="am-btn-confirm focus-aurora" onClick={onAssign}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
              Bestätigen
            </button>
            <button className="am-btn-cancel focus-aurora" onClick={onCancelConfirm} title="Abbrechen">×</button>
          </div>
        ) : (
          <button className="am-btn-assign focus-aurora" onClick={onConfirm}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
            Zuweisen
          </button>
        )
      )}

      {isFull && (
        <div style={{
          height: 32, borderRadius: 7, fontSize: 12, fontWeight: 600,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
          background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.14)",
          color: "#5c2020",
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 1 1 8 0v3"/>
          </svg>
          Keine Plätze verfügbar
        </div>
      )}

    </div>
  );
}



/* ===============================  ROOT (Admin)  =============================== */
export default function Page() {
  const supabase = createClientComponentClient();
  const searchRef = useRef(null);

  // Dummy "Profil" für Admin – nur UI
const [user, setUser] = useState(null);
const [profile, setProfile] = useState(null);


  const [menuOpen, setMenuOpen] = useState(false);
  const [view, setView] = useState('overview'); // overview | workshops | users | settings | detail
  const [detailId, setDetailId] = useState(null);

  const [workshops, setWorkshops] = useState([]);
const [loadingWorkshops, setLoadingWorkshops] = useState(true);
const [workshopsError, setWorkshopsError] = useState(null);

  const [users, setUsers] = useState([]);
const [loadingUsers, setLoadingUsers] = useState(false);

const [assignTarget, setAssignTarget] = useState(null)
const [assignWorkshops, setAssignWorkshops] = useState([])




  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ status:'Alle' });
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);

  function showToast(msg){ setToast(msg); setTimeout(()=>setToast(null), 2600); }

  // Keyboard shortcuts wie im Lehrer-Dashboard (nur UI)
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      const isTyping = tag === 'input' || tag === 'textarea' || tag === 'select';
      if (isTyping) return;

      if (e.key === '/' && !e.metaKey && !e.ctrlKey) { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key?.toLowerCase() === 'f') { e.preventDefault(); setView('workshops'); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const filteredWorkshops = useMemo(() => {
    const q = query.trim().toLowerCase();
    return workshops.filter(w => {
      const byQ = !q || [
        w.title, w.date, w.time_slot, w.room, w.owner_name, ...(Array.isArray(w.tags) ? w.tags : [])
      ].some(s => String(s ?? '').toLowerCase().includes(q));

      const byStatus = filters.status === 'Alle'
        || (filters.status==='Freigegeben' && w.status==='confirmed')
        || (filters.status==='Gesperrt' && w.status==='locked');

      return byQ && byStatus;
    });
  }, [workshops, query, filters]);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(u =>
      [u.name, u.email, u.role, u.status].some(s => String(s ?? '').toLowerCase().includes(q))
    );
  }, [users, query]);

  const detail = useMemo(() => workshops.find(w => w.id === detailId) || null, [workshops, detailId]);

  function openDetail(id) {
    setDetailId(id);
    setView('detail');
  }

  useEffect(() => {
  let mounted = true;

  (async () => {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (!mounted) return;
    if (error) console.error(error);

    setUser(user || null);

    if (user) {
      const { data: prof, error: pErr } = await supabase
        .from("profiles")
        .select("id, full_name, role, created_at")
        .eq("id", user.id)
        .single();

      if (!mounted) return;
      if (pErr) console.error(pErr);

      setProfile(prof || null);
    }
  })();

  return () => {
    mounted = false;
  };
}, []);

function requestToggle(id) {
  const w = workshops.find(x => x.id === id);
  if (!w) return;

  setConfirm({
    id,
    title: w.title,
    action: w.status === "confirmed" ? "lock" : "unlock",
  });
}

async function handleAssign(student, slot) {

  setAssignTarget({ student, slot })

  const grade = extractGrade(student.class)

  if (grade === null) {
    alert("Klassenstufe konnte nicht erkannt werden")
    return
  }

  // 🔥 1. Workshops laden
  const { data, error } = await supabase.rpc(
    "get_workshops_for_slot",
    { 
      _slot: slot,
      _grade: grade
    }
  )

  if (error) {
    console.error("RPC ERROR:", error)
    alert(error.message)
    return
  }

  // 🔥 2. Helper: Slots extrahieren
  function extractSlots(str) {
    return (String(str ?? "").match(/\d+/g) || []).map(Number)
  }

  // 🔥 3. Bereits belegte Slots des Schülers
  const userSlots = (student.workshops || []).flatMap(sw =>
    extractSlots(sw.time_slot)
  )

  console.log("USER SLOTS:", userSlots)

  // 🔥 4. FINAL FILTER
  const filtered = (data || []).filter(w => {

    // ✅ Klassenfilter (Sicherheit, auch wenn RPC es schon macht)
    const from = Number(w.grade_from)
    const to   = Number(w.grade_to)

    if (from && grade < from) return false
    if (to && grade > to) return false

    // ✅ Multi-Booking erlaubt → IMMER anzeigen
    if (w.allow_multi_booking) return true

    // ❌ Slot-Konflikt prüfen
    const workshopSlots = extractSlots(w.time_slot)

    const hasConflict = workshopSlots.some(s =>
      userSlots.includes(s)
    )

    return !hasConflict
  })

  console.log("FILTERED WORKSHOPS:", filtered)

  setAssignWorkshops(filtered)
}

  async function adminToggleStatus(id) {
  console.log("TOGGLE id:", id, "typeof:", typeof id);

  const w = workshops.find(x => x.id === id);
  console.log("WORKSHOP:", w);

  if (!w) return;

  const newStatus = w.status === "confirmed" ? "locked" : "confirmed";

  const { error } = await supabase.rpc("admin_set_workshop_status", {
    _workshop_id: id,
    _new_status: newStatus,
  });

  if (error) {
    console.error("admin_set_workshop_status failed:", error);
    showToast(
      `${error.code ?? ""} | ${error.message ?? ""} | ${error.details ?? ""} | ${error.hint ?? ""}`.trim()
    );
    return;
  }

  await loadConfirmedWorkshops();
  showToast("Status aktualisiert.");
}


function onExport() {
  try {
    const source = ((filteredWorkshops?.length ? filteredWorkshops : workshops) || []).filter(w => w.status === "confirmed");

    if (!source.length) {
      showToast("Keine Workshops zum Exportieren vorhanden.");
      return;
    }

    function normalizeWsSlots(value) {
      const text = String(value || "");
      const matches = [...text.matchAll(/WS\s*([1-6])/gi)];
      const nums = matches.map((m) => Number(m[1])).filter(Boolean);
      return [...new Set(nums)].sort((a, b) => a - b);
    }

    function formatJgstCell(w) {
      const f = toInt(w?.grade_from);
      const t = toInt(w?.grade_to);

      if (!f && !t) return "Alle";
      if (f && t && f === t) return `Jgst ${f}`;
      if (f && t) return `Jgst ${f} – Jgst ${t}`;
      if (f) return `ab Jgst ${f}`;
      return `bis Jgst ${t}`;
    }

    function cleanText(value) {
      return String(value ?? "")
        .replace(/\r/g, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
    }

    function wsCellValue(w, wsNumber) {
      const slots = normalizeWsSlots(w?.time_slot ?? w?.time);
      if (!slots.includes(wsNumber)) return "";

      const room = cleanText(w?.room);
      const owner = cleanText(w?.owner_name);

      if (room && owner) return `${room} — ${owner}`;
      return room || owner || "x";
    }

    const header = [
      "Nr.",
      "Titel",
      "Jgst.",
      "Max. Teilnehmer",
      "Beschreibung",
      "WS 1",
      "WS 2",
      "WS 3",
      "WS 4",
      "WS 5",
      "WS 6",
      "Leitung",
    ];

    const aoa = [header];

    source.forEach((w, index) => {
      aoa.push([
        `W${String(index + 1).padStart(3, "0")}`,
        cleanText(w?.title),
        formatJgstCell(w),
        Number(w?.capacity ?? 0),
        cleanText(w?.description),
        wsCellValue(w, 1),
        wsCellValue(w, 2),
        wsCellValue(w, 3),
        wsCellValue(w, 4),
        wsCellValue(w, 5),
        wsCellValue(w, 6),
        cleanText(w?.owner_name),
      ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(aoa);

    worksheet["!cols"] = [
      { wch: 9 },   // Nr.
      { wch: 34 },  // Titel
      { wch: 14 },  // Jgst.
      { wch: 16 },  // Max. Teilnehmer
      { wch: 60 },  // Beschreibung
      { wch: 18 },  // WS1
      { wch: 18 },  // WS2
      { wch: 18 },  // WS3
      { wch: 18 },  // WS4
      { wch: 18 },  // WS5
      { wch: 18 },  // WS6
      { wch: 24 },  // Leitung
    ];

    worksheet["!rows"] = [
      { hpt: 24 }, // Header
      ...source.map((w) => {
        const description = cleanText(w?.description);
        const lineCount = Math.max(1, description.split("\n").length);
        const approxLines = Math.max(1, Math.ceil(description.length / 70));
        const visualLines = Math.max(lineCount, approxLines);
        return { hpt: Math.min(120, Math.max(24, visualLines * 14)) };
      }),
    ];

    worksheet["!autofilter"] = {
      ref: `A1:L${aoa.length}`,
    };

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Workshops");

    XLSX.writeFile(workbook, "workshops_export.xlsx");

    showToast("Excel-Datei exportiert.");
  } catch (error) {
    console.error("EXPORT ERROR:", error);
    showToast("Export fehlgeschlagen.");
  }
}

async function exportParticipants(workshopId) {

  const { data, error } = await supabase.rpc(
    "list_workshop_participants",
    { _workshop_id: workshopId }
  )

  if (error) {
    console.error(error)
    showToast("Teilnehmer konnten nicht geladen werden.")
    return
  }

  const rows = (data || []).map((p, i) => ({
    Nr: i + 1,
    Name: p.full_name || "",
    Klasse: p.class || "",
    Status: p.status || ""
  }))

  const worksheet = XLSX.utils.json_to_sheet(rows)

  worksheet["!cols"] = [
    { wch: 6 },
    { wch: 30 },
    { wch: 14 },
    { wch: 16 }
  ]

  const workbook = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Teilnehmer"
  )

  XLSX.writeFile(
    workbook,
    `workshop_${workshopId}_teilnehmer.xlsx`
  )

  showToast("Teilnehmerliste exportiert.")
}
  async function assignWorkshop(workshopId){

  const { data, error } = await supabase.rpc(
    "admin_assign_student_to_workshop",
    {
      _student_id: assignTarget.student.user_id,
      _workshop_id: workshopId
    }
  )

if(error){
  console.error("ASSIGN ERROR:", error)
  alert(error.message)
  return
}

  if(data.ok){

    showToast("Workshop zugewiesen")

    setAssignTarget(null)

    await loadUsers()

  }

}

  async function loadConfirmedWorkshops() {
  setLoadingWorkshops(true);
  setWorkshopsError(null);

const { data, error } = await supabase.rpc("list_submitted_workshops_for_admin");

if (error) {
  console.error("list_submitted_workshops_for_admin failed:", error);
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
      time_slot: timeValue,   // Admin-UI nutzt time_slot
      registered: w.registered ?? 0,
    };
  });

  setWorkshops(mapped);
  setLoadingWorkshops(false);
}

async function loadUsers() {
  setLoadingUsers(true);

  // Fetch the full user list (all roles) for the Lehrer / Admins tab
  const { data: allUsers, error: e1 } = await supabase.rpc("admin_list_users");
  if (e1) console.error("admin_list_users failed:", e1);

  // Fetch students with slot-completion data
  const { data: studentData, error: e2 } = await supabase.rpc(
    "admin_list_students_with_status"
  );
  if (e2) console.error("admin_list_students_with_status failed:", e2);

  // Merge slot data into the matching records so both tabs can live in one
  // `users` state array.  We key on `user_id` / `id` (adjust field names to
  // match whatever admin_list_users returns for the primary-key column).
  const slotMap = new Map(
    (studentData || []).map((s) => [s.user_id, s])
  );

  const merged = (allUsers || []).map((u) => {
    const slotInfo = slotMap.get(u.id ?? u.user_id);
    return slotInfo ? { ...u, ...slotInfo } : u;
  });

  setUsers(merged);
  setLoadingUsers(false);
}



useEffect(() => {
  loadConfirmedWorkshops();
  loadUsers();
}, []);



  return (
    <div className="h-screen" style={{ background:TOK.bg, color:TOK.text }}>
      {/* Hintergrund & Orbs – wie beim Lehrer */}
      <div className="fixed inset-0 bg-[var(--bg)] text-slate-100 pointer-events-none">
        <div className="hidden md:block pointer-events-none absolute bottom-0 right-0 h-[20rem] w-[20rem] translate-x-1/3 translate-y-1/3 rounded-full bg-gradient-to-tr from-[var(--primary-2)] via-teal-500 to-[var(--primary)] opacity-20 orb orb2" />
      </div>

      {/* Global Styles – identisch (plus progress fallback) */}
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
        button, .btn, [role="button"], input[type="button"], input[type="submit"] { cursor: pointer; }

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
        .btn-primary:hover { filter: brightness(1.08); transform: translateY(-1px); }

        .btn-secondary {
          background: color-mix(in oklab, var(--surface) 88%, transparent);
          color: var(--text);
          border: 1px solid var(--border);
          box-shadow: 0 2px 8px rgba(0, 0, 0, .25) inset, 0 8px 18px rgba(0, 0, 0, .25);
        }
        .btn-secondary:hover { background: color-mix(in oklab, var(--surface) 92%, transparent); }

        .btn-tertiary { color: ${TOK.info}; background: transparent; }
        .btn-tertiary:hover { text-decoration: underline; }

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
        .card:hover { transform: translateY(-1px); box-shadow: 0 10px 28px rgba(0,0,0,.42); }

        .divider { height: 1px; background: var(--border); opacity: .7; }
        .row-hover:hover { background: rgba(255,255,255,.035); }

        .tnum { font-variant-numeric: tabular-nums; font-feature-settings: "tnum" 1; }
        .kbd {
          padding: 0 6px;
          border: 1px solid var(--border);
          border-bottom-width: 2px;
          border-radius: 6px;
          color: var(--textDim);
          font-size: 12px;
        }
/* Native Date-Icon ausblenden */
input[type="date"]::-webkit-calendar-picker-indicator {
  opacity: 0;
  position: absolute;
  right: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

/* Firefox */
input[type="date"] {
  appearance: none;
}

        /* Progress fallback */
        .progress {
          height: 10px;
          background: #1b2736;
          border: 1px solid var(--border);
          border-radius: 999px;
          overflow: hidden;
        }
        .progress-bar { height: 100%; }

        /* Scrollbar hidden wie bei dir */
        html::-webkit-scrollbar, body::-webkit-scrollbar { width: 0px; height: 0px; }
        html, body { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>

      {/* App Shell */}
      <div className="relative z-10 flex h-full">
        {/* Sidebar */}
        <aside
          style={{ width: 64, background: TOK.surfaceAlt, borderRight:`1px solid ${TOK.border}` }}
          className="hidden md:flex flex-col items-stretch md:relative"
        >
          {[
  { key:'overview', icon:Ic.home,  label:'Übersicht' },
  { key:'workshops', icon:Ic.hat, label:'Workshops' },
  { key:'users', icon:Ic.users,   label:'Benutzer' },
  { key:'config', icon:Ic.calendarFold, label:'Konfigurieren' },
  { key:'settings', icon:Ic.cog,  label:'Einstellungen' },
].map((it) => {
            const active = view === it.key || (view === 'detail' && it.key === 'workshops');
            return (
              <button
                key={it.key}
                title={it.label}
                onClick={() => setView(it.key)}
                className={cx('relative h-16 flex items-center justify-center hover:bg-[#1C2432] focus-aurora')}
                aria-label={it.label}
              >
                {active && <span className="absolute left-0" style={{ width:3, height:28, background:'#22D3EE', borderRadius:2 }} />}
                <it.icon style={{ color: active ? TOK.text : TOK.textDim }} />
              </button>
            );
          })}
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="flex items-center justify-between md:justify-start gap-4 px-6 relative"
                  style={{ height:64, borderBottom:`1px solid ${TOK.border}`, background:'transparent' }}>
            <div className="flex items-center gap-3">
              <button className="md:hidden flex items-center justify-center" onClick={() => setMenuOpen(true)}>
                <svg width="26" height="26" stroke="currentColor">
                  <path d="M3 6h18M3 12h18M3 18h18" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <h1 className="text-[22px] font-semibold hidden md:block">
              {view==='overview' ? 'Übersicht'
                : view==='workshops' ? 'Workshops'
                : view==='users' ? 'Benutzer'
                : view==='settings' ? 'Einstellungen'
                : (detail?.title || 'Workshop')}
            </h1>

            {/* Suche */}
            <div className="flex-1 flex justify-center md:justify-start w-full">
              <div className="flex items-center gap-2 px-3 card" style={{ width: '100%', maxWidth: 560, height: 44, borderRadius:12 }}>
                <Ic.search style={{ color:TOK.textDim }} />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={e=>setQuery(e.target.value)}
                  placeholder="Suchen…"
                  aria-label="Suchen"
                  className="flex-1 bg-transparent outline-none text-[14px] placeholder-[#7a8796]"
                />
                <span className="kbd">/</span>
              </div>
            </div>

            {/* Profil */}
            <div className="flex items-center gap-3">
              <div className="text-sm" style={{ color:TOK.textDim }}>{user?.email || '—'}</div>
              <div className="flex items-center justify-center"
                   style={{ width:36, height:36, borderRadius:18, background:TOK.gradFrom, color:'#fff', fontWeight:600 }}>
                {(profile?.full_name || user?.email || 'A')[0].toUpperCase()}
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-6">
            {loadingWorkshops && (
  <div className="card p-4">Lade Workshops…</div>
)}

{!loadingWorkshops && workshopsError && (
  <div className="card p-4" style={{ color: TOK.errText }}>
    {workshopsError}
  </div>
)}

            {view==='overview' && (
              <AdminOverview
                workshops={filteredWorkshops}
                onNew={() => showToast('Neu (Dummy).')}
                onOpen={(id) => openDetail(id)}
                onToggle={(id) => requestToggle(id)}
              />
            )}

            {view==='workshops' && (
              <WorkshopsListView
                workshops={filteredWorkshops}
                filters={filters}
                setFilters={setFilters}
                onExport={onExport}
                onOpen={(id) => openDetail(id)}
                onToggle={(id) => requestToggle(id)}
              />
            )}

            {view==='detail' && detail && (
              <DetailView
                w={detail}
                onBack={() => setView('workshops')}
                onToggle={() => requestToggle(detail.id)}
                onExport={() => exportParticipants(detail.id)}
              />
            )}

            {view === 'config' && (
  <ConfigView supabase={supabase} showToast={showToast} />
)}



{view === 'users' && (
  loadingUsers
    ? <div className="card p-4">Lade Benutzer…</div>
    : <UsersView
        users={filteredUsers}
        onAssignSlot={handleAssign}
      />
)}

           {view === 'settings' && (
  <SettingsViewUI user={user} supabase={supabase} />
)}


          </main>
        </div>
      </div>

      {/* Toast */}
      <div aria-live="polite" className="fixed top-4 right-4 z-50">
        {toast && <div className="card px-4 py-3">{toast}</div>}
      </div>

      {/* Confirm Dialog */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45">
          <div className="card p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">
              {confirm.action === "lock" ? "Workshop sperren" : "Workshop freigeben"}
            </h3>

            <p className="mb-6" style={{ color: TOK.textDim }}>
              Admin-Aktion: Du {confirm.action === "lock" ? "sperrst" : "gibst frei"} „{confirm.title}“. Fortfahren?
            </p>

            <div className="flex justify-end gap-3">
              <button className="btn btn-secondary focus-aurora" onClick={() => setConfirm(null)}>
                Abbrechen
              </button>

<button
  className="btn btn-primary focus-aurora"
  onClick={() => {
    const id = confirm.id;
    setConfirm(null);
    adminToggleStatus(id);
  }}
>
  Bestätigen
</button>


            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/40" onClick={() => setMenuOpen(false)}>
          <div
            className="absolute left-0 top-0 h-full w-64 bg-[var(--surfaceAlt)] border-r border-[var(--border)] p-4 flex flex-col gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {[
  { key:'overview', icon:Ic.home, label:'Übersicht' },
  { key:'workshops', icon:Ic.hat, label:'Workshops' },
  { key:'users', icon:Ic.users, label:'Benutzer' },
  { key:'config', icon:Ic.calendarFold, label:'Konfigurieren' },
  { key:'settings', icon:Ic.cog, label:'Einstellungen' },
]
.map((it) => (
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

{assignTarget && (
  <AssignModal
    target={assignTarget}
    workshops={assignWorkshops}
    onAssign={assignWorkshop}
    onClose={() => setAssignTarget(null)}
  />
)}
    </div>
  );
}
