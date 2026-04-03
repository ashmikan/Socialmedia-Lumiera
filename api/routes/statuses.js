import express from "express";
import { getStatuses, addStatus } from "../controllers/status.js";

const router = express.Router();

router.get("/", getStatuses);
router.post("/", addStatus);

export default router;
