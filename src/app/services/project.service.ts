import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { TeamService, Team } from './team.service';

export interface Project {
  id: number;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date | null;
  status: ProjectStatus;
  teamId: number;
  teamName?: string;
  budget: number;
  documentsCount: number;
  tasksCount: number;
  completedTasksCount: number;
}

export enum ProjectStatus {
  PLANNING = 'Planning',
  IN_PROGRESS = 'In Progress',
  ON_HOLD = 'On Hold',
  COMPLETED = 'Completed',
  CANCELED = 'Canceled'
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private projects: Project[] = [
    {
      id: 1,
      name: 'Website Redesign',
      description: 'Modernize company website with new design and features',
      startDate: new Date('2023-02-15'),
      endDate: new Date('2023-05-30'),
      status: ProjectStatus.IN_PROGRESS,
      teamId: 2, // Design team
      budget: 25000,
      documentsCount: 8,
      tasksCount: 24,
      completedTasksCount: 14
    },
    {
      id: 2,
      name: 'Mobile App Development',
      description: 'Create mobile application for customers',
      startDate: new Date('2023-01-10'),
      endDate: new Date('2023-06-15'),
      status: ProjectStatus.IN_PROGRESS,
      teamId: 1, // Development team
      budget: 45000,
      documentsCount: 12,
      tasksCount: 35,
      completedTasksCount: 20
    },
    {
      id: 3,
      name: 'System Integration',
      description: 'Integrate new CRM system with existing infrastructure',
      startDate: new Date('2022-11-05'),
      endDate: new Date('2023-03-25'),
      status: ProjectStatus.COMPLETED,
      teamId: 4, // DevOps team
      budget: 30000,
      documentsCount: 15,
      tasksCount: 28,
      completedTasksCount: 28
    },
    {
      id: 4,
      name: 'Performance Testing',
      description: 'Comprehensive testing of system performance under load',
      startDate: new Date('2023-03-01'),
      endDate: new Date('2023-04-15'),
      status: ProjectStatus.ON_HOLD,
      teamId: 3, // QA team
      budget: 12000,
      documentsCount: 5,
      tasksCount: 18,
      completedTasksCount: 7
    },
    {
      id: 5,
      name: 'Security Audit',
      description: 'Annual security audit and penetration testing',
      startDate: new Date('2023-04-10'),
      endDate: null, // ongoing
      status: ProjectStatus.PLANNING,
      teamId: 4, // DevOps team
      budget: 20000,
      documentsCount: 3,
      tasksCount: 12,
      completedTasksCount: 0
    },
    {
      id: 6,
      name: 'API Gateway Implementation',
      description: 'Develop a centralized API gateway for all micro-services',
      startDate: new Date('2023-02-20'),
      endDate: new Date('2023-05-15'),
      status: ProjectStatus.IN_PROGRESS,
      teamId: 1, // Development team
      budget: 35000,
      documentsCount: 10,
      tasksCount: 22,
      completedTasksCount: 8
    }
  ];

  private projectsSubject = new BehaviorSubject<Project[]>(this.projects);
  projects$ = this.projectsSubject.asObservable();

  constructor(private teamService: TeamService) {
    this.updateProjectsWithTeamNames();
  }

  getProjects(): Observable<Project[]> {
    return this.projects$;
  }

  getProject(id: number): Observable<Project | undefined> {
    return this.projects$.pipe(
      map(projects => projects.find(project => project.id === id))
    );
  }

  createProject(project: Omit<Project, 'id'>): Observable<Project> {
    const newProject: Project = {
      ...project,
      id: this.generateId()
    };

    const updatedProjects = [...this.projects, newProject];
    this.projects = updatedProjects;
    this.projectsSubject.next(updatedProjects);

    return of(newProject);
  }

  updateProject(updatedProject: Project): Observable<Project> {
    const updatedProjects = this.projects.map(project => 
      project.id === updatedProject.id ? updatedProject : project
    );
    
    this.projects = updatedProjects;
    this.projectsSubject.next(updatedProjects);
    this.updateProjectsWithTeamNames();
    
    return of(updatedProject);
  }

  deleteProject(id: number): Observable<boolean> {
    const updatedProjects = this.projects.filter(project => project.id !== id);
    
    if (updatedProjects.length < this.projects.length) {
      this.projects = updatedProjects;
      this.projectsSubject.next(updatedProjects);
      return of(true);
    }
    
    return of(false);
  }

  getProjectsByTeam(teamId: number): Observable<Project[]> {
    return this.projects$.pipe(
      map(projects => projects.filter(project => project.teamId === teamId))
    );
  }

  getProjectsByDateRange(startDate: Date, endDate: Date): Observable<Project[]> {
    return this.projects$.pipe(
      map(projects => projects.filter(project => {
        const projectStart = new Date(project.startDate);
        return projectStart >= startDate && projectStart <= endDate;
      }))
    );
  }

  getProjectsByStatus(status: ProjectStatus): Observable<Project[]> {
    return this.projects$.pipe(
      map(projects => projects.filter(project => project.status === status))
    );
  }

  private generateId(): number {
    return Math.max(0, ...this.projects.map(project => project.id)) + 1;
  }

  private updateProjectsWithTeamNames(): void {
    this.teamService.getTeams().subscribe(teams => {
      const teamsMap = new Map(teams.map(team => [team.id, team.name]));
      
      const updatedProjects = this.projects.map(project => ({
        ...project,
        teamName: teamsMap.get(project.teamId) || 'Unknown Team'
      }));
      
      this.projects = updatedProjects;
      this.projectsSubject.next(updatedProjects);
    });
  }

  getStatuses(): ProjectStatus[] {
    return Object.values(ProjectStatus);
  }
}
