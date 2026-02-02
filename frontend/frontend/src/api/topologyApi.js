const BASE_URL = "http://localhost:8000";

export async function validateTopology(topology) {
  const response = await fetch(`${BASE_URL}/topology/validate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(topology),
  });

  return response.json();
}

export async function analyzeTopology(topology) {
  const response = await fetch(`${BASE_URL}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(topology),
  });

  return response.json();
}

/* ✅ NEW: Suggest Fix API */
export async function suggestFix(analysisResult) {
  const response = await fetch(`${BASE_URL}/suggest-fix`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(analysisResult),
  });

  return response.json();
}
