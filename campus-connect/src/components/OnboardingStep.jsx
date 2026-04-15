// ── PERSON A OWNS THIS FILE ───────────────────────────────────────────────
// Onboarding form + local scoring/matching
// Output: calls onDone(myProfile, rankedStudents[])

import { useState, useEffect, useRef } from "react";
import { EMPTY_STUDENT, SEED_STUDENTS } from "../App";

const YEARS = ["Freshman", "Sophomore", "Junior", "Senior", "Grad"];
const LOOKING_FOR_OPTIONS = [
  "study buddy",
  "project collab",
  "join a club",
  "just meet people",
];
const INTEREST_SUGGESTIONS = [
  "startups",
  "hiking",
  "music",
  "gaming",
  "research",
  "coffee",
  "cooking",
  "fitness",
  "reading",
  "photography",
  "open source",
  "jazz",
  "chess",
  "robotics",
  "UX",
  "machine learning",
  "writing",
  "art",
  "dance",
  "film",
  "sports",
  "theater",
  "design",
  "entrepreneurship",
  "volunteering",
  "travel",
  "cooking",
  "gardening",
  "meditation",
  "yoga",
  "rock climbing",
  "surfing",
  "skateboarding",
  "cycling",
  "hockey",
  "soccer",
  "basketball",
  "tennis",
  "badminton",
  "debate",
  "public speaking",
  "languages",
  "animation",
  "comics",
  "sci-fi",
  "fantasy",
  "mystery",
  "history",
  "philosophy",
  "psychology",
  "economics",
  "politics",
  "environmental",
  "social justice",
  "sustainability",
  "web development",
  "data science",
  "AI",
  "blockchain",
  "cybersecurity",
  "mobile apps",
  "gaming dev",
  "3D modeling",
  "VR",
  "AR",
  "board games",
  "tabletop RPG",
  "poker",
  "trading cards",
  "cooking shows",
  "podcasts",
  "true crime",
  "comedy",
  "anime",
  "manga",
  "K-pop",
  "hip hop",
  "electronic",
  "classical",
  "country",
  "indie",
  "pop",
  "rock",
];

const MADGRADES_TOKEN = "89a27736128f492db75bec4b952501b8";

const DEV_AUTOFILL = {
  name: "Alex Dev",
  email: "alexdev@university.edu",
  year: "Junior",
  major: "Computer Science",
  classes: [
    "COMP SCI 301 – Introduction to Algorithms",
    "MATH 241 – Calculus and Analytic Geometry 3",
  ],
  interests: ["startups", "open source", "coffee", "hiking"],
  lookingFor: ["project collab", "study buddy"],
  bio: "Building side projects and looking for teammates.",
};

const YEAR_ORDER = ["Freshman", "Sophomore", "Junior", "Senior", "Grad"];

function scoreMatch(me, them) {
  let score = 0;
  const sharedClasses = me.classes.filter((c) => them.classes.includes(c));
  score += sharedClasses.length * 40;
  const sharedIntent = me.lookingFor.filter((l) => them.lookingFor.includes(l));
  score += sharedIntent.length * 20;
  const sharedInterests = me.interests.filter((i) =>
    them.interests.includes(i),
  );
  score += sharedInterests.length * 10;
  const yearDiff = Math.abs(
    YEAR_ORDER.indexOf(me.year) - YEAR_ORDER.indexOf(them.year),
  );
  score += Math.max(0, 10 - yearDiff * 3);
  return score;
}

function buildReason(me, them) {
  const sharedClasses = me.classes.filter((c) => them.classes.includes(c));
  const sharedInterests = me.interests.filter((i) =>
    them.interests.includes(i),
  );
  const sharedIntent = me.lookingFor.filter((l) => them.lookingFor.includes(l));
  const parts = [];
  if (sharedClasses.length)
    parts.push(`Both in ${sharedClasses.slice(0, 2).join(" & ")}`);
  if (sharedInterests.length)
    parts.push(`both into ${sharedInterests.slice(0, 2).join(" & ")}`);
  if (!parts.length && sharedIntent.length)
    parts.push(`Both looking for ${sharedIntent[0]}`);
  return parts.join(", ") || "";
}

