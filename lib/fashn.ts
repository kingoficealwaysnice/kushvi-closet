const FASHN_API_KEY = process.env.FASHN_API_KEY || "";
const FASHN_BASE_URL = "https://api.fashn.ai";

interface FashnPredictionResponse {
  id: string;
}

interface FashnStatusResponse {
  id: string;
  status: "pending" | "starting" | "processing" | "completed" | "failed";
  output?: string[];
  error?: string | null;
}

// Map database categories to Fashn try-on categories
function mapCategoryToFashn(category: string): "tops" | "bottoms" | "one-pieces" {
  const cat = category.toLowerCase();
  if (cat === "bottoms") return "bottoms";
  if (cat === "dresses" || cat === "co-ords" || cat === "ethnic") return "one-pieces";
  return "tops"; // Fallback/tops
}

export async function runFashnTryOn(
  garmentImageUrl: string,
  personImageUrl: string,
  category: string
): Promise<string> {
  if (!FASHN_API_KEY) {
    throw new Error("Missing FashN API Key in environment configuration");
  }

  const fashnCategory = mapCategoryToFashn(category);

  // 1. Submit prediction task
  const runRes = await fetch(`${FASHN_BASE_URL}/v1/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${FASHN_API_KEY}`,
    },
    body: JSON.stringify({
      model_name: "tryon-max",
      inputs: {
        product_image: garmentImageUrl,
        model_image: personImageUrl,
        category: fashnCategory,
      },
    }),
  });

  if (!runRes.ok) {
    const errText = await runRes.text();
    console.error("Fashn API Submit Task Error:", errText);
    throw new Error(`Fashn API returned status ${runRes.status}: ${errText}`);
  }

  const runData = (await runRes.json()) as FashnPredictionResponse;
  const taskId = runData.id;

  // 2. Poll status endpoint until completed
  const maxRetries = 40;
  const pollIntervalMs = 3000; // 3 seconds

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // Wait first
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));

    const statusRes = await fetch(`${FASHN_BASE_URL}/v1/status/${taskId}`, {
      headers: {
        Authorization: `Bearer ${FASHN_API_KEY}`,
      },
    });

    if (!statusRes.ok) {
      console.error(`Fashn Polling Error on Attempt ${attempt}:`, await statusRes.text());
      continue; // Retry on transient network error
    }

    const statusData = (await statusRes.json()) as FashnStatusResponse;
    console.log(`Fashn task status for ${taskId}: ${statusData.status}`);

    if (statusData.status === "completed") {
      if (statusData.output && statusData.output.length > 0) {
        return statusData.output[0];
      }
      throw new Error("Fashn API marked completed but output URL is missing");
    }

    if (statusData.status === "failed") {
      throw new Error(statusData.error || "Fashn AI image generation task failed");
    }
  }

  throw new Error("Fashn AI try-on generation timed out. Please try again later.");
}
