import api from "./axios";

export const fetchAuditLogs = () => api.get("/audit-logs");
