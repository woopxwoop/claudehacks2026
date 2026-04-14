// ── PERSON B OWNS THIS FILE ───────────────────────────────────────────────


export default function StudentCard({ student, onClick }) {
  const { name, year, major, interests, lookingFor, matchScore, matchReason, avatar } = student;

  return (
    <div style={s.card} onClick={onClick}>
      <div style={s.top}>
        <div style={s.avatar}>{avatar}</div>
        <div style={s.info}>
          <p style={s.name}>{name}</p>
          <p style={s.meta}>{year} · {major}</p>
        </div>
        {matchScore > 0 && (
          <div style={s.score}>{matchScore}</div>
        )}
      </div>

      {matchReason && (
        <div style={s.reason}>
          <span style={s.reasonDot}>✦</span>
          {matchReason}
        </div>
      )}

      <div style={s.tags}>
        {lookingFor.slice(0, 2).map((l) => (
          <span key={l} style={s.tag}>{l}</span>
        ))}
      </div>

      <div style={s.interests}>
        {interests.slice(0, 4).map((i) => (
          <span key={i} style={s.interest}>#{i}</span>
        ))}
      </div>
    </div>
  );
}

const s = {
  card: {
    background: "var(--uwWhite)", borderRadius: 14, border: "0.5px solid var(--uwGrayLight)",
    padding: 20, cursor: "pointer", transition: "box-shadow .15s",
  },
  top: { display: "flex", alignItems: "center", gap: 12, marginBottom: 12 },
  avatar: {
    width: 44, height: 44, borderRadius: "50%", background: "var(--uwRed)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "var(--uwWhite)", fontSize: 14, fontWeight: 600, flexShrink: 0,
  },
  info: { flex: 1 },
  name: { margin: 0, fontSize: 15, fontWeight: 600 },
  meta: { margin: "2px 0 0", fontSize: 12, color: "#888" },
  score: {
    width: 36, height: 36, borderRadius: "50%", background: "var(--uwRedLight)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 13, fontWeight: 700, color: "var(--uwRedDark)", flexShrink: 0,
  },
  reason: { fontSize: 13, color: "#555", marginBottom: 12, display: "flex", gap: 6, alignItems: "flex-start", lineHeight: 1.4 },
  reasonDot: { color: "var(--uwRed)", flexShrink: 0, fontSize: 10, marginTop: 2 },
  tags: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 },
  tag: { padding: "3px 10px", borderRadius: 20, background: "var(--uwRedLight)", color: "var(--uwRedDark)", fontSize: 11, fontWeight: 500 },
  interests: { display: "flex", gap: 8, flexWrap: "wrap" },
  interest: { fontSize: 12, color: "#999" },
};
