import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { 
  TaskService, 
  Task, 
  TaskStatus, 
  TaskPriority, 
  TaskFilter 
} from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { TeamService } from '../../services/team.service';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-tasks-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './tasks-list.component.html',
  styleUrl: './tasks-list.component.css'
})
export class TasksListComponent implements OnInit {
  // Tasks data
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  
  // Filter values
  filter: TaskFilter = {};
  taskStatuses: TaskStatus[] = [];
  taskPriorities: TaskPriority[] = [];
  teams: any[] = [];
  projects: any[] = [];
  
  // View options
  viewMode: 'list' | 'board' = 'list';
  isLoading: boolean = true;
  showMyTasksOnly: boolean = false;
  
  // Sort options
  sortField: string = 'dueDate';
  sortDirection: 'asc' | 'desc' = 'asc';
  
  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private teamService: TeamService,
    private projectService: ProjectService,
    private router: Router
  ) {
    this.taskStatuses = this.taskService.getTaskStatuses();
    this.taskPriorities = this.taskService.getTaskPriorities();
  }
  
  ngOnInit(): void {
    this.loadTasks();
    this.loadTeams();
    this.loadProjects();
  }
  
  loadTasks(): void {
    this.isLoading = true;
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
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
  
  loadProjects(): void {
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
      },
      error: (error) => {
        console.error('Error loading projects:', error);
      }
    });
  }
  
  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'list' ? 'board' : 'list';
  }
  
  toggleMyTasks(): void {
    this.showMyTasksOnly = !this.showMyTasksOnly;
    
    if (this.showMyTasksOnly) {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        this.filter.assignedUserId = currentUser.id;
      }
    } else {
      this.filter.assignedUserId = null;
    }
    
    this.applyFilters();
  }
  
  applyFilters(): void {
    this.taskService.getTasksByFilter(this.filter).subscribe(tasks => {
      this.filteredTasks = this.sortTasks(tasks);
    });
  }
  
  resetFilters(): void {
    this.filter = {};
    this.showMyTasksOnly = false;
    this.applyFilters();
  }
  
  sortTasks(tasks: Task[]): Task[] {
    return tasks.sort((a, b) => {
      let valueA: any;
      let valueB: any;
      
      // Determine values to compare based on the sort field
      switch(this.sortField) {
        case 'title':
          valueA = a.title.toLowerCase();
          valueB = b.title.toLowerCase();
          break;
        case 'priority':
          valueA = this.getPriorityValue(a.priority);
          valueB = this.getPriorityValue(b.priority);
          break;
        case 'status':
          valueA = this.getStatusValue(a.status);
          valueB = this.getStatusValue(b.status);
          break;
        case 'dueDate':
          valueA = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
          valueB = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
          break;
        case 'createdAt':
          valueA = new Date(a.createdAt).getTime();
          valueB = new Date(b.createdAt).getTime();
          break;
        default:
          valueA = a.title.toLowerCase();
          valueB = b.title.toLowerCase();
      }
      
      // Determine sort direction
      const direction = this.sortDirection === 'asc' ? 1 : -1;
      
      // Compare the values
      if (valueA < valueB) return -1 * direction;
      if (valueA > valueB) return 1 * direction;
      return 0;
    });
  }
  
  setSortField(field: string): void {
    if (this.sortField === field) {
      // Toggle sort direction if clicking on the same field
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Set new sort field with default ascending direction
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    
    this.filteredTasks = this.sortTasks([...this.filteredTasks]);
  }
  
  getSortIcon(field: string): string {
    if (this.sortField !== field) return 'sort';
    return this.sortDirection === 'asc' ? 'arrow-up' : 'arrow-down';
  }
  
  getPriorityValue(priority: TaskPriority): number {
    switch (priority) {
      case TaskPriority.LOW: return 1;
      case TaskPriority.MEDIUM: return 2;
      case TaskPriority.HIGH: return 3;
      case TaskPriority.CRITICAL: return 4;
      default: return 0;
    }
  }
  
  getStatusValue(status: TaskStatus): number {
    switch (status) {
      case TaskStatus.TODO: return 1;
      case TaskStatus.IN_PROGRESS: return 2;
      case TaskStatus.IN_REVIEW: return 3;
      case TaskStatus.DONE: return 4;
      case TaskStatus.BLOCKED: return 5;
      default: return 0;
    }
  }
  
  getPriorityClass(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.LOW: return 'priority-low';
      case TaskPriority.MEDIUM: return 'priority-medium';
      case TaskPriority.HIGH: return 'priority-high';
      case TaskPriority.CRITICAL: return 'priority-critical';
      default: return '';
    }
  }
  
  getStatusClass(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.TODO: return 'status-todo';
      case TaskStatus.IN_PROGRESS: return 'status-in-progress';
      case TaskStatus.IN_REVIEW: return 'status-in-review';
      case TaskStatus.DONE: return 'status-done';
      case TaskStatus.BLOCKED: return 'status-blocked';
      default: return '';
    }
  }
  
  formatDate(date: Date | null): string {
    if (!date) return 'No date';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString();
  }
  
  getDaysRemaining(dueDate: Date | null): string {
    if (!dueDate) return '';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} overdue`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} left`;
    }
  }
  
  getDueDateClass(dueDate: Date | null): string {
    if (!dueDate) return '';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'overdue';
    } else if (diffDays === 0) {
      return 'due-today';
    } else if (diffDays <= 2) {
      return 'due-soon';
    } else {
      return '';
    }
  }
  
  getTeamName(teamId: number | null): string {
    if (!teamId) return 'No team';
    const team = this.teams.find(t => t.id === teamId);
    return team ? team.name : 'Unknown team';
  }
  
  getProjectName(projectId: number | undefined): string {
    if (!projectId) return 'No project';
    const project = this.projects.find(p => p.id === projectId);
    return project ? project.name : 'Unknown project';
  }
  
  getSubtasksCompletionText(task: Task): string {
    const completed = task.subtasks.filter(st => st.completed).length;
    const total = task.subtasks.length;
    return `${completed}/${total} completed`;
  }
  
  getSubtasksCompletionPercentage(task: Task): number {
    if (task.subtasks.length === 0) return 0;
    const completed = task.subtasks.filter(st => st.completed).length;
    return Math.round((completed / task.subtasks.length) * 100);
  }
  
  updateTaskStatus(task: Task, status: TaskStatus): void {
    // Only users with proper permissions can update non-blocked tasks
    if (!this.canChangeTaskStatus(task)) {
      return;
    }
    
    this.taskService.updateTaskStatus(task.id, status).subscribe({
      next: (updatedTask) => {
        this.loadTasks(); // Refresh task list
      },
      error: (error) => {
        console.error('Error updating task status:', error);
      }
    });
  }
  
  viewTaskDetails(task: Task): void {
    this.router.navigate(['/tasks', task.id]);
  }
  
  createNewTask(): void {
    this.router.navigate(['/tasks/new']);
  }
  
  // Permissions checking
  canCreateTask(): boolean {
    return this.authService.hasPermission('canEditProjects');
  }
  
  canEditTask(task: Task): boolean {
    return this.authService.hasPermission('canEditProjects');
  }
  
  canChangeTaskStatus(task: Task): boolean {
    // Anyone can update status except for blocked tasks which need manager/admin
    if (task.status === TaskStatus.BLOCKED) {
      return this.authService.hasPermission('canEditProjects');
    }
    return this.authService.isAuthenticated();
  }
  
  canDeleteTask(task: Task): boolean {
    return this.authService.hasPermission('canEditProjects');
  }
  
  // Task board methods
  getTasksByStatus(status: TaskStatus): Task[] {
    return this.filteredTasks.filter(task => task.status === status);
  }
}
