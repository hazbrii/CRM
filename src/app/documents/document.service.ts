import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export interface Document {
  id: number;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadDate: Date;
  projectId?: number;
  projectName?: string;
  fileUrl: string;  // In a real app, this would be a URL to the file storage
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  // Mock in-memory documents for demo
  private documents: Document[] = [
    {
      id: 1,
      title: 'Project Plan Template',
      fileName: 'project_plan_template.docx',
      fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      fileSize: 2500000,
      uploadedBy: 'Admin User',
      uploadDate: new Date(2023, 5, 15),
      projectId: 1,
      projectName: 'Website Redesign',
      fileUrl: 'assets/mock/documents/project_plan.docx'
    },
    {
      id: 2,
      title: 'Budget Spreadsheet',
      fileName: 'budget_2023.xlsx',
      fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      fileSize: 1800000,
      uploadedBy: 'Admin User',
      uploadDate: new Date(2023, 6, 10),
      projectId: 1,
      projectName: 'Website Redesign',
      fileUrl: 'assets/mock/documents/budget.xlsx'
    },
    {
      id: 3,
      title: 'Marketing Guidelines',
      fileName: 'marketing_guidelines.pdf',
      fileType: 'application/pdf',
      fileSize: 3500000,
      uploadedBy: 'Marketing Manager',
      uploadDate: new Date(2023, 7, 5),
      fileUrl: 'assets/mock/documents/guidelines.pdf'
    }
  ];

  private documentsSubject = new BehaviorSubject<Document[]>(this.documents);

  constructor(private authService: AuthService) {}

  getAllDocuments(): Observable<Document[]> {
    // Simulate API delay
    return this.documentsSubject.asObservable().pipe(delay(500));
  }

  getDocumentById(id: number): Observable<Document | undefined> {
    return this.getAllDocuments().pipe(
      map(documents => documents.find(doc => doc.id === id))
    );
  }

  getDocumentsByProject(projectId: number): Observable<Document[]> {
    return this.getAllDocuments().pipe(
      map(documents => documents.filter(doc => doc.projectId === projectId))
    );
  }

  addDocument(document: Omit<Document, 'id' | 'uploadedBy' | 'uploadDate' | 'fileUrl'>): Observable<Document> {
    const currentUser = this.authService.getCurrentUser();
    const newDocument: Document = {
      ...document,
      id: this.getNextId(),
      uploadedBy: currentUser?.name || 'Unknown User',
      uploadDate: new Date(),
      fileUrl: `assets/mock/documents/${document.fileName}`
    };
    
    this.documents = [...this.documents, newDocument];
    this.documentsSubject.next(this.documents);
    
    // Simulate API delay
    return of(newDocument).pipe(delay(500));
  }

  updateDocument(document: Partial<Document> & { id: number }): Observable<Document> {
    const index = this.documents.findIndex(doc => doc.id === document.id);
    
    if (index === -1) {
      return throwError(() => new Error('Document not found'));
    }
    
    // Merge the existing document with the updates
    const updatedDocument = {
      ...this.documents[index],
      ...document,
      // Don't allow changing these fields
      uploadedBy: this.documents[index].uploadedBy,
      uploadDate: this.documents[index].uploadDate
    };
    
    // Update the document in the array
    this.documents = [
      ...this.documents.slice(0, index),
      updatedDocument,
      ...this.documents.slice(index + 1)
    ];
    
    this.documentsSubject.next(this.documents);
    
    // Simulate API delay
    return of(updatedDocument).pipe(delay(500));
  }

  deleteDocument(id: number): Observable<boolean> {
    this.documents = this.documents.filter(doc => doc.id !== id);
    this.documentsSubject.next(this.documents);
    
    // Simulate API delay
    return of(true).pipe(delay(500));
  }

  private getNextId(): number {
    return Math.max(...this.documents.map(doc => doc.id), 0) + 1;
  }

  // In a real application, this would make an API call to upload a file
  uploadFile(file: File): Observable<string> {
    // Mock file upload - just returns a fake URL
    console.log(`Uploading file: ${file.name} (${file.size} bytes)`);
    return of(`assets/mock/documents/${file.name}`).pipe(delay(1000));
  }

  // Helper function to get human-readable file size
  getReadableFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  // Helper function to get a file icon based on file type
  getFileIcon(fileType: string): string {
    if (fileType.includes('pdf')) {
      return 'far fa-file-pdf';
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return 'far fa-file-word';
    } else if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
      return 'far fa-file-excel';
    } else if (fileType.includes('image')) {
      return 'far fa-file-image';
    } else {
      return 'far fa-file';
    }
  }
} 