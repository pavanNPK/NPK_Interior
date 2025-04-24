import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const roleGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.currentUserValue;
  if (!user) return router.createUrlTree(['/access-denied']);
  const role = user.role.toLowerCase();
  const currentUrl = state.url.toLowerCase();
  if (role.startsWith('sup')) return true;
  if (role.startsWith('shop')) {
    const restrictedPaths = ['categories'];
    const allowedPaths = ['view', 'details'];
    const segments = currentUrl.split('?')[0].split('/');
    // If any restricted path is present in the URL segments, deny access
    if (segments.some(seg => restrictedPaths.includes(seg))) {
      return router.createUrlTree(['/access-denied']);
    }
    // Allow if any allowed path is in the URL
    if (segments.some(seg => allowedPaths.includes(seg))) {
      return true;
    }
    return router.createUrlTree(['/access-denied']);
  }
  return router.createUrlTree(['/access-denied']);
};
