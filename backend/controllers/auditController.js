import AuditLog from "../models/AuditLog.js";

export const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate("user", "name email")
      .populate("targetUser", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ logs });
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve audit logs" });
  }
};
