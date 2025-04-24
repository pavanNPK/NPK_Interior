import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, throwError } from "rxjs";
import { UserService } from "./user.service";
import { Router } from "@angular/router";
import { ResponseWithError } from "../models/commonDTO";
import { catchError } from "rxjs/operators";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  userName: string;
  role: string;
  code: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private tokenExpirationTimer: any;

  constructor(
    private userService: UserService,
    private router: Router
  ) {
    this.currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromLocalStorage());
    this.currentUser = this.currentUserSubject.asObservable();

    // Auto-authenticate user if token exists
    if (this.getToken()) {
      this.autoRenewToken();
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get giveAccess(): boolean {
    return this.currentUserSubject.value?.role?.startsWith('sup') ?? false;
  }

  // Login with your existing service
  login(email: string, password: string): Observable<ResponseWithError<User>> {
    return this.userService.loginUser({ email, password }).pipe(
      tap((response: ResponseWithError<User>) => {
        if (response.success && response.response) {
          this.handleAuthSuccess(response.response);
        }
      })
    );
  }

  // Logout user
  logout(): void {
    // Get the current user before logging out
    const currentUser = this.getUserFromLocalStorage();

    // Store the lastLoggedIn timestamp for this user if we have a user
    if (currentUser && currentUser._id) {
      // Create a mapping of user IDs to their last login times
      const lastLoggedInData = JSON.parse(localStorage.getItem('lastLoggedIn') || '{}');

      // Update the lastLoggedIn time for this specific user
      lastLoggedInData[currentUser._id] = new Date().toISOString();

      // Save the updated lastLoggedIn data back to localStorage
      localStorage.setItem('lastLoggedIn', JSON.stringify(lastLoggedInData));
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpiration');
    this.currentUserSubject.next(null);
    this.clearLogoutTimer();
    this.router.navigate(['/login']);
  }

  // Auto logout when token expires
  autoLogout(expirationDuration: number): void {
    this.clearLogoutTimer();
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  // Get token from localStorage
  getToken(): string | null {
    if (typeof window !== 'undefined' && localStorage) {
      return localStorage.getItem('token');
    }
    return null; // Return null if localStorage is not available
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const expirationDate = this.getTokenExpirationDate();
    if (!expirationDate) return false;

    return expirationDate > new Date();
  }

  // Parse JWT token to get expiration
  getTokenExpirationDate(): Date | null {
    const expirationStr = localStorage.getItem('tokenExpiration');
    if (!expirationStr) {
      const token = this.getToken();
      if (token) {
        try {
          const decoded = this.parseJwt(token);
          if (decoded && decoded.exp) {
            const expDate = new Date(decoded.exp * 1000);
            localStorage.setItem('tokenExpiration', expDate.toISOString());
            return expDate;
          }
        } catch (err) {
          console.error('Error decoding token', err);
        }
      }
      return null;
    }
    return new Date(expirationStr);
  }

  // Auto-renew token if it's about to expire
  private autoRenewToken(): void {
    const expirationDate = this.getTokenExpirationDate();
    if (!expirationDate) return;

    const expiresIn = expirationDate.getTime() - Date.now();

    // Set auto logout
    this.autoLogout(expiresIn);

    // If the token expires in less than 5 minutes (300000 ms), try to refresh it
    if (expiresIn < 300000 && expiresIn > 0) {
      // Call the refresh token method
      this.refreshToken().subscribe({
        next: () => console.log('Token refreshed successfully'),
        error: (err) => console.error('Token refresh failed:', err)
      });
    }
  }

  // Handle successful authentication
  private handleAuthSuccess(data: any): void {
    // Check for token (handling both 'token' and 'accessToken' property names)
    const token = data.token || data.accessToken;

    if (token) {
      // Update the data object to ensure it has the correct token property
      const authData = {
        ...data,
        token: token // Ensure token property exists
      };

      this.storeAuthData(authData);
      const user = data.user;
      this.currentUserSubject.next(user);

      // Set auto logout
      const expirationDuration = this.getTokenExpiryTime(token);
      this.autoLogout(expirationDuration);
    }
  }

  // Store auth data in localStorage
  private storeAuthData(data: any): void {
    const token = data.token || data.accessToken;
    localStorage.setItem('token', token);

    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    localStorage.setItem('user', JSON.stringify(data.user));

    // Calculate and store expiration date
    try {
      const decoded = this.parseJwt(token);
      if (decoded && decoded.exp) {
        const expDate = new Date(decoded.exp * 1000);
        localStorage.setItem('tokenExpiration', expDate.toISOString());
      }
    } catch (err) {
      console.error('Error storing token expiration', err);
    }
  }

  // Get user from localStorage
  getUserFromLocalStorage(): any {
    if (typeof window !== 'undefined' && localStorage) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch (e) {
          console.error('Error parsing user from localStorage', e);
          return null;
        }
      }
    }
    return null; // Return null in non-browser environments or if user doesn't exist
  }

  // Clear logout timer
  private clearLogoutTimer(): void {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
      this.tokenExpirationTimer = null;
    }
  }

  // Get token expiry time in milliseconds
  private getTokenExpiryTime(token: string): number {
    try {
      const decoded = this.parseJwt(token);
      if (decoded && decoded.exp) {
        return Math.max(0, decoded.exp * 1000 - Date.now());
      }
    } catch (err) {
      console.error('Error getting token expiry time', err);
    }
    return 0;
  }

  // Parse JWT token without a library
  private parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error parsing JWT', e);
      return null;
    }
  }

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.userService.refreshToken({ refreshToken }).pipe(
      tap((response: ResponseWithError<any>) => {
        if (response.success && response.response) {
          // Update the auth data with the new token
          // Note that the backend returns 'accessToken' but our service expects 'token'
          const authData = {
            token: response.response.accessToken,
            user: this.getUserFromLocalStorage() // Maintain the same user
          };
          this.handleAuthSuccess(authData);
        } else {
          this.logout();
        }
      }),
      catchError(() => {
        this.logout();
        return throwError(() => new Error('Session expired. Please log in again.'));
      })
    );
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);

    // Update token expiration date in localStorage when setting a new token
    try {
      const decoded = this.parseJwt(token);
      if (decoded && decoded.exp) {
        const expDate = new Date(decoded.exp * 1000);
        localStorage.setItem('tokenExpiration', expDate.toISOString());
      }
    } catch (err) {
      console.error('Error updating token expiration', err);
    }
  }
}
