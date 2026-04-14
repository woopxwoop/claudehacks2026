// ── PERSON B OWNS THIS FILE ───────────────────────────────────────────────
// Filter bar + student card grid + profile modal
// Input: me (my profile), students (Claude-ranked array)

import { useState } from "react";
import StudentCard from "./StudentCard";
import ProfileModal from "./ProfileModal";

const LOOKING_FOR_OPTIONS = ["study buddy", "project collab", "join a club", "just meet people"];
const YEARS = ["Freshman", "Sophomore", "Junior", "Senior", "Grad"];

export default function FeedStep({ me, students }) {
  const [filters, setFilters] = useState({ year: "", major: "", lookingFor: "" });
  const [selected, setSelected] = useState(null);

  const filtered = students.filter((s) => {
    if (filters.year && s.year !== filters.year) return false;
    if (filters.major && !s.major.toLowerCase().includes(filters.major.toLowerCase())) return false;
    if (filters.lookingFor && !s.lookingFor.includes(filters.lookingFor)) return false;
    return true;
  });

  const setFilter = (key, val) =>
    setFilters((f) => ({ ...f, [key]: f[key] === val ? "" : val }));

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerInner}>
          <div style={s.logoRow}>
            <div style={s.logo}>C</div>
            <span style={s.appName}>Campus</span>
          </div>
          <div style={s.meChip}>
            <div style={s.avatar}>{me.avatar}</div>
            <span style={{ fontSize: 14 }}>{me.name}</span>
          </div>
        </div>
      </div>

      <div style={s.body}>
        {/* Filters */}
        <div style={s.filterBar}>
          <span style={s.filterLabel}>Filter:</span>

          <div style={s.filterGroup}>
            {YEARS.map((y) => (
              <button key={y}
                style={{ ...s.filterChip, ...(filters.year === y ? s.filterChipActive : {}) }}
                onClick={() => setFilter("year", y)}>{y}</button>
            ))}
          </div>

          <div style={s.filterGroup}>
            {LOOKING_FOR_OPTIONS.map((opt) => (
              <button key={opt}
                style={{ ...s.filterChip, ...(filters.lookingFor === opt ? s.filterChipActive : {}) }}
                onClick={() => setFilter("lookingFor", opt)}>{opt}</button>
            ))}
          </div>

          <input style={s.majorInput} placeholder="Search major…"
            value={filters.major}
            onChange={(e) => setFilters((f) => ({ ...f, major: e.target.value }))} />
        </div>

        {/* Results count */}
        <p style={s.count}>
          {filtered.length} {filtered.length === 1 ? "person" : "people"} on campus
        </p>

        {/* Card grid */}
        <div style={s.grid}>
          {filtered.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              onClick={() => setSelected(student)}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={s.empty}>
            <p>No matches with those filters.</p>
            <button style={s.clearBtn} onClick={() => setFilters({ year: "", major: "", lookingFor: "" })}>
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Profile modal */}
      {selected && (
        <ProfileModal
          student={selected}
          me={me}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}


const s = {
  page: { minHeight: "100vh", background: "var(--uwGrayLightest)" },
  header: { background: "var(--uwWhite)", borderBottom: "0.5px solid var(--uwGrayLight)", position: "sticky", top: 0, zIndex: 10 },
  headerInner: { maxWidth: 960, margin: "0 auto", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  logoRow: { display: "flex", alignItems: "center", gap: 10 },
  logo: { width: 32, height: 32, background: "var(--uwRed)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--uwWhite)", fontSize: 16, fontWeight: 700 },
  appName: { fontWeight: 700, fontSize: 18, color: "var(--uwBlack)" },
  meChip: { display: "flex", alignItems: "center", gap: 8, background: "var(--uwGrayLight)", borderRadius: 20, padding: "6px 14px" },
  avatar: { width: 28, height: 28, background: "var(--uwRed)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--uwWhite)", fontSize: 11, fontWeight: 600 },
  body: { maxWidth: 960, margin: "0 auto", padding: "24px 24px" },
  filterBar: { display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 20, background: "var(--uwWhite)", borderRadius: 12, border: "0.5px solid var(--uwGrayLight)", padding: "14px 16px" },
  filterLabel: { fontSize: 13, color: "#888", marginRight: 4 },
  filterGroup: { display: "flex", gap: 6, flexWrap: "wrap" },
  filterChip: { padding: "5px 12px", borderRadius: 20, border: "0.5px solid var(--uwGrayLight)", background: "var(--uwWhite)", fontSize: 13, cursor: "pointer", color: "var(--uwGrayDark)" },
  filterChipActive: { background: "var(--uwRed)", borderColor: "var(--uwRedDark)", color: "var(--uwWhite)" },
  majorInput: { padding: "6px 12px", border: "0.5px solid var(--uwGrayLight)", borderRadius: 20, fontSize: 13, outline: "none", background: "var(--uwGrayLightest)" },
  count: { fontSize: 13, color: "#888", marginBottom: 16 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 },
  empty: { textAlign: "center", padding: "60px 0", color: "#888" },
  clearBtn: { marginTop: 8, padding: "8px 20px", border: "0.5px solid var(--uwGrayLight)", borderRadius: 8, background: "var(--uwWhite)", cursor: "pointer", fontSize: 14 },
};
