import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsListComponent } from './reports-list/reports-list.component';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReportsRoutingModule,
    ReportsListComponent
  ]
})
export class ReportsModule { }
