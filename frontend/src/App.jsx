import { useState } from "react";
import CandidateForm from "./components/CandidateForm";
import CandidateTable from "./components/CandidateTable";
import ScoreCard from "./components/ScoreCard";

const DEMO_CANDIDATES = [
  {
    id: "demo-1", name: "Aisha Bekova", total_score: 78.5, shortlist: true,
    breakdown: { leadership_potential: 0.85, motivation_clarity: 0.80, growth_trajectory: 0.75, communication: 0.70, ai_authenticity: 0.92 },
    explanation: {
      leadership_potential: "Strong signals of initiative — essay references concrete leadership actions.",
      motivation_clarity: "Motivation is specific and goal-oriented with clear reasoning.",
      growth_trajectory: "Strong narrative of overcoming challenges. Equity bonus: first-generation student.",
      ai_authenticity: "Essay reads as authentic; low AI-generated content indicators.",
    },
    flags: [], timestamp: new Date().toISOString(),
  },
  {
    id: "demo-2", name: "Daniyar Seitkali", total_score: 54.0, shortlist: false,
    breakdown: { leadership_potential: 0.50, motivation_clarity: 0.55, growth_trajectory: 0.45, communication: 0.60, ai_authenticity: 0.40 },
    explanation: {
      leadership_potential: "Some leadership indicators present; consider probing in interview.",
      motivation_clarity: "Motivation statement is vague or generic.",
      ai_authenticity: "High likelihood of AI-assisted writing. Manual review required.",
      flags: "Attention needed: Possible AI-generated content (4 phrases detected)",
    },
    flags: ["Possible AI-generated content (4 phrases detected)"],
    timestamp: new Date().toISOString(),
  },
  {
    id: "demo-3", name: "Zarina Omarova", total_score: 66.2, shortlist: true,
    breakdown: { leadership_potential: 0.65, motivation_clarity: 0.72, growth_trajectory: 0.70, communication: 0.58, ai_authenticity: 0.75 },
    explanation: {
      leadership_potential: "Some leadership indicators present; consider probing in interview.",
      motivation_clarity: "Motivation is specific and goal-oriented with clear reasoning.",
      growth_trajectory: "Strong narrative of personal development.",
      ai_authenticity: "Some AI-typical phrases detected. Recommend follow-up interview.",
    },
    flags: [], timestamp: new Date().toISOString(),
  },
];

export default function App() {
  const [candidates, setCandidates] = useState(DEMO_CANDIDATES);
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState("dashboard"); // dashboard | submit

  const handleNewResult = (result) => {
    setCandidates((prev) => [result, ...prev].sort((a, b) => b.total_score - a.total_score));
    setSelected(result);
    setView("dashboard");
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "system-ui, sans-serif", background: "#f9f8f5" }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: "#1a1a18", color: "#ccc", display: "flex", flexDirection: "column", padding: "24px 0" }}>
        <div style={{ padding: "0 20px 24px", borderBottom: "1px solid #333" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", letterSpacing: 0.5 }}>inVision U</div>
          <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>Admissions AI · v0.1</div>
        </div>
        <nav style={{ padding: "16px 12px", flex: 1 }}>
          {[
            { id: "dashboard", label: "Candidates" },
            { id: "submit", label: "Add candidate" },
          ].map((item) => (
            <button key={item.id} onClick={() => setView(item.id)}
              style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "9px 12px", borderRadius: 6, border: "none", cursor: "pointer",
                marginBottom: 4, fontSize: 13,
                background: view === item.id ? "#2d2d2b" : "transparent",
                color: view === item.id ? "#fff" : "#aaa",
              }}>
              {item.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: "16px 20px", borderTop: "1px solid #333", fontSize: 11, color: "#666" }}>
          Human-in-the-loop · AI assist only
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: 32 }}>
          {view === "dashboard" && (
            <>
              <h1 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 500, color: "#1a1a18" }}>Candidate shortlist</h1>
              <p style={{ margin: "0 0 24px", color: "#888", fontSize: 14 }}>
                {candidates.filter(c => c.shortlist).length} shortlisted · {candidates.length} total · AI scoring is advisory only
              </p>
              <CandidateTable candidates={candidates} selected={selected} onSelect={setSelected} />
            </>
          )}
          {view === "submit" && (
            <>
              <h1 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 500 }}>Score a candidate</h1>
              <p style={{ margin: "0 0 24px", color: "#888", fontSize: 14 }}>Submit application data to get an instant AI score and explanation.</p>
              <CandidateForm onResult={handleNewResult} />
            </>
          )}
        </div>

        {/* Score detail panel */}
        {selected && view === "dashboard" && (
          <aside style={{ width: 380, borderLeft: "1px solid #e8e6e0", overflowY: "auto", padding: 24, background: "#fff" }}>
            <ScoreCard candidate={selected} onClose={() => setSelected(null)} />
          </aside>
        )}
      </main>
    </div>
  );
}
