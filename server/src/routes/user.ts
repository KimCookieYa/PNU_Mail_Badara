import express from "express";

import {
  deleteUser,
  getValidateEmail,
  postRegisterUser,
} from "../controllers/users";

const router = express.Router();

// Endpoint: Email Subscribe
router.post("/subscribe", postRegisterUser);

// Endpoint: Email Validation
router.get("/validation/:email", getValidateEmail);

// Endpoint: Email Delete
router.delete("/unsubscribe/:email", deleteUser);

export default router;
