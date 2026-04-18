import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project, ProjectCreate } from '../models/project.model';
import { API_BASE } from './api.config';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Project[]> {
    return this.http.get<Project[]>(`${API_BASE}/projects`);
  }

  get(id: number): Observable<Project> {
    return this.http.get<Project>(`${API_BASE}/projects/${id}`);
  }

  create(body: ProjectCreate): Observable<Project> {
    return this.http.post<Project>(`${API_BASE}/projects`, body);
  }

  update(id: number, body: Partial<ProjectCreate>): Observable<Project> {
    return this.http.put<Project>(`${API_BASE}/projects/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/projects/${id}`);
  }
}
