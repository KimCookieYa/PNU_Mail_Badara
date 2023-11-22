import { Router } from "express";

import {
  getDepartmentBoardName,
  getDepartmentName,
} from "../controllers/departments";

const router = Router();

// Endpoint: Get Department Name
router.get("/name", getDepartmentName);

// Endpoint: Get Department Boards
router.get("/board", getDepartmentBoardName);

export default router;
