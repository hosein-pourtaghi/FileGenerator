
export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  userCount?: number;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissionIds: string[];
}

export interface UpdateRoleRequest {
  name: string;
  description?: string;
  permissionIds: string[];
}
src/app/core/models/permission.model.ts
typescript

export interface Permission {
  id: string;
  name: string;
  description?: string;
  group?: string;
  isActive: boolean;
  createdAt: string;
}
src/app/core/models/session.model.ts
typescript

export interface Session {
  id: string;
  userId: string;
  userEmail: string;
  userFullName: string;
  deviceInfo: string;
  ipAddress: string;
  browser: string;
  operatingSystem: string;
  location?: string;
  createdAt: string;
  lastActivityAt: string;
  isCurrent: boolean;
}

export interface OnlineSession {
  id: string;
  userId: string;
  userEmail: string;
  userFullName: string;
  sessionCount: number;
  lastActivityAt: string;
}