import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TaskService, Task, TaskStatus, TaskPriority, Subtask, Comment } from '../../services/task.service';
import { ProjectService } from '../../services/project.service';
import { TeamService } from '../../services/team.service';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.css'
})
export class TaskDetailComponent implements OnInit {
  taskForm!: FormGroup;
  task?: Task;
  isNewTask: boolean = false;
  isLoading: boolean = true;
  isEditing: boolean = false;
  isSaving: boolean = false;
  showDeleteConfirm: boolean = false;
  
  // Make enums accessible in the template
  TaskStatus = TaskStatus;
  TaskPriority = TaskPriority;
  
  // Dropdown options
  teams: any[] = [];
  projects: any[] = [];
  statuses: TaskStatus[] = [];
  priorities: TaskPriority[] = [];
  
  // Current user
  currentUser: User | null = null;
  newCommentText: string = '';
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private projectService: ProjectService,
    private teamService: TeamService,
    private authService: AuthService
  ) {
    this.statuses = this.taskService.getTaskStatuses();
    this.priorities = this.taskService.getTaskPriorities();
    this.currentUser = this.authService.getCurrentUser();
    
    // Initialize the form
    this.createForm();
  }
  
  ngOnInit(): void {
    this.loadTeams();
    this.loadProjects();
    
    const taskId = this.route.snapshot.paramMap.get('id');
    if (taskId === 'new') {
      this.isNewTask = true;
      this.isEditing = true;
      this.isLoading = false;
      this.setInitialFormValues();
    } else if (taskId) {
      this.loadTask(+taskId);
    } else {
      this.router.navigate(['/tasks']);
    }
  }
  
  createForm(): void {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      status: [TaskStatus.TODO, [Validators.required]],
      priority: [TaskPriority.MEDIUM, [Validators.required]],
      dueDate: [null],
      teamId: [null],
      projectId: [null],
      assignedUserId: [null],
      subtasks: this.fb.array([])
    });
  }
  
  setInitialFormValues(): void {
    // Set default values for new tasks
    this.taskForm.patchValue({
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      assignedUserId: this.currentUser?.id || null
    });
  }
  
  get subtasksFormArray(): FormArray {
    return this.taskForm.get('subtasks') as FormArray;
  }
  
  loadTask(taskId: number): void {
    this.isLoading = true;
    this.taskService.getTask(taskId).subscribe({
      next: (task) => {
        if (task) {
          this.task = task;
          this.patchFormWithTask(task);
        } else {
          this.router.navigate(['/tasks']);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading task:', error);
        this.isLoading = false;
        this.router.navigate(['/tasks']);
      }
    });
  }
  
  patchFormWithTask(task: Task): void {
    // Clear existing subtasks
    while (this.subtasksFormArray.length) {
      this.subtasksFormArray.removeAt(0);
    }
    
    // Add subtasks
    task.subtasks.forEach(subtask => {
      this.subtasksFormArray.push(this.createSubtaskFormGroup(subtask));
    });
    
    // Format date for input
    const formattedDueDate = task.dueDate ? this.formatDateForInput(new Date(task.dueDate)) : null;
    
    // Patch main form values
    this.taskForm.patchValue({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: formattedDueDate,
      teamId: task.teamId,
      projectId: task.projectId,
      assignedUserId: task.assignedUserId
    });
  }
  
  createSubtaskFormGroup(subtask?: Subtask): FormGroup {
    return this.fb.group({
      id: [subtask ? subtask.id : 0],
      title: [subtask ? subtask.title : '', Validators.required],
      completed: [subtask ? subtask.completed : false],
      assignedUserId: [subtask ? subtask.assignedUserId : null]
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
  
  addSubtask(): void {
    this.subtasksFormArray.push(this.createSubtaskFormGroup());
  }
  
  removeSubtask(index: number): void {
    this.subtasksFormArray.removeAt(index);
  }
  
  toggleSubtaskCompletion(index: number): void {
    const subtask = this.subtasksFormArray.at(index);
    subtask.patchValue({ completed: !subtask.value.completed });
    
    // If editing an existing task, update the subtask immediately
    if (this.task && !this.isEditing) {
      const subtaskId = subtask.value.id;
      this.taskService.updateSubtask(
        this.task.id,
        subtaskId,
        { completed: subtask.value.completed }
      ).subscribe();
    }
  }
  
  startEditing(): void {
    if (!this.canEditTask()) return;
    this.isEditing = true;
  }
  
  cancelEditing(): void {
    if (this.isNewTask) {
      this.router.navigate(['/tasks']);
      return;
    }
    
    this.isEditing = false;
    if (this.task) {
      this.patchFormWithTask(this.task);
    }
  }
  
  saveTask(): void {
    if (this.taskForm.invalid) {
      return;
    }
    
    this.isSaving = true;
    const formValues = this.taskForm.value;
    
    // Convert form values to Task model
    const taskData: Partial<Task> = {
      title: formValues.title,
      description: formValues.description,
      status: formValues.status,
      priority: formValues.priority,
      teamId: formValues.teamId,
      projectId: formValues.projectId,
      assignedUserId: formValues.assignedUserId,
      subtasks: formValues.subtasks,
      dueDate: formValues.dueDate ? new Date(formValues.dueDate) : null
    };
    
    if (this.isNewTask) {
      // Create a new task
      this.taskService.createTask({
        ...taskData,
        createdAt: new Date(),
        updatedAt: new Date(),
        comments: [],
        attachments: 0
      } as any).subscribe({
        next: (newTask) => {
          this.isSaving = false;
          this.router.navigate(['/tasks', newTask.id]);
        },
        error: (error) => {
          console.error('Error creating task:', error);
          this.isSaving = false;
        }
      });
    } else if (this.task) {
      // Update existing task
      const updatedTask: Task = {
        ...this.task,
        ...taskData
      };
      
      this.taskService.updateTask(updatedTask).subscribe({
        next: (result) => {
          this.task = result;
          this.isEditing = false;
          this.isSaving = false;
        },
        error: (error) => {
          console.error('Error updating task:', error);
          this.isSaving = false;
        }
      });
    }
  }
  
  confirmDelete(): void {
    if (!this.canDeleteTask()) return;
    this.showDeleteConfirm = true;
  }
  
  cancelDelete(): void {
    this.showDeleteConfirm = false;
  }
  
  deleteTask(): void {
    if (!this.task) return;
    
    this.taskService.deleteTask(this.task.id).subscribe({
      next: () => {
        this.router.navigate(['/tasks']);
      },
      error: (error) => {
        console.error('Error deleting task:', error);
      }
    });
  }
  
  updateStatus(status: TaskStatus): void {
    if (!this.task || !this.canChangeTaskStatus()) return;
    
    this.taskService.updateTaskStatus(this.task.id, status).subscribe({
      next: (updatedTask) => {
        if (updatedTask) {
          this.task = updatedTask;
          this.patchFormWithTask(updatedTask);
        }
      },
      error: (error) => {
        console.error('Error updating task status:', error);
      }
    });
  }
  
  addComment(): void {
    if (!this.newCommentText.trim() || !this.task || !this.currentUser) return;
    
    this.taskService.addComment(
      this.task.id,
      this.currentUser.id,
      this.currentUser.name,
      this.currentUser.role,
      this.newCommentText.trim()
    ).subscribe({
      next: (updatedTask) => {
        if (updatedTask) {
          this.task = updatedTask;
          this.newCommentText = '';
        }
      },
      error: (error) => {
        console.error('Error adding comment:', error);
      }
    });
  }
  
  deleteComment(commentId: number): void {
    if (!this.task || !this.canDeleteComment()) return;
    
    this.taskService.deleteComment(this.task.id, commentId).subscribe({
      next: (updatedTask) => {
        if (updatedTask) {
          this.task = updatedTask;
        }
      },
      error: (error) => {
        console.error('Error deleting comment:', error);
      }
    });
  }
  
  // Helper functions
  formatDate(date: Date | null | undefined): string {
    if (!date) return '';
    const dateObj = new Date(date);
    
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return dateObj.toLocaleDateString(undefined, options);
  }
  
  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  getTeamName(teamId: number | null): string {
    if (!teamId) return 'None';
    const team = this.teams.find(t => t.id === teamId);
    return team ? team.name : 'Unknown';
  }
  
  getProjectName(projectId: number | undefined): string {
    if (!projectId) return 'None';
    const project = this.projects.find(p => p.id === projectId);
    return project ? project.name : 'Unknown';
  }
  
  isOwnComment(comment: Comment): boolean {
    return this.currentUser?.id === comment.userId;
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
  
  getPriorityClass(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.LOW: return 'priority-low';
      case TaskPriority.MEDIUM: return 'priority-medium';
      case TaskPriority.HIGH: return 'priority-high';
      case TaskPriority.CRITICAL: return 'priority-critical';
      default: return '';
    }
  }
  
  // Added missing method
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
  
  // Permission checks
  canEditTask(): boolean {
    return this.authService.hasPermission('canEditProjects');
  }
  
  canDeleteTask(): boolean {
    return this.authService.hasPermission('canEditProjects');
  }
  
  canDeleteComment(): boolean {
    return this.authService.hasPermission('canEditProjects');
  }
  
  canChangeTaskStatus(): boolean {
    // If the task is blocked, only admins/managers can change its status
    if (this.task?.status === TaskStatus.BLOCKED) {
      return this.authService.hasPermission('canEditProjects');
    }
    
    // Otherwise, any authenticated user can update status
    return this.authService.isAuthenticated();
  }
}
