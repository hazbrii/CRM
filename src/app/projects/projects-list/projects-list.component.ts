import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProjectService, Project, ProjectStatus } from '../../services/project.service';
import { TeamService, Team } from '../../services/team.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-projects-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './projects-list.component.html',
  styleUrl: './projects-list.component.css'
})
export class ProjectsListComponent implements OnInit {
  // Projects data
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  teams: Team[] = [];
  statuses: ProjectStatus[] = [];

  // Loading state
  isLoading: boolean = true;
  
  // Filter options
  searchText: string = '';
  selectedTeamId: number = 0; // 0 means all teams
  selectedStatus: string = ''; // Empty means all statuses
  startDate: string = '';
  endDate: string = '';

  // Project form modal
  showProjectModal: boolean = false;
  editMode: boolean = false;
  selectedProject: Project | null = null;
  projectForm: FormGroup;

  // Delete confirmation modal
  showDeleteModal: boolean = false;
  
  // View details modal
  showDetailsModal: boolean = false;

  constructor(
    private projectService: ProjectService,
    private teamService: TeamService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.projectForm = this.createProjectForm();
    this.statuses = this.projectService.getStatuses();
  }
  
  ngOnInit(): void {
    this.loadProjects();
    this.loadTeams();
  }
  
  createProjectForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      startDate: ['', [Validators.required]],
      endDate: [''],
      status: [ProjectStatus.PLANNING, [Validators.required]],
      teamId: ['', [Validators.required]],
      budget: [0, [Validators.min(0)]],
      tasksCount: [0],
      completedTasksCount: [0],
      documentsCount: [0]
    });
  }
  
  loadProjects(): void {
    this.isLoading = true;
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.filteredProjects = [...projects];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this.isLoading = false;
      }
    });
  }
  
  loadTeams(): void {
    this.teamService.getTeams().subscribe({
      next: (teams) => {
        this.teams = teams;
      },
      error: (error) => {
        console.error('Error loading teams:', error);
      }
    });
  }
  
  filterProjects(): void {
    this.filteredProjects = this.projects.filter(project => {
      // Text search filter
      const searchMatch = this.searchText.trim() === '' || 
        project.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
        project.description.toLowerCase().includes(this.searchText.toLowerCase());
      
      // Team filter
      const teamMatch = this.selectedTeamId === 0 || project.teamId === this.selectedTeamId;
      
      // Status filter
      const statusMatch = this.selectedStatus === '' || project.status === this.selectedStatus;
      
      // Date range filter - only if both dates are provided
      let dateMatch = true;
      if (this.startDate && this.endDate) {
        const start = new Date(this.startDate);
        const end = new Date(this.endDate);
        const projectStart = new Date(project.startDate);
        dateMatch = projectStart >= start && projectStart <= end;
      }
      
      return searchMatch && teamMatch && statusMatch && dateMatch;
    });
  }
  
  resetFilters(): void {
    this.searchText = '';
    this.selectedTeamId = 0;
    this.selectedStatus = '';
    this.startDate = '';
    this.endDate = '';
    this.filteredProjects = [...this.projects];
  }
  
  // Project modal functions
  openCreateProjectModal(): void {
    this.editMode = false;
    this.selectedProject = null;
    this.projectForm.reset({
      status: ProjectStatus.PLANNING,
      budget: 0,
      tasksCount: 0,
      completedTasksCount: 0,
      documentsCount: 0
    });
    this.showProjectModal = true;
  }
  
  openEditProjectModal(project: Project): void {
    this.editMode = true;
    this.selectedProject = project;
    
    // Convert dates for form input
    const startDate = project.startDate ? this.formatDateForInput(new Date(project.startDate)) : '';
    const endDate = project.endDate ? this.formatDateForInput(new Date(project.endDate)) : '';
    
    this.projectForm.patchValue({
      name: project.name,
      description: project.description,
      startDate: startDate,
      endDate: endDate,
      status: project.status,
      teamId: project.teamId,
      budget: project.budget,
      tasksCount: project.tasksCount,
      completedTasksCount: project.completedTasksCount,
      documentsCount: project.documentsCount
    });
    
    this.showProjectModal = true;
  }
  
  closeProjectModal(): void {
    this.showProjectModal = false;
  }
  
  saveProject(): void {
    if (this.projectForm.invalid) {
      return;
    }
    
    const formData = this.projectForm.value;
    
    // Convert form data to Project model
    const projectData: Partial<Project> = {
      name: formData.name,
      description: formData.description,
      startDate: new Date(formData.startDate),
      status: formData.status,
      teamId: Number(formData.teamId),
      budget: Number(formData.budget),
      tasksCount: Number(formData.tasksCount || 0),
      completedTasksCount: Number(formData.completedTasksCount || 0),
      documentsCount: Number(formData.documentsCount || 0)
    };
    
    if (formData.endDate) {
      projectData.endDate = new Date(formData.endDate);
    } else {
      projectData.endDate = null;
    }
    
    if (this.editMode && this.selectedProject) {
      const updatedProject: Project = {
        ...this.selectedProject,
        ...projectData
      };
      
      this.projectService.updateProject(updatedProject).subscribe({
        next: () => {
          this.closeProjectModal();
          this.loadProjects();
        },
        error: (error) => {
          console.error('Error updating project:', error);
        }
      });
    } else {
      this.projectService.createProject(projectData as Omit<Project, 'id'>).subscribe({
        next: () => {
          this.closeProjectModal();
          this.loadProjects();
        },
        error: (error) => {
          console.error('Error creating project:', error);
        }
      });
    }
  }
  
  // Delete confirmation modal functions
  openDeleteConfirmation(project: Project): void {
    this.selectedProject = project;
    this.showDeleteModal = true;
  }
  
  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedProject = null;
  }
  
  deleteProject(): void {
    if (!this.selectedProject) {
      return;
    }
    
    this.projectService.deleteProject(this.selectedProject.id).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.loadProjects();
      },
      error: (error) => {
        console.error('Error deleting project:', error);
      }
    });
  }
  
  // View details modal functions
  openDetailsModal(project: Project): void {
    this.selectedProject = project;
    this.showDetailsModal = true;
  }
  
  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedProject = null;
  }
  
  // Helper functions
  getTeamName(teamId: number): string {
    const team = this.teams.find(t => t.id === teamId);
    return team ? team.name : 'Unknown Team';
  }
  
  getTaskCompletionPercentage(project: Project): number {
    if (project.tasksCount === 0) return 0;
    return Math.round((project.completedTasksCount / project.tasksCount) * 100);
  }
  
  formatDate(date: Date | null): string {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString();
  }
  
  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  getStatusClass(status: string): string {
    switch (status) {
      case ProjectStatus.PLANNING:
        return 'status-planning';
      case ProjectStatus.IN_PROGRESS:
        return 'status-in-progress';
      case ProjectStatus.ON_HOLD:
        return 'status-on-hold';
      case ProjectStatus.COMPLETED:
        return 'status-completed';
      case ProjectStatus.CANCELED:
        return 'status-canceled';
      default:
        return '';
    }
  }
  
  navigateToTasks(project: Project): void {
    // This would navigate to a tasks list for the project
    // Placeholder for now
    console.log('Navigate to tasks for project:', project.id);
  }
  
  navigateToDocuments(project: Project): void {
    // This would navigate to documents for the project
    // Placeholder for now
    console.log('Navigate to documents for project:', project.id);
  }
}
