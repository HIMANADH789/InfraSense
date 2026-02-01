# predict.py

import json
import pandas as pd
import joblib
from simulate import run_simulation
from features import extract_features_from_topology


MODEL_PATH = "model.pkl"

FEATURE_ORDER = [
    "num_nodes", "num_links",
    "avg_bandwidth", "max_bandwidth",
    "avg_delay", "max_delay",
    "flow_count", "avg_flow_rate",
    "max_flow_rate", "total_flow_rate",
    "utilization_ratio", "simulated_latency",
    "simulated_loss", "queue_length", "throughput"
]


def predict_network_behavior(topology_file):
    # 1️⃣ Run simulation AND collect outputs
    simulation_output = run_simulation(topology_file)

    # 2️⃣ Extract ML features
    feature_dict = extract_features_from_topology(topology_file)
    X = pd.DataFrame([[feature_dict[k] for k in FEATURE_ORDER]])

    # 3️⃣ ML prediction
    model = joblib.load(MODEL_PATH)
    anomaly_score = float(model.decision_function(X)[0])
    is_anomaly = bool(model.predict(X)[0] == -1)

    with open(topology_file) as f:
        topo = json.load(f)

    nodes = [
        {"id": node, "risk": min(1.0, abs(anomaly_score))}
        for node in topo["nodes"]
    ]

    links = [
        {
            "src": link["src"],
            "dst": link["dst"],
            "bandwidth": link["bw"],
            "delay": link["delay"],
            "utilization": feature_dict["utilization_ratio"],
            "risk": min(1.0, abs(anomaly_score))
        }
        for link in topo["links"]
    ]

    return {
        # 🔥 NEW: simulation values
        "simulation": simulation_output,

        # ML output
        "global": {
            "anomaly_score": anomaly_score,
            "is_anomaly": is_anomaly
        },

        "topology": {
            "nodes": nodes,
            "links": links
        },

        # Metrics still available for charts
        "metrics": {
            "latency_vs_flows": {
                "x": feature_dict["flow_count"],
                "y": feature_dict["simulated_latency"]
            },
            "loss_vs_flows": {
                "x": feature_dict["flow_count"],
                "y": feature_dict["simulated_loss"]
            },
            "throughput_vs_time": {
                "x": [1, 2, 3, 4, 5],
                "y": [
                    feature_dict["throughput"] * 0.9,
                    feature_dict["throughput"],
                    feature_dict["throughput"] * 0.95,
                    feature_dict["throughput"] * 0.85,
                    feature_dict["throughput"] * 0.8
                ]
            }
        }
    }


if __name__ == "__main__":
    print(json.dumps(predict_network_behavior("topology.json"), indent=2))
