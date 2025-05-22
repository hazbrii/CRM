import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService, UserPermissions } from '../services/auth.service';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot, 
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Check if user is authenticated
  const isAuthenticated = authService.isAuthenticated();
  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    router.navigate(['/login']);
    return false;
  }
  
  // Check required permission from route data
  const requiredPermission = route.data['requiredPermission'] as keyof UserPermissions;
  
  if (requiredPermission) {
    const hasPermission = authService.hasPermission(requiredPermission);
    
    if (!hasPermission) {
      // Redirect to forbidden page if user doesn't have the required permission
      router.navigate(['/forbidden']);
      return false;
    }
  }
  
  return true;
};
