import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../user.service';
import { User } from '../models/user.model';
import { UserFormComponent } from '../user-form/user-form.component';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, UserFormComponent],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.css'
})
export class UsersListComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm: string = '';
  selectedRole: string = '';
  selectedTeam: string = '';
  roles: string[] = ['Admin', 'Manager', 'User'];
  teams: string[] = [];
  showDeleteConfirmation = false;
  userToDelete?: User;
  showResetPasswordModal = false;
  userToResetPassword?: User;
  newPassword: string = '';
  
  // Add properties for user form dialog
  showUserFormModal = false;
  userToEdit?: User;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe(users => {
      this.users = users;
      this.filteredUsers = users;
      // Extract unique teams
      this.teams = [...new Set(users.map(user => user.team))];
    });
  }

  search(): void {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = this.searchTerm === '' || 
        user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesRole = this.selectedRole === '' || 
        user.role === this.selectedRole;
      
      const matchesTeam = this.selectedTeam === '' || 
        user.team === this.selectedTeam;
      
      return matchesSearch && matchesRole && matchesTeam;
    });
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedRole = '';
    this.selectedTeam = '';
    this.filteredUsers = this.users;
  }

  // Methods for create/edit user dialog
  createNewUser(): void {
    this.userToEdit = undefined;
    this.showUserFormModal = true;
  }

  editUser(user: User): void {
    this.userToEdit = { ...user };
    this.showUserFormModal = true;
  }
  
  closeUserForm(): void {
    this.showUserFormModal = false;
    this.userToEdit = undefined;
    this.loadUsers();
  }

  confirmDelete(user: User): void {
    this.userToDelete = user;
    this.showDeleteConfirmation = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirmation = false;
    this.userToDelete = undefined;
  }

  deleteUser(): void {
    if (this.userToDelete) {
      this.userService.deleteUser(this.userToDelete.id).subscribe(() => {
        this.loadUsers();
        this.showDeleteConfirmation = false;
        this.userToDelete = undefined;
      });
    }
  }

  showResetPassword(user: User): void {
    this.userToResetPassword = user;
    this.newPassword = '';
    this.showResetPasswordModal = true;
  }

  cancelResetPassword(): void {
    this.showResetPasswordModal = false;
    this.userToResetPassword = undefined;
  }

  resetPassword(): void {
    if (this.userToResetPassword && this.newPassword) {
      this.userService
        .resetPassword(this.userToResetPassword.id, this.newPassword)
        .subscribe(() => {
          this.showResetPasswordModal = false;
          this.userToResetPassword = undefined;
          this.newPassword = '';
        });
    }
  }
}
