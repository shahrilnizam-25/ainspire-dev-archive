import { Router, type IRouter } from "express";
import healthRouter from "./health";
import classifyRouter from "./classify";
import actionPlanRouter from "./actionPlan";
import youtubeRouter from "./youtube";
import eventsRouter from "./events";

const router: IRouter = Router();

router.use(healthRouter);
router.use(classifyRouter);
router.use(actionPlanRouter);
router.use(youtubeRouter);
router.use(eventsRouter);

export default router;
