import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, TaskCreate, TaskCategoryWeight } from '../models/task.model';
import { API_BASE } from './api.config';

@Injectable({ providedIn: 'root' })
export class TaskService {
  constructor(private http: HttpClient) {}

  getByProject(projectId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${API_BASE}/projects/${projectId}/tasks`);
  }

  get(taskId: number): Observable<Task> {
    return this.http.get<Task>(`${API_BASE}/tasks/${taskId}`);
  }

  create(projectId: number, body: TaskCreate): Observable<Task> {
    return this.http.post<Task>(`${API_BASE}/projects/${projectId}/tasks`, body);
  }

  update(taskId: number, body: Partial<TaskCreate>): Observable<Task> {
    return this.http.put<Task>(`${API_BASE}/tasks/${taskId}`, body);
  }

  delete(taskId: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/tasks/${taskId}`);
  }

  getWeights(taskId: number): Observable<TaskCategoryWeight[]> {
    return this.http.get<TaskCategoryWeight[]>(`${API_BASE}/tasks/${taskId}/weights`);
  }

  setWeights(
    taskId: number,
    weights: { category_id: number; weight: number }[]
  ): Observable<TaskCategoryWeight[]> {
    return this.http.put<TaskCategoryWeight[]>(`${API_BASE}/tasks/${taskId}/weights`, weights);
  }
}
