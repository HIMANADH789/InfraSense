import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer,
  BarChart, Bar, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Legend
} from "recharts";

export default function AnalysisResult({ data }) {

  /* ---------------- DERIVED NETWORK METRICS ---------------- */

  // 1️⃣ Effective Throughput
  const effectiveThroughput = data.metrics.throughput_vs_time.x.map((t, i) => ({
    time: t,
    value:
      data.metrics.throughput_vs_time.y[i] *
      (1 - data.simulation.packet_loss_ratio)
  }));

  // 2️⃣ Link Congestion Index
  const congestionData = data.topology.links.map(l => ({
    name: `${l.src}-${l.dst}`,
    congestion: l.utilization / (1 + l.bandwidth)
  }));

  // 3️⃣ Delay Sensitivity Curve (queuing theory inspired)
  const delaySensitivity = Array.from({ length: 10 }, (_, i) => {
    const rho = Math.min(0.95, i / 10);
    return {
      utilization: rho,
      delay: data.simulation.avg_latency_ms / (1 - rho)
    };
  });

  // 4️⃣ Node Stress Score
  const avgUtil =
    data.topology.links.reduce((a, b) => a + b.utilization, 0) /
    data.topology.links.length;

  const nodeStress = data.topology.nodes.map(n => ({
    name: n.id,
    stress: n.risk * avgUtil
  }));

  // 5️⃣ Network Health Radar
  const radarData = [
    { metric: "Latency", value: normalize(data.simulation.avg_latency_ms, 50) },
    { metric: "Loss", value: normalize(data.simulation.packet_loss_ratio, 1) },
    { metric: "Throughput", value: normalize(data.simulation.avg_throughput_mbps, 10) },
    { metric: "Queue", value: normalize(data.simulation.queue_occupancy, 100) },
    { metric: "Congestion", value: normalize(avgUtil, 2) }
  ];

  /* ---------------- UI ---------------- */

  return (
    <div style={styles.container}>
      <h2>📊 Network Performance & Risk Dashboard</h2>

      {/* SUMMARY CARDS */}
      <div style={styles.cardGrid}>
        <Metric title="Avg Latency (ms)" value={fix(data.simulation.avg_latency_ms)} />
        <Metric title="Packet Loss" value={fix(data.simulation.packet_loss_ratio)} />
        <Metric title="Avg Throughput (Mbps)" value={fix(data.simulation.avg_throughput_mbps)} />
        <Metric title="Queue Occupancy (%)" value={fix(data.simulation.queue_occupancy)} />
      </div>

      <StatusBanner anomaly={data.global.is_anomaly} score={data.global.anomaly_score} />

      {/* PERFORMANCE GRAPHS */}
      <TwoCol>
        <ChartBlock title="Effective Throughput Over Time">
          <LineChartComp data={effectiveThroughput} x="time" y="value" />
        </ChartBlock>

        <ChartBlock title="Delay Sensitivity vs Utilization">
          <LineChartComp data={delaySensitivity} x="utilization" y="delay" />
        </ChartBlock>
      </TwoCol>

      {/* CONGESTION & STRESS */}
      <TwoCol>
        <ChartBlock title="Link Congestion Index">
          <BarChartComp data={congestionData} x="name" y="congestion" />
        </ChartBlock>

        <ChartBlock title="Node Stress Score">
          <BarChartComp data={nodeStress} x="name" y="stress" />
        </ChartBlock>
      </TwoCol>

      {/* RADAR */}
      <ChartBlock title="Overall Network Health Radar">
        <RadarChartComp data={radarData} />
      </ChartBlock>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function Metric({ title, value }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>{title}</div>
      <div style={styles.cardValue}>{value}</div>
    </div>
  );
}

function StatusBanner({ anomaly, score }) {
  return (
    <div style={{
      ...styles.alert,
      background: anomaly ? "#ffe5e5" : "#e5ffe5"
    }}>
      <strong>Status:</strong>
      <span style={{
        marginLeft: 10,
        color: anomaly ? "red" : "green",
        fontWeight: "bold"
      }}>
        {anomaly ? "⚠ ANOMALY DETECTED" : "✅ NORMAL"}
      </span>
      <div>Anomaly Score: {fix(score)}</div>
    </div>
  );
}

function ChartBlock({ title, children }) {
  return (
    <div style={styles.chartBlock}>
      <h3>{title}</h3>
      <div style={{ width: "100%", height: 280 }}>
        {children}
      </div>
    </div>
  );
}

function TwoCol({ children }) {
  return <div style={styles.twoCol}>{children}</div>;
}

/* ================= CHARTS ================= */

const LineChartComp = ({ data, x, y }) => (
  <ResponsiveContainer>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={x} />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey={y} stroke="#2563eb" strokeWidth={3} />
    </LineChart>
  </ResponsiveContainer>
);

const BarChartComp = ({ data, x, y }) => (
  <ResponsiveContainer>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={x} />
      <YAxis />
      <Tooltip />
      <Bar dataKey={y} fill="#f97316" />
    </BarChart>
  </ResponsiveContainer>
);

const RadarChartComp = ({ data }) => (
  <ResponsiveContainer>
    <RadarChart data={data}>
      <PolarGrid />
      <PolarAngleAxis dataKey="metric" />
      <PolarRadiusAxis domain={[0, 1]} />
      <Radar dataKey="value" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
    </RadarChart>
  </ResponsiveContainer>
);

/* ================= HELPERS ================= */

function normalize(value, max) {
  return Math.min(value / max, 1);
}

function fix(v) {
  return Number(v).toFixed(2);
}

/* ================= STYLES ================= */

const styles = {
  container: {
    padding: 20,
    background: "#f8fafc",
    borderRadius: 12
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 15
  },
  card: {
    padding: 16,
    borderRadius: 12,
    background: "white",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
  },
  cardTitle: {
    fontSize: 13,
    color: "#555"
  },
  cardValue: {
    fontSize: 24,
    fontWeight: "bold"
  },
  alert: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12
  },
  chartBlock: {
    marginTop: 30,
    background: "white",
    padding: 15,
    borderRadius: 12,
    boxShadow: "0 3px 8px rgba(0,0,0,0.06)"
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20
  }
};
