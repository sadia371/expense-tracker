import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    targetUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    details: { type: String },
    userRole: { type: String, enum: ["admin", "employee"], default: "employee" },
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", auditLogSchema);
