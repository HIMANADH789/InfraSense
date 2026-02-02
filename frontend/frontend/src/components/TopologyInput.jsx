import { useState } from "react";

export default function TopologyInput({ onValidate, onAnalyze }) {
  const [json, setJson] = useState(`{
  "nodes": ["h1", "h2", "s1"],
  "links": [
    { "src": "h1", "dst": "s1", "bw": 3, "delay": "10ms" },
    { "src": "h2", "dst": "s1", "bw": 1, "delay": "20ms" }
  ],
  "flows": [
    { "src": "h1", "dst": "h2", "rate": 5 }
  ]
}`);

  const parseJSON = () => {
    try {
      return JSON.parse(json);
    } catch {
      alert("Invalid JSON format");
      return null;
    }
  };

  return (
    <div>
      <h2>Topology Input</h2>

      <textarea
        spellCheck={false}
        rows={14}
        value={json}
        onChange={(e) => setJson(e.target.value)}
      />

      <div style={{ marginTop: 15 }}>
        <button
          onClick={() => {
            const data = parseJSON();
            if (data) onValidate(data);
          }}
        >
          Validate Topology
        </button>

        <button
          style={{ marginLeft: 12 }}
          onClick={() => {
            const data = parseJSON();
            if (data) onAnalyze(data);
          }}
        >
          Analyze Network
        </button>
      </div>
    </div>
  );
}
