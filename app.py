# app.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware   # ✅ NEW
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

# --------------------------------------------------
# 🌐 CORS CONFIGURATION (REQUIRED FOR FRONTEND)
# --------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # frontend origin (use specific URL in prod)
    allow_credentials=True,
    allow_methods=["*"],          # allows OPTIONS, POST, etc.
    allow_headers=["*"],          # allows Content-Type
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
    Validate user-designed topology BEFORE simulation
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

    print("\n📥 RECEIVED TOPOLOGY FROM FRONTEND:")
    print(json.dumps(topology.dict(), indent=2))

    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=".json",
        mode="w",
        encoding="utf-8"
    ) as tmp:
        json.dump(topology.dict(), tmp)
        topo_file = tmp.name

    try:
        result = predict_network_behavior(topo_file)

        print("\n📤 RESPONSE SENT TO FRONTEND:")
        print(json.dumps(result, indent=2))

        return result

    finally:
        os.remove(topo_file)



# -----------------------------
# 🛠️ DESIGN SUGGESTIONS
# -----------------------------
@app.post("/suggest-fix")
def suggest_fix(analysis: dict):
    """
    Convert ML analysis into human-readable design suggestions
    """

    if "global" not in analysis:
        raise HTTPException(
            status_code=400,
            detail="Invalid analysis input. Call /analyze first."
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
            "suggestion": "Add redundancy or reduce traffic load"
        })

    return {
        "recommendations": suggestions
    }
