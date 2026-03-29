const DIMS = ["leadership_potential", "motivation_clarity", "growth_trajectory", "communication", "ai_authenticity"];
const DIM_LABELS = {
  leadership_potential: "Leadership",
  motivation_clarity: "Motivation",
  growth_trajectory: "Growth",
  communication: "Communication",
  ai_authenticity: "Authenticity",
};

function ScoreBadge({ score, shortlist }) {
  const bg = shortlist ? "#e8f5ec" : score >= 50 ? "#fef8e7" : "#fdecea";
  const color = shortlist ? "#1d6e35" : score >= 50 ? "#7a5c00" : "#991b1b";
  return (
    <span style={{ background: bg, color, borderRadius: 6, padding: "3px 10px", fontSize: 13, fontWeight: 500 }}>
      {score}
    </span>
  );
}

function MiniBar({ value, color = "#4f46e5" }) {
  return (
    <div style={{ background: "#f0eee8", borderRadius: 4, height: 6, width: 64, overflow: "hidden" }}>
      <div style={{ width: `${Math.round(value * 100)}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.4s" }} />
    </div>
  );
}

export default function CandidateTable({ candidates, selected, onSelect }) {
  return (
    <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e8e6e0", overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "#f9f8f5", borderBottom: "1px solid #e8e6e0" }}>
            <th style={th}>Candidate</th>
            <th style={th}>Score</th>
            {DIMS.map(d => <th key={d} style={th}>{DIM_LABELS[d]}</th>)}
            <th style={th}>Flags</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((c) => (
            <tr key={c.id} onClick={() => onSelect(c)}
              style={{
                cursor: "pointer", borderBottom: "1px solid #f0eee8",
                background: selected?.id === c.id ? "#f3f1ff" : "transparent",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => { if (selected?.id !== c.id) e.currentTarget.style.background = "#fafaf8"; }}
              onMouseLeave={e => { if (selected?.id !== c.id) e.currentTarget.style.background = "transparent"; }}
            >
              <td style={td}>
                <div style={{ fontWeight: 500, color: "#1a1a18" }}>{c.name}</div>
                {c.shortlist && <span style={{ fontSize: 11, color: "#1d6e35", background: "#e8f5ec", borderRadius: 4, padding: "1px 6px" }}>Shortlisted</span>}
              </td>
              <td style={td}><ScoreBadge score={c.total_score} shortlist={c.shortlist} /></td>
              {DIMS.map(d => (
                <td key={d} style={{ ...td, verticalAlign: "middle" }}>
                  <MiniBar value={c.breakdown[d]} color={d === "ai_authenticity" ? "#0f6e56" : "#534ab7"} />
                </td>
              ))}
              <td style={td}>
                {c.flags.length > 0
                  ? <span style={{ fontSize: 11, color: "#991b1b", background: "#fdecea", borderRadius: 4, padding: "2px 7px" }}>
                      {c.flags.length} flag{c.flags.length > 1 ? "s" : ""}
                    </span>
                  : <span style={{ color: "#bbb" }}>—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th = { padding: "10px 14px", textAlign: "left", fontWeight: 500, color: "#888", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.4 };
const td = { padding: "12px 14px", color: "#444" };
