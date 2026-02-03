export default function ValidationResult({ data }) {

  /* ---------------- DERIVED VALUES ---------------- */

  const warningCount = data.warnings?.length || 0;

  const validationScore = Math.max(100 - warningCount * 15, 40);

  const severity =
    !data.valid ? "invalid" :
    warningCount === 0 ? "clean" :
    "warning";

  const readiness =
    !data.valid ? "❌ Invalid Design" :
    warningCount === 0 ? "✅ Ready for Simulation" :
    "⚠ Needs Optimization";

  const focusArea = data.warnings?.some(w => w.toLowerCase().includes("bandwidth"))
    ? "Bandwidth Optimization"
    : "Topology Structure";

  /* ---------------- UI ---------------- */

  return (
    <div style={styles.container}>

      <h3>🧪 Topology Validation Summary</h3>

      {/* STATUS BANNER */}
      <div style={{
        ...styles.status,
        background:
          severity === "clean" ? "#e6fffa" :
          severity === "warning" ? "#fff7e6" :
          "#ffe6e6"
      }}>
        <strong>Status:</strong>
        <span style={{
          marginLeft: 10,
          fontWeight: "bold",
          color:
            severity === "clean" ? "green" :
            severity === "warning" ? "#d97706" :
            "red"
        }}>
          {readiness}
        </span>
      </div>

      {/* METRIC CARDS */}
      <div style={styles.cardGrid}>

        <Metric
          title="Validation Score"
          value={`${validationScore}/100`}
          hint="Overall design readiness"
        />

        <Metric
          title="Warnings"
          value={warningCount}
          hint="Non-critical issues detected"
        />

        <Metric
          title="Focus Area"
          value={focusArea}
          hint="Primary optimization target"
        />

      </div>

      {/* WARNINGS LIST */}
      {warningCount > 0 && (
        <div style={styles.warningBox}>
          <h4>⚠ Design Warnings</h4>
          <ul>
            {data.warnings.map((warning, index) => (
              <li key={index} style={styles.warningItem}>
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* NEXT STEP */}
      <div style={styles.nextStep}>
        <strong>Next Step:</strong>{" "}
        {severity === "clean"
          ? "Proceed to simulation and anomaly analysis."
          : "Resolve warnings to improve network robustness."}
      </div>

    </div>
  );
}

/* ================= COMPONENTS ================= */

function Metric({ title, value, hint }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>{title}</div>
      <div style={styles.cardValue}>{value}</div>
      <div style={styles.cardHint}>{hint}</div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  container: {
    marginTop: 20,
    padding: 20,
    background: "#f8fafc",
    borderRadius: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
  },

  status: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20
  },

  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 15
  },

  card: {
    background: "white",
    padding: 16,
    borderRadius: 12,
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
  },

  cardTitle: {
    fontSize: 13,
    color: "#555"
  },

  cardValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 5
  },

  cardHint: {
    fontSize: 12,
    color: "#777",
    marginTop: 6
  },

  warningBox: {
    marginTop: 20,
    padding: 15,
    background: "#fff7e6",
    borderRadius: 10
  },

  warningItem: {
    marginBottom: 6
  },

  nextStep: {
    marginTop: 20,
    padding: 12,
    background: "#eef2ff",
    borderRadius: 10
  }
};
