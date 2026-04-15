// ── PERSON B OWNS THIS FILE ───────────────────────────────────────────────

export default function StudentCard({ student, onClick }) {
  const { name, year, major, interests, lookingFor, matchReason, avatar } =
    student;

  return (
    <div style={s.card} onClick={onClick}>
      <div style={s.top}>
        <div style={s.avatar}>
          {avatar.startsWith("http") ? (
            <img src={avatar} alt={name} style={s.avatarImg} />
          ) : (
            avatar
          )}
        </div>
        <div style={s.info}>
          <p style={s.name}>{name}</p>
          <p style={s.meta}>
            {year} · {major}
          </p>
        </div>
      </div>

      {matchReason && (
        <div style={s.reason}>
          <span style={s.reasonDot}>✦</span>
          {matchReason}
        </div>
      )}

      <div style={s.tags}>
        {lookingFor.slice(0, 2).map((l) => (
          <span key={l} style={s.tag}>
            {l}
          </span>
        ))}
      </div>

      <div style={s.interests}>
        {interests.slice(0, 4).map((i) => (
          <span key={i} style={s.interest}>
            #{i}
          </span>
        ))}
      </div>
    </div>
  );
}

const s = {
  card: {
    background: "rgba(255, 255, 255, 0.86)",
    borderRadius: 22,
    border: "1px solid rgba(39, 39, 39, 0.08)",
    padding: 20,
    cursor: "pointer",
    boxShadow: "0 12px 30px rgba(29, 24, 21, 0.05)",
    backdropFilter: "blur(14px)",
    transition:
      "transform .18s ease, box-shadow .18s ease, border-color .18s ease",
  },
  top: { display: "flex", alignItems: "center", gap: 12, marginBottom: 14 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: "50%",
    background: "linear-gradient(145deg, var(--uwRed) 0%, #8f0108 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--uwWhite)",
    fontSize: 14,
    fontWeight: 700,
    flexShrink: 0,
    overflow: "hidden",
    boxShadow: "0 8px 16px rgba(197, 5, 12, 0.15)",
  },
  avatarImg: { width: "100%", height: "100%", objectFit: "cover" },
  info: { flex: 1 },
  name: { margin: 0, fontSize: 15, fontWeight: 700, color: "var(--uwBlack)" },
  meta: { margin: "2px 0 0", fontSize: 12, color: "rgba(40, 39, 40, 0.58)" },
  reason: {
    fontSize: 13,
    color: "rgba(40, 39, 40, 0.72)",
    marginBottom: 12,
    display: "flex",
    gap: 6,
    alignItems: "flex-start",
    lineHeight: 1.45,
  },
  reasonDot: {
    color: "var(--uwRed)",
    flexShrink: 0,
    fontSize: 10,
    marginTop: 2,
  },
  tags: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 },
  tag: {
    padding: "4px 10px",
    borderRadius: 999,
    background: "rgba(197, 5, 12, 0.08)",
    color: "var(--uwRedDark)",
    fontSize: 11,
    fontWeight: 600,
  },
  interests: { display: "flex", gap: 8, flexWrap: "wrap" },
  interest: {
    fontSize: 12,
    color: "rgba(40, 39, 40, 0.5)",
  },
};
