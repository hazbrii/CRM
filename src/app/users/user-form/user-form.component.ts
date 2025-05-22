import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../models/user.model';
import { UserService } from '../user.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.css'
})
export class UserFormComponent implements OnInit {
  @Input() userToEdit?: User;
  @Output() formClosed = new EventEmitter<void>();

  user: Partial<User> = {
    name: '',
    email: '',
    role: 'User',
    team: ''
  };
  
  isEditMode = false;
  roles: string[] = ['Admin', 'Manager', 'User'];
  teams: string[] = ['Development', 'Marketing', 'Sales', 'Support', 'HR'];
  showPassword = false;
  formSubmitted = false;
  
  constructor(private userService: UserService) {}
  
  ngOnInit(): void {
    if (this.userToEdit) {
      this.isEditMode = true;
      this.user = { ...this.userToEdit };
    }
  }
  
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  
  onSubmit(): void {
    this.formSubmitted = true;
    
    // Simple validation
    if (!this.user.name || !this.user.email || !this.user.role || !this.user.team) {
      return;
    }
    
    if (this.isEditMode) {
      this.userService.updateUser(this.user as User).subscribe(() => {
        this.formClosed.emit();
      });
    } else {
      if (!this.user.password) {
        return; // Password required for new users
      }
      
      this.userService.createUser(this.user as Omit<User, 'id'>).subscribe(() => {
        this.formClosed.emit();
      });
    }
  }
  
  cancelForm(): void {
    this.formClosed.emit();
  }
}
