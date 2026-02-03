import json
import numpy as np

def extract_features_from_topology(topology_file):
    with open(topology_file) as f:
        topo = json.load(f)

    nodes = topo.get("nodes", [])
    links = topo.get("links", [])
    flows = topo.get("flows", [])

    # ---------------- BASIC COUNTS ----------------
    num_nodes = len(nodes)
    num_links = len(links)
    flow_count = len(flows)

    # ---------------- LINK FEATURES ----------------
    bandwidths = [l["bw"] for l in links] if links else [0]
    delays = [
        float(l["delay"].replace("ms", ""))
        for l in links
    ] if links else [0]

    avg_bandwidth = float(np.mean(bandwidths))
    max_bandwidth = float(np.max(bandwidths))
    avg_delay = float(np.mean(delays))
    max_delay = float(np.max(delays))

    # ---------------- FLOW FEATURES ----------------
    flow_rates = [f["rate"] for f in flows]

    if flow_rates:
        avg_flow_rate = float(np.mean(flow_rates))
        max_flow_rate = float(np.max(flow_rates))
        total_flow_rate = float(np.sum(flow_rates))
    else:
        avg_flow_rate = 0.0
        max_flow_rate = 0.0
        total_flow_rate = 0.0

    # ---------------- DERIVED NETWORK METRICS ----------------
    utilization_ratio = (
        total_flow_rate / (avg_bandwidth * num_links)
        if avg_bandwidth > 0 and num_links > 0
        else 0.0
    )

    # ---------------- SIMULATION PLACEHOLDERS ----------------
    # (Later you can replace these with real Mininet metrics)
    simulated_latency = avg_delay * (1 + utilization_ratio)
    simulated_loss = min(0.5, utilization_ratio * 0.2)
    queue_length = utilization_ratio * 100
    throughput = max(0.1, avg_bandwidth * (1 - simulated_loss))

    # ---------------- FINAL FEATURE DICT ----------------
    return {
        "num_nodes": num_nodes,
        "num_links": num_links,
        "avg_bandwidth": avg_bandwidth,
        "max_bandwidth": max_bandwidth,
        "avg_delay": avg_delay,
        "max_delay": max_delay,
        "flow_count": flow_count,
        "avg_flow_rate": avg_flow_rate,
        "max_flow_rate": max_flow_rate,
        "total_flow_rate": total_flow_rate,
        "utilization_ratio": utilization_ratio,
        "simulated_latency": simulated_latency,
        "simulated_loss": simulated_loss,
        "queue_length": queue_length,
        "throughput": throughput
    }
