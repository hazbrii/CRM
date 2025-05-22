import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { DocumentListComponent } from './document-list/document-list.component';
import { DocumentUploadComponent } from './document-upload/document-upload.component';
import { DocumentsComponent } from './documents.component';
import { DocumentService } from './document.service';

const routes: Routes = [
  {
    path: '',
    component: DocumentsComponent,
    children: [
      { path: '', component: DocumentListComponent },
      { 
        path: 'upload', 
        component: DocumentUploadComponent, 
        data: { requiredPermission: 'canManageDocuments' }
      },
      { 
        path: 'edit/:id', 
        component: DocumentUploadComponent, 
        data: { requiredPermission: 'canManageDocuments', isEditMode: true }
      }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    DocumentsComponent,
    DocumentListComponent,
    DocumentUploadComponent
  ],
  providers: [
    DocumentService
  ]
})
export class DocumentsModule { } 