import { useState } from "react";

const API = "http://localhost:8000";

const inputStyle = {
  width: "100%", padding: "9px 12px", borderRadius: 6,
  border: "1px solid #ddd", fontSize: 13, boxSizing: "border-box",
  outline: "none", background: "#fff", color: "#1a1a18",
};
const labelStyle = { display: "block", fontSize: 12, fontWeight: 500, color: "#555", marginBottom: 5 };
const fieldStyle = { marginBottom: 16 };

export default function CandidateForm({ onResult }) {
  const [form, setForm] = useState({
    name: "", age: 18, essay: "", motivation: "",
    activities: "", awards: "", gpa: "", region: "", first_gen: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      const payload = {
        ...form,
        age: Number(form.age),
        gpa: form.gpa ? Number(form.gpa) : null,
        activities: form.activities.split(",").map(s => s.trim()).filter(Boolean),
        awards: form.awards.split(",").map(s => s.trim()).filter(Boolean),
      };
      const res = await fetch(`${API}/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        const detail = Array.isArray(err.detail)
          ? err.detail.map(d => d.msg || JSON.stringify(d)).join(", ")
          : (err.detail || "API error");
        throw new Error(detail);
      }
      const result = await res.json();
      onResult(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, background: "#fff", borderRadius: 10, border: "1px solid #e8e6e0", padding: 28 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 0 }}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Full name</label>
          <input style={inputStyle} value={form.name} onChange={set("name")} placeholder="Aisha Bekova" />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Age</label>
          <input style={inputStyle} type="number" value={form.age} onChange={set("age")} min={14} max={30} />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Region</label>
          <input style={inputStyle} value={form.region} onChange={set("region")} placeholder="Almaty" />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>GPA (optional, 0–5 scale)</label>
          <input style={inputStyle} type="number" value={form.gpa} onChange={set("gpa")} step="0.1" min={0} max={5} placeholder="4.2" />
        </div>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Activities / projects (comma-separated)</label>
        <input style={inputStyle} value={form.activities} onChange={set("activities")} placeholder="Robotics club, school newspaper, community volunteering" />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Awards / achievements (comma-separated)</label>
        <input style={inputStyle} value={form.awards} onChange={set("awards")} placeholder="Regional math olympiad 2nd place" />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Motivation statement</label>
        <textarea style={{ ...inputStyle, height: 80, resize: "vertical" }} value={form.motivation} onChange={set("motivation")}
          placeholder="Why do you want to study at inVision U?" />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Personal essay</label>
        <textarea style={{ ...inputStyle, height: 160, resize: "vertical" }} value={form.essay} onChange={set("essay")}
          placeholder="Tell us about a challenge you overcame, a project you led, or a moment that changed how you think..." />
      </div>

      <div style={{ ...fieldStyle, display: "flex", alignItems: "center", gap: 8 }}>
        <input type="checkbox" id="first_gen" checked={form.first_gen} onChange={set("first_gen")} />
        <label htmlFor="first_gen" style={{ ...labelStyle, margin: 0, cursor: "pointer" }}>
          First-generation university student (equity consideration applied)
        </label>
      </div>

      {error && (
        <div style={{ background: "#fdecea", borderRadius: 6, padding: "10px 14px", fontSize: 13, color: "#991b1b", marginBottom: 12 }}>
          {error}
        </div>
      )}

      <button onClick={submit} disabled={loading}
        style={{
          width: "100%", padding: "11px 0", borderRadius: 7, border: "none",
          background: loading ? "#aaa" : "#1a1a18", color: "#fff",
          fontSize: 14, fontWeight: 500, cursor: loading ? "default" : "pointer",
          transition: "background 0.2s",
        }}>
        {loading ? "Scoring…" : "Score candidate"}
      </button>
    </div>
  );
}
