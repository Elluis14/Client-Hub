import { Router, type IRouter } from "express";
import healthRouter from "./health";
import projectsRouter from "./projects";
import requestsRouter from "./requests";
import messagesRouter from "./messages";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dashboardRouter);
router.use(projectsRouter);
router.use(requestsRouter);
router.use(messagesRouter);

export default router;
