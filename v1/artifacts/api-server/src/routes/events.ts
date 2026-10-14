import { Router } from "express";
import { persistAnalyticsEvent } from "../lib/persistence.js";

const router = Router();

router.post("/events", async (req, res) => {
  const body = req.body as {
    eventId?: string;
    sessionId?: string;
    assessmentSessionId?: string;
    eventName?: string;
    eventCategory?: string;
    screenName?: string;
    languageCode?: string;
    properties?: Record<string, unknown>;
    route?: string;
    durationMs?: number;
    success?: boolean;
    errorCode?: string;
    correlationId?: string;
  };
  if (!body.eventName || !body.eventCategory) {
    return res.status(400).json({ error: "eventName and eventCategory are required" });
  }
  const eventName = body.eventName;
  const eventCategory = body.eventCategory;
  try {
    const eventId = await persistAnalyticsEvent({ ...body, eventName, eventCategory, languageCode: body.languageCode?.toUpperCase() });
    req.log.info({ event: "analytics_event_recorded", eventName, persisted: Boolean(eventId) }, "Analytics event recorded");
    return res.status(202).json({ accepted: true, eventId });
  } catch (error) {
    req.log.error({ event: "analytics_event_failed", err: error }, "Analytics event could not be persisted");
    return res.status(202).json({ accepted: true, persisted: false });
  }
});

export default router;