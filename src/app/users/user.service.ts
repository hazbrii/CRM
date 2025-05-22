import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { User } from './models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private users: User[] = [
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', role: 'Admin', team: 'Development' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'Manager', team: 'Marketing' },
    { id: 3, name: 'Bob Johnson', email: 'bob.johnson@example.com', role: 'User', team: 'Sales' },
  ];
  
  private usersSubject = new BehaviorSubject<User[]>(this.users);
  
  constructor() { }
  
  getUsers(): Observable<User[]> {
    return this.usersSubject.asObservable();
  }
  
  getUserById(id: number): Observable<User | undefined> {
    const user = this.users.find(u => u.id === id);
    return of(user);
  }
  
  createUser(user: Omit<User, 'id'>): Observable<User> {
    const newId = Math.max(...this.users.map(u => u.id), 0) + 1;
    const newUser = { ...user, id: newId };
    this.users = [...this.users, newUser];
    this.usersSubject.next(this.users);
    return of(newUser);
  }
  
  updateUser(user: User): Observable<User> {
    this.users = this.users.map(u => u.id === user.id ? user : u);
    this.usersSubject.next(this.users);
    return of(user);
  }
  
  deleteUser(id: number): Observable<boolean> {
    this.users = this.users.filter(u => u.id !== id);
    this.usersSubject.next(this.users);
    return of(true);
  }
  
  resetPassword(id: number, newPassword: string): Observable<boolean> {
    const user = this.users.find(u => u.id === id);
    if (user) {
      user.password = newPassword;
      this.updateUser(user);
      return of(true);
    }
    return of(false);
  }
}
