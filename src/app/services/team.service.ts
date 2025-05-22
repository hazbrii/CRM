import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Team {
  id: number;
  name: string;
  description: string;
  created: Date;
  members: TeamMember[];
}

export interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private teams: Team[] = [
    {
      id: 1,
      name: 'Development',
      description: 'Frontend and backend development team',
      created: new Date('2023-01-15'),
      members: [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Team Lead' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Developer' },
        { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'Developer' }
      ]
    },
    {
      id: 2,
      name: 'Design',
      description: 'UI/UX design team',
      created: new Date('2023-02-10'),
      members: [
        { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', role: 'Design Lead' },
        { id: 5, name: 'Tom Brown', email: 'tom@example.com', role: 'Designer' }
      ]
    },
    {
      id: 3,
      name: 'QA',
      description: 'Quality assurance and testing',
      created: new Date('2023-03-05'),
      members: [
        { id: 6, name: 'Emily Davis', email: 'emily@example.com', role: 'QA Lead' },
        { id: 7, name: 'David Wilson', email: 'david@example.com', role: 'QA Engineer' },
        { id: 8, name: 'Lisa Taylor', email: 'lisa@example.com', role: 'QA Engineer' },
        { id: 9, name: 'Robert Miller', email: 'robert@example.com', role: 'QA Engineer' }
      ]
    },
    {
      id: 4,
      name: 'DevOps',
      description: 'Infrastructure and operations',
      created: new Date('2023-04-20'),
      members: [
        { id: 10, name: 'Chris Thomas', email: 'chris@example.com', role: 'DevOps Engineer' },
        { id: 11, name: 'Amanda Clark', email: 'amanda@example.com', role: 'System Admin' }
      ]
    }
  ];

  // Available users to add to teams
  private availableUsers: TeamMember[] = [
    { id: 12, name: 'Alex Rodriguez', email: 'alex@example.com', role: 'Developer' },
    { id: 13, name: 'Jessica White', email: 'jessica@example.com', role: 'Designer' },
    { id: 14, name: 'Ryan Green', email: 'ryan@example.com', role: 'QA Engineer' },
    { id: 15, name: 'Nicole Adams', email: 'nicole@example.com', role: 'Product Manager' }
  ];

  private teamsSubject = new BehaviorSubject<Team[]>(this.teams);
  teams$ = this.teamsSubject.asObservable();

  constructor() { }

  getTeams(): Observable<Team[]> {
    return this.teams$;
  }

  getTeam(id: number): Observable<Team | undefined> {
    return this.teams$.pipe(
      map(teams => teams.find(team => team.id === id))
    );
  }

  createTeam(team: Omit<Team, 'id'>): Observable<Team> {
    const newTeam: Team = {
      ...team,
      id: this.generateId()
    };

    const updatedTeams = [...this.teams, newTeam];
    this.teams = updatedTeams;
    this.teamsSubject.next(updatedTeams);

    return of(newTeam);
  }

  updateTeam(updatedTeam: Team): Observable<Team> {
    const updatedTeams = this.teams.map(team => 
      team.id === updatedTeam.id ? updatedTeam : team
    );
    
    this.teams = updatedTeams;
    this.teamsSubject.next(updatedTeams);
    
    return of(updatedTeam);
  }

  deleteTeam(id: number): Observable<boolean> {
    const updatedTeams = this.teams.filter(team => team.id !== id);
    
    if (updatedTeams.length < this.teams.length) {
      this.teams = updatedTeams;
      this.teamsSubject.next(updatedTeams);
      return of(true);
    }
    
    return of(false);
  }

  getAvailableUsers(): Observable<TeamMember[]> {
    return of([...this.availableUsers]);
  }

  addMemberToTeam(teamId: number, member: TeamMember): Observable<Team | undefined> {
    const team = this.teams.find(t => t.id === teamId);
    
    if (!team) {
      return of(undefined);
    }
    
    // Check if member already exists in team
    const memberExists = team.members.some(m => m.id === member.id);
    
    if (memberExists) {
      return of(team);
    }
    
    const updatedTeam: Team = {
      ...team,
      members: [...team.members, member]
    };
    
    return this.updateTeam(updatedTeam);
  }

  removeMemberFromTeam(teamId: number, memberId: number): Observable<Team | undefined> {
    const team = this.teams.find(t => t.id === teamId);
    
    if (!team) {
      return of(undefined);
    }
    
    const updatedTeam: Team = {
      ...team,
      members: team.members.filter(m => m.id !== memberId)
    };
    
    return this.updateTeam(updatedTeam);
  }

  private generateId(): number {
    return Math.max(0, ...this.teams.map(team => team.id)) + 1;
  }
}
