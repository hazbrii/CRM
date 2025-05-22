import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, UserRole } from './auth.service';

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export enum TaskStatus {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  IN_REVIEW = 'In Review',
  DONE = 'Done',
  BLOCKED = 'Blocked'
}

export interface Comment {
  id: number;
  taskId: number;
  userId: number;
  userName: string;
  userRole: UserRole;
  content: string;
  createdAt: Date;
}

export interface Subtask {
  id: number;
  taskId: number;
  title: string;
  completed: boolean;
  assignedUserId?: number;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  projectId?: number;
  projectName?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  assignedUserId: number | null;
  assignedUserName?: string;
  teamId: number | null;
  teamName?: string;
  subtasks: Subtask[];
  comments: Comment[];
  attachments: number;
}

export interface TaskFilter {
  searchText?: string;
  status?: TaskStatus | null;
  priority?: TaskPriority | null;
  assignedUserId?: number | null;
  teamId?: number | null;
  projectId?: number | null;
  dueStartDate?: Date | null;
  dueEndDate?: Date | null;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasks: Task[] = [
    {
      id: 1,
      title: 'Implement login page',
      description: 'Create a responsive login page with username and password validation',
      projectId: 2,
      projectName: 'Mobile App Development',
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      dueDate: new Date('2023-05-15'),
      createdAt: new Date('2023-04-28'),
      updatedAt: new Date('2023-05-12'),
      assignedUserId: 1,
      assignedUserName: 'Admin User',
      teamId: 1,
      teamName: 'Development Team',
      subtasks: [
        { id: 1, taskId: 1, title: 'Design login UI', completed: true },
        { id: 2, taskId: 1, title: 'Implement form validation', completed: true },
        { id: 3, taskId: 1, title: 'Add forgot password feature', completed: true }
      ],
      comments: [
        { 
          id: 1, 
          taskId: 1, 
          userId: 1, 
          userName: 'Admin User', 
          userRole: 'Admin', 
          content: 'Design approved by client', 
          createdAt: new Date('2023-04-30') 
        },
        { 
          id: 2, 
          taskId: 1, 
          userId: 3, 
          userName: 'John Doe', 
          userRole: 'User', 
          content: 'Completed validation logic', 
          createdAt: new Date('2023-05-08') 
        }
      ],
      attachments: 2
    },
    {
      id: 2,
      title: 'API Integration',
      description: 'Integrate the backend APIs with frontend services',
      projectId: 2,
      projectName: 'Mobile App Development',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: new Date('2023-06-10'),
      createdAt: new Date('2023-05-20'),
      updatedAt: new Date('2023-05-25'),
      assignedUserId: 3,
      assignedUserName: 'John Doe',
      teamId: 1,
      teamName: 'Development Team',
      subtasks: [
        { id: 4, taskId: 2, title: 'Implement API service', completed: true },
        { id: 5, taskId: 2, title: 'Add authentication headers', completed: true },
        { id: 6, taskId: 2, title: 'Handle error responses', completed: false },
        { id: 7, taskId: 2, title: 'Write unit tests', completed: false }
      ],
      comments: [
        { 
          id: 3, 
          taskId: 2, 
          userId: 2, 
          userName: 'Jane Smith', 
          userRole: 'Manager', 
          content: 'Please make sure to add proper error handling', 
          createdAt: new Date('2023-05-22') 
        }
      ],
      attachments: 1
    },
    {
      id: 3,
      title: 'Design Dashboard UI',
      description: 'Create wireframes and UI components for the main dashboard',
      projectId: 1,
      projectName: 'Website Redesign',
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.MEDIUM,
      dueDate: new Date('2023-06-05'),
      createdAt: new Date('2023-05-15'),
      updatedAt: new Date('2023-06-01'),
      assignedUserId: 4,
      assignedUserName: 'Lisa Johnson',
      teamId: 2,
      teamName: 'Design Team',
      subtasks: [
        { id: 8, taskId: 3, title: 'Create mockups', completed: true },
        { id: 9, taskId: 3, title: 'Design UI components', completed: true },
        { id: 10, taskId: 3, title: 'Get client approval', completed: false }
      ],
      comments: [
        { 
          id: 4, 
          taskId: 3, 
          userId: 4, 
          userName: 'Lisa Johnson', 
          userRole: 'User', 
          content: 'Uploaded mockups for review', 
          createdAt: new Date('2023-05-28') 
        },
        { 
          id: 5, 
          taskId: 3, 
          userId: 2, 
          userName: 'Jane Smith', 
          userRole: 'Manager', 
          content: 'Looks good, but please check the responsive layout', 
          createdAt: new Date('2023-05-30') 
        }
      ],
      attachments: 5
    },
    {
      id: 4,
      title: 'Database Schema Design',
      description: 'Create database schema for the new user management system',
      projectId: 6,
      projectName: 'API Gateway Implementation',
      status: TaskStatus.TODO,
      priority: TaskPriority.CRITICAL,
      dueDate: new Date('2023-06-20'),
      createdAt: new Date('2023-06-01'),
      updatedAt: new Date('2023-06-01'),
      assignedUserId: 5,
      assignedUserName: 'Mike Wilson',
      teamId: 4,
      teamName: 'DevOps Team',
      subtasks: [
        { id: 11, taskId: 4, title: 'Define data relationships', completed: false },
        { id: 12, taskId: 4, title: 'Create SQL scripts', completed: false },
        { id: 13, taskId: 4, title: 'Test with sample data', completed: false }
      ],
      comments: [],
      attachments: 0
    },
    {
      id: 5,
      title: 'User Acceptance Testing',
      description: 'Coordinate UAT session with client stakeholders',
      projectId: 3,
      projectName: 'System Integration',
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      dueDate: new Date('2023-07-05'),
      createdAt: new Date('2023-06-01'),
      updatedAt: new Date('2023-06-01'),
      assignedUserId: 2,
      assignedUserName: 'Jane Smith',
      teamId: 3,
      teamName: 'QA Team',
      subtasks: [
        { id: 14, taskId: 5, title: 'Prepare test scenarios', completed: false },
        { id: 15, taskId: 5, title: 'Schedule meeting with client', completed: true },
        { id: 16, taskId: 5, title: 'Document feedback', completed: false }
      ],
      comments: [
        { 
          id: 6, 
          taskId: 5, 
          userId: 2, 
          userName: 'Jane Smith', 
          userRole: 'Manager', 
          content: 'Meeting scheduled for July 1st', 
          createdAt: new Date('2023-06-02') 
        }
      ],
      attachments: 1
    },
    {
      id: 6,
      title: 'Security Audit',
      description: 'Perform security audit on existing codebase',
      projectId: 5,
      projectName: 'Security Audit',
      status: TaskStatus.BLOCKED,
      priority: TaskPriority.CRITICAL,
      dueDate: new Date('2023-06-15'),
      createdAt: new Date('2023-05-25'),
      updatedAt: new Date('2023-06-02'),
      assignedUserId: 6,
      assignedUserName: 'Robert Chen',
      teamId: 4,
      teamName: 'DevOps Team',
      subtasks: [
        { id: 17, taskId: 6, title: 'Code review', completed: false },
        { id: 18, taskId: 6, title: 'Run security tools', completed: false },
        { id: 19, taskId: 6, title: 'Document vulnerabilities', completed: false }
      ],
      comments: [
        { 
          id: 7, 
          taskId: 6, 
          userId: 6, 
          userName: 'Robert Chen', 
          userRole: 'User', 
          content: 'Blocked due to pending access to production servers', 
          createdAt: new Date('2023-06-02') 
        }
      ],
      attachments: 0
    }
  ];
  
