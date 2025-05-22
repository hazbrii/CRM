import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { TeamService, Team, TeamMember } from '../../services/team.service';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './team-detail.component.html',
  styleUrl: './team-detail.component.css'
})
export class TeamDetailComponent implements OnInit {
  team: Team | undefined;
  searchText: string = '';
  filteredMembers: TeamMember[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private teamService: TeamService
  ) {}

  ngOnInit(): void {
    this.getTeam();
  }

  getTeam(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.teamService.getTeam(id).subscribe(team => {
      this.team = team;
      if (team) {
        this.filteredMembers = [...team.members];
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  editTeam(): void {
    // Navigate to edit page or open edit dialog
    if (this.team) {
      this.router.navigate(['/teams']);
    }
  }

  manageMembers(): void {
    // Navigate to manage members page or open dialog
    if (this.team) {
      this.router.navigate(['/teams']);
    }
  }

  filterMembers(): void {
    if (!this.team) {
      return;
    }
    
    const search = this.searchText.toLowerCase().trim();
    
    if (!search) {
      this.filteredMembers = [...this.team.members];
      return;
    }
    
    this.filteredMembers = this.team.members.filter(member => 
      member.name.toLowerCase().includes(search) || 
      member.email.toLowerCase().includes(search) ||
      member.role.toLowerCase().includes(search)
    );
  }

  getInitials(name: string): string {
    if (!name) {
      return '';
    }
    
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    
    return name.substring(0, 2).toUpperCase();
  }
}
