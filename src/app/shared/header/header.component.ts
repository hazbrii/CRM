import { Component, EventEmitter, Output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  @Output() sidebarToggle = new EventEmitter<void>();
  isProfileDropdownOpen = false;
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    console.log('Header component initialized');
  }
  
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Close the dropdown when clicking outside of it
    const clickedElement = event.target as HTMLElement;
    const userMenuContainer = document.querySelector('.user-menu-container');
    
    if (userMenuContainer && !userMenuContainer.contains(clickedElement)) {
      this.isProfileDropdownOpen = false;
      console.log('Closing dropdown from document click');
    }
  }
  
  toggleSidebar(): void {
    this.sidebarToggle.emit();
  }
  
  toggleProfileDropdown(event?: MouseEvent): void {
    if (event) {
      // Prevent this click from being captured by the document click listener
      event.stopPropagation();
    }
    
    this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
    console.log('Profile dropdown toggled:', this.isProfileDropdownOpen);
  }
  
  closeProfileDropdown(): void {
    this.isProfileDropdownOpen = false;
    console.log('Profile dropdown closed');
  }
  
  logout(event?: MouseEvent): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    console.log('Logout clicked');
    this.authService.logout().subscribe({
      next: () => {
        console.log('Logout successful, navigating to login');
        this.router.navigate(['/login']);
      }
    });
  }
}
