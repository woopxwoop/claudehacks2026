import { useState } from "react";
import OnboardingStep from "./components/OnboardingStep";
import FeedStep from "./components/FeedStep";

// ── Agree on this schema first — both people depend on it ─────────────────
export const EMPTY_STUDENT = {
  id: "",
  name: "",
  year: "",        // Freshman | Sophomore | Junior | Senior | Grad
  major: "",
  classes: [],     // ["CS 301", "MATH 241"]
  interests: [],   // ["hiking", "startups", "jazz"]
  lookingFor: [],  // "study buddy" | "project collab" | "join a club" | "just meet people"
  bio: "",
  avatar: "",      // initials fallback e.g. "JD"
  matchScore: 0,   // 0-100, filled by Claude
  matchReason: "", // ≤15 words, filled by Claude
};

// ── Claude matching prompt (Person A owns this) ───────────────────────────
export const MATCH_PROMPT = (me, others) => `
You are a campus connection algorithm. Rank these students by connection potential with the user.

User profile:
${JSON.stringify(me, null, 2)}

Other students:
${JSON.stringify(others, null, 2)}

Return ONLY a JSON array (no markdown) of all students sorted best-to-worst match.
Add two fields to each:
- matchScore: integer 0-100
- matchReason: string, max 12 words, conversational (e.g. "Both in CS 301 and love startups")

Prioritize: shared classes > shared interests > compatible lookingFor > same year.
`;

// ── Seeded fake students (Person A owns this) ─────────────────────────────
export const SEED_STUDENTS = [
  { id: "1", name: "Maya Chen", year: "Junior", major: "Computer Science", classes: ["CS 301", "CS 421"], interests: ["startups", "rock climbing", "coffee"], lookingFor: ["project collab", "just meet people"], bio: "Building a fintech app, always down for a climb.", avatar: "MC", matchScore: 0, matchReason: "" },
  { id: "2", name: "Jordan Lee", year: "Sophomore", major: "Economics", classes: ["ECON 201", "MATH 241"], interests: ["jazz", "investing", "running"], lookingFor: ["study buddy", "just meet people"], bio: "Jazz pianist who thinks in spreadsheets.", avatar: "JL", matchScore: 0, matchReason: "" },
  { id: "3", name: "Sam Okafor", year: "Senior", major: "Mechanical Engineering", classes: ["ME 401", "PHYS 301"], interests: ["robotics", "hiking", "cooking"], lookingFor: ["project collab", "join a club"], bio: "Building a Mars rover for senior capstone.", avatar: "SO", matchScore: 0, matchReason: "" },
  { id: "4", name: "Priya Nair", year: "Freshman", major: "Psychology", classes: ["PSYC 101", "BIO 110"], interests: ["yoga", "reading", "mental health advocacy"], lookingFor: ["study buddy", "join a club"], bio: "Want to start a mindfulness club on campus.", avatar: "PN", matchScore: 0, matchReason: "" },
  { id: "5", name: "Alex Rivera", year: "Junior", major: "Computer Science", classes: ["CS 301", "CS 350", "MATH 241"], interests: ["open source", "music production", "startups"], lookingFor: ["project collab", "study buddy"], bio: "OSS contributor, looking to build something real.", avatar: "AR", matchScore: 0, matchReason: "" },
  { id: "6", name: "Taylor Kim", year: "Sophomore", major: "Design", classes: ["DES 201", "ART 150"], interests: ["UX", "photography", "hiking"], lookingFor: ["project collab", "just meet people"], bio: "Designer looking for engineers to build with.", avatar: "TK", matchScore: 0, matchReason: "" },
  { id: "7", name: "Chris Wang", year: "Grad", major: "Data Science", classes: ["DS 501", "STAT 410"], interests: ["machine learning", "chess", "coffee"], lookingFor: ["project collab", "study buddy"], bio: "PhD student, happy to mentor undergrads.", avatar: "CW", matchScore: 0, matchReason: "" },
  { id: "8", name: "Dana Osei", year: "Junior", major: "Biology", classes: ["BIO 301", "CHEM 220"], interests: ["research", "tennis", "cooking"], lookingFor: ["study buddy", "join a club"], bio: "Pre-med, obsessed with biochemistry.", avatar: "DO", matchScore: 0, matchReason: "" },
  { id: "9", name: "Riley Zhang", year: "Freshman", major: "Undecided", classes: ["MATH 141", "ENGL 101", "CS 101"], interests: ["gaming", "anime", "startups"], lookingFor: ["just meet people", "join a club"], bio: "Figuring it out, down for anything.", avatar: "RZ", matchScore: 0, matchReason: "" },
  { id: "10", name: "Morgan Ellis", year: "Senior", major: "Economics", classes: ["ECON 401", "STAT 301"], interests: ["policy", "running", "jazz"], lookingFor: ["just meet people", "project collab"], bio: "Thesis on housing policy. Send recs.", avatar: "ME", matchScore: 0, matchReason: "" },
  { id: "11", name: "Nia Brooks", year: "Sophomore", major: "Computer Science", classes: ["CS 201", "MATH 241", "CS 301"], interests: ["hackathons", "startups", "photography"], lookingFor: ["project collab", "study buddy"], bio: "Won two hackathons, hungry for the third.", avatar: "NB", matchScore: 0, matchReason: "" },
  { id: "12", name: "Omar Farouk", year: "Junior", major: "Physics", classes: ["PHYS 301", "MATH 341"], interests: ["astronomy", "chess", "hiking"], lookingFor: ["study buddy", "join a club"], bio: "Stargazing club president. Always looking up.", avatar: "OF", matchScore: 0, matchReason: "" },
];

// ── App shell ─────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState("onboarding"); // onboarding | feed
  const [me, setMe] = useState(null);
  const [rankedStudents, setRankedStudents] = useState([]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg, #f8f7f4)", fontFamily: "system-ui, sans-serif" }}>
      {step === "onboarding" && (
        <OnboardingStep
          onDone={(profile, ranked) => {
            setMe(profile);
            setRankedStudents(ranked);
            setStep("feed");
          }}
        />
      )}
      {step === "feed" && (
        <FeedStep
          me={me}
          students={rankedStudents}
        />
      )}
    </div>
  );
}
