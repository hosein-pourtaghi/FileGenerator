
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly prefix = 'app_';

  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (item === null) return null;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error getting item from storage: ${key}`, error);
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item to storage: ${key}`, error);
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.error(`Error removing item from storage: ${key}`, error);
    }
  }

  clear(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Error clearing storage', error);
    }
  }

  has(key: string): boolean {
    return localStorage.getItem(this.prefix + key) !== null;
  }
}
src/app/core/services/toast.service.ts
typescript

import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private snackBar = inject(MatSnackBar);
  private defaultDuration = 3000;

  private show(message: string, type: ToastType, config?: MatSnackBarConfig): void {
    const defaultConfig: MatSnackBarConfig = {
      duration: this.defaultDuration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [`toast-${type}`],
      ...config
    };

    this.snackBar.open(message, '✕', defaultConfig);
  }

  success(message: string, config?: MatSnackBarConfig): void {
    this.show(message, 'success', config);
  }

  error(message: string, config?: MatSnackBarConfig): void {
    this.show(message, 'error', { ...config, duration: config?.duration || 5000 });
  }

  warning(message: string, config?: MatSnackBarConfig): void {
    this.show(message, 'warning', config);
  }

  info(message: string, config?: MatSnackBarConfig): void {
    this.show(message, 'info', config);
  }
}
src/app/core/services/loading.service.ts
typescript

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private requestCount = 0;

  loading$: Observable<boolean> = this.loadingSubject.asObservable();

  show(): void {
    this.requestCount++;
    if (!this.loadingSubject.value) {
      this.loadingSubject.next(true);
    }
  }

  hide(): void {
    this.requestCount--;
    if (this.requestCount <= 0) {
      this.requestCount = 0;
      this.loadingSubject.next(false);
    }
  }

  hideAll(): void {
    this.requestCount = 0;
    this.loadingSubject.next(false);
  }

  get isLoading(): boolean {
    return this.loadingSubject.value;
  }
}
src/app/core/services/api.service.ts
typescript

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