import { Component, EventEmitter, Output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
  
  constructor(private authService: AuthService) {
    console.log('Header component initialized');
  }
  
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Close the dropdown when clicking outside of it
    const clickedElement = event.target as HTMLElement;
    const userMenuContainer = document.querySelector('.user-menu-container');
    
    if (userMenuContainer && !userMenuContainer.contains(clickedElement)) {
      this.isProfileDropdownOpen = false;
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
  }
  
  closeProfileDropdown(): void {
    this.isProfileDropdownOpen = false;
  }
  
  logout(event?: MouseEvent): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Close the dropdown before logging out
    this.isProfileDropdownOpen = false;
    
    // The AuthService now handles storage clearing and navigation
    this.authService.logout().subscribe();
  }
}
