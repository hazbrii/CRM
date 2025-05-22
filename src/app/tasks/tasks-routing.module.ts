import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TasksListComponent } from './tasks-list/tasks-list.component';
import { TaskDetailComponent } from './task-detail/task-detail.component';
import { authGuard } from '../guards/auth.guard';

const routes: Routes = [
  { 
    path: '', 
    component: TasksListComponent,
    canActivate: [authGuard],
    data: { requiredPermission: '' } // All authenticated users can access tasks
  },
  { 
    path: 'new', 
    component: TaskDetailComponent,
    canActivate: [authGuard],
    data: { requiredPermission: 'canEditProjects' } // Only admin/manager can create tasks
  },
  { 
    path: ':id', 
    component: TaskDetailComponent,
    canActivate: [authGuard],
    data: { requiredPermission: '' } // All authenticated users can view task details
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TasksRoutingModule { }
