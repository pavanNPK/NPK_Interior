import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from "../../../services/auth.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // Skip interceptor for authentication-related endpoints
    if (this.isAuthEndpoint(request.url)) {
      return next.handle(request);
    }

    // Add token to request if available
    const token = this.authService.getToken();
    if (token) {
      request = this.addToken(request, token);
    }

    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(this.authService.getToken());

      return this.authService.refreshToken().pipe(
        switchMap(response => {
          this.isRefreshing = false;
          const newToken = response?.response?.token; // Adjust based on your API response structure
          if (newToken) {
            this.authService.setToken(newToken);
            this.refreshTokenSubject.next(newToken);
            return next.handle(this.addToken(request, newToken));
          }

          this.authService.logout(); // Log out if refresh token fails
          return throwError(() => new Error('Session expired. Please log in again.'));
        }),
        catchError(error => {
          this.isRefreshing = false;
          this.authService.logout(); // Log out on error
          return throwError(() => new Error('Session expired. Please log in again.'));
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => next.handle(this.addToken(request, token as string)))
      );
    }
  }

  private isAuthEndpoint(url: string): boolean {
    const authEndpoints = [
      '/users/login',
      '/users/register',
      '/users/sendOTP',
      '/users/confirmOTP',
      '/users/forgotPassword',
      '/users/resetPassword'
    ];
    return authEndpoints.some(endpoint => url.includes(endpoint));
  }
}
