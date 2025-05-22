import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DocumentService, Document } from '../document.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class DocumentListComponent implements OnInit {
  documents: Document[] = [];
  isLoading = true;
  canManageDocuments = false;
  
  constructor(
    private documentService: DocumentService,
    private authService: AuthService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.canManageDocuments = this.authService.hasPermission('canManageDocuments');
    this.loadDocuments();
  }
  
  loadDocuments(): void {
    this.isLoading = true;
    this.documentService.getAllDocuments().subscribe({
      next: documents => {
        this.documents = documents;
        this.isLoading = false;
      },
      error: err => {
        console.error('Error loading documents', err);
        this.isLoading = false;
      }
    });
  }
  
  getFileSize(bytes: number): string {
    return this.documentService.getReadableFileSize(bytes);
  }
  
  getFileIcon(fileType: string): string {
    return this.documentService.getFileIcon(fileType);
  }
  
  getFileTypeLabel(fileType: string): string {
    if (fileType.includes('pdf')) {
      return 'PDF';
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return 'Word';
    } else if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
      return 'Excel';
    } else if (fileType.includes('image')) {
      const type = fileType.split('/')[1]?.toUpperCase() || 'Image';
      return type;
    } else {
      return 'File';
    }
  }
  
  downloadDocument(document: Document): void {
    // In a real app, this would trigger a file download
    console.log(`Downloading document: ${document.fileName}`);
    window.open(document.fileUrl, '_blank');
  }
  
  deleteDocument(id: number): void {
    if (confirm('Are you sure you want to delete this document?')) {
      this.documentService.deleteDocument(id).subscribe({
        next: () => {
          this.loadDocuments();
        },
        error: err => {
          console.error('Error deleting document', err);
        }
      });
    }
  }
  
  editDocument(document: Document): void {
    // Navigate to edit page with document id
    this.router.navigate(['/documents/edit', document.id]);
  }
} 