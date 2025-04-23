import { inject } from '@angular/core';
import { CanActivateFn, CanActivateChildFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../../services/auth.service';

// Helper function to check role permissions
const checkRolePermission = (url: string): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // First check if user is authenticated
  if (!authService.isAuthenticated()) {
    // Store the URL for redirection after login
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('redirectUrl', url);
      }
    } catch (e) {
      console.error('localStorage not available:', e);
    }

    return router.createUrlTree(['/login']);
  }

  // Get current user and check role
  const currentUser = authService.currentUserValue;

  if (!currentUser) {
    return router.createUrlTree(['/login']);
  }

  // Check if user is a mentor - mentors get full access
  if (currentUser.role === 'mentor') {
    return true;
  }

  // For lifters (or other roles), implement view-only restrictions
  if (currentUser.role === 'lifter') {
    // Allow access to view routes only
    if (url.includes('/view') || isViewOnlyRoute(url)) {
      return true;
    }

    // For edit, add, delete routes, redirect to access denied
    if (url.includes('/edit') || url.includes('/add') || url.includes('/delete')) {
      console.log('Lifter attempted to access restricted route:', url);
      return router.createUrlTree(['/access-denied']);
    }

    // For any other routes, default to access-denied
    return router.createUrlTree(['/access-denied']);
  }

  // Default deny for unknown roles
  return router.createUrlTree(['/access-denied']);
};

// Helper function to determine if a route is view-only
function isViewOnlyRoute(url: string): boolean {
  // Define your view-only routes here
  const viewOnlyRoutes = [
    '/',
    '/dashboard',
    '/products',
    '/profile',
    '/cart',
    '/wishlist',
    '/settings',
    '/categories',
    '/deals',
    '/upcoming',
    '/orders'
  ];

  return viewOnlyRoutes.some(route => url === route || url.startsWith(route + '/'));
}

// Guard for protecting routes based on role
export const roleGuard: CanActivateFn = (route, state) => {
  console.log('Role Guard checking:', state.url);
  return checkRolePermission(state.url);
};

// Guard for protecting child routes based on role
export const roleChildGuard: CanActivateChildFn = (childRoute, state) => {
  return checkRolePermission(state.url);
};
