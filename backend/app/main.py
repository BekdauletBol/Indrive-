from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import re, math, uuid, datetime

app = FastAPI(title="inVision U Candidate Scoring API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Schemas ─────────────────────────────────────────────────────────────────

class CandidateInput(BaseModel):
    name: str
    age: int = Field(..., ge=14, le=30)
    essay: str = Field(..., min_length=50)
    motivation: str = Field(..., min_length=20)
    activities: list[str] = []           # extracurriculars / projects
    gpa: Optional[float] = None          # 0.0 – 5.0 scale
    awards: list[str] = []
    first_gen: bool = False              # first-generation student
    region: Optional[str] = None

class ScoreBreakdown(BaseModel):
    leadership_potential: float
    motivation_clarity: float
    growth_trajectory: float
    communication: float
    ai_authenticity: float               # higher = more authentic

class CandidateResult(BaseModel):
    id: str
    name: str
    total_score: float                   # 0–100
    shortlist: bool
    breakdown: ScoreBreakdown
    explanation: dict[str, str]
    flags: list[str]
    timestamp: str

# ─── Scoring Engine ───────────────────────────────────────────────────────────

AI_PHRASES = [
    "in conclusion", "it is worth noting", "in today's world",
    "delve into", "multifaceted", "as an ai language model",
    "to sum up", "it goes without saying", "needless to say",
    "in the realm of", "elevate", "underscore the importance",
    "navigate the complexities", "foster", "leverage",
    "as we move forward", "it's important to note", "dive deep",
]

LEADERSHIP_KEYWORDS = [
    "led", "founded", "organized", "initiated", "created", "built",
    "launched", "managed", "volunteered", "mentored", "taught",
    "coordinated", "proposed", "solved", "improved",
]

GROWTH_KEYWORDS = [
    "overcame", "despite", "challenged", "struggled", "learned from",
    "changed", "grew", "failed", "tried again", "improved",
    "realized", "discovered", "unexpected",
]


def detect_ai_score(text: str) -> tuple[float, list[str]]:
    """Returns authenticity score (1=human, 0=AI) and triggered phrases."""
    lower = text.lower()
    hits = [p for p in AI_PHRASES if p in lower]
    
    # Sentence length uniformity (AI tends to be more uniform)
    sentences = [s.strip() for s in re.split(r'[.!?]', text) if len(s.strip()) > 10]
    if len(sentences) > 2:
        lengths = [len(s) for s in sentences]
        avg = sum(lengths) / len(lengths)
        variance = sum((l - avg) ** 2 for l in lengths) / len(lengths)
        uniformity_penalty = max(0, 0.3 - (variance / 2000))
    else:
        uniformity_penalty = 0

    penalty = min(1.0, len(hits) * 0.12 + uniformity_penalty)
    return round(max(0.0, 1.0 - penalty), 3), hits


def score_leadership(activities: list[str], awards: list[str], essay: str) -> float:
    lower = essay.lower()
    keyword_hits = sum(1 for k in LEADERSHIP_KEYWORDS if k in lower)
    activity_score = min(1.0, len(activities) / 4)
    award_score = min(1.0, len(awards) / 3)
    keyword_score = min(1.0, keyword_hits / 5)
    return round((activity_score * 0.4 + award_score * 0.2 + keyword_score * 0.4), 3)


def score_motivation(motivation: str, essay: str) -> float:
    combined = (motivation + " " + essay).lower()
    word_count = len(combined.split())
    specificity = min(1.0, word_count / 300)
    # Look for concrete goals or references
    concrete = sum(1 for w in ["because", "goal", "plan", "want to", "dream", "vision", "will"] if w in combined)
    return round(min(1.0, specificity * 0.4 + min(1.0, concrete / 4) * 0.6), 3)


def score_growth(essay: str, first_gen: bool) -> float:
    lower = essay.lower()
    hits = sum(1 for k in GROWTH_KEYWORDS if k in lower)
    base = min(1.0, hits / 4)
    bonus = 0.15 if first_gen else 0.0   # equity-aware: path traveled matters
    return round(min(1.0, base + bonus), 3)


def score_communication(essay: str) -> float:
    words = essay.split()
    word_count = len(words)
    if word_count < 50:
        return 0.2
    unique_ratio = len(set(w.lower() for w in words)) / word_count
    length_score = min(1.0, word_count / 500)
    return round((unique_ratio * 0.5 + length_score * 0.5), 3)


def build_explanation(breakdown: ScoreBreakdown, flags: list[str], first_gen: bool) -> dict[str, str]:
    expl = {}

    if breakdown.leadership_potential >= 0.7:
        expl["leadership_potential"] = "Strong signals of initiative — essay references concrete leadership actions and activities."
    elif breakdown.leadership_potential >= 0.4:
        expl["leadership_potential"] = "Some leadership indicators present; consider probing in interview."
    else:
        expl["leadership_potential"] = "Limited direct leadership evidence. May need further assessment."

    if breakdown.motivation_clarity >= 0.7:
        expl["motivation_clarity"] = "Motivation is specific and goal-oriented with clear reasoning."
    else:
        expl["motivation_clarity"] = "Motivation statement is vague or generic; deeper questioning advised."

    if breakdown.growth_trajectory >= 0.7:
        expl["growth_trajectory"] = "Strong narrative of overcoming challenges or personal development."
        if first_gen:
            expl["growth_trajectory"] += " Equity bonus applied: first-generation student."
    else:
        expl["growth_trajectory"] = "Limited evidence of growth narrative in the essay."

    if breakdown.ai_authenticity >= 0.8:
        expl["ai_authenticity"] = "Essay reads as authentic; low AI-generated content indicators."
    elif breakdown.ai_authenticity >= 0.5:
        expl["ai_authenticity"] = "Some AI-typical phrases detected. Recommend follow-up interview."
    else:
        expl["ai_authenticity"] = "High likelihood of AI-assisted writing. Manual review required."

    if flags:
        expl["flags"] = "Attention needed: " + "; ".join(flags)

    return expl


# ─── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "ok", "service": "inVision U Scoring API"}


@app.post("/score", response_model=CandidateResult)
def score_candidate(candidate: CandidateInput):
    # Individual dimension scores
    leadership = score_leadership(candidate.activities, candidate.awards, candidate.essay)
    motivation = score_motivation(candidate.motivation, candidate.essay)
    growth = score_growth(candidate.essay, candidate.first_gen)
    communication = score_communication(candidate.essay)
    ai_auth, ai_hits = detect_ai_score(candidate.essay + " " + candidate.motivation)

    breakdown = ScoreBreakdown(
        leadership_potential=leadership,
        motivation_clarity=motivation,
        growth_trajectory=growth,
        communication=communication,
        ai_authenticity=ai_auth,
    )

    # Weighted total (0–100)
    total = round(
        (leadership * 30 + motivation * 25 + growth * 20 + communication * 15 + ai_auth * 10),
        1,
    )

    flags = []
    if ai_auth < 0.5:
        flags.append(f"Possible AI-generated content ({len(ai_hits)} phrases detected)")
    if candidate.age < 16:
        flags.append("Minor — extra data protection applies")
    if not candidate.activities and not candidate.awards:
        flags.append("No activities or awards listed — essay is sole signal")

    explanation = build_explanation(breakdown, flags, candidate.first_gen)

    return CandidateResult(
        id=str(uuid.uuid4()),
        name=candidate.name,
        total_score=total,
        shortlist=total >= 60,
        breakdown=breakdown,
        explanation=explanation,
        flags=flags,
        timestamp=datetime.datetime.utcnow().isoformat(),
    )


@app.post("/score/batch", response_model=list[CandidateResult])
def score_batch(candidates: list[CandidateInput]):
    if len(candidates) > 50:
        raise HTTPException(status_code=400, detail="Max 50 candidates per batch")
    results = [score_candidate(c) for c in candidates]
    results.sort(key=lambda r: r.total_score, reverse=True)
    return results