async function searchCourses(query) {
  const url = `https://api.madgrades.com/v1/courses?query=${encodeURIComponent(query)}&per_page=8`;
  console.log("[MadGrades] GET", url);
  const res = await fetch(url, {
    headers: { Authorization: `Token token=${MADGRADES_TOKEN}` },
  });
  const data = await res.json();
  console.log("[MadGrades] response", data);
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
    if (query.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
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
      if (wrapRef.current && !wrapRef.current.contains(e.target))
        setOpen(false);
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
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}
        >
          {selected.map((c) => (
            <span key={c} style={s.courseChip}>
              {c}
              <button onClick={() => remove(c)} style={s.courseChipX}>
                ×
              </button>
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
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--uwGrayLightest)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              {course}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Interest search combobox ──────────────────────────────────────────────
function InterestSearch({ selected, onChange }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    const filtered = INTEREST_SUGGESTIONS.filter(
      (interest) =>
        interest.toLowerCase().includes(query.toLowerCase()) &&
        !selected.includes(interest),
    );
    setResults(filtered);
    setOpen(filtered.length > 0);
  }, [query, selected]);

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const pick = (interest) => {
    onChange([...selected, interest]);
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  const remove = (interest) => onChange(selected.filter((i) => i !== interest));

  const handleAddCustom = () => {
    const trimmed = query.trim().toLowerCase();
    if (trimmed && !selected.includes(trimmed)) {
      onChange([...selected, trimmed]);
      setQuery("");
      setResults([]);
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      {selected.length > 0 && (
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}
        >
          {selected.map((i) => (
            <span key={i} style={s.interestChip}>
              #{i}
              <button onClick={() => remove(i)} style={s.interestChipX}>
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <div style={{ position: "relative" }}>
        <input
          style={s.input}
          placeholder="Search or type a custom interest..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {}}
        />
      </div>
      {open && (
        <ul style={s.dropdown}>
          {results.map((interest) => (
            <li
              key={interest}
              style={s.dropdownItem}
              onMouseDown={() => pick(interest)}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--uwGrayLightest)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              #{interest}
            </li>
          ))}
        </ul>
      )}
      {query.trim() && !results.length && (
        <button style={s.addCustomInterest} onClick={handleAddCustom}>
          + Add "{query.trim()}"
        </button>
      )}
    </div>
  );
}

export default function OnboardingStep({ onDone }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    year: "",
    major: "",
    classes: [], // array of "ABBR NUMBER – Name" strings
    interests: [],
    lookingFor: [],
    bio: "",
  });
  const [error, setError] = useState(null);

  const toggle = (field, value) => {
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(value)
        ? f[field].filter((v) => v !== value)
        : [...f[field], value],
    }));
  };

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.year || !form.major) {
      setError("Please fill in name, email, year, and major.");
      return;
    }
    if (!form.email.endsWith(".edu")) {
      setError("Please use your college .edu email.");
      return;
    }
    setError(null);
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
      avatar: form.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    };

    const ranked = SEED_STUDENTS.map((s) => ({
      ...s,
      matchScore: scoreMatch(myProfile, s),
      matchReason: buildReason(myProfile, s),
    })).sort((a, b) => b.matchScore - a.matchScore);
    onDone(myProfile, ranked);
  };

  return (
    <div style={s.page}>
      <div style={s.glowOne} />
      <div style={s.glowTwo} />
      <div style={s.layout}>
        <section style={s.hero}>
          <span style={s.badge}>Campus Connect</span>
          <h1 style={s.heroTitle}>
            Find people who actually fit your campus life.
          </h1>
          <p style={s.heroCopy}>
            Build a profile once, then get ranked matches, cleaner cards, and
            intro messages that feel human.
          </p>
          <div style={s.heroStats}>
            <div style={s.stat}>
              <strong style={s.statValue}>Quick setup</strong>
              <span style={s.statLabel}>Finish in a couple minutes.</span>
            </div>
            <div style={s.stat}>
              <strong style={s.statValue}>Better matches</strong>
              <span style={s.statLabel}>
                Shared classes and interests rise first.
              </span>
            </div>
            <div style={s.stat}>
              <strong style={s.statValue}>Less noise</strong>
              <span style={s.statLabel}>
                One focused flow from profile to message.
              </span>
            </div>
          </div>
        </section>

        <div style={s.card}>
          <div style={s.logoRow}>
            <div>
              <h1 style={s.appName}>Campus Connect</h1>
              <p style={s.tagline}>Find your people.</p>
            </div>
            {process.env.NODE_ENV !== "production" && (
              <button style={s.devBtn} onClick={() => setForm(DEV_AUTOFILL)}>
                Autofill (dev)
              </button>
            )}
          </div>

          <Field label="Full name">
            <input
              style={s.input}
              placeholder="Jane Doe"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </Field>

          <Field label="College email" hint=".edu required">
            <input
              style={s.input}
              type="email"
              placeholder="you@university.edu"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
            />
          </Field>

          <div style={s.row}>
            <Field label="Year" style={{ flex: 1 }}>
              <select
                style={s.input}
                value={form.year}
                onChange={(e) =>
                  setForm((f) => ({ ...f, year: e.target.value }))
                }
              >
                <option value="">Select...</option>
                {YEARS.map((y) => (
                  <option key={y}>{y}</option>
                ))}
              </select>
            </Field>
            <Field label="Major" style={{ flex: 2 }}>
              <input
                style={s.input}
                placeholder="Computer Science"
                value={form.major}
                onChange={(e) =>
                  setForm((f) => ({ ...f, major: e.target.value }))
                }
              />
            </Field>
          </div>

          <Field label="Classes this semester" hint="search by name or code">
            <CourseSearch
              selected={form.classes}
              onChange={(classes) => setForm((f) => ({ ...f, classes }))}
            />
          </Field>

          <Field label="Interests" hint="search or add custom interests">
            <InterestSearch
              selected={form.interests}
              onChange={(interests) => setForm((f) => ({ ...f, interests }))}
            />
          </Field>

          <Field label="Looking for">
            <div style={s.chips}>
              {LOOKING_FOR_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  style={{
                    ...s.chip,
                    ...(form.lookingFor.includes(opt) ? s.chipActive : {}),
                  }}
                  onClick={() => toggle("lookingFor", opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Bio" hint="optional, 1-2 sentences">
            <textarea
              style={{ ...s.input, height: 96, resize: "none" }}
              placeholder="What are you working on? What do you want to find on campus?"
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            />
          </Field>

          {error && <p style={s.error}>{error}</p>}

          <button style={s.btn} onClick={handleSubmit}>
            Find my people →
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, children, style }) {
  return (
    <div style={{ marginBottom: 20, ...style }}>
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "baseline",
          marginBottom: 6,
        }}
      >
        <label style={{ fontSize: 14, fontWeight: 500 }}>{label}</label>
        {hint && <span style={{ fontSize: 12, color: "#999" }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const s = {
  page: {
    position: "relative",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    overflow: "hidden",
  },
  glowOne: {
    position: "absolute",
    inset: "auto auto -10% -6%",
    width: 360,
    height: 360,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(197, 5, 12, 0.18) 0%, rgba(197, 5, 12, 0) 70%)",
    filter: "blur(12px)",
    pointerEvents: "none",
  },
  glowTwo: {
    position: "absolute",
    inset: "-12% -8% auto auto",
    width: 320,
    height: 320,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(28, 68, 142, 0.14) 0%, rgba(28, 68, 142, 0) 70%)",
    filter: "blur(10px)",
    pointerEvents: "none",
  },
  layout: {
    position: "relative",
    width: "100%",
    maxWidth: 1120,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 28,
    alignItems: "center",
    zIndex: 1,
  },
  hero: {
    padding: "24px 12px",
    color: "var(--uwGrayDark)",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 12px",
    borderRadius: 999,
    background: "rgba(197, 5, 12, 0.08)",
    color: "var(--uwRedDark)",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 18,
  },
  heroTitle: {
    margin: 0,
    maxWidth: 520,
    fontSize: "clamp(2.4rem, 5vw, 4.5rem)",
    lineHeight: 0.96,
    letterSpacing: "-0.04em",
    color: "var(--uwBlack)",
  },
  heroCopy: {
    maxWidth: 480,
    margin: "18px 0 0",
    fontSize: 16,
    lineHeight: 1.7,
    color: "rgba(40, 39, 40, 0.72)",
  },
  heroStats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 12,
    marginTop: 28,
  },
  stat: {
    padding: 16,
    borderRadius: 16,
    border: "1px solid var(--uwBorder)",
    background: "var(--uwSurface)",
    boxShadow: "0 10px 30px rgba(29, 24, 21, 0.04)",
    backdropFilter: "blur(14px)",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  statValue: {
    fontSize: 15,
    fontWeight: 700,
    color: "var(--uwBlack)",
    margin: 0,
    lineHeight: 1.3,
  },
  statLabel: {
    fontSize: 13,
    lineHeight: 1.45,
    color: "rgba(40, 39, 40, 0.68)",
    margin: 0,
  },
  card: {
    background: "var(--uwSurface)",
    borderRadius: 28,
    border: "1px solid var(--uwBorder)",
    padding: 32,
    width: "100%",
    boxShadow: "var(--uwShadow)",
    backdropFilter: "blur(18px)",
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 28,
  },
  logo: {
    width: 46,
    height: 46,
    background: "linear-gradient(145deg, var(--uwRed) 0%, #8f0108 100%)",
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--uwWhite)",
    fontSize: 20,
    fontWeight: 800,
    boxShadow: "0 10px 20px rgba(197, 5, 12, 0.18)",
    flexShrink: 0,
  },
  appName: {
    margin: 0,
    fontSize: 20,
    fontWeight: 800,
    letterSpacing: "-0.02em",
    color: "var(--uwBlack)",
  },
  tagline: { margin: "3px 0 0", fontSize: 13, color: "rgba(40, 39, 40, 0.66)" },
  row: { display: "flex", gap: 12 },
  input: {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid rgba(39, 39, 39, 0.12)",
    borderRadius: 14,
    fontSize: 14,
    boxSizing: "border-box",
    background: "rgba(255, 255, 255, 0.82)",
    color: "var(--uwBlack)",
    outline: "none",
    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.8)",
  },
  chips: { display: "flex", flexWrap: "wrap", gap: 8 },
  chip: {
    padding: "8px 14px",
    borderRadius: 999,
    border: "1px solid rgba(39, 39, 39, 0.1)",
    background: "rgba(255, 255, 255, 0.84)",
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
  btn: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, var(--uwRed) 0%, #9b0000 100%)",
    color: "var(--uwWhite)",
    border: "none",
    borderRadius: 14,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    marginTop: 10,
    boxShadow: "0 14px 28px rgba(197, 5, 12, 0.22)",
  },
  error: { color: "var(--uwRed)", fontSize: 13, marginBottom: 8 },
  devBtn: {
    marginLeft: "auto",
    padding: "7px 12px",
    fontSize: 11,
    background: "rgba(255, 255, 255, 0.7)",
    border: "1px dashed rgba(39, 39, 39, 0.18)",
    borderRadius: 999,
    cursor: "pointer",
    color: "rgba(40, 39, 40, 0.72)",
    whiteSpace: "nowrap",
  },
  // CourseSearch
  courseChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "5px 10px",
    background: "rgba(197, 5, 12, 0.1)",
    color: "var(--uwRedDark)",
    borderRadius: 999,
    fontSize: 12,
  },
  courseChipX: {
    background: "none",
    border: "none",
    color: "inherit",
    cursor: "pointer",
    fontSize: 15,
    lineHeight: 1,
    padding: 0,
  },
  // CourseSearch
  courseChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "5px 10px",
    background: "rgba(197, 5, 12, 0.1)",
    color: "var(--uwRedDark)",
    borderRadius: 999,
    fontSize: 12,
  },
  courseChipX: {
    background: "none",
    border: "none",
    color: "inherit",
    cursor: "pointer",
    fontSize: 15,
    lineHeight: 1,
    padding: 0,
  },
  // InterestSearch
  interestChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "5px 10px",
    background: "rgba(197, 5, 12, 0.1)",
    color: "var(--uwRedDark)",
    borderRadius: 999,
    fontSize: 12,
  },
  interestChipX: {
    background: "none",
    border: "none",
    color: "inherit",
    cursor: "pointer",
    fontSize: 15,
    lineHeight: 1,
    padding: 0,
  },
  addCustomInterest: {
    marginTop: 8,
    padding: "8px 12px",
    background: "rgba(197, 5, 12, 0.08)",
    border: "1px dashed rgba(197, 5, 12, 0.3)",
    borderRadius: 10,
    color: "var(--uwRedDark)",
    fontSize: 13,
    cursor: "pointer",
    fontWeight: 500,
    width: "100%",
  },
  searchSpinner: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: "translateY(-50%)",
    color: "#999",
    fontSize: 13,
    pointerEvents: "none",
  },
  dropdown: {
    position: "absolute",
    top: "calc(100% + 8px)",
    left: 0,
    right: 0,
    background: "var(--uwSurfaceStrong)",
    border: "1px solid var(--uwBorder)",
    borderRadius: 16,
    boxShadow: "0 16px 36px rgba(0,0,0,0.12)",
    zIndex: 100,
    margin: 0,
    padding: 6,
    listStyle: "none",
    backdropFilter: "blur(16px)",
  },
  dropdownItem: {
    padding: "10px 12px",
    fontSize: 13,
    borderRadius: 10,
    cursor: "pointer",
    color: "var(--uwGrayDark)",
    background: "transparent",
  },
};
