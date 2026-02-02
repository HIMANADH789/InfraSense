import { useState } from "react";

import TopologyInput from "./components/TopologyInput";
import ValidationResult from "./components/ValidationResult";
import AnalysisResult from "./components/AnalysisResult";
import SuggestFix from "./components/SuggestFix";

import {
  validateTopology,
  analyzeTopology,
  suggestFix, // ADD
} from "./api/topologyApi";

import "./App.css";

function App() {
  const [validationResult, setValidationResult] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  //  NEW STATE
  const [suggestResult, setSuggestResult] = useState(null);

  const handleValidate = async (topology) => {
    const result = await validateTopology(topology);

    setValidationResult(result);
    setAnalysisResult(null); // clear old analysis
    setSuggestResult(null);  // clear old suggestions
  };

  const handleAnalyze = async (topology) => {
    const result = await analyzeTopology(topology);

    setAnalysisResult(result);

    //  AUTO CALL /suggest-fix
    try {
      const suggest = await suggestFix(result);
      setSuggestResult(suggest);
    } catch (err) {
      console.error("Suggest-fix error:", err);
    }
  };

  return (
    <div className="app">
      <div className="container">
        {/* Header */}
        <h1 className="title">InfraSense</h1>
        <p className="subtitle">
          Topology Validation & Network Analysis
        </p>

        {/* Topology Input */}
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

        {/* Suggest Fix Output */}
        {suggestResult && (
          <div className="card">
            <SuggestFix data={suggestResult} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
