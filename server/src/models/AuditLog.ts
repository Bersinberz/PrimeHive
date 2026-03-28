import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
  actor: mongoose.Types.ObjectId;
  actorName: string;
  role: string;
  action: string;       // e.g. "product.create", "order.status_update"
  target: string;       // e.g. "Product", "Order"
  targetId?: string;
  metadata?: Record<string, any>;
  ip: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actor:     { type: Schema.Types.ObjectId, ref: "User", required: true },
    actorName: { type: String, required: true },
    role:      { type: String, required: true },
    action:    { type: String, required: true, index: true },
    target:    { type: String, required: true },
    targetId:  { type: String },
    metadata:  { type: Schema.Types.Mixed },
    ip:        { type: String, default: "" },
  },
  { timestamps: true, versionKey: false }
);

AuditLogSchema.index({ actor: 1, createdAt: -1 });
AuditLogSchema.index({ createdAt: -1 });
// Auto-expire logs after 90 days
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export default mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
