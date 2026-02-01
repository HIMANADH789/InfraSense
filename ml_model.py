# ml_model.py

import json
import random
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import IsolationForest
from simulate import run_simulation
from features import extract_features_from_topology


MODEL_PATH = "model.pkl"
DATASET_PATH = "training_data.csv"

FEATURE_ORDER = [
    "num_nodes",
    "num_links",
    "avg_bandwidth",
    "max_bandwidth",
    "avg_delay",
    "max_delay",
    "flow_count",
    "avg_flow_rate",
    "max_flow_rate",
    "total_flow_rate",
    "utilization_ratio",
    "simulated_latency",
    "simulated_loss",
    "queue_length",
    "throughput"
]

# -----------------------------
# 1️⃣ AUTO TOPOLOGY GENERATOR
# -----------------------------

def generate_random_topology():
    num_hosts = random.randint(2, 6)
    num_switches = random.randint(1, 3)

    hosts = [f"h{i}" for i in range(1, num_hosts + 1)]
    switches = [f"s{i}" for i in range(1, num_switches + 1)]
    nodes = hosts + switches

    links = []
    for h in hosts:
        s = random.choice(switches)
        links.append({
            "src": h,
            "dst": s,
            "bw": random.randint(10, 100),
            "delay": f"{random.randint(1, 20)}ms"
        })

    flows = []
    for _ in range(random.randint(1, num_hosts)):
        src, dst = random.sample(hosts, 2)
        flows.append({
            "src": src,
            "dst": dst,
            "rate": random.randint(1, 15)
        })

    return {
        "nodes": nodes,
        "links": links,
        "flows": flows
    }

# -----------------------------
# 2️⃣ DATASET GENERATION
# -----------------------------

def generate_dataset(n_samples=300):
    rows = []

    for i in range(n_samples):
        topo = generate_random_topology()

        topo_file = f"_train_topo_{i}.json"
        with open(topo_file, "w") as f:
            json.dump(topo, f)

        run_simulation(topo_file)

        feature_dict = extract_features_from_topology(topo_file)
        feature_vector = [feature_dict[k] for k in FEATURE_ORDER]
        rows.append(feature_vector)

    df = pd.DataFrame(rows, columns=FEATURE_ORDER)
    df.to_csv(DATASET_PATH, index=False)
    print(f"✅ Dataset created with {n_samples} samples")

    return df

# -----------------------------
# 3️⃣ TRAIN MODEL
# -----------------------------

def train_model():
    df = pd.read_csv(DATASET_PATH)

    model = IsolationForest(
        n_estimators=300,
        contamination=0.08,
        random_state=42
    )

    model.fit(df.values)
    joblib.dump(model, MODEL_PATH)

    print("✅ Model trained and saved:", MODEL_PATH)

# -----------------------------
# 4️⃣ MAIN (RUN ONCE)
# -----------------------------

if __name__ == "__main__":
    generate_dataset(n_samples=200)
    train_model()
