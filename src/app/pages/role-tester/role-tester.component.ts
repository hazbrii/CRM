import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, UserRole } from '../../services/auth.service';

@Component({
  selector: 'app-role-tester',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './role-tester.component.html',
  styleUrl: './role-tester.component.css'
})
export class RoleTesterComponent {
  availableRoles: UserRole[] = ['Admin', 'Manager', 'User', 'Guest'];
  currentRole: UserRole;
  
  constructor(private authService: AuthService) {
    this.currentRole = authService.getUserRole();
  }
  
  changeRole(role: UserRole): void {
    this.authService.setUserRole(role);
    this.currentRole = role;
  }
  
  hasPermission(permission: string): boolean {
    return this.authService.hasPermission(permission as any);
  }
}
