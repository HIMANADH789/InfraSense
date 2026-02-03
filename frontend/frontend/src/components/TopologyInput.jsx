import { useCallback, useState } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  useNodesState,
  useEdgesState
} from "reactflow";
import "reactflow/dist/style.css";

/* ---------------- COUNTERS FOR MININET SAFE NAMES ---------------- */

let hostCounter = 0;
let switchCounter = 0;

export default function TopologyInput({ onValidate, onAnalyze }) {

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedEdge, setSelectedEdge] = useState(null);

  const [flowConfig, setFlowConfig] = useState({
    src: "",
    dst: "",
    rate: 5
  });

  /* ---------------- ADD NODE ---------------- */

  const addNode = (type) => {
    const mnName =
      type === "host"
        ? `h${++hostCounter}`
        : `s${++switchCounter}`;

    setNodes((nds) => [
      ...nds,
      {
        id: mnName,
        position: {
          x: Math.random() * 400,
          y: Math.random() * 300
        },
        data: { label: mnName, mnName },
        style: {
          padding: 10,
          borderRadius: 8,
          background: type === "host" ? "#e0f2fe" : "#dcfce7",
          border: "2px solid #333",
          fontWeight: "bold"
        }
      }
    ]);
  };

  /* ---------------- CONNECT EDGE ---------------- */

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            data: { bw: 10, delay: "10ms" },
            label: "10 Mbps"
          },
          eds
        )
      ),
    [setEdges]
  );

  /* ---------------- EDGE CLICK ---------------- */

  const onEdgeClick = (_, edge) => {
    setSelectedEdge(edge);
  };

  /* ---------------- UPDATE EDGE ---------------- */

  const updateEdge = (field, value) => {
    setEdges((eds) =>
      eds.map((e) =>
        e.id === selectedEdge.id
          ? {
              ...e,
              data: { ...e.data, [field]: value },
              label: field === "bw" ? `${value} Mbps` : e.label
            }
          : e
      )
    );

    setSelectedEdge((prev) => ({
      ...prev,
      data: { ...prev.data, [field]: value }
    }));
  };

  /* ---------------- SAFE FLOW RATE ---------------- */

  const minLinkBw =
    edges.length > 0
      ? Math.min(...edges.map((e) => Number(e.data.bw)))
      : 10;

  const safeRate = Math.min(flowConfig.rate, minLinkBw);

  /* ---------------- EXPORT JSON ---------------- */

  /* ---------------- EXPORT JSON (AUTO-FLOW PER HOST PAIR) ---------------- */

const buildTopologyJSON = () => {
  const nodeNames = nodes.map((n) => n.data.mnName);

  const links = edges.map((e) => ({
    src: e.source,
    dst: e.target,
    bw: Number(e.data.bw),
    delay: e.data.delay
  }));

  // ---------------- HOST DETECTION ----------------
  const hosts = nodeNames.filter((n) => n.startsWith("h"));

  // ---------------- AUTO FLOW GENERATION ----------------
  let flows = [];

  // 1️⃣ If user explicitly defines src & dst → use that
  if (flowConfig.src && flowConfig.dst) {
    flows.push({
      src: flowConfig.src,
      dst: flowConfig.dst,
      rate: Number(flowConfig.rate)
    });
  }

  // 2️⃣ Else auto-generate flows between ALL host pairs
  else {
    const baseRate = Number(flowConfig.rate || 5);

    for (let i = 0; i < hosts.length; i++) {
      for (let j = 0; j < hosts.length; j++) {
        if (i !== j) {
          flows.push({
            src: hosts[i],
            dst: hosts[j],
            rate: baseRate
          });
        }
      }
    }
  }

  return {
    nodes: nodeNames,
    links,
    flows
  };
};


  /* ---------------- UI ---------------- */

  return (
    <div style={styles.container}>
      <h2>🧩 Network Topology Builder</h2>

      {/* TOOLBAR */}
      <div style={styles.toolbar}>
        <button onClick={() => addNode("host")}>➕ Host</button>
        <button onClick={() => addNode("switch")}>➕ Switch</button>
      </div>

      {/* FLOW CONFIG */}
      <div style={styles.flowBox}>
        <strong>🚦 Traffic Flow</strong>

        <input
          placeholder="src (h1)"
          value={flowConfig.src}
          onChange={(e) =>
            setFlowConfig({ ...flowConfig, src: e.target.value })
          }
        />
        <input
          placeholder="dst (h2)"
          value={flowConfig.dst}
          onChange={(e) =>
            setFlowConfig({ ...flowConfig, dst: e.target.value })
          }
        />

        <label>
          Rate: <b>{safeRate} Mbps</b>
        </label>

        <input
          type="range"
          min={1}
          max={100}
          value={flowConfig.rate}
          onChange={(e) =>
            setFlowConfig({
              ...flowConfig,
              rate: Number(e.target.value)
            })
          }
        />

        {flowConfig.rate > minLinkBw && (
          <div style={styles.warning}>
            ⚠ Rate capped to link bandwidth ({minLinkBw} Mbps)
          </div>
        )}
      </div>

      {/* GRAPH */}
      <div style={{ height: 450 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeClick={onEdgeClick}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>

      {/* EDGE EDITOR */}
      {selectedEdge && (
        <div style={styles.editor}>
          <h4>✏️ Edit Link</h4>

          <label>Bandwidth (Mbps)</label>
          <input
            type="number"
            value={selectedEdge.data.bw}
            onChange={(e) => updateEdge("bw", e.target.value)}
          />

          <label>Delay</label>
          <input
            value={selectedEdge.data.delay}
            onChange={(e) => updateEdge("delay", e.target.value)}
          />
        </div>
      )}

      {/* ACTIONS */}
      <div style={styles.actions}>
        <button onClick={() => onValidate(buildTopologyJSON())}>
          ✅ Validate
        </button>
        <button onClick={() => onAnalyze(buildTopologyJSON())}>
          🚀 Analyze
        </button>
      </div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const styles = {
  container: {
    padding: 20,
    background: "#f9fafb",
    borderRadius: 12
  },
  toolbar: {
    display: "flex",
    gap: 10,
    marginBottom: 10
  },
  flowBox: {
    background: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
  },
  warning: {
    color: "#b91c1c",
    fontSize: 12
  },
  actions: {
    marginTop: 15,
    display: "flex",
    gap: 12
  },
  editor: {
    marginTop: 15,
    padding: 12,
    background: "#fff",
    borderRadius: 10,
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    maxWidth: 300
  }
};
