
import { UserWithRoleAndPermissions } from "@/repositories/AuthRepository";

declare namespace Express {
  export interface Request {
    user?: UserWithRoleAndPermissions;
  }
}

