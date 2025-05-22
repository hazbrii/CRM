import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  menuItems = [
    { path: '/users', icon: 'users', label: 'User Management' },
    { path: '/teams', icon: 'users-plus', label: 'Teams' },
    { path: '/projects', icon: 'folder', label: 'Projects' },
    { path: '/reports', icon: 'bar-chart', label: 'Reports' },
    { path: '/settings', icon: 'settings', label: 'Settings' }
  ];
}
