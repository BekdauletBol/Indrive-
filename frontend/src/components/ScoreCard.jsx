const DIMS = [
  { key: "leadership_potential", label: "Leadership potential", color: "#534ab7" },
  { key: "motivation_clarity",   label: "Motivation clarity",   color: "#534ab7" },
  { key: "growth_trajectory",    label: "Growth trajectory",    color: "#534ab7" },
  { key: "communication",        label: "Communication",        color: "#534ab7" },
  { key: "ai_authenticity",      label: "Essay authenticity",   color: "#0f6e56" },
];

function DimRow({ dim, value, explanation }) {
  const pct = Math.round(value * 100);
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: "#333" }}>{dim.label}</span>
        <span style={{ fontSize: 13, color: dim.color, fontWeight: 500 }}>{pct}%</span>
      </div>
      <div style={{ background: "#f0eee8", borderRadius: 6, height: 8, marginBottom: 6 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: dim.color, borderRadius: 6, transition: "width 0.5s" }} />
      </div>
      {explanation && (
        <p style={{ margin: 0, fontSize: 12, color: "#666", lineHeight: 1.5 }}>{explanation}</p>
      )}
    </div>
  );
}

export default function ScoreCard({ candidate, onClose }) {
  const scoreColor = candidate.shortlist ? "#1d6e35" : candidate.total_score >= 50 ? "#7a5c00" : "#991b1b";
  const scoreBg = candidate.shortlist ? "#e8f5ec" : candidate.total_score >= 50 ? "#fef8e7" : "#fdecea";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500, color: "#1a1a18" }}>{candidate.name}</h2>
          <div style={{ fontSize: 12, color: "#999", marginTop: 3 }}>
            {new Date(candidate.timestamp).toLocaleString()}
          </div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#999", fontSize: 18, lineHeight: 1 }}>×</button>
      </div>

      {/* Total score */}
      <div style={{ background: scoreBg, borderRadius: 10, padding: "16px 20px", marginBottom: 24, textAlign: "center" }}>
        <div style={{ fontSize: 42, fontWeight: 600, color: scoreColor, lineHeight: 1 }}>{candidate.total_score}</div>
        <div style={{ fontSize: 12, color: scoreColor, marginTop: 4, opacity: 0.8 }}>out of 100 · {candidate.shortlist ? "Shortlisted ✓" : "Not shortlisted"}</div>
      </div>

      {/* Dimension breakdown */}
      <h3 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 500, color: "#888", textTransform: "uppercase", letterSpacing: 0.5 }}>Score breakdown</h3>
      {DIMS.map(dim => (
        <DimRow
          key={dim.key}
          dim={dim}
          value={candidate.breakdown[dim.key]}
          explanation={candidate.explanation[dim.key]}
        />
      ))}

      {/* Flags */}
      {candidate.flags.length > 0 && (
        <div style={{ marginTop: 16, background: "#fdecea", borderRadius: 8, padding: "12px 16px" }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: "#991b1b", marginBottom: 6 }}>Flags requiring attention</div>
          {candidate.flags.map((f, i) => (
            <div key={i} style={{ fontSize: 12, color: "#7f1d1d", marginBottom: 3 }}>• {f}</div>
          ))}
        </div>
      )}

      {/* Human override note */}
      <div style={{ marginTop: 20, borderTop: "1px solid #f0eee8", paddingTop: 16, fontSize: 12, color: "#999", lineHeight: 1.6 }}>
        This score is advisory only. The admissions committee retains full decision authority. AI scoring is one input among many.
      </div>
    </div>
  );
}
