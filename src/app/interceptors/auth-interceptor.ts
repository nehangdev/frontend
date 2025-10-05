import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  let authReq = req;

  // 1. Add the Auth Token Header
  if (token) {
    authReq = req.clone({
      setHeaders: {
        'x-auth-token': token,
        // Optional: Ensure content type is always JSON for your API
        'Content-Type': 'application/json' 
      }
    });
  }

  // 2. Handle Unauthorized (401) Errors
  return next(authReq).pipe(
    catchError((error) => {
      // Check for 401 Unauthorized status
      if (error.status === 401) {
        // Clear token and redirect to login
        localStorage.removeItem('token');
        alert('Your session has expired or is unauthorized. Please log in again.');
        router.navigate(['/login']); 
      }
      return throwError(() => error);
    })
  );
};