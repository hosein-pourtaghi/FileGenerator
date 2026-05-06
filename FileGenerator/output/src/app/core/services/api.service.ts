
import { Injectable, inject } from '@angular/core';
  }

  putWithId<T>(endpoint: string, id: string, body: any): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(`${this.baseUrl}${endpoint}/${id}`, body)
      .pipe(catchError(this.handleError));
  }

  delete<T>(endpoint: string, id?: string): Observable<ApiResponse<T>> {
    const url = id ? `${this.baseUrl}${endpoint}/${id}` : `${this.baseUrl}${endpoint}`;
    return this.http.delete<ApiResponse<T>>(url)
      .pipe(catchError(this.handleError));
  }

  deleteWithParams<T>(endpoint: string, params: Record<string, string>): Observable<ApiResponse<T>> {
    const httpParams = new HttpParams({ fromObject: params });
    return this.http.delete<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  private buildParams(params?: PaginationParams & FilterParams): HttpParams {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof typeof params];
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    
    return httpParams;
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      switch (error.status) {
        case 0:
          errorMessage = 'Unable to connect to server. Please check your internet connection.';
          break;
        case 400:
          errorMessage = error.error?.message || error.error?.title || 'Bad request';
          break;
        case 401:
          errorMessage = 'Session expired. Please login again.';
          break;
        case 403:
          errorMessage = 'You do not have permission to perform this action.';
          break;
        case 404:
          errorMessage = 'The requested resource was not found.';
          break;
        case 500:
          errorMessage = 'Internal server error. Please try again later.';
          break;
        default:
          errorMessage = error.error?.message || `Error: ${error.status}`;
      }
    }
    
    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
src/app/core/services/auth.service.ts
typescript

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