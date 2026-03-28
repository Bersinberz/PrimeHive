import axiosInstance from "../axiosInstance";

export interface AuditLog {
  _id: string;
  actor: string;
  actorName: string;
  role: string;
  action: string;
  target: string;
  targetId?: string;
  metadata?: Record<string, any>;
  ip: string;
  createdAt: string;
}

export const getAuditLogs = async (params?: {
  page?: number;
  limit?: number;
  action?: string;
  actor?: string;
  from?: string;
  to?: string;
}): Promise<{ data: AuditLog[]; pagination: any }> => {
  const { data } = await axiosInstance.get("admin/audit-logs", { params });
  return data;
};
