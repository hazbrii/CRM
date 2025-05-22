import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

export type UserRole = 'Admin' | 'Manager' | 'User' | 'Guest';

export interface UserPermissions {
  canViewUsers: boolean;
  canEditUsers: boolean;
  canDeleteUsers: boolean;
  canViewTeams: boolean;
  canEditTeams: boolean;
  canViewProjects: boolean;
  canEditProjects: boolean;
  canViewReports: boolean;
  canManageProjects: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

const ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  'Admin': {
    canViewUsers: true,
    canEditUsers: true,
    canDeleteUsers: true,
    canViewTeams: true,
    canEditTeams: true,
    canViewProjects: true,
    canEditProjects: true,
    canViewReports: true,
    canManageProjects: true
  },
  'Manager': {
    canViewUsers: true,
    canEditUsers: true,
    canDeleteUsers: false,
    canViewTeams: true,
    canEditTeams: true,
    canViewProjects: true,
    canEditProjects: true,
    canViewReports: true,
    canManageProjects: true
  },
  'User': {
    canViewUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canViewTeams: true,
    canEditTeams: false,
    canViewProjects: true,
    canEditProjects: false,
    canViewReports: false,
    canManageProjects: false
  },
  'Guest': {
    canViewUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canViewTeams: false,
    canEditTeams: false,
    canViewProjects: false,
    canEditProjects: false,
    canViewReports: false,
    canManageProjects: false
  }
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // For demo purposes, hardcoded admin user
  private mockUser: User = {
    id: 1,
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'Admin'
  };

  constructor() {
    // Initialize with a mock user for demonstration
    // In a real app, you would check local storage or a token
    this.currentUserSubject.next(this.mockUser);
  }
  
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
  
  getUserRole(): UserRole {
    const user = this.currentUserSubject.value;
    return user ? user.role : 'Guest';
  }
  
  hasPermission(permission: keyof UserPermissions): boolean {
    const role = this.getUserRole();
    return ROLE_PERMISSIONS[role][permission];
  }
  
  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }
  
  // Mock login function - in a real app this would call an API
  login(email: string, password: string): Observable<User> {
    // For demo purposes, just return the mock user
    this.currentUserSubject.next(this.mockUser);
    return of(this.mockUser);
  }
  
  // Mock logout function
  logout(): Observable<boolean> {
    this.currentUserSubject.next(null);
    return of(true);
  }
  
  // Change role for testing permissions
  setUserRole(role: UserRole): void {
    if (this.currentUserSubject.value) {
      const updatedUser = {
        ...this.currentUserSubject.value,
        role
      };
      this.currentUserSubject.next(updatedUser);
    }
  }
}
