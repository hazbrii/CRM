import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-teams-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './teams-list.component.html',
  styleUrl: './teams-list.component.css'
})
export class TeamsListComponent {

}
