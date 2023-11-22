import { Router } from "express";

import { getEmailCount, getSendEmail } from "../controllers/emails";

const router = Router();

// Endpoint: Check whether email exists in database.
router.get("/existence", getSendEmail);

// Endpoint: Get subscriber user count.
router.get("/count", getEmailCount);

export default router;
