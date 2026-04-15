// ── PERSON B OWNS THIS FILE ───────────────────────────────────────────────
// Filter bar + student card grid + profile modal
// Input: me (my profile), students (Claude-ranked array)

import { useState, useMemo } from "react";
import StudentCard from "./StudentCard";
import ProfileModal from "./ProfileModal";

const LOOKING_FOR_OPTIONS = [
  "study buddy",
  "project collab",
  "join a club",
  "just meet people",
];
const YEARS = ["Freshman", "Sophomore", "Junior", "Senior", "Grad"];

function LuckyView({ students, index, onPass, onConnect }) {
  if (students.length === 0) {
    return (
      <div style={s.empty}>
        <p>No matches with those filters.</p>
      </div>
    );
  }
  if (index >= students.length) {
    return (
      <div style={s.luckyDone}>
        <p style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
          You've seen everyone!
        </p>
        <p style={{ color: "#888", fontSize: 14 }}>
          Try adjusting filters or browse the full list.
        </p>
      </div>
    );
  }

  const student = students[index];
  const {
    name,
    year,
    major,
    avatar,
    bio,
    classes,
    interests,
    lookingFor,
    matchScore,
    matchReason,
  } = student;

  return (
    <div style={s.luckyWrap}>
      <p style={s.luckyCounter}>
        {index + 1} of {students.length}
      </p>
      <div style={s.luckyCard}>
        <div style={s.luckyTop}>
          <div style={s.luckyAvatar}>
            {avatar.startsWith("http") ? (
              <img
                src={avatar}
                alt={name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              avatar
            )}
          </div>
          <div style={{ flex: 1 }}>
            <p style={s.luckyName}>{name}</p>
            <p style={s.luckyMeta}>
              {year} · {major}
            </p>
          </div>
          {matchScore > 0 && <div style={s.luckyScore}>{matchScore}</div>}
        </div>

        {matchReason && (
          <div style={s.luckyReason}>
            <span style={{ color: "var(--uwRed)" }}>✦</span> {matchReason}
          </div>
        )}

        {bio && <p style={s.luckyBio}>{bio}</p>}

        <div style={s.luckySection}>
          <p style={s.luckySectionLabel}>Classes</p>
          <div style={s.luckyChips}>
            {classes.map((c) => (
              <span key={c} style={s.luckyChip}>
                {c}
              </span>
            ))}
          </div>
        </div>

        <div style={s.luckySection}>
          <p style={s.luckySectionLabel}>Interests</p>
          <div style={s.luckyChips}>
            {interests.map((i) => (
              <span key={i} style={s.luckyChip}>
                #{i}
              </span>
            ))}
          </div>
        </div>

        <div style={s.luckySection}>
          <p style={s.luckySectionLabel}>Looking for</p>
          <div style={s.luckyChips}>
            {lookingFor.map((l) => (
              <span key={l} style={{ ...s.luckyChip, ...s.luckyChipAccent }}>
                {l}
              </span>
            ))}
          </div>
        </div>

        <div style={s.luckyActions}>
          <button style={s.passBtn} onClick={onPass}>
            Pass
          </button>
          <button style={s.connectBtn} onClick={() => onConnect(student)}>
            Connect →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FeedStep({ me, students, onOpenMessages, onNavigate }) {
  const [filters, setFilters] = useState({
    year: "",
    lookingFor: "",
    class: "",
    interest: "",
  });
  const [selected, setSelected] = useState(null);
  const [luckyMode, setLuckyMode] = useState(false);
  const [luckyIndex, setLuckyIndex] = useState(0);

  // Derive unique classes and interests from all students
  const allClasses = useMemo(() => {
    const set = new Set();
    students.forEach((s) => s.classes.forEach((c) => set.add(c)));
    return [...set].sort();
  }, [students]);

  const allInterests = useMemo(() => {
    const set = new Set();
    students.forEach((s) => s.interests.forEach((i) => set.add(i)));
    return [...set].sort();
  }, [students]);

  const filtered = students.filter((s) => {
    if (filters.year && s.year !== filters.year) return false;
    if (filters.lookingFor && !s.lookingFor.includes(filters.lookingFor))
      return false;
    if (filters.class && !s.classes.includes(filters.class)) return false;
    if (filters.interest && !s.interests.includes(filters.interest))
      return false;
    return true;
  });

  const setFilter = (key, val) =>
    setFilters((f) => ({ ...f, [key]: f[key] === val ? "" : val }));

  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerInner}>
          <div style={s.logoRow}>
            <span style={s.appName}>Campus Connect</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              style={{ ...s.luckyBtn, ...(luckyMode ? s.luckyBtnActive : {}) }}
              onClick={() => {
                if (onNavigate) {
                  onNavigate("feeling-lucky");
                } else {
                  setLuckyMode((m) => !m);
                  setLuckyIndex(0);
                }
              }}
            >
              {luckyMode ? "← Browse all" : "Feeling lucky?"}
            </button>
            <button style={s.messagesBtn} onClick={() => onOpenMessages()}>
              Messages
            </button>
            <button
              style={s.settingsBtn}
              onClick={() => onNavigate("settings")}
            >
              Settings
            </button>
            <div style={s.meChip}>
              <div style={s.avatar}>{me.avatar}</div>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{me.name}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={s.body}>
        {/* Filter bar */}
        <div style={s.filterCard}>
          <div style={s.filterRow}>
            <span style={s.filterLabel}>Year</span>
            <div style={s.chipGroup}>
              {YEARS.map((y) => (
                <button
                  key={y}
                  style={{
                    ...s.chip,
                    ...(filters.year === y ? s.chipActive : {}),
                  }}
                  onClick={() => setFilter("year", y)}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          <div style={s.divider} />

          <div style={s.filterRow}>
            <span style={s.filterLabel}>Looking for</span>
            <div style={s.chipGroup}>
              {LOOKING_FOR_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  style={{
                    ...s.chip,
                    ...(filters.lookingFor === opt ? s.chipActive : {}),
                  }}
                  onClick={() => setFilter("lookingFor", opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div style={s.divider} />

          <div style={s.filterRow}>
            <span style={s.filterLabel}>Class</span>
            <select
              style={{ ...s.select, ...(filters.class ? s.selectActive : {}) }}
              value={filters.class}
              onChange={(e) =>
                setFilters((f) => ({ ...f, class: e.target.value }))
              }
            >
              <option value="">Any class</option>
              {allClasses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <span style={s.filterLabel}>Interest</span>
            <select
              style={{
                ...s.select,
                ...(filters.interest ? s.selectActive : {}),
              }}
              value={filters.interest}
              onChange={(e) =>
                setFilters((f) => ({ ...f, interest: e.target.value }))
              }
            >
              <option value="">Any interest</option>
              {allInterests.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>

            {activeCount > 0 && (
              <button
                style={s.clearBtn}
                onClick={() =>
                  setFilters({
                    year: "",
                    lookingFor: "",
                    class: "",
                    interest: "",
                  })
                }
              >
                Clear {activeCount > 1 ? `(${activeCount})` : ""}
              </button>
            )}
          </div>
        </div>

        {luckyMode ? (
          <LuckyView
            students={filtered}
            index={luckyIndex}
            onPass={() => setLuckyIndex((i) => i + 1)}
            onConnect={(s) => setSelected(s)}
          />
        ) : (
          <>
            <p style={s.count}>
              {filtered.length} {filtered.length === 1 ? "person" : "people"} on
              campus
            </p>
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
                <p style={{ marginBottom: 12 }}>
                  No matches with those filters.
                </p>
                <button
                  style={s.clearBtn}
                  onClick={() =>
                    setFilters({
                      year: "",
                      lookingFor: "",
                      class: "",
                      interest: "",
                    })
                  }
                >
                  Clear filters
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {selected && (
        <ProfileModal
          student={selected}
          me={me}
          onClose={() => setSelected(null)}
          onMessage={(id, draftText) => {
            setSelected(null);
            onOpenMessages(id, draftText);
          }}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    background: "transparent",
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    background: "rgba(255, 255, 255, 0.7)",
    borderBottom: "1px solid rgba(39, 39, 39, 0.08)",
    backdropFilter: "blur(18px)",
    boxShadow: "0 8px 30px rgba(29, 24, 21, 0.04)",
  },
  headerInner: {
    maxWidth: 1160,
    margin: "0 auto",
    padding: "16px 28px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  logoRow: { display: "flex", alignItems: "center", gap: 10 },
  logo: {
    width: 34,
    height: 34,
    background: "linear-gradient(145deg, var(--uwRed) 0%, #8f0108 100%)",
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--uwWhite)",
    fontSize: 16,
    fontWeight: 800,
    boxShadow: "0 10px 20px rgba(197, 5, 12, 0.16)",
  },
  appName: {
    fontWeight: 800,
    fontSize: 18,
    letterSpacing: -0.02,
    color: "var(--uwBlack)",
  },
  meChip: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(255, 255, 255, 0.78)",
    border: "1px solid rgba(39, 39, 39, 0.08)",
    borderRadius: 999,
    padding: "6px 14px 6px 8px",
    boxShadow: "0 8px 20px rgba(29, 24, 21, 0.04)",
  },
  avatar: {
    width: 30,
    height: 30,
    background: "linear-gradient(145deg, var(--uwRed) 0%, #8f0108 100%)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--uwWhite)",
    fontSize: 11,
    fontWeight: 700,
    overflow: "hidden",
  },
  body: {
    maxWidth: 1160,
    margin: "0 auto",
    padding: "30px 28px 44px",
  },
  filterCard: {
    background: "rgba(255, 255, 255, 0.82)",
    borderRadius: 24,
    border: "1px solid rgba(39, 39, 39, 0.08)",
    padding: "20px 22px",
    marginBottom: 22,
    boxShadow: "0 14px 36px rgba(29, 24, 21, 0.06)",
    backdropFilter: "blur(16px)",
  },
  filterRow: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 10,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "rgba(40, 39, 40, 0.54)",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    minWidth: 72,
  },
  chipGroup: { display: "flex", gap: 8, flexWrap: "wrap" },
  chip: {
    padding: "7px 13px",
    borderRadius: 999,
    border: "1px solid rgba(39, 39, 39, 0.08)",
    background: "rgba(255, 255, 255, 0.88)",
    fontSize: 13,
    cursor: "pointer",
    color: "var(--uwGrayDark)",
  },
  chipActive: {
    background: "var(--uwRed)",
    borderColor: "var(--uwRed)",
    color: "var(--uwWhite)",
    boxShadow: "0 10px 18px rgba(197, 5, 12, 0.16)",
  },
  divider: { borderTop: "1px solid rgba(39, 39, 39, 0.08)", margin: "14px 0" },
  select: {
    padding: "9px 12px",
    border: "1px solid rgba(39, 39, 39, 0.1)",
    borderRadius: 12,
    fontSize: 13,
    background: "rgba(255, 255, 255, 0.88)",
    color: "var(--uwGrayDark)",
    cursor: "pointer",
    outline: "none",
  },
  selectActive: {
    borderColor: "var(--uwRed)",
    color: "var(--uwRed)",
    background: "rgba(255, 255, 255, 0.96)",
  },
  clearBtn: {
    marginLeft: "auto",
    padding: "7px 14px",
    border: "1px solid rgba(39, 39, 39, 0.1)",
    borderRadius: 999,
    background: "rgba(255, 255, 255, 0.9)",
    cursor: "pointer",
    fontSize: 13,
    color: "rgba(40, 39, 40, 0.72)",
  },
  count: {
    fontSize: 13,
    color: "rgba(40, 39, 40, 0.62)",
    marginBottom: 14,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 18,
  },
  empty: {
    textAlign: "center",
    padding: "56px 0",
    color: "rgba(40, 39, 40, 0.62)",
  },
  luckyBtn: {
    padding: "8px 16px",
    borderRadius: 999,
    border: "1px solid rgba(39, 39, 39, 0.1)",
    background: "rgba(255, 255, 255, 0.88)",
    color: "var(--uwGrayDark)",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  luckyBtnActive: {
    background: "var(--uwRed)",
    color: "var(--uwWhite)",
    borderColor: "var(--uwRed)",
  },
  messagesBtn: {
    padding: "8px 16px",
    borderRadius: 999,
    border: "1px solid rgba(39, 39, 39, 0.1)",
    background: "rgba(255, 255, 255, 0.88)",
    color: "var(--uwGrayDark)",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  settingsBtn: {
    padding: "8px 16px",
    borderRadius: 999,
    border: "1px solid rgba(39, 39, 39, 0.1)",
    background: "rgba(255, 255, 255, 0.88)",
    color: "var(--uwGrayDark)",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  luckyWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: 12,
  },
  luckyCounter: {
    fontSize: 13,
    color: "rgba(40, 39, 40, 0.56)",
    marginBottom: 16,
  },
  luckyCard: {
    background: "rgba(255, 255, 255, 0.88)",
    borderRadius: 26,
    border: "1px solid rgba(39, 39, 39, 0.08)",
    padding: 30,
    width: "100%",
    maxWidth: 500,
    boxShadow: "0 18px 54px rgba(29, 24, 21, 0.08)",
    backdropFilter: "blur(14px)",
  },
  luckyTop: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
  },
  luckyAvatar: {
    width: 58,
    height: 58,
    borderRadius: "50%",
    background: "linear-gradient(145deg, var(--uwRed) 0%, #8f0108 100%)",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--uwWhite)",
    fontSize: 18,
    fontWeight: 800,
    overflow: "hidden",
  },
  luckyName: { margin: 0, fontSize: 20, fontWeight: 800 },
  luckyMeta: {
    margin: "3px 0 0",
    fontSize: 13,
    color: "rgba(40, 39, 40, 0.58)",
  },
  luckyScore: {
    width: 42,
    height: 42,
    borderRadius: "50%",
    background: "rgba(197, 5, 12, 0.1)",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 800,
    color: "var(--uwRedDark)",
  },
  luckyReason: {
    background: "rgba(197, 5, 12, 0.08)",
    borderRadius: 14,
    padding: "10px 14px",
    fontSize: 13,
    color: "var(--uwGrayDark)",
    marginBottom: 16,
    display: "flex",
    gap: 6,
    lineHeight: 1.45,
  },
  luckyBio: {
    fontSize: 14,
    color: "rgba(40, 39, 40, 0.72)",
    lineHeight: 1.6,
    marginBottom: 18,
  },
  luckySection: { marginBottom: 16 },
  luckySectionLabel: {
    margin: "0 0 8px",
    fontSize: 11,
    color: "rgba(40, 39, 40, 0.48)",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  luckyChips: { display: "flex", flexWrap: "wrap", gap: 6 },
  luckyChip: {
    padding: "5px 11px",
    borderRadius: 999,
    background: "rgba(243, 243, 243, 0.9)",
    fontSize: 13,
    color: "rgba(40, 39, 40, 0.72)",
  },
  luckyChipAccent: {
    background: "rgba(197, 5, 12, 0.08)",
    color: "var(--uwRedDark)",
  },
  luckyActions: { display: "flex", gap: 12, marginTop: 24 },
  passBtn: {
    flex: 1,
    padding: "12px",
    border: "1px solid rgba(39, 39, 39, 0.1)",
    borderRadius: 14,
    background: "rgba(255, 255, 255, 0.88)",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    color: "rgba(40, 39, 40, 0.72)",
  },
  connectBtn: {
    flex: 2,
    padding: "12px",
    background: "linear-gradient(135deg, var(--uwRed) 0%, #9b0000 100%)",
    color: "var(--uwWhite)",
    border: "none",
    borderRadius: 14,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 14px 28px rgba(197, 5, 12, 0.18)",
  },
  luckyDone: {
    textAlign: "center",
    padding: "80px 0",
    color: "var(--uwBlack)",
  },
};
