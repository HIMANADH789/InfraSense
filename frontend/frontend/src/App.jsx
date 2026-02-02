import { useState } from "react";
import TopologyInput from "./components/TopologyInput";
import ValidationResult from "./components/ValidationResult";
import AnalysisResult from "./components/AnalysisResult";
import { validateTopology, analyzeTopology } from "./api/topologyApi";
import "./App.css";

function App() {
  const [validationResult, setValidationResult] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleValidate = async (topology) => {
    const result = await validateTopology(topology);
    setValidationResult(result);
    setAnalysisResult(null); // clear old analysis
  };

  const handleAnalyze = async (topology) => {
    const result = await analyzeTopology(topology);
    setAnalysisResult(result);
  };

  return (
    <div className="app">
      <div className="container">
        {/* Header */}
        <h1 className="title">InfraSense</h1>
        <p className="subtitle">
          Topology Validation & Network Analysis
        </p>

        {/* Topology Input (WIDER CARD) */}
        <div className="card topology-card">
          <TopologyInput
            onValidate={handleValidate}
            onAnalyze={handleAnalyze}
          />
        </div>

        {/* Validation Output */}
        {validationResult && (
          <div className="card">
            <ValidationResult data={validationResult} />
          </div>
        )}

        {/* Analysis Output */}
        {analysisResult && (
          <div className="card">
            <AnalysisResult data={analysisResult} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
