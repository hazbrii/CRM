import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TeamsListComponent } from './teams-list/teams-list.component';
import { TeamDetailComponent } from './team-detail/team-detail.component';
import { authGuard } from '../guards/auth.guard';

const routes: Routes = [
  { 
    path: '', 
    component: TeamsListComponent,
    canActivate: [authGuard],
    data: { requiredPermission: 'canViewTeams' }
  },
  {
    path: ':id',
    component: TeamDetailComponent,
    canActivate: [authGuard],
    data: { requiredPermission: 'canViewTeams' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TeamsRoutingModule { }
