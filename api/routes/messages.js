import express from "express";
import { getConversation, addMessage } from "../controllers/message.js";

const router = express.Router();

router.get("/:userId", getConversation);
router.post("/", addMessage);

export default router;
