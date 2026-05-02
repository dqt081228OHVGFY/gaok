import { Router, type IRouter } from "express";
import healthRouter from "./health";
import gaokaoRouter from "./gaokao";

const router: IRouter = Router();

router.use(healthRouter);
router.use(gaokaoRouter);

export default router;
