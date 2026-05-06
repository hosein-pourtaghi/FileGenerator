
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