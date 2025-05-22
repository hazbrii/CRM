import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { CreateAccountComponent } from './create-account/create-account.component';
import { ForbiddenComponent } from './pages/forbidden/forbidden.component';
import { RoleTesterComponent } from './pages/role-tester/role-tester.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'create-account', component: CreateAccountComponent },
  { 
    path: 'users', 
    loadChildren: () => import('./users/users.module').then(m => m.UsersModule),
    canActivate: [authGuard],
    data: { requiredPermission: 'canViewUsers' }
  },
  {
    path: 'teams',
    loadChildren: () => import('./teams/teams.module').then(m => m.TeamsModule),
    canActivate: [authGuard],
    data: { requiredPermission: 'canViewTeams' }
  },
  {
    path: 'projects',
    loadChildren: () => import('./projects/projects.module').then(m => m.ProjectsModule),
    canActivate: [authGuard],
    data: { requiredPermission: 'canViewProjects' }
  },
  {
    path: 'reports',
    loadChildren: () => import('./reports/reports.module').then(m => m.ReportsModule),
    canActivate: [authGuard],
    data: { requiredPermission: 'canViewReports' }
  },
  { path: 'role-tester', component: RoleTesterComponent },
  { path: 'forbidden', component: ForbiddenComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
