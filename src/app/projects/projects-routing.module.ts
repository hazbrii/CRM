import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjectsListComponent } from './projects-list/projects-list.component';
import { authGuard } from '../guards/auth.guard';

const routes: Routes = [
  { 
    path: '', 
    component: ProjectsListComponent,
    canActivate: [authGuard],
    data: { requiredPermission: 'canManageProjects' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectsRoutingModule { }
