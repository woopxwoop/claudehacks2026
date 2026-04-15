import { useState } from "react";

export default function FeelingLucky({ students, me, onMessage, onNavigate }) {
  const [index, setIndex] = useState(0);
  const [swiped, setSwiped] = useState([]);
  const [matches, setMatches] = useState([]);

  const current = students[index];
  const isDone = index >= students.length;

  const handleSwipe = (direction) => {
    if (isDone) return;

    // Add to swiped history
    setSwiped([...swiped, { id: current.id, direction }]);

    // If "match" (right swipe), add to matches
    if (direction === "right") {
      setMatches([...matches, current.id]);
    }

    // Move to next card
    setIndex(index + 1);
  };

  const handleMessage = () => {
    onMessage(current.id);
  };

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => onNavigate("feed")}>
          ← Back
        </button>
        <h1 style={s.title}>Feeling Lucky</h1>
        <div style={{ width: 40 }} />
      </div>

      {/* Card Stack */}
      <div style={s.stackContainer}>
        {isDone ? (
          <div style={s.emptyState}>
            <p style={s.doneText}>You've seen everyone!</p>
            <p style={s.matchCount}>
              {matches.length} match{matches.length !== 1 ? "es" : ""} so far
            </p>
            <button style={s.resetBtn} onClick={() => setIndex(0)}>
              Start over
            </button>
          </div>
        ) : (
          <>
            {/* Show next few cards in stack for depth */}
            {[index, index + 1, index + 2].map(
              (i) =>
                i < students.length && (
                  <div
                    key={students[i].id}
                    style={{
                      ...s.card,
                      transform:
                        i === index
                          ? "translateY(0px) translateX(0px) scale(1)"
                          : i < index
                            ? "translateX(-120%) translateY(0px) scale(0.95)"
                            : `translateY(${(i - index) * 12}px) translateX(0px) scale(${1 - (i - index) * 0.02})`,
                      zIndex: 100 - (i - index),
                      opacity: i === index ? 1 : 0,
                      pointerEvents: i === index ? "auto" : "none",
                      transition:
                        i === index
                          ? "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)"
                          : "all 0.5s ease-in",
                    }}
                  >
                    <FeelingLuckyCard
                      student={students[i]}
                      isActive={i === index}
                      onSwipe={i === index ? handleSwipe : null}
                    />
                  </div>
                ),
            )}
          </>
        )}
      </div>

      {/* Controls */}
      {!isDone && (
        <div style={s.controls}>
          <button style={s.nextBtn} onClick={() => handleSwipe("left")}>
            Next
          </button>
          <button style={s.messageBtn} onClick={handleMessage}>
            Message
          </button>
        </div>
      )}

      {/* Progress */}
      {!isDone && (
        <div style={s.progress}>
          <div style={s.progressBar}>
            <div
              style={{
                ...s.progressFill,
                width: `${((index + 1) / students.length) * 100}%`,
              }}
            />
          </div>
          <p style={s.progressText}>
            {index + 1} of {students.length}
          </p>
        </div>
      )}
    </div>
  );
}

function FeelingLuckyCard({ student, isActive, onSwipe }) {
  const [dragX, setDragX] = useState(0);
  const [dragStart, setDragStart] = useState(null);

  const { name, year, major, classes, interests, bio, avatar, matchScore } =
    student;

  const handleMouseDown = (e) => {
    if (!isActive || !onSwipe) return;
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!dragStart) return;
    const delta = e.clientX - dragStart.x;
    setDragX(delta);
  };

  const handleMouseUp = () => {
    if (!dragStart) return;
    const threshold = 80;

    if (dragX > threshold) {
      onSwipe("right");
    } else if (dragX < -threshold) {
      onSwipe("left");
    }

    setDragStart(null);
    setDragX(0);
  };

  const handleTouchStart = (e) => {
    if (!isActive || !onSwipe) return;
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e) => {
    if (!dragStart) return;
    const touch = e.touches[0];
    const delta = touch.clientX - dragStart.x;
    setDragX(delta);
  };

  const handleTouchEnd = () => {
    if (!dragStart) return;
    const threshold = 80;

    if (dragX > threshold) {
      onSwipe("right");
    } else if (dragX < -threshold) {
      onSwipe("left");
    }

    setDragStart(null);
    setDragX(0);
  };

  const rotation = dragX / 30;
  const bgColor =
    dragX > 0
      ? `rgba(220, 53, 69, ${Math.abs(dragX) / 200})`
      : dragX < 0
        ? `rgba(100, 100, 100, ${Math.abs(dragX) / 200})`
        : "transparent";

  return (
    <div
      style={{
        ...s.cardContent,
        cursor: isActive ? "grab" : "default",
        transform: `rotate(${rotation}deg) translateX(${dragX}px)`,
        backgroundColor: bgColor,
        transition: dragStart
          ? "none"
          : "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        opacity: isActive ? 1 : 0.5,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Avatar Banner (full-width, top) */}
      {avatar && (
        <div style={s.avatarBanner}>
          {avatar.startsWith("http") ? (
            <img
              src={avatar}
              alt={name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div style={s.avatarPlaceholder}>{avatar}</div>
          )}
        </div>
      )}

      {/* Content */}
      <div style={s.cardBody}>
        <div style={s.nameRow}>
          <h2 style={s.cardName}>{name}</h2>
          {matchScore && matchScore > 70 && (
            <span style={s.matchScoreBadge}>{matchScore}%</span>
          )}
        </div>

        <p style={s.cardMeta}>
          {year} • {major}
        </p>

        {bio && <p style={s.cardBio}>{bio}</p>}

        {classes.length > 0 && (
          <div style={s.section}>
            <p style={s.sectionLabel}>Classes</p>
            <div style={s.chipRow}>
              {classes.slice(0, 3).map((c) => (
                <span key={c} style={s.classChip}>
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {interests.length > 0 && (
          <div style={s.section}>
            <p style={s.sectionLabel}>Interests</p>
            <div style={s.chipRow}>
              {interests.slice(0, 4).map((i) => (
                <span key={i} style={s.interestChip}>
                  {i}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Swipe Hints */}
      {dragX > 30 && (
        <div style={{ ...s.swipeHint, ...s.swipeHintRight }}>♥ Match</div>
      )}
      {dragX < -30 && (
        <div style={{ ...s.swipeHint, ...s.swipeHintLeft }}>Pass</div>
      )}
    </div>
  );
}

const s = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    background: "var(--uwWhite)",
    padding: "16px",
    gap: 16,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 8,
    borderBottom: "0.5px solid var(--uwGrayLight)",
  },
  backBtn: {
    background: "none",
    border: "none",
    fontSize: 16,
    cursor: "pointer",
    color: "var(--uwGrayDark)",
    fontWeight: 500,
  },
  title: {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
    color: "var(--uwGrayDark)",
  },
  stackContainer: {
    flex: 1,
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 80,
  },
  card: {
    position: "absolute",
    width: "100%",
    maxWidth: 360,
    height: "100%",
    maxHeight: 600,
  },
  cardContent: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: "0 24px 24px 24px",
    background: "var(--uwWhite)",
    border: "1px solid var(--uwGrayLight)",
    borderRadius: 20,
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
    position: "relative",
    overflow: "hidden",
    userSelect: "none",
  },
  avatarBanner: {
    width: "calc(100% + 48px)",
    height: 140,
    background: "var(--uwRed)",
    overflow: "hidden",
    marginLeft: -24,
    marginTop: -24,
    marginRight: -24,
    marginBottom: 16,
    borderRadius: "20px 20px 0 0",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    background: "linear-gradient(135deg, var(--uwRed) 0%, #8f0108 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--uwWhite)",
    fontSize: 48,
    fontWeight: 700,
  },
  cardBody: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    paddingTop: 0,
  },
  nameRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: 8,
  },
  cardName: {
    margin: 0,
    fontSize: 28,
    fontWeight: 700,
    color: "var(--uwGrayDark)",
  },
  matchScoreBadge: {
    background: "var(--uwRedLight)",
    color: "var(--uwRedDark)",
    padding: "4px 10px",
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
  },
  cardMeta: {
    margin: "0",
    fontSize: 14,
    color: "#888",
  },
  cardBio: {
    margin: "8px 0 0",
    fontSize: 14,
    color: "#555",
    lineHeight: 1.5,
  },
  section: {
    marginTop: 8,
  },
  sectionLabel: {
    margin: "0 0 6px",
    fontSize: 11,
    fontWeight: 600,
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chipRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
  },
  classChip: {
    padding: "4px 10px",
    borderRadius: 14,
    background: "var(--uwGrayLightest)",
    fontSize: 12,
    color: "#555",
    border: "0.5px solid var(--uwGrayLight)",
  },
  interestChip: {
    padding: "4px 10px",
    borderRadius: 14,
    background: "var(--uwRedLight)",
    fontSize: 12,
    color: "var(--uwRedDark)",
    fontWeight: 500,
  },
  swipeHint: {
    position: "absolute",
    fontSize: 32,
    fontWeight: 700,
    opacity: 0,
    transform: "rotate(-25deg)",
    transition: "opacity 0.2s",
  },
  swipeHintRight: {
    top: 20,
    right: 20,
    color: "rgba(220, 53, 69, 0.7)",
    opacity: 1,
  },
  swipeHintLeft: {
    top: 20,
    left: 20,
    color: "rgba(100, 100, 100, 0.7)",
    opacity: 1,
  },
  controls: {
    display: "flex",
    justifyContent: "center",
    gap: 12,
    paddingBottom: 16,
    borderTop: "0.5px solid var(--uwGrayLight)",
    paddingTop: 16,
  },
  nextBtn: {
    flex: 1,
    maxWidth: 180,
    padding: "12px 24px",
    border: "1.5px solid var(--uwGrayLight)",
    borderRadius: 10,
    background: "var(--uwWhite)",
    color: "var(--uwGrayDark)",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  messageBtn: {
    flex: 1,
    maxWidth: 180,
    padding: "12px 24px",
    border: "none",
    borderRadius: 10,
    background: "var(--uwRed)",
    color: "var(--uwWhite)",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  progress: {
    paddingBottom: 8,
  },
  progressBar: {
    height: 4,
    background: "var(--uwGrayLightest)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "var(--uwRed)",
    transition: "width 0.3s ease",
  },
  progressText: {
    margin: "8px 0 0",
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
  emptyState: {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    alignItems: "center",
  },
  doneText: {
    fontSize: 20,
    fontWeight: 600,
    color: "var(--uwGrayDark)",
    margin: 0,
  },
  matchCount: {
    fontSize: 14,
    color: "#888",
    margin: 0,
  },
  resetBtn: {
    padding: "11px 24px",
    background: "var(--uwRed)",
    color: "var(--uwWhite)",
    border: "none",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
};
