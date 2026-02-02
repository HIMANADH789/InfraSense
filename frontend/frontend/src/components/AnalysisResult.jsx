export default function AnalysisResult({ data }) {
  return (
    <div style={{ marginTop: 30 }}>
      <h2>Analysis Results</h2>

      <h3>Simulation Metrics</h3>
      <ul>
        <li>Avg Latency: {data.simulation.avg_latency_ms} ms</li>
        <li>Packet Loss: {data.simulation.packet_loss_ratio}</li>
        <li>Avg Throughput: {data.simulation.avg_throughput_mbps} Mbps</li>
        <li>Queue Occupancy: {data.simulation.queue_occupancy}%</li>
        <li>Simulation Time: {data.simulation.simulation_time_sec}s</li>
      </ul>

      <h3>Global Anomaly Detection</h3>
      <p>
        Anomaly Score: <b>{data.global.anomaly_score}</b><br />
        Status:
        <strong style={{ color: data.global.is_anomaly ? "red" : "green" }}>
          {data.global.is_anomaly ? " ANOMALY" : " NORMAL"}
        </strong>
      </p>

      <h3>Node Risk Levels</h3>
      <ul>
        {data.topology.nodes.map(node => (
          <li key={node.id}>
            {node.id} → Risk: {node.risk}
          </li>
        ))}
      </ul>

      <h3>Critical Links</h3>
      {data.topology.links.map((link, index) => (
        <p key={index}>
          {link.src} → {link.dst} | BW: {link.bandwidth} |
          Utilization: {link.utilization}
        </p>
      ))}
    </div>
  );
}
