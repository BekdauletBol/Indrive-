"""Quick smoke test — run without a server (tests the scoring logic directly)."""
import sys
sys.path.insert(0, ".")

from app.main import (
    score_leadership, score_motivation, score_growth,
    score_communication, detect_ai_score, build_explanation, ScoreBreakdown
)

essay_human = """
I founded a robotics club at my rural school after noticing students had nowhere to build things.
Despite having no budget and skeptical teachers, I organized fundraisers and learned everything online.
We failed our first competition badly, but I learned more from that failure than any classroom lesson.
The team rebuilt and placed third regionally the next year. That experience changed how I think about problems.
"""

essay_ai = """
In today's world, it is worth noting that education plays a multifaceted role in society.
As we delve into the complexities of modern learning, it goes without saying that students
must leverage their skills to navigate the challenges ahead. In conclusion, fostering growth
is essential to elevate our collective potential and underscore the importance of collaboration.
"""

print("=== Human essay ===")
auth, hits = detect_ai_score(essay_human)
print(f"Authenticity: {auth} | AI phrases: {hits}")

print("\n=== AI essay ===")
auth2, hits2 = detect_ai_score(essay_ai)
print(f"Authenticity: {auth2} | AI phrases: {hits2}")

activities = ["Robotics club founder", "School newspaper editor"]
awards = ["Regional olympiad 2nd place"]

lead = score_leadership(activities, awards, essay_human)
motiv = score_motivation("I want to solve real problems in Central Asia.", essay_human)
growth = score_growth(essay_human, first_gen=True)
comm = score_communication(essay_human)

print(f"\n=== Full score for human essay ===")
print(f"Leadership:   {lead}")
print(f"Motivation:   {motiv}")
print(f"Growth:       {growth}")
print(f"Communication:{comm}")
total = round(lead*30 + motiv*25 + growth*20 + comm*15 + auth*10, 1)
print(f"Total score:  {total} / 100")
print(f"Shortlisted:  {total >= 60}")