  private tasksSubject = new BehaviorSubject<Task[]>(this.tasks);
  tasks$ = this.tasksSubject.asObservable();
  
  private lastCommentId = 7;
  private lastSubtaskId = 19;

  constructor() {}

  getTasks(): Observable<Task[]> {
    return this.tasks$;
  }
  
  getTask(id: number): Observable<Task | undefined> {
    return this.tasks$.pipe(
      map(tasks => tasks.find(task => task.id === id))
    );
  }
  
  getTasksByFilter(filter: TaskFilter): Observable<Task[]> {
    return this.tasks$.pipe(
      map(tasks => tasks.filter(task => {
        let match = true;
        
        if (filter.searchText) {
          const searchText = filter.searchText.toLowerCase();
          match = match && (
            task.title.toLowerCase().includes(searchText) || 
            task.description.toLowerCase().includes(searchText)
          );
        }
        
        if (filter.status !== undefined && filter.status !== null) {
          match = match && task.status === filter.status;
        }
        
        if (filter.priority !== undefined && filter.priority !== null) {
          match = match && task.priority === filter.priority;
        }
        
        if (filter.assignedUserId !== undefined && filter.assignedUserId !== null) {
          match = match && task.assignedUserId === filter.assignedUserId;
        }
        
        if (filter.teamId !== undefined && filter.teamId !== null) {
          match = match && task.teamId === filter.teamId;
        }
        
        if (filter.projectId !== undefined && filter.projectId !== null) {
          match = match && task.projectId === filter.projectId;
        }
        
        if (filter.dueStartDate && filter.dueEndDate && task.dueDate) {
          const dueDate = new Date(task.dueDate);
          const startDate = new Date(filter.dueStartDate);
          const endDate = new Date(filter.dueEndDate);
          match = match && (dueDate >= startDate && dueDate <= endDate);
        }
        
        return match;
      }))
    );
  }
  
