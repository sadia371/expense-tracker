import express from "express";
import { getAuditLogs } from "../controllers/auditController.js";
import { protect, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protect, isAdmin, getAuditLogs);

export default router;
