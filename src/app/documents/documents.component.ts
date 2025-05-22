import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class DocumentsComponent {
  canManageDocuments = false;
  
  constructor(private authService: AuthService) {
    this.canManageDocuments = this.authService.hasPermission('canManageDocuments');
  }
} 