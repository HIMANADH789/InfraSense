import json
import numpy as np

def extract_features_from_topology(topology_file):
    """
    Extracts ML-ready numerical features from a network topology JSON.

    Returns:
        dict: feature_name -> value
    """

    with open(topology_file, "r") as f:
        topo = json.load(f)

    # -----------------------------
    # TOPOLOGY FEATURES
    # -----------------------------
    num_nodes = len(topo["nodes"])
    num_links = len(topo["links"])

    bandwidths = [link["bw"] for link in topo["links"]]
    delays = [int(link["delay"].replace("ms", "")) for link in topo["links"]]

    avg_bandwidth = float(np.mean(bandwidths))
    max_bandwidth = float(np.max(bandwidths))

    avg_delay = float(np.mean(delays))
    max_delay = float(np.max(delays))

    # -----------------------------
    # TRAFFIC FEATURES
    # -----------------------------
    flow_count = len(topo["flows"])
    flow_rates = [flow["rate"] for flow in topo["flows"]]

    avg_flow_rate = float(np.mean(flow_rates))
    max_flow_rate = float(np.max(flow_rates))
    total_flow_rate = float(np.sum(flow_rates))

    # -----------------------------
    # DERIVED BEHAVIOR FEATURES
    # (proxy until real iperf parsing)
    # -----------------------------
    utilization_ratio = total_flow_rate / (avg_bandwidth * num_links)

    simulated_latency = avg_delay * (1 + utilization_ratio)
    simulated_loss = min(utilization_ratio * 0.2, 0.5)
    queue_length = flow_count * utilization_ratio * 50
    throughput = max(avg_bandwidth * num_links - total_flow_rate, 0.1)

    # -----------------------------
    # FINAL FEATURE VECTOR
    # -----------------------------
    return {
        # Topology size
        "num_nodes": num_nodes,
        "num_links": num_links,

        # Link capacity & delay
        "avg_bandwidth": avg_bandwidth,
        "max_bandwidth": max_bandwidth,
        "avg_delay": avg_delay,
        "max_delay": max_delay,

        # Traffic load
        "flow_count": flow_count,
        "avg_flow_rate": avg_flow_rate,
        "max_flow_rate": max_flow_rate,
        "total_flow_rate": total_flow_rate,

        # Network behavior (what ML judges)
        "utilization_ratio": utilization_ratio,
        "simulated_latency": simulated_latency,
        "simulated_loss": simulated_loss,
        "queue_length": queue_length,
        "throughput": throughput
    }
