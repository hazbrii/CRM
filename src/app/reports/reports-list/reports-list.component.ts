import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-reports-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './reports-list.component.html',
  styleUrl: './reports-list.component.css'
})
export class ReportsListComponent {

}
