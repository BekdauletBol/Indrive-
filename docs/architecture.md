# Solution Architecture — inVision U Candidate Screening AI

## Core idea
Replace manual first-pass screening with a transparent, explainable scoring system that surfaces the strongest candidates while explicitly preserving human authority over all final decisions.

## Design principles
1. **Explain every score** — the committee must understand why a candidate ranked where they did.
2. **Path traveled over polish** — weight growth trajectory and equity factors alongside raw achievement.
3. **Detect inauthenticity early** — flag AI-generated essays before they reach human reviewers.
4. **Human-in-the-loop always** — the system produces a ranked shortlist; humans make admissions decisions.

## Components

### 1. FastAPI scoring backend (`/backend`)
- `POST /score` — scores a single candidate, returns breakdown + plain-language explanations
- `POST /score/batch` — scores up to 50 candidates, returns sorted shortlist
- Stateless in Stage 1 (no DB); Stage 2 adds PostgreSQL persistence

### 2. React admin dashboard (`/frontend`)
- Candidate table with mini score bars per dimension
- Click-through detail panel: score breakdown, per-dimension explanation, flags
- "Add candidate" form that hits the live API

### 3. Telegram bot (`/backend/bot.py`)
- Conversational intake: collects name, age, motivation, essay, activities, first-gen flag
- Submits to the scoring API
- Returns a plain-language result to the candidate immediately
- No data stored beyond the API call (Stage 1)

## Scoring model

```
Total score (0–100) =
    leadership_potential × 30 +
    motivation_clarity   × 25 +
    growth_trajectory    × 20 +
    communication        × 15 +
    ai_authenticity      × 10
```

### Leadership potential (0–1)
- Activity count (capped at 4): weight 40%
- Award count (capped at 3): weight 20%
- Essay keyword hits (led, founded, organized…): weight 40%

### Motivation clarity (0–1)
- Essay + motivation statement word count / 300: weight 40%
- Concrete goal words (goal, plan, because, dream…) capped at 4: weight 60%

### Growth trajectory (0–1)
- Resilience/challenge keywords in essay: weight 80%
- First-generation student equity bonus: +15% (capped at 1.0)

### Communication (0–1)
- Vocabulary richness (unique words / total words): weight 50%
- Essay length score (word count / 500, capped): weight 50%

### Essay authenticity (0–1)
- AI phrase detection: −12% per matching phrase
- Sentence-length uniformity penalty: up to −30%
- Score of 1 = fully human, 0 = highly likely AI-generated

## Fairness safeguards
- No demographic, racial, or socioeconomic proxies
- First-generation bonus is explicitly documented and auditable
- Every score includes plain-language explanation
- Flags for AI essays trigger human review, not automatic rejection
- Minor applicants (under 16) are flagged for extra data protection

## Planned Stage 2 improvements
- Replace keyword scoring with a fine-tuned sentence-transformer model
- Replace heuristic AI detection with a RoBERTa-based classifier
- Add PostgreSQL for persistent candidate records and audit trail
- Add video interview transcription (Whisper) + multimodal signals
- Committee override UI: log reason, update final decision independently of AI score
- Bias audit on first real applicant cohort before any production use
