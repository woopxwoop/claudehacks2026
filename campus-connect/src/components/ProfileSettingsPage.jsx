import { useMemo, useState } from "react";

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
];

function makeAvatar(name) {
  return (name || "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Field({ label, hint, children, style }) {
  return (
    <div style={{ marginBottom: 18, ...style }}>
      <div style={s.fieldHeader}>
        <label style={s.label}>{label}</label>
        {hint && <span style={s.hint}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export default function ProfileSettingsPage({ me, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: me?.name || "",
    year: me?.year || "",
    major: me?.major || "",
    classes: me?.classes || [],
    interests: me?.interests || [],
    lookingFor: me?.lookingFor || [],
    bio: me?.bio || "",
    avatar: me?.avatar || "",
  });
  const [classInput, setClassInput] = useState("");
  const [interestInput, setInterestInput] = useState("");
  const [error, setError] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(me?.avatar || "");

  const hasChanges = useMemo(
    () =>
      JSON.stringify(form) !==
      JSON.stringify({
        name: me?.name || "",
        year: me?.year || "",
        major: me?.major || "",
        classes: me?.classes || [],
        interests: me?.interests || [],
        avatar: me?.avatar || "",
        lookingFor: me?.lookingFor || [],
        bio: me?.bio || "",
      }),
    [form, me],
  );

  const toggle = (field, value) => {
    setForm((curr) => ({
      ...curr,
      [field]: curr[field].includes(value)
        ? curr[field].filter((v) => v !== value)
        : [...curr[field], value],
    }));
  };

  const filteredSuggestions = INTEREST_SUGGESTIONS.filter(
    (s) =>
      !form.interests.includes(s) &&
      s.toLowerCase().includes(interestInput.toLowerCase()),
  );

  const addClass = () => {
    const value = classInput.trim();
    if (!value) return;
    if (form.classes.includes(value)) {
      setClassInput("");
      return;
    }
    setForm((curr) => ({ ...curr, classes: [...curr.classes, value] }));
    setClassInput("");
  };

  const removeClass = (value) => {
    setForm((curr) => ({
      ...curr,
      classes: curr.classes.filter((c) => c !== value),
    }));
  };

  const addInterest = () => {
    const value = interestInput.trim();
    if (!value) return;
    if (form.interests.includes(value)) {
      setInterestInput("");
      return;
    }
    setForm((curr) => ({ ...curr, interests: [...curr.interests, value] }));
    setInterestInput("");
  };

  const removeInterest = (value) => {
    setForm((curr) => ({
      ...curr,
      interests: curr.interests.filter((i) => i !== value),
    }));
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result;
        if (typeof dataUrl === "string") {
          setAvatarPreview(dataUrl);
          setForm((curr) => ({ ...curr, avatar: dataUrl }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.year || !form.major.trim()) {
      setError("Please fill in your name, year, and major.");
      return;
    }

    setError("");
    onSave({
      ...me,
      ...form,
      name: form.name.trim(),
      major: form.major.trim(),
      bio: form.bio.trim(),
      avatar: makeAvatar(form.name),
    });
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.headerInner}>
          <div style={s.logoRow}>
            <span style={s.appName}>Campus Connect</span>
          </div>
          <button style={s.backBtn} onClick={onCancel}>
            ← Back to feed
          </button>
        </div>
      </div>

      <div style={s.body}>
        <div style={s.card}>
          <Field label="Full name">
            <input
              style={s.input}
              value={form.name}
              onChange={(e) =>
                setForm((curr) => ({ ...curr, name: e.target.value }))
              }
              placeholder="Jane Doe"
            />
          </Field>

          <div style={s.row}>
            <Field label="Year" style={{ flex: 1 }}>
              <select
                style={s.input}
                value={form.year}
                onChange={(e) =>
                  setForm((curr) => ({ ...curr, year: e.target.value }))
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
                value={form.major}
                onChange={(e) =>
                  setForm((curr) => ({ ...curr, major: e.target.value }))
                }
                placeholder="Computer Science"
              />
            </Field>
          </div>

          <Field label="Classes" hint="press Enter to add">
            <div style={s.classInputRow}>
              <input
                style={s.input}
                value={classInput}
                onChange={(e) => setClassInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addClass();
                  }
                }}
                placeholder="CS 301"
              />
              <button style={s.secondaryBtn} onClick={addClass}>
                Add
              </button>
            </div>
            {form.classes.length > 0 && (
              <div style={s.chips}>
                {form.classes.map((c) => (
                  <button
                    key={c}
                    style={s.classChip}
                    onClick={() => removeClass(c)}
                  >
                    {c} x
                  </button>
                ))}
              </div>
            )}
          </Field>

          <Field label="Interests" hint="press Enter to add">
            <div style={s.classInputRow}>
              <input
                style={s.input}
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addInterest();
                  }
                }}
                placeholder="hiking"
              />
              <button style={s.secondaryBtn} onClick={addInterest}>
                Add
              </button>
            </div>
            {filteredSuggestions.length > 0 && interestInput && (
              <div style={s.chips}>
                {filteredSuggestions.map((s) => (
                  <button
                    key={s}
                    style={s.suggestedChip}
                    onClick={() => {
                      setInterestInput("");
                      setForm((curr) => ({
                        ...curr,
                        interests: [...curr.interests, s],
                      }));
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {form.interests.length > 0 && (
              <div style={s.chips}>
                {form.interests.map((i) => (
                  <button
                    key={i}
                    style={s.classChip}
                    onClick={() => removeInterest(i)}
                  >
                    {i} x
                  </button>
                ))}
              </div>
            )}
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

          <Field label="Profile Picture">
            <div style={s.avatarUploadContainer}>
              <div style={s.avatarPreviewWrapper}>
                {avatarPreview ? (
                  avatarPreview.startsWith("http") ||
                  avatarPreview.startsWith("data:") ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                        fontSize: 28,
                        fontWeight: 700,
                        color: "var(--uwWhite)",
                      }}
                    >
                      {avatarPreview}
                    </div>
                  )
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      color: "#999",
                    }}
                  >
                    No image
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                style={s.fileInput}
                id="avatarInput"
              />
              <label htmlFor="avatarInput" style={s.uploadBtn}>
                Choose image
              </label>
            </div>
          </Field>

          <Field label="Bio">
            <textarea
              style={{ ...s.input, minHeight: 84, resize: "vertical" }}
              value={form.bio}
              onChange={(e) =>
                setForm((curr) => ({ ...curr, bio: e.target.value }))
              }
              placeholder="What are you looking for on campus?"
            />
          </Field>

          {error && <p style={s.error}>{error}</p>}

          <div style={s.actions}>
            <button style={s.ghostBtn} onClick={onCancel}>
              Cancel
            </button>
            <button
              style={{ ...s.primaryBtn, opacity: hasChanges ? 1 : 0.55 }}
              onClick={handleSave}
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    background: "var(--uwGrayLightest)",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    background: "var(--uwWhite)",
    borderBottom: "1px solid var(--uwGrayLight)",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  headerInner: {
    maxWidth: 1040,
    margin: "0 auto",
    padding: "14px 28px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoRow: { display: "flex", alignItems: "center", gap: 10 },
  logo: {
    width: 32,
    height: 32,
    background: "var(--uwRed)",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--uwWhite)",
    fontSize: 16,
    fontWeight: 700,
  },
  appName: { fontWeight: 700, fontSize: 18, color: "var(--uwBlack)" },
  backBtn: {
    padding: "7px 16px",
    border: "1px solid var(--uwGrayLight)",
    borderRadius: 8,
    background: "var(--uwWhite)",
    fontSize: 13,
    cursor: "pointer",
    color: "#666",
  },
  body: {
    flex: 1,
    width: "100%",
    maxWidth: 1040,
    margin: "0 auto",
    padding: 28,
    boxSizing: "border-box",
  },
  card: {
    background: "var(--uwWhite)",
    borderRadius: 16,
    border: "1px solid var(--uwGrayLight)",
    padding: 24,
    maxWidth: 760,
    margin: "0 auto",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 2fr",
    gap: 12,
  },
  fieldHeader: {
    display: "flex",
    gap: 8,
    alignItems: "baseline",
    marginBottom: 6,
  },
  label: { fontSize: 14, fontWeight: 600 },
  hint: { fontSize: 12, color: "#999" },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "0.5px solid var(--uwGrayLight)",
    borderRadius: 8,
    fontSize: 14,
    boxSizing: "border-box",
    background: "var(--uwGrayLightest)",
    outline: "none",
  },
  classInputRow: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 8,
  },
  secondaryBtn: {
    padding: "0 16px",
    border: "1px solid var(--uwGrayLight)",
    borderRadius: 8,
    background: "var(--uwWhite)",
    fontSize: 13,
    cursor: "pointer",
  },
  avatarUploadContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    alignItems: "center",
  },
  avatarPreviewWrapper: {
    width: 120,
    height: 120,
    borderRadius: "50%",
    background: "var(--uwRed)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--uwWhite)",
    fontSize: 18,
    fontWeight: 700,
    overflow: "hidden",
    border: "2px solid var(--uwGrayLight)",
  },
  fileInput: {
    display: "none",
  },
  uploadBtn: {
    padding: "8px 16px",
    border: "1px solid var(--uwRed)",
    borderRadius: 8,
    background: "var(--uwWhite)",
    color: "var(--uwRed)",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    textAlign: "center",
  },
  chips: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  chip: {
    padding: "6px 14px",
    borderRadius: 20,
    border: "0.5px solid var(--uwGrayLight)",
    background: "var(--uwWhite)",
    fontSize: 13,
    cursor: "pointer",
    color: "var(--uwGrayDark)",
  },
  chipActive: {
    background: "var(--uwRed)",
    borderColor: "var(--uwRedDark)",
    color: "var(--uwWhite)",
  },
  classChip: {
    padding: "6px 12px",
    borderRadius: 20,
    border: "0.5px solid var(--uwGrayLight)",
    background: "var(--uwGrayLightest)",
    fontSize: 13,
    cursor: "pointer",
    color: "#444",
  },
  suggestedChip: {
    padding: "6px 12px",
    borderRadius: 20,
    border: "1px solid var(--uwRed)",
    background: "var(--uwRedLight)",
    fontSize: 13,
    cursor: "pointer",
    color: "var(--uwRedDark)",
  },
  error: {
    color: "var(--uwRed)",
    margin: "0 0 12px",
    fontSize: 13,
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 8,
  },
  ghostBtn: {
    padding: "10px 16px",
    border: "1px solid var(--uwGrayLight)",
    borderRadius: 8,
    background: "var(--uwWhite)",
    fontSize: 14,
    cursor: "pointer",
    color: "#666",
  },
  primaryBtn: {
    padding: "10px 16px",
    border: "none",
    borderRadius: 8,
    background: "var(--uwRed)",
    color: "var(--uwWhite)",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
};
