import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;
  isLoading = false;
  loginError: string | null = null;
  
  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.initForm();
    this.checkExistingSession();
  }
  
  private initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [
        Validators.required, 
        Validators.email
      ]],
      password: ['', [
        Validators.required, 
        Validators.minLength(6)
      ]],
      rememberMe: [false]
    });

    // Clear errors on form changes
    this.loginForm.valueChanges.subscribe(() => {
      if (this.loginError) {
        this.loginError = null;
      }
    });
  }
  
  private checkExistingSession(): void {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (token) {
      this.navigateToProjects();
    }
  }
  
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  
  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
  
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }
    
    this.isLoading = true;
    this.loginError = null;
    
    const { email, password, rememberMe } = this.loginForm.value;
    
    // Simulate authentication (replace with actual API call)
    setTimeout(() => {
      try {
        // Demo authentication logic - In production, call an auth service
        if (this.authenticateUser(email, password)) {
          const token = this.generateToken();
          this.storeAuthToken(token, rememberMe);
          this.navigateToProjects();
        } else {
          this.handleLoginError('Invalid email or password. Please try again.');
        }
      } catch (error) {
        this.handleLoginError('An unexpected error occurred. Please try again later.');
        console.error('Login error:', error);
      }
    }, 800);
  }
  
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
  
  private authenticateUser(email: string, password: string): boolean {
    // Demo authentication - replace with actual auth logic
    return email === 'admin@example.com' && password === 'admin123';
  }
  
  private generateToken(): string {
    // In production, this would be a JWT from your auth service
    return `mock_jwt_token_${Math.random().toString(36).substring(2)}`;
  }
  
  private storeAuthToken(token: string, rememberMe: boolean): void {
    if (rememberMe) {
      localStorage.setItem('auth_token', token);
    } else {
      sessionStorage.setItem('auth_token', token);
    }
  }
  
  private navigateToProjects(): void {
    this.router.navigate(['/projects']);
  }
  
  private handleLoginError(message: string): void {
    this.loginError = message;
    this.isLoading = false;
  }
}
