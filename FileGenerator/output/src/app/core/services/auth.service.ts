
    );
  }

  getToken(): string | null {
    return this.storage.get<string>(TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return this.storage.get<string>(REFRESH_TOKEN_KEY);
  }

  hasRole(role: string): boolean {
    const user = this._currentUser();
    return user?.roles?.includes(role) || false;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this._currentUser();
    return roles.some(role => user?.roles?.includes(role)) || false;
  }

  hasPermission(permission: string): boolean {
    const user = this._currentUser();
    return user?.permissions?.includes(permission) || false;
  }

  private setSession(response: LoginResponse): void {
    this.storage.set(TOKEN_KEY, response.accessToken);
    this.storage.set(REFRESH_TOKEN_KEY, response.refreshToken);
    this.storage.set(USER_KEY, response.user);
    this._currentUser.set(response.user);
    this._isAuthenticated.set(true);
  }

  private setTokens(response: RefreshTokenResponse): void {
    this.storage.set(TOKEN_KEY, response.accessToken);
    this.storage.set(REFRESH_TOKEN_KEY, response.refreshToken);
  }

  private clearSession(): void {
    this.storage.remove(TOKEN_KEY);
    this.storage.remove(REFRESH_TOKEN_KEY);
    this.storage.remove(USER_KEY);
    this._currentUser.set(null);
    this._isAuthenticated.set(false);
  }

  private hasValidToken(): boolean {
    const token = this.storage.get<string>(TOKEN_KEY);
    return !!token;
  }

  private getDeviceInfo(): string {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    return `${platform} - ${userAgent.substring(0, 100)}`;
  }
}
6. Core Interceptors
src/app/core/interceptors/auth.interceptor.ts
typescript

import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);
  const token = authService.getToken();