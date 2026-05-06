
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = '';

      switch (error.status) {
        case 0:
          errorMessage = 'Unable to connect to server. Please check your internet connection.';
          toast.error(errorMessage);
          break;

        case 400:
          if (error.error?.errors) {
            // Validation errors
            const errors = error.error.errors;
            Object.keys(errors).forEach(key => {
              const messages = errors[key];
              if (Array.isArray(messages)) {
                messages.forEach(msg => toast.error(msg));
              }
            });
          } else {
            errorMessage = error.error?.message || error.error?.title || 'Bad request';
            toast.error(errorMessage);
          }
          break;

        case 401:
          errorMessage = 'Session expired. Please login again.';
          toast.error(errorMessage);
          router.navigate(['/auth/login']);
          break;

        case 403:
          errorMessage = 'You do not have permission to perform this action.';
          toast.warning(errorMessage);
          router.navigate(['/dashboard']);
          break;

        case 404:
          errorMessage = 'The requested resource was not found.';
          toast.warning(errorMessage);
          break;

        case 500:
          errorMessage = 'Internal server error. Please try again later.';
          toast.error(errorMessage);
          break;

        default:
          if (error.error?.message) {
            toast.error(error.error.message);
          } else {
            errorMessage = `Error: ${error.status} - ${error.statusText}`;
            toast.error(errorMessage);
          }
      }

      console.error('HTTP Error:', error);
      return throwError(() => error);
    })
  );
};
src/app/core/interceptors/loading.interceptor.ts
typescript

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoadingService } from '../services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);