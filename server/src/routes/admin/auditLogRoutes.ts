import express from "express";
import { getAuditLogs } from "../../controllers/admin/auditLogController";
import { verifyToken, superAdminOnly } from "../../middleware/verifyToken";

const router = express.Router();

router.get("/", verifyToken, superAdminOnly, getAuditLogs);

export default router;
