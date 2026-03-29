# inVision U — Intelligent Candidate Selection Support System
**Decentrathon 5.0 · AI inDrive track**

> AI-powered screening tool that scores university applicants on leadership potential, motivation, growth trajectory, communication quality, and essay authenticity — giving the admissions committee a transparent, explainable shortlist without replacing human judgment.

---

## What it does

- Accepts candidate applications (essay, motivation statement, activities, GPA) via API or web dashboard
- Returns a score breakdown across 5 dimensions with plain-language explanations
- Flags AI-generated essays and equity factors (first-generation students)
- Produces a ranked shortlist — all decisions remain with the human committee

## Run

Backend
```
cd backend
python3 -m pip install -r requirements.txt
python3 -m uvicorn app.main:app --reload
```

Frontend 
```
cd frontend
npm install
npm run dev
```

<br>
<img height="700" src="Screenshot 2026-03-29 at 22.04.47.pdf">
<br>
<img width="1440" height="813" alt="Screenshot 2026-03-29 at 10 23 52 PM" src="https://github.com/user-attachments/assets/588b3caf-5c5e-4723-871d-9af136ffed92" />