  getTasksByUser(userId: number): Observable<Task[]> {
    return this.getTasksByFilter({ assignedUserId: userId });
  }
  
  getTasksByTeam(teamId: number): Observable<Task[]> {
    return this.getTasksByFilter({ teamId: teamId });
  }
  
  getTasksByProject(projectId: number): Observable<Task[]> {
    return this.getTasksByFilter({ projectId: projectId });
  }
  
  createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Observable<Task> {
    const newTask: Task = {
      ...task,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const updatedTasks = [...this.tasks, newTask];
    this.tasks = updatedTasks;
    this.tasksSubject.next(updatedTasks);
    
    return of(newTask);
  }
  
  updateTask(updatedTask: Task): Observable<Task> {
    updatedTask = {
      ...updatedTask,
      updatedAt: new Date()
    };
    
    const updatedTasks = this.tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    );
    
    this.tasks = updatedTasks;
    this.tasksSubject.next(updatedTasks);
    
    return of(updatedTask);
  }
  
  deleteTask(id: number): Observable<boolean> {
    const updatedTasks = this.tasks.filter(task => task.id !== id);
    
    if (updatedTasks.length < this.tasks.length) {
      this.tasks = updatedTasks;
      this.tasksSubject.next(updatedTasks);
      return of(true);
    }
    
    return of(false);
  }
  
  // Subtask operations
  addSubtask(taskId: number, subtask: Omit<Subtask, 'id' | 'taskId'>): Observable<Task | undefined> {
    const task = this.tasks.find(t => t.id === taskId);
    
    if (!task) {
      return of(undefined);
    }
    
    const newSubtask: Subtask = {
      ...subtask,
      id: ++this.lastSubtaskId,
      taskId
    };
    
    const updatedTask = {
      ...task,
      subtasks: [...task.subtasks, newSubtask],
      updatedAt: new Date()
    };
    
    return this.updateTask(updatedTask);
  }
  
  updateSubtask(taskId: number, subtaskId: number, updates: Partial<Subtask>): Observable<Task | undefined> {
    const task = this.tasks.find(t => t.id === taskId);
    
    if (!task) {
      return of(undefined);
    }
    
    const updatedSubtasks = task.subtasks.map(subtask => 
      subtask.id === subtaskId ? { ...subtask, ...updates } : subtask
    );
    
    const updatedTask = {
      ...task,
      subtasks: updatedSubtasks,
      updatedAt: new Date()
    };
    
    return this.updateTask(updatedTask);
  }
  
  deleteSubtask(taskId: number, subtaskId: number): Observable<Task | undefined> {
    const task = this.tasks.find(t => t.id === taskId);
    
    if (!task) {
      return of(undefined);
    }
    
    const updatedSubtasks = task.subtasks.filter(subtask => subtask.id !== subtaskId);
    
    const updatedTask = {
      ...task,
      subtasks: updatedSubtasks,
      updatedAt: new Date()
    };
    
    return this.updateTask(updatedTask);
  }
  
  // Comment operations
  addComment(taskId: number, userId: number, userName: string, userRole: UserRole, content: string): Observable<Task | undefined> {
    const task = this.tasks.find(t => t.id === taskId);
    
    if (!task) {
      return of(undefined);
    }
    
    const newComment: Comment = {
      id: ++this.lastCommentId,
      taskId,
      userId,
      userName,
      userRole,
      content,
      createdAt: new Date()
    };
    
    const updatedTask = {
      ...task,
      comments: [...task.comments, newComment],
      updatedAt: new Date()
    };
    
    return this.updateTask(updatedTask);
  }
  
  deleteComment(taskId: number, commentId: number): Observable<Task | undefined> {
    const task = this.tasks.find(t => t.id === taskId);
    
    if (!task) {
      return of(undefined);
    }
    
    const updatedComments = task.comments.filter(comment => comment.id !== commentId);
    
    const updatedTask = {
      ...task,
      comments: updatedComments,
      updatedAt: new Date()
    };
    
    return this.updateTask(updatedTask);
  }
  
  // Status operations
  updateTaskStatus(taskId: number, status: TaskStatus): Observable<Task | undefined> {
    const task = this.tasks.find(t => t.id === taskId);
    
    if (!task) {
      return of(undefined);
    }
    
    const updatedTask = {
      ...task,
      status,
      updatedAt: new Date()
    };
    
    return this.updateTask(updatedTask);
  }
  
  getTaskStatuses(): TaskStatus[] {
    return Object.values(TaskStatus);
  }
  
  getTaskPriorities(): TaskPriority[] {
    return Object.values(TaskPriority);
  }
  
  private generateId(): number {
    return Math.max(0, ...this.tasks.map(task => task.id)) + 1;
  }
}
