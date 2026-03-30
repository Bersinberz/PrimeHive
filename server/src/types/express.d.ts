import { IPermissions, IAdminStaffPermissions } from "../models/User";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        permissions?: IPermissions;
        adminStaffPermissions?: IAdminStaffPermissions;
      };
    }
  }
}

export {};
