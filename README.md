# inVision U — Intelligent Candidate Selection Support System
**Decentrathon 5.0 · AI inDrive track**

> AI-powered screening tool that scores university applicants on leadership potential, motivation, growth trajectory, communication quality, and essay authenticity — giving the admissions committee a transparent, explainable shortlist without replacing human judgment.

---

## What it does

- Accepts candidate applications (essay, motivation statement, activities, GPA) via API or web dashboard
- Returns a score breakdown across 5 dimensions with plain-language explanations
- Flags AI-generated essays and equity factors (first-generation students)
- Produces a ranked shortlist — all decisions remain with the human committee

## Architecture

```
React dashboard  ──┐
Telegram bot     ──┤──▶  FastAPI backend  ──▶  Scoring engine  ──▶  PostgreSQL / Redis
Candidate portal ──┘                               │
                                            SHAP-style explanation
```

