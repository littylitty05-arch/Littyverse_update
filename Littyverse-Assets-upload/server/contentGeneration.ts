import { storage } from "./storage";
import { openai } from "./replit_integrations/image/client";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const GENERATION_TIMEOUT_MS = 5 * 60 * 1000;
const STALE_JOB_THRESHOLD_MS = 10 * 60 * 1000;
const UPLOADS_DIR = path.join(process.cwd(), "uploads", "generated");
const activeJobs = new Map<number, { timeout: NodeJS.Timeout; startedAt: number }>();

function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

function saveImageFromBase64(base64Data: string, contentId: number): string {
  ensureUploadsDir();
  const filename = `content_${contentId}_${crypto.randomBytes(4).toString("hex")}.png`;
  const filepath = path.join(UPLOADS_DIR, filename);
  fs.writeFileSync(filepath, Buffer.from(base64Data, "base64"));
  return `/uploads/generated/${filename}`;
}

export async function processContentGeneration(contentId: number) {
  const content = await storage.getContent(contentId);
  if (!content) {
    console.error(`Content ${contentId} not found, skipping generation`);
    return;
  }

  console.log(`[Generation] Starting ${content.type} generation for content ${contentId}: "${content.prompt.slice(0, 60)}..."`);

  const startedAt = Date.now();

  const timeoutHandle = setTimeout(async () => {
    activeJobs.delete(contentId);
    console.error(`[Generation] Content ${contentId} timed out after ${GENERATION_TIMEOUT_MS / 1000}s`);
    try {
      const current = await storage.getContent(contentId);
      if (current && current.status === "processing") {
        await storage.updateContent(contentId, {
          status: "failed",
          meta: { ...(current.meta as object || {}), error: "Generation timed out. Please try again.", timedOutAt: new Date().toISOString() },
        });
      }
    } catch (e) {
      console.error(`[Generation] Failed to update timed-out content ${contentId}:`, e);
    }
  }, GENERATION_TIMEOUT_MS);

  activeJobs.set(contentId, { timeout: timeoutHandle, startedAt });

  try {
    const imagePrompt = content.type === "video"
      ? `Cinematic high-quality film still keyframe: ${content.prompt}. Dramatic lighting, widescreen cinematic composition, movie scene aesthetic.`
      : content.prompt;

    console.log(`[Generation] Calling OpenAI API for content ${contentId}...`);

    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: imagePrompt,
      n: 1,
      size: "1024x1024",
    });

    const imageData = response.data?.[0];
    if (!imageData) {
      console.error(`[Generation] Full API response for content ${contentId}:`, JSON.stringify(response, null, 2));
      throw new Error("No data returned from generation API");
    }

    console.log(`[Generation] Response keys for content ${contentId}:`, Object.keys(imageData));

    let resultUrl: string;

    if (imageData.b64_json) {
      resultUrl = saveImageFromBase64(imageData.b64_json, contentId);
      console.log(`[Generation] Saved image from b64_json to ${resultUrl}`);
    } else if (imageData.url) {
      resultUrl = imageData.url;
      console.log(`[Generation] Got direct URL: ${resultUrl.slice(0, 80)}...`);
    } else {
      const responseStr = JSON.stringify(imageData).slice(0, 200);
      console.error(`[Generation] Unexpected response shape for content ${contentId}:`, responseStr);
      throw new Error("API returned neither image URL nor base64 data. Response: " + responseStr);
    }

    clearTimeout(timeoutHandle);
    activeJobs.delete(contentId);

    const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
    console.log(`[Generation] Content ${contentId} completed in ${elapsed}s`);

    await storage.updateContent(contentId, {
      status: "published",
      url: resultUrl,
      thumbnailUrl: resultUrl,
      meta: {
        ...(content.meta as object || {}),
        model: "gpt-image-1",
        generationType: content.type === "video" ? "keyframe" : "image",
        completedAt: new Date().toISOString(),
        elapsedSeconds: parseFloat(elapsed),
      },
    });
  } catch (error: unknown) {
    clearTimeout(timeoutHandle);
    activeJobs.delete(contentId);

    const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Generation] Content ${contentId} failed after ${elapsed}s:`, errorMessage);

    await storage.updateContent(contentId, {
      status: "failed",
      meta: {
        ...(content.meta as object || {}),
        error: errorMessage || "Generation failed unexpectedly. Please try again.",
        failedAt: new Date().toISOString(),
        elapsedSeconds: parseFloat(elapsed),
      },
    });
  }
}

export async function cleanupStaleJobs() {
  try {
    const allContent = await storage.listContent();
    const staleItems = allContent.filter((item) => {
      if (item.status !== "processing") return false;
      if (!item.createdAt) return true;
      const age = Date.now() - new Date(item.createdAt).getTime();
      return age > STALE_JOB_THRESHOLD_MS;
    });

    for (const item of staleItems) {
      console.log(`[Generation] Cleaning up stale job ${item.id} (created ${item.createdAt})`);
      await storage.updateContent(item.id, {
        status: "failed",
        meta: {
          ...(item.meta as object || {}),
          error: "Generation was interrupted. Please try again.",
          cleanedUpAt: new Date().toISOString(),
        },
      });
    }

    if (staleItems.length > 0) {
      console.log(`[Generation] Cleaned up ${staleItems.length} stale jobs`);
    }
  } catch (e) {
    console.error("[Generation] Failed to clean up stale jobs:", e);
  }
}

export function cancelJob(contentId: number) {
  const job = activeJobs.get(contentId);
  if (job) {
    clearTimeout(job.timeout);
    activeJobs.delete(contentId);
  }
}
