import { Router } from "express";

import { getDevHistorys } from "../controllers/historys";

const router = Router();

// Endpoint: Get project commit history.
router.get("/api/history", getDevHistorys);

export default router;
