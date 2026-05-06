
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}
src/app/core/models/pagination.model.ts
typescript

export interface PaginationParams {
  pageNumber: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  [key: string]: any;
}

export const defaultPaginationParams: PaginationParams = {
  pageNumber: 1,
  pageSize: 10,
  sortBy: 'id',
  sortDirection: 'asc'
};
src/app/core/models/user.model.ts
typescript

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  roles: string[];
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  deviceInfo?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface LogoutRequest {
  terminateAllSessions: boolean;
}
src/app/core/models/role.model.ts
typescript

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