import { Router } from "express";

const router = Router();

router.get("/youtube-thumbnail/:videoId", async (req, res) => {
  const videoId = req.params.videoId;
  if (!/^[A-Za-z0-9_-]{6,20}$/.test(videoId)) {
    return res.status(400).send("Invalid YouTube video ID");
  }

  try {
    const upstream = await fetch(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, {
      signal: AbortSignal.timeout(10_000),
    });
    if (!upstream.ok) return res.status(404).send("Thumbnail unavailable");
    res.set("Content-Type", upstream.headers.get("content-type") ?? "image/jpeg");
    res.set("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
    return res.send(Buffer.from(await upstream.arrayBuffer()));
  } catch {
    return res.status(502).send("Thumbnail unavailable");
  }
});

export default router;