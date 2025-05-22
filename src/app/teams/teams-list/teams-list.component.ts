import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TeamService, Team, TeamMember } from '../../services/team.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-teams-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './teams-list.component.html',
  styleUrl: './teams-list.component.css'
})
export class TeamsListComponent implements OnInit {
  // Teams data
  teams: Team[] = [];
  filteredTeams: Team[] = [];
  searchText: string = '';
  isLoading: boolean = true;
  
  // Team form modal
  showTeamModal: boolean = false;
  editMode: boolean = false;
  selectedTeam: Team | null = null;
  teamForm: FormGroup;
  
  // Delete modal
  showDeleteModal: boolean = false;
  
  // Members modal
  showMembersModal: boolean = false;
  activeTab: 'current' | 'add' = 'current';
  memberSearchText: string = '';
  userSearchText: string = '';
  availableUsers: TeamMember[] = [];
  filteredTeamMembers: TeamMember[] = [];
  filteredAvailableUsers: TeamMember[] = [];
  
  constructor(
    private teamService: TeamService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.teamForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]]
    });
  }
  
  ngOnInit(): void {
    this.loadTeams();
    this.loadAvailableUsers();
  }
  
  loadTeams(): void {
    this.isLoading = true;
    this.teamService.getTeams().subscribe({
      next: (teams) => {
        this.teams = teams;
        this.filteredTeams = [...teams];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading teams:', error);
        this.isLoading = false;
      }
    });
  }
  
  loadAvailableUsers(): void {
    this.teamService.getAvailableUsers().subscribe({
      next: (users) => {
        this.availableUsers = users;
      },
      error: (error) => {
        console.error('Error loading available users:', error);
      }
    });
  }
  
  filterTeams(): void {
    const search = this.searchText.toLowerCase().trim();
    
    if (!search) {
      this.filteredTeams = [...this.teams];
      return;
    }
    
    this.filteredTeams = this.teams.filter(team => 
      team.name.toLowerCase().includes(search) || 
      team.description.toLowerCase().includes(search)
    );
  }
  
  // Team form modal functions
  openCreateTeamModal(): void {
    this.editMode = false;
    this.selectedTeam = null;
    this.teamForm.reset();
    this.showTeamModal = true;
  }
  
  openEditTeamModal(team: Team): void {
    this.editMode = true;
    this.selectedTeam = team;
    this.teamForm.patchValue({
      name: team.name,
      description: team.description
    });
    this.showTeamModal = true;
  }
  
  closeTeamModal(): void {
    this.showTeamModal = false;
    this.teamForm.reset();
  }
  
  saveTeam(): void {
    if (this.teamForm.invalid) {
      return;
    }
    
    const formData = this.teamForm.value;
    
    if (this.editMode && this.selectedTeam) {
      const updatedTeam: Team = {
        ...this.selectedTeam,
        name: formData.name,
        description: formData.description
      };
      
      this.teamService.updateTeam(updatedTeam).subscribe({
        next: () => {
          this.closeTeamModal();
          this.loadTeams();
        },
        error: (error) => {
          console.error('Error updating team:', error);
        }
      });
    } else {
      // Create new team
      const newTeam = {
        name: formData.name,
        description: formData.description,
        created: new Date(),
        members: []
      };
      
      this.teamService.createTeam(newTeam).subscribe({
        next: () => {
          this.closeTeamModal();
          this.loadTeams();
        },
        error: (error) => {
          console.error('Error creating team:', error);
        }
      });
    }
  }
  
  // Delete modal functions
  openDeleteConfirmation(team: Team): void {
    this.selectedTeam = team;
    this.showDeleteModal = true;
  }
  
  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedTeam = null;
  }
  
  deleteTeam(): void {
    if (!this.selectedTeam) {
      return;
    }
    
    this.teamService.deleteTeam(this.selectedTeam.id).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.loadTeams();
      },
      error: (error) => {
        console.error('Error deleting team:', error);
      }
    });
  }
  
  // Team detail and member management
  viewTeamDetails(team: Team): void {
    this.router.navigate(['/teams', team.id]);
  }
  
  manageMembers(team: Team): void {
    this.selectedTeam = team;
    this.filteredTeamMembers = [...team.members];
    this.updateFilteredAvailableUsers();
    this.activeTab = 'current';
    this.memberSearchText = '';
    this.userSearchText = '';
    this.showMembersModal = true;
  }
  
  closeMembersModal(): void {
    this.showMembersModal = false;
    this.selectedTeam = null;
  }
  
  updateFilteredTeamMembers(): void {
    if (!this.selectedTeam) {
      this.filteredTeamMembers = [];
      return;
    }
    
    const search = this.memberSearchText.toLowerCase().trim();
    
    if (!search) {
      this.filteredTeamMembers = [...this.selectedTeam.members];
      return;
    }
    
    this.filteredTeamMembers = this.selectedTeam.members.filter(member =>
      member.name.toLowerCase().includes(search) ||
      member.email.toLowerCase().includes(search) ||
      member.role.toLowerCase().includes(search)
    );
  }
  
  updateFilteredAvailableUsers(): void {
    const currentTeamMemberIds = this.selectedTeam?.members.map(m => m.id) || [];
    const availableUsers = this.availableUsers.filter(user => !currentTeamMemberIds.includes(user.id));
    
    const search = this.userSearchText.toLowerCase().trim();
    
    if (!search) {
      this.filteredAvailableUsers = availableUsers;
      return;
    }
    
    this.filteredAvailableUsers = availableUsers.filter(user =>
      user.name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      user.role.toLowerCase().includes(search)
    );
  }
  
  addMember(user: TeamMember): void {
    if (!this.selectedTeam) {
      return;
    }
    
    this.teamService.addMemberToTeam(this.selectedTeam.id, user).subscribe({
      next: (updatedTeam) => {
        if (updatedTeam) {
          this.selectedTeam = updatedTeam;
          this.filteredTeamMembers = [...updatedTeam.members];
          this.updateFilteredAvailableUsers();
        }
      },
      error: (error) => {
        console.error('Error adding member to team:', error);
      }
    });
  }
  
  removeMember(member: TeamMember): void {
    if (!this.selectedTeam) {
      return;
    }
    
    this.teamService.removeMemberFromTeam(this.selectedTeam.id, member.id).subscribe({
      next: (updatedTeam) => {
        if (updatedTeam) {
          this.selectedTeam = updatedTeam;
          this.filteredTeamMembers = [...updatedTeam.members];
          this.updateFilteredAvailableUsers();
        }
      },
      error: (error) => {
        console.error('Error removing member from team:', error);
      }
    });
  }
  
  // Utility functions
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
