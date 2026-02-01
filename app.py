# app.py

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import json
import os
import tempfile

from predict import predict_network_behavior


app = FastAPI(
    title="Network Design Analyzer",
    description="Simulate networks, detect anomalies, and return visualization-ready data",
    version="1.0"
)


# -----------------------------
# 📦 INPUT SCHEMA
# -----------------------------
class TopologyInput(BaseModel):
    nodes: list
    links: list
    flows: list




# -----------------------------
# 🧪 TOPOLOGY VALIDATION
# -----------------------------
@app.post("/topology/validate")
def validate_topology(topology: TopologyInput):
    """
    ROUTE PURPOSE:
    - Validate user-designed topology BEFORE simulation
    - Catch errors early (UX improvement)
    """

    warnings = []

    if len(topology.nodes) < 2:
        raise HTTPException(status_code=400, detail="At least 2 nodes required")

    for link in topology.links:
        if link["bw"] < 2:
            warnings.append(
                f"Low bandwidth on {link['src']} → {link['dst']}"
            )

    return {
        "valid": True,
        "warnings": warnings
    }


# -----------------------------
# ⚙️ SIMULATION + ML ANALYSIS
# -----------------------------
@app.post("/analyze")
def analyze_network(topology: TopologyInput):
    """
    ROUTE PURPOSE (MAIN ROUTE):
    - User submits network design
    - Backend runs:
        1. Mininet simulation
        2. Feature extraction
        3. ML anomaly detection
    - Returns ONLY VALUES (no drawing)
    - Frontend uses this for visualization
    """

    # Save topology temporarily
    with tempfile.NamedTemporaryFile(
    delete=False,
    suffix=".json",
    mode="w",          # 🔥 text mode
    encoding="utf-8"   # 🔥 required for json
    ) as tmp:
        json.dump(topology.dict(), tmp)
        topo_file = tmp.name


    try:
        result = predict_network_behavior(topo_file)
        return result

    finally:
        os.remove(topo_file)


# -----------------------------
# 🛠️ DESIGN SUGGESTIONS (RULE-BASED)
# -----------------------------
@app.post("/suggest-fix")
def suggest_fix(analysis: dict):
    """
    Converts ML analysis into human-readable design suggestions
    """

    if "global" not in analysis:
        raise HTTPException(
            status_code=400,
            detail="Invalid analysis input. Call /analyze first and pass its output here."
        )

    suggestions = []

    if analysis["global"]["is_anomaly"]:
        for link in analysis["topology"]["links"]:
            if link["bandwidth"] < 5:
                suggestions.append({
                    "type": "bandwidth",
                    "target": f"{link['src']} → {link['dst']}",
                    "suggestion": "Increase link bandwidth"
                })

        suggestions.append({
            "type": "topology",
            "target": "network",
            "suggestion": "Consider adding parallel paths or reducing traffic load"
        })

    return {
        "recommendations": suggestions
    }
