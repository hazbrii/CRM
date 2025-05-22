import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TeamsRoutingModule } from './teams-routing.module';
import { TeamsListComponent } from './teams-list/teams-list.component';
import { TeamListComponent } from './team-list/team-list.component';
import { TeamFormComponent } from './team-form/team-form.component';
import { TeamDetailComponent } from './team-detail/team-detail.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    TeamsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    TeamsListComponent,
    TeamListComponent,
    TeamFormComponent,
    TeamDetailComponent
  ]
})
export class TeamsModule { }
