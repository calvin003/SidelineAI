import { TwelveLabs } from "twelvelabs-js";

const apiKey = process.env.TWELVELABS_API_KEY;

export const tlClient = apiKey ? new TwelveLabs({ apiKey }) : null;

function ensure() {
  if (!tlClient) {
    throw new Error("Twelve Labs not configured. Set TWELVELABS_API_KEY.");
  }
  return tlClient;
}

export async function uploadVideo(
  file: Blob,
  filename: string,
): Promise<{ taskId: string }> {
  const client = ensure();
  console.log(`[TL] uploading ${filename} (${file.size} bytes) as asset`);
  const asset = await client.assets.create({
    method: "direct",
    file,
    filename,
  });
  if (!asset.id) throw new Error("Asset creation returned no id");
  console.log(`[TL] asset created: ${asset.id} status=${asset.status}`);
  return { taskId: asset.id };
}

export async function getIndexingStatus(
  assetId: string,
): Promise<{ status: "processing" | "ready" | "failed"; videoId?: string }> {
  const client = ensure();
  const asset = await client.assets.retrieve(assetId);
  const raw = (asset.status || "").toLowerCase();
  let status: "processing" | "ready" | "failed" = "processing";
  if (raw === "ready") status = "ready";
  else if (raw === "failed" || raw === "error") status = "failed";
  return { status, videoId: status === "ready" ? assetId : undefined };
}

export async function generateEvaluation(
  assetId: string,
  prompt: string,
): Promise<string> {
  const client = ensure();
  console.log(`[TL] analyze (pegasus1.5) on asset ${assetId}`);
  const result = await client.analyze({
    modelName: "pegasus1.5",
    video: { type: "asset_id", assetId },
    promptV2: { inputText: prompt },
    temperature: 0.2,
  });
  if (!result.data) throw new Error("Empty analyze response");
  return result.data;
}
