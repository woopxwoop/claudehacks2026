// ── PERSON B OWNS THIS FILE ───────────────────────────────────────────────
// Profile modal with Claude-drafted intro message

import { useState } from "react";

const MODEL = "claude-sonnet-4-20250514";

async function draftIntro(me, them) {
  const apiKey = process.env.REACT_APP_ANTHROPIC_KEY;

  if (!apiKey) {
    throw new Error("Missing Anthropic API key");
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 200,
      messages: [
        {
          role: "user",
          content: `Write a short, friendly, non-cringe intro message from ${me.name} to ${them.name}.
They're both college students. Base it on their shared context below.
2-3 sentences max. Casual tone. End with a concrete question or invite.

${me.name}'s profile: major ${me.major}, interests: ${me.interests.join(", ")}, classes: ${me.classes.join(", ")}, looking for: ${me.lookingFor.join(", ")}
${them.name}'s profile: major ${them.major}, interests ${them.interests.join(", ")}, classes: ${them.classes.join(", ")}, bio: ${them.bio}

Return only the message, no quotes, no preamble.`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Anthropic request failed: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  return data.content?.map((b) => b.text || "").join("") || "";
}

export default function ProfileModal({
  student,
  me,
  onClose,
  onMessage,
  onNavigate,
}) {
  const [intro, setIntro] = useState("");
  const [loadingIntro, setLoadingIntro] = useState(false);

  const {
    name,
    year,
    major,
    classes = [],
    interests = [],
    lookingFor = [],
    bio,
    avatar,
    matchReason,
  } = student;

  const handleDraftIntro = async () => {
    setLoadingIntro(true);
    try {
      const msg = await draftIntro(me, student);
      setIntro(msg);
    } catch {
      setIntro(
        "Hey! I came across your profile and thought we should connect. Want to grab coffee sometime?",
      );
    } finally {
      setLoadingIntro(false);
    }
  };

  const handleSendIntro = () => {
    onMessage(student.id, intro.trim());
  };

  const handleEditProfile = () => {
    if (onNavigate) {
      onClose();
      onNavigate("settings");
    }
  };

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        <button style={s.close} onClick={onClose}>
          ✕
        </button>

        {/* Header */}
        <div style={s.header}>
          <div
            style={{
              ...s.avatar,
              cursor: "pointer",
              transition: "transform 0.2s ease",
            }}
            onClick={handleEditProfile}
            title="Click to edit your profile"
          >
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
          <div>
            <h2 style={s.name}>{name}</h2>
            <p style={s.meta}>
              {year} · {major}
            </p>
          </div>
        </div>

        {matchReason && (
          <div style={s.matchBadge}>
            <span style={{ color: "var(--uwRed)" }}>✦</span> {matchReason}
          </div>
        )}

        {bio && <p style={s.bio}>{bio}</p>}

        <div style={s.section}>
          <p style={s.sectionLabel}>Classes</p>
          <div style={s.chips}>
            {classes.map((c) => (
              <span key={c} style={s.chip}>
                {c}
              </span>
            ))}
          </div>
        </div>

        <div style={s.section}>
          <p style={s.sectionLabel}>Interests</p>
          <div style={s.chips}>
            {interests.map((i) => (
              <span key={i} style={s.chip}>
                #{i}
              </span>
            ))}
          </div>
        </div>

        <div style={s.section}>
          <p style={s.sectionLabel}>Looking for</p>
          <div style={s.chips}>
            {lookingFor.map((l) => (
              <span key={l} style={{ ...s.chip, ...s.chipAccent }}>
                {l}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={s.introBox}>
          {!intro && !loadingIntro && (
            <div style={{ display: "flex", gap: 10, marginBottom: 0 }}>
              <button
                style={s.messageBtn}
                onClick={() => onMessage(student.id)}
              >
                Message
              </button>
              <button style={s.draftBtn} onClick={handleDraftIntro}>
                ✦ Draft intro
              </button>
            </div>
          )}
          {loadingIntro && (
            <p style={{ color: "#999", fontSize: 14 }}>Writing intro…</p>
          )}
          {intro && (
            <>
              <textarea
                style={s.introText}
                value={intro}
                onChange={(e) => setIntro(e.target.value)}
                rows={4}
              />
              <button style={s.copyBtn} onClick={handleSendIntro}>
                Send message
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    padding: 24,
  },
  modal: {
    background: "var(--uwWhite)",
    borderRadius: 18,
    padding: 32,
    width: "100%",
    maxWidth: 460,
    position: "relative",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  close: {
    position: "absolute",
    top: 16,
    right: 16,
    background: "none",
    border: "none",
    fontSize: 18,
    cursor: "pointer",
    color: "#999",
    lineHeight: 1,
  },
  header: { display: "flex", gap: 14, alignItems: "center", marginBottom: 16 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "var(--uwRed)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--uwWhite)",
    fontSize: 18,
    fontWeight: 700,
    flexShrink: 0,
    overflow: "hidden",
  },
  name: { margin: 0, fontSize: 20, fontWeight: 700 },
  meta: { margin: "2px 0 0", color: "#888", fontSize: 13 },
  matchBadge: {
    background: "var(--uwRedLight)",
    borderRadius: 8,
    padding: "8px 14px",
    fontSize: 13,
    color: "var(--uwGrayDark)",
    marginBottom: 16,
    display: "flex",
    gap: 6,
    alignItems: "center",
  },
  bio: { color: "#555", fontSize: 14, lineHeight: 1.6, marginBottom: 20 },
  section: { marginBottom: 18 },
  sectionLabel: {
    margin: "0 0 8px",
    fontSize: 12,
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chips: { display: "flex", flexWrap: "wrap", gap: 6 },
  chip: {
    padding: "4px 12px",
    borderRadius: 20,
    background: "var(--uwGrayLightest)",
    fontSize: 13,
    color: "#555",
  },
  chipAccent: { background: "var(--uwRedLight)", color: "var(--uwRedDark)" },
  introBox: {
    marginTop: 24,
    borderTop: "0.5px solid var(--uwGrayLight)",
    paddingTop: 20,
  },
  messageBtn: {
    flex: 1,
    padding: "11px",
    background: "var(--uwRed)",
    color: "var(--uwWhite)",
    border: "none",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  draftBtn: {
    flex: 1,
    padding: "11px",
    border: "1.5px solid var(--uwRed)",
    borderRadius: 10,
    background: "var(--uwWhite)",
    color: "var(--uwRed)",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  introText: {
    width: "100%",
    padding: "12px",
    border: "0.5px solid var(--uwGrayLight)",
    borderRadius: 10,
    fontSize: 14,
    lineHeight: 1.6,
    resize: "none",
    boxSizing: "border-box",
    background: "var(--uwGrayLightest)",
    marginBottom: 10,
    outline: "none",
  },
  copyBtn: {
    width: "100%",
    padding: "11px",
    background: "var(--uwRed)",
    color: "var(--uwWhite)",
    border: "none",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
};
