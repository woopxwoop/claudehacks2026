// ── PERSON A OWNS THIS FILE ───────────────────────────────────────────────
// Onboarding form + Claude matching call
// Output: calls onDone(myProfile, rankedStudents[])

import { useState, useEffect, useRef } from "react";
import { EMPTY_STUDENT, MATCH_PROMPT, SEED_STUDENTS } from "../App";

const YEARS = ["Freshman", "Sophomore", "Junior", "Senior", "Grad"];
const LOOKING_FOR_OPTIONS = ["study buddy", "project collab", "join a club", "just meet people"];
const INTEREST_SUGGESTIONS = ["startups", "hiking", "music", "gaming", "research", "coffee", "cooking", "fitness", "reading", "photography", "open source", "jazz", "chess", "robotics", "UX", "machine learning"];

const MODEL = "claude-sonnet-4-20250514";
const MADGRADES_TOKEN = "89a27736128f492db75bec4b952501b8";

const DEV_AUTOFILL = {
  name: "Alex Dev",
  email: "alexdev@university.edu",
  year: "Junior",
  major: "Computer Science",
  classes: ["COMP SCI 301 – Introduction to Algorithms", "MATH 241 – Calculus and Analytic Geometry 3"],
  interests: ["startups", "open source", "coffee", "hiking"],
  lookingFor: ["project collab", "study buddy"],
  bio: "Building side projects and looking for teammates.",
};

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

async function searchCourses(query) {
  const url = `https://api.madgrades.com/v1/courses?query=${encodeURIComponent(query)}&per_page=8`;
  const res = await fetch(url, {
    headers: { Authorization: `Token token=${MADGRADES_TOKEN}` },
  });
  const data = await res.json();
  return (data.results || []).map((course) => {
    const abbr = course.subjects?.[0]?.abbreviation ?? "";
    return `${abbr} ${course.number} – ${course.name}`;
  });
}

// ── Course search combobox ────────────────────────────────────────────────
function CourseSearch({ selected, onChange }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    clearTimeout(timerRef.current);
    if (query.length < 2) { setResults([]); setOpen(false); return; }
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const hits = await searchCourses(query);
        const filtered = hits.filter((h) => !selected.includes(h));
        setResults(filtered);
        setOpen(filtered.length > 0);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timerRef.current);
  }, [query, selected]);

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const pick = (course) => {
    onChange([...selected, course]);
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  const remove = (course) => onChange(selected.filter((c) => c !== course));

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      {selected.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
          {selected.map((c) => (
            <span key={c} style={s.courseChip}>
              {c}
              <button onClick={() => remove(c)} style={s.courseChipX}>×</button>
            </span>
          ))}
        </div>
      )}
      <div style={{ position: "relative" }}>
        <input
          style={s.input}
          placeholder='Search by name or code, e.g. "algorithms" or "CS 301"'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
        />
        {loading && <span style={s.searchSpinner}>…</span>}
      </div>
      {open && (
        <ul style={s.dropdown}>
          {results.map((course) => (
            <li
              key={course}
              style={s.dropdownItem}
              onMouseDown={() => pick(course)}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--uwGrayLightest)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {course}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function OnboardingStep({ onDone }) {
  const [form, setForm] = useState({
    name: "", email: "", year: "", major: "",
    classes: [],    // array of "ABBR NUMBER – Name" strings
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

    // Shorten to "ABBR NUMBER" for matching (drop the – Name part)
    const classesShort = form.classes.map((c) => c.split(" – ")[0].trim());

    const myProfile = {
      ...EMPTY_STUDENT,
      id: "me",
      name: form.name,
      year: form.year,
      major: form.major,
      classes: classesShort,
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
          {process.env.NODE_ENV !== "production" && (
            <button style={s.devBtn} onClick={() => setForm(DEV_AUTOFILL)}>
              Autofill (dev)
            </button>
          )}
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

        <Field label="Classes this semester" hint="search by name or code">
          <CourseSearch
            selected={form.classes}
            onChange={(classes) => setForm((f) => ({ ...f, classes }))}
          />
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

const s = {
  page: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "var(--uwGrayLightest)" },
  card: { background: "var(--uwWhite)", borderRadius: 16, border: "0.5px solid var(--uwGrayLight)", padding: 40, width: "100%", maxWidth: 520 },
  logoRow: { display: "flex", alignItems: "center", gap: 14, marginBottom: 36 },
  logo: { width: 44, height: 44, background: "var(--uwRed)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--uwWhite)", fontSize: 22, fontWeight: 700 },
  appName: { margin: 0, fontSize: 22, fontWeight: 700, color: "var(--uwBlack)" },
  tagline: { margin: 0, fontSize: 13, color: "#888" },
  row: { display: "flex", gap: 12 },
  input: { width: "100%", padding: "10px 12px", border: "0.5px solid var(--uwGrayLight)", borderRadius: 8, fontSize: 14, boxSizing: "border-box", background: "var(--uwGrayLightest)", outline: "none" },
  chips: { display: "flex", flexWrap: "wrap", gap: 8 },
  chip: { padding: "6px 14px", borderRadius: 20, border: "0.5px solid var(--uwGrayLight)", background: "var(--uwWhite)", fontSize: 13, cursor: "pointer", color: "var(--uwGrayDark)" },
  chipActive: { background: "var(--uwRed)", borderColor: "var(--uwRedDark)", color: "var(--uwWhite)" },
  btn: { width: "100%", padding: "13px", background: "var(--uwRed)", color: "var(--uwWhite)", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer", marginTop: 8 },
  error: { color: "var(--uwRed)", fontSize: 13, marginBottom: 8 },
  devBtn: { marginLeft: "auto", padding: "4px 10px", fontSize: 11, background: "var(--uwGrayLightest)", border: "1px dashed var(--uwGrayLight)", borderRadius: 6, cursor: "pointer", color: "#666", whiteSpace: "nowrap" },
  // CourseSearch
  courseChip: { display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", background: "var(--uwRed)", color: "var(--uwWhite)", borderRadius: 20, fontSize: 12 },
  courseChipX: { background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: 15, lineHeight: 1, padding: 0 },
  searchSpinner: { position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#999", fontSize: 13, pointerEvents: "none" },
  dropdown: { position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "var(--uwWhite)", border: "0.5px solid var(--uwGrayLight)", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.08)", zIndex: 100, margin: 0, padding: 4, listStyle: "none" },
  dropdownItem: { padding: "9px 12px", fontSize: 13, borderRadius: 6, cursor: "pointer", color: "var(--uwGrayDark)", background: "transparent" },
};
