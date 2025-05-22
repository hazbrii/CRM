import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DocumentService } from '../document.service';

interface Project {
  id: number;
  name: string;
}

@Component({
  selector: 'app-document-upload',
  templateUrl: './document-upload.component.html',
  styleUrls: ['./document-upload.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class DocumentUploadComponent implements OnInit {
  uploadForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  selectedFile: File | null = null;
  filePreview = '';
  isEditMode = false;
  documentId: number | null = null;
  pageTitle = 'Upload Document';
  submitButtonText = 'Upload Document';
  
  // Mock projects for selection - in a real app would come from a ProjectService
  projects: Project[] = [
    { id: 1, name: 'Website Redesign' },
    { id: 2, name: 'Mobile App Development' },
    { id: 3, name: 'Marketing Campaign' }
  ];
  
  constructor(
    private fb: FormBuilder,
    private documentService: DocumentService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.uploadForm = this.fb.group({
      title: ['', [Validators.required]],
      file: [null, [Validators.required]],
      projectId: [null]
    });
  }
  
  ngOnInit(): void {
    // Check if we're in edit mode
    this.isEditMode = this.route.snapshot.data['isEditMode'] === true;
    
    if (this.isEditMode) {
      this.pageTitle = 'Edit Document';
      this.submitButtonText = 'Update Document';
      
      // Get the document ID from the route
      const id = Number(this.route.snapshot.paramMap.get('id'));
      if (id) {
        this.documentId = id;
        this.loadDocument(id);
        
        // In edit mode, the file is optional
        this.uploadForm.get('file')?.clearValidators();
        this.uploadForm.get('file')?.updateValueAndValidity();
      }
    }
  }
  
  loadDocument(id: number): void {
    this.documentService.getDocumentById(id).subscribe({
      next: (document) => {
        if (document) {
          this.uploadForm.patchValue({
            title: document.title,
            projectId: document.projectId || null
          });
          
          this.filePreview = document.fileName;
        } else {
          this.errorMessage = 'Document not found.';
        }
      },
      error: (err) => {
        console.error('Error loading document', err);
        this.errorMessage = 'Error loading document. Please try again.';
      }
    });
  }
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.uploadForm.patchValue({ file: this.selectedFile });
      
      // Update file name preview
      this.filePreview = this.selectedFile.name;
      
      // Mark the file control as touched to trigger validation
      this.uploadForm.get('file')?.markAsTouched();
    }
  }
  
  onSubmit(): void {
    if (this.uploadForm.invalid || (!this.isEditMode && !this.selectedFile)) {
      // Mark all fields as touched to trigger validation messages
      this.markFormGroupTouched(this.uploadForm);
      return;
    }
    
    this.isSubmitting = true;
    this.errorMessage = '';
    
    if (this.isEditMode) {
      this.updateDocument();
    } else {
      this.createDocument();
    }
  }
  
  createDocument(): void {
    if (!this.selectedFile) return;
    
    // In a real app, first upload the file to get a URL
    this.documentService.uploadFile(this.selectedFile).subscribe({
      next: (fileUrl: string) => {
        // Then create the document record with the file URL
        const formValues = this.uploadForm.value;
        const document = {
          title: formValues.title,
          fileName: this.selectedFile!.name,
          fileType: this.selectedFile!.type,
          fileSize: this.selectedFile!.size,
          projectId: formValues.projectId,
          projectName: this.getProjectName(formValues.projectId)
        };
        
        this.documentService.addDocument(document).subscribe({
          next: () => {
            this.isSubmitting = false;
            this.router.navigate(['/documents']);
          },
          error: (err) => {
            console.error('Error adding document record', err);
            this.errorMessage = 'Failed to save document. Please try again.';
            this.isSubmitting = false;
          }
        });
      },
      error: (err) => {
        console.error('Error uploading file', err);
        this.errorMessage = 'Failed to upload file. Please try again.';
        this.isSubmitting = false;
      }
    });
  }
  
  updateDocument(): void {
    if (!this.documentId) return;
    
    const updateDocument = (fileUrl?: string): void => {
      const formValues = this.uploadForm.value;
      const updates = {
        id: this.documentId as number,
        title: formValues.title,
        projectId: formValues.projectId,
        projectName: this.getProjectName(formValues.projectId)
      };
      
      // If a new file was selected, include file details
      if (this.selectedFile && fileUrl) {
        Object.assign(updates, {
          fileName: this.selectedFile.name,
          fileType: this.selectedFile.type,
          fileSize: this.selectedFile.size,
          fileUrl: fileUrl
        });
      }
      
      this.documentService.updateDocument(updates).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigate(['/documents']);
        },
        error: (error: Error) => {
          console.error('Error updating document', error);
          this.errorMessage = 'Failed to update document. Please try again.';
          this.isSubmitting = false;
        }
      });
    };
    
    // If a new file was selected, upload it first
    if (this.selectedFile) {
      this.documentService.uploadFile(this.selectedFile).subscribe({
        next: (fileUrl: string) => {
          updateDocument(fileUrl);
        },
        error: (err) => {
          console.error('Error uploading file', err);
          this.errorMessage = 'Failed to upload file. Please try again.';
          this.isSubmitting = false;
        }
      });
    } else {
      // Just update the document details without changing the file
      updateDocument();
    }
  }
  
  cancel(): void {
    this.router.navigate(['/documents']);
  }
  
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      // If control is a nested form group, recursively mark its controls as touched
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
  
  private getProjectName(projectId: number | null): string | undefined {
    if (!projectId) return undefined;
    return this.projects.find(p => p.id === projectId)?.name;
  }
} 