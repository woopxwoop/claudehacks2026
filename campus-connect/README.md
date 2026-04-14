# Campus Connect — Hackathon Scaffold

College email auth → Claude-ranked feed of students → intro message drafts.

## Setup (5 min)

```bash
npx create-react-app campus-connect
cd campus-connect
# replace src/ with these files
npm start
```

## API Key (local dev)

Add to `.env`:

```
REACT_APP_ANTHROPIC_KEY=sk-ant-...
```

Then uncomment the 3 header lines in both `OnboardingStep.jsx` and `ProfileModal.jsx`.

## File Split

```
src/
  App.jsx                        — schema, seed data, prompts, app shell
                                   ← BOTH read this, neither edits it mid-build
  components/
    OnboardingStep.jsx           — PERSON A (form + Claude matching)
    FeedStep.jsx                 — PERSON B (filter bar + card grid)
    StudentCard.jsx              — PERSON B
    ProfileModal.jsx             — PERSON B (profile view + intro drafting)
```

## Handoff Point

Person A calls `onDone(myProfile, rankedStudents[])` — that's the only interface between the two halves. Agree on EMPTY_STUDENT schema in App.jsx and don't touch it after that.

## Hour Plan

- **0:00–0:10** Both read App.jsx, agree on schema, scaffold repo
- **0:10–0:45** Parallel build (Person A: onboarding + Claude call; Person B: feed + cards + modal)
- **0:45–0:55** Integration — wire onDone, test end to end
- **0:55–1:00** Polish demo flow, make sure conflict highlights land

## Demo Flow

1. Fill onboarding form with a .edu email
2. Hit "Find my people" — show the loading state
3. Feed appears — ranked cards with match reason blurbs
4. Filter by "project collab" — show it narrowing
5. Click a card — open modal
6. Hit "Draft an intro message" — show Claude write it live
7. Copy and done

The match reason blurb ("Both in CS 301 and love startups") is the moment that sells it.

"We're using seeded in-memory data for the demo, but the real architecture is a graph database — students and interests as nodes, shared classes as edges. Claude ranks a pre-filtered shortlist, not the whole campus."
