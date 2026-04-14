// ── PERSON A OWNS THIS FILE ───────────────────────────────────────────────
// Onboarding form + Claude matching call
// Output: calls onDone(myProfile, rankedStudents[])

import { useState } from "react";
import { EMPTY_STUDENT, MATCH_PROMPT, SEED_STUDENTS } from "../App";

const YEARS = ["Freshman", "Sophomore", "Junior", "Senior", "Grad"];
const LOOKING_FOR_OPTIONS = ["study buddy", "project collab", "join a club", "just meet people"];
const INTEREST_SUGGESTIONS = ["startups", "hiking", "music", "gaming", "research", "coffee", "cooking", "fitness", "reading", "photography", "open source", "jazz", "chess", "robotics", "UX", "machine learning"];

const MODEL = "claude-sonnet-4-20250514";

async function callClaude(prompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Add your API key here for local dev:
      // "x-api-key": process.env.REACT_APP_ANTHROPIC_KEY,
      // "anthropic-version": "2023-06-01",
      // "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  const text = data.content?.map((b) => b.text || "").join("") || "[]";
  return text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
}

export default function OnboardingStep({ onDone }) {
  const [form, setForm] = useState({
    name: "", email: "", year: "", major: "",
    classes: "", // comma-separated string, split on submit
    interests: [],
    lookingFor: [],
    bio: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggle = (field, value) => {
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(value)
        ? f[field].filter((v) => v !== value)
        : [...f[field], value],
    }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.year || !form.major) {
      setError("Please fill in name, email, year, and major.");
      return;
    }
    if (!form.email.endsWith(".edu")) {
      setError("Please use your college .edu email.");
      return;
    }
    setError(null);
    setLoading(true);

    const myProfile = {
      ...EMPTY_STUDENT,
      id: "me",
      name: form.name,
      year: form.year,
      major: form.major,
      classes: form.classes.split(",").map((c) => c.trim()).filter(Boolean),
      interests: form.interests,
      lookingFor: form.lookingFor,
      bio: form.bio,
      avatar: form.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase(),
    };

    try {
      const raw = await callClaude(MATCH_PROMPT(myProfile, SEED_STUDENTS));
      const ranked = JSON.parse(raw);
      onDone(myProfile, ranked);
    } catch (e) {
      // Fallback: return seed students unranked if Claude fails
      console.error(e);
      onDone(myProfile, SEED_STUDENTS);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logoRow}>
          <div style={s.logo}>C</div>
          <div>
            <h1 style={s.appName}>Campus</h1>
            <p style={s.tagline}>Find your people.</p>
          </div>
        </div>

        <Field label="Full name">
          <input style={s.input} placeholder="Jane Doe" value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </Field>

        <Field label="College email" hint=".edu required">
          <input style={s.input} type="email" placeholder="you@university.edu" value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        </Field>

        <div style={s.row}>
          <Field label="Year" style={{ flex: 1 }}>
            <select style={s.input} value={form.year}
              onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}>
              <option value="">Select...</option>
              {YEARS.map((y) => <option key={y}>{y}</option>)}
            </select>
          </Field>
          <Field label="Major" style={{ flex: 2 }}>
            <input style={s.input} placeholder="Computer Science" value={form.major}
              onChange={(e) => setForm((f) => ({ ...f, major: e.target.value }))} />
          </Field>
        </div>

        <Field label="Classes this semester" hint="comma-separated, e.g. CS 301, MATH 241">
          <input style={s.input} placeholder="CS 301, MATH 241" value={form.classes}
            onChange={(e) => setForm((f) => ({ ...f, classes: e.target.value }))} />
        </Field>

        <Field label="Interests">
          <div style={s.chips}>
            {INTEREST_SUGGESTIONS.map((interest) => (
              <button key={interest} style={{ ...s.chip, ...(form.interests.includes(interest) ? s.chipActive : {}) }}
                onClick={() => toggle("interests", interest)}>
                {interest}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Looking for">
          <div style={s.chips}>
            {LOOKING_FOR_OPTIONS.map((opt) => (
              <button key={opt} style={{ ...s.chip, ...(form.lookingFor.includes(opt) ? s.chipActive : {}) }}
                onClick={() => toggle("lookingFor", opt)}>
                {opt}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Bio" hint="optional, 1-2 sentences">
          <textarea style={{ ...s.input, height: 72, resize: "none" }} placeholder="What are you working on? What do you want to find on campus?"
            value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} />
        </Field>

        {error && <p style={s.error}>{error}</p>}

        <button style={{ ...s.btn, opacity: loading ? 0.6 : 1 }} disabled={loading} onClick={handleSubmit}>
          {loading ? "Finding your people…" : "Find my people →"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, hint, children, style }) {
  return (
    <div style={{ marginBottom: 20, ...style }}>
      <div style={{ display: "flex", gap: 8, alignItems: "baseline", marginBottom: 6 }}>
        <label style={{ fontSize: 14, fontWeight: 500 }}>{label}</label>
        {hint && <span style={{ fontSize: 12, color: "#999" }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const ACCENT = "#5c6ac4";

const s = {
  page: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 },
  card: { background: "#fff", borderRadius: 16, border: "0.5px solid #e0e0e0", padding: 40, width: "100%", maxWidth: 520 },
  logoRow: { display: "flex", alignItems: "center", gap: 14, marginBottom: 36 },
  logo: { width: 44, height: 44, background: ACCENT, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 22, fontWeight: 700 },
  appName: { margin: 0, fontSize: 22, fontWeight: 700 },
  tagline: { margin: 0, fontSize: 13, color: "#999" },
  row: { display: "flex", gap: 12 },
  input: { width: "100%", padding: "10px 12px", border: "0.5px solid #ddd", borderRadius: 8, fontSize: 14, boxSizing: "border-box", background: "#fafafa", outline: "none" },
  chips: { display: "flex", flexWrap: "wrap", gap: 8 },
  chip: { padding: "6px 14px", borderRadius: 20, border: "0.5px solid #ddd", background: "#fff", fontSize: 13, cursor: "pointer", color: "#555" },
  chipActive: { background: ACCENT, borderColor: ACCENT, color: "#fff" },
  btn: { width: "100%", padding: "13px", background: ACCENT, color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer", marginTop: 8 },
  error: { color: "#c0392b", fontSize: 13, marginBottom: 8 },
};
