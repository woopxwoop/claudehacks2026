import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "cc_messages";

export function loadConversations() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveConversations(convs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(convs));
}

export function startConversation(studentId) {
  const convs = loadConversations();
  if (!convs[studentId]) {
    convs[studentId] = [];
    saveConversations(convs);
  }
}

export function conversationCount() {
  return Object.keys(loadConversations()).length;
}

export default function MessagesView({
  me,
  students,
  initialStudentId,
  initialDraft = "",
  onBack,
}) {
  const [convs, setConvs] = useState(loadConversations);
  const [activeId, setActiveId] = useState(initialStudentId ?? null);
  const [draft, setDraft] = useState(initialDraft);
  const bottomRef = useRef(null);

  const studentMap = Object.fromEntries(students.map((s) => [s.id, s]));
  const convIds = Object.keys(convs).filter((id) => studentMap[id]);

  // Ensure the initial conversation entry exists
  useEffect(() => {
    if (initialStudentId && !convs[initialStudentId]) {
      const next = { ...convs, [initialStudentId]: [] };
      setConvs(next);
      saveConversations(next);
    }
    if (!activeId && convIds.length) setActiveId(convIds[0]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [convs, activeId]);

  useEffect(() => {
    setDraft(initialDraft || "");
  }, [initialDraft, initialStudentId]);

  const send = () => {
    if (!draft.trim() || !activeId) return;
    const msg = { from: "me", text: draft.trim(), ts: Date.now() };
    const next = { ...convs, [activeId]: [...(convs[activeId] || []), msg] };
    setConvs(next);
    saveConversations(next);
    setDraft("");
  };

  const activeStudent = activeId ? studentMap[activeId] : null;
  const activeMessages = activeId ? convs[activeId] || [] : [];

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.headerInner}>
          <div style={s.logoRow}>
            <span style={s.appName}>Campus Connect</span>
          </div>
          <button style={s.backBtn} onClick={onBack}>
            ← Back to feed
          </button>
        </div>
      </div>

      <div style={s.body}>
        {convIds.length === 0 ? (
          <div style={s.emptyState}>
            <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
              No conversations yet
            </p>
            <p style={{ color: "#888", fontSize: 14, marginBottom: 24 }}>
              Open someone's profile and hit "Message" to start chatting.
            </p>
            <button style={s.browseBtn} onClick={onBack}>
              Browse people
            </button>
          </div>
        ) : (
          <div style={s.layout}>
            {/* Sidebar */}
            <div style={s.sidebar}>
              {convIds.map((id) => {
                const student = studentMap[id];
                if (!student) return null;
                const msgs = convs[id] || [];
                const last = msgs[msgs.length - 1];
                return (
                  <div
                    key={id}
                    style={{
                      ...s.convItem,
                      ...(activeId === id ? s.convItemActive : {}),
                    }}
                    onClick={() => setActiveId(id)}
                  >
                    <StudentAvatar student={student} size={42} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={s.convName}>{student.name}</p>
                      <p style={s.convPreview}>
                        {last ? last.text : "Say hi!"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chat panel */}
            <div style={s.chatPanel}>
              {activeStudent ? (
                <>
                  <div style={s.chatHeader}>
                    <StudentAvatar student={activeStudent} size={36} />
                    <div>
                      <p style={s.chatName}>{activeStudent.name}</p>
                      <p style={s.chatMeta}>
                        {activeStudent.year} · {activeStudent.major}
                      </p>
                    </div>
                  </div>

                  <div style={s.messages}>
                    {activeMessages.length === 0 && (
                      <p style={s.emptyChat}>
                        Send a message to start the conversation.
                      </p>
                    )}
                    {activeMessages.map((msg, i) => (
                      <div
                        key={i}
                        style={{
                          ...s.bubble,
                          ...(msg.from === "me" ? s.bubbleMe : s.bubbleThem),
                        }}
                      >
                        {msg.text}
                      </div>
                    ))}
                    <div ref={bottomRef} />
                  </div>

                  <div style={s.inputRow}>
                    <input
                      style={s.input}
                      placeholder={`Message ${activeStudent.name}…`}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          send();
                        }
                      }}
                    />
                    <button
                      style={{ ...s.sendBtn, opacity: draft.trim() ? 1 : 0.4 }}
                      onClick={send}
                    >
                      Send
                    </button>
                  </div>
                </>
              ) : (
                <div style={s.emptyChat}>Select a conversation.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StudentAvatar({ student, size }) {
  const [imgErr, setImgErr] = useState(false);
  const isUrl = student.avatar?.startsWith("http");
  if (isUrl && !imgErr) {
    return (
      <img
        src={student.avatar}
        alt={student.name}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
        }}
        onError={() => setImgErr(true)}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "var(--uwRed)",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--uwWhite)",
        fontSize: size * 0.35,
        fontWeight: 700,
      }}
    >
      {student.name.slice(0, 2).toUpperCase()}
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
    maxWidth: 1040,
    width: "100%",
    margin: "0 auto",
    padding: "28px",
    boxSizing: "border-box",
  },

  emptyState: { textAlign: "center", padding: "100px 0" },
  browseBtn: {
    padding: "10px 24px",
    background: "var(--uwRed)",
    color: "var(--uwWhite)",
    border: "none",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },

  layout: {
    display: "flex",
    gap: 0,
    background: "var(--uwWhite)",
    borderRadius: 16,
    border: "1px solid var(--uwGrayLight)",
    overflow: "hidden",
    height: "calc(100vh - 140px)",
  },

  sidebar: {
    width: 280,
    flexShrink: 0,
    borderRight: "1px solid var(--uwGrayLight)",
    overflowY: "auto",
  },
  convItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 16px",
    cursor: "pointer",
    borderBottom: "0.5px solid var(--uwGrayLight)",
  },
  convItemActive: { background: "var(--uwGrayLightest)" },
  convName: {
    margin: 0,
    fontSize: 14,
    fontWeight: 600,
    color: "var(--uwBlack)",
  },
  convPreview: {
    margin: "2px 0 0",
    fontSize: 12,
    color: "#999",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  chatPanel: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0 },
  chatHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "16px 20px",
    borderBottom: "1px solid var(--uwGrayLight)",
  },
  chatName: { margin: 0, fontSize: 15, fontWeight: 600 },
  chatMeta: { margin: "2px 0 0", fontSize: 12, color: "#888" },

  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  emptyChat: {
    color: "#bbb",
    fontSize: 14,
    textAlign: "center",
    margin: "auto",
  },
  bubble: {
    maxWidth: "70%",
    padding: "10px 14px",
    borderRadius: 16,
    fontSize: 14,
    lineHeight: 1.5,
    wordBreak: "break-word",
  },
  bubbleMe: {
    alignSelf: "flex-end",
    background: "var(--uwRed)",
    color: "var(--uwWhite)",
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    alignSelf: "flex-start",
    background: "var(--uwGrayLightest)",
    color: "var(--uwBlack)",
    borderBottomLeftRadius: 4,
  },

  inputRow: {
    display: "flex",
    gap: 10,
    padding: "16px 20px",
    borderTop: "1px solid var(--uwGrayLight)",
  },
  input: {
    flex: 1,
    padding: "10px 14px",
    border: "1px solid var(--uwGrayLight)",
    borderRadius: 24,
    fontSize: 14,
    outline: "none",
    background: "var(--uwGrayLightest)",
  },
  sendBtn: {
    padding: "10px 20px",
    background: "var(--uwRed)",
    color: "var(--uwWhite)",
    border: "none",
    borderRadius: 24,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
};
