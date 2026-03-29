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

## Scoring dimensions

| Dimension | Weight | How it's calculated |
|---|---|---|
| Leadership potential | 30% | Essay keyword analysis + activities + awards |
| Motivation clarity | 25% | Specificity of goals in motivation + essay |
| Growth trajectory | 20% | Challenge/resilience language; +equity bonus for first-gen |
| Communication | 15% | Vocabulary richness + essay length |
| Essay authenticity | 10% | AI-phrase detection + sentence uniformity analysis |

**Explainability**: every score includes a plain-language explanation per dimension. No black boxes.

## How to run

### Option 1 — Docker (recommended)
```bash
git clone <repo-url>
cd invisionu
docker-compose up --build
```
- Frontend: http://localhost:5173
- API docs: http://localhost:8000/docs

### Option 2 — Local dev

**Backend**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

## API usage

### Score one candidate
```bash
curl -X POST http://localhost:8000/score \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Aisha Bekova",
    "age": 17,
    "essay": "I founded a robotics club at my school after noticing students had no space to build things...",
    "motivation": "I want to become a social entrepreneur who solves real problems in Central Asia.",
    "activities": ["Robotics club founder", "School newspaper editor"],
    "awards": ["Regional olympiad 2nd place"],
    "first_gen": true
  }'
```

### Response
```json
{
  "id": "uuid",
  "name": "Aisha Bekova",
  "total_score": 78.5,
  "shortlist": true,
  "breakdown": {
    "leadership_potential": 0.85,
    "motivation_clarity": 0.80,
    "growth_trajectory": 0.75,
    "communication": 0.70,
    "ai_authenticity": 0.92
  },
  "explanation": {
    "leadership_potential": "Strong signals of initiative — essay references concrete leadership actions and activities.",
    "growth_trajectory": "Strong narrative of overcoming challenges. Equity bonus: first-generation student.",
    "ai_authenticity": "Essay reads as authentic; low AI-generated content indicators."
  },
  "flags": [],
  "timestamp": "2026-03-29T..."
}
```

### Batch scoring
```bash
curl -X POST http://localhost:8000/score/batch \
  -H "Content-Type: application/json" \
  -d '[{...candidate1}, {...candidate2}]'
```

## Data used

- Candidate-provided application data only (essay, motivation, activities, awards, GPA, age, region)
- No social media scraping, no demographic proxies
- Personal data is not persisted in Stage 1 (stateless scoring)
- Full GDPR/PDPA compliance planned for Stage 2

## Hard constraints met

- ✅ AI does not make final admission decisions — humans always review
- ✅ No demographic/racial/socioeconomic proxies used
- ✅ Explainability built in from day one (per-dimension plain-language reasons)
- ✅ Equity-aware: first-generation bonus in growth trajectory score
- ✅ No invasive data collection

## Limitations & next steps

- Current NLP scoring uses rule-based keyword analysis — Stage 2 will integrate a fine-tuned transformer model
- AI detection is heuristic-based; a dedicated classifier (e.g. fine-tuned RoBERTa) will improve accuracy
- Video interview analysis (multimodal) is planned but not yet implemented
- Bias audit on real applicant data is required before production use

## Dependencies

- Python 3.11, FastAPI, Pydantic, Uvicorn
- React 18, Vite
- Docker + docker-compose (optional)

## Team

Decentrathon 5.0 — AI inDrive track
