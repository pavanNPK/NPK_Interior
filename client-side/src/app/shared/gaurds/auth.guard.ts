import { inject } from '@angular/core';
import { CanActivateFn, CanActivateChildFn, CanMatchFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { of } from 'rxjs';

// Helper function to handle authentication checks with localStorage safety
const checkAuth = (url: string): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Prevent redirection loops - if we're already at login, return true
  if (url.includes('/login')) {
    return true;
  }

  // Check authentication
  if (authService.isAuthenticated()) {
    return true;
  }

  // Safely store redirect URL
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('redirectUrl', url);
    }
  } catch (e) {
    console.error('localStorage not available:', e);
  }

  // Use createUrlTree instead of navigate to avoid navigation errors
  return router.createUrlTree(['/login']);
};

// Protects main routes
export const authGuard: CanActivateFn = (route, state) => {
  console.log('Auth Guard checking:', state.url);
  return checkAuth(state.url);
};

// Protects child routes
export const authChildGuard: CanActivateChildFn = (childRoute, state) => {
  return checkAuth(state.url);
};

// Prevents unauthorized module loading
// Prevents unauthorized module loading
export const authLoadGuard: CanMatchFn = (route, segments) => {
  const url = `/${segments.map(s => s.path).join('/')}`;
  console.log('Auth Load Guard checking:', url);
  // Skip auth check for public routes
  if (url === '/login' || url === '/register' || url === '/reset-password' || url === '/access-denied' || url === '/privacy-policy' || url === '/terms-and-conditions' || url === '/return-policy') {
    return true;
  }
  return checkAuth(url);
};
