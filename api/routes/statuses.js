import express from "express";
import { getStatuses, addStatus, deleteStatus } from "../controllers/status.js";

const router = express.Router();

router.get("/", getStatuses);
router.post("/", addStatus);
router.delete("/:id", deleteStatus);

export default router;
