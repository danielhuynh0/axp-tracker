import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from './api.config';

export interface CategorySummary {
  category_id: number;
  category_name: string;
  order: number;
  total_hours: number;
}

export interface HistoryAllocation {
  category_id: number;
  category_name: string;
  hours: number;
}

export interface HistoryEntry {
  id: number;
  week_start_date: string;
  total_hours: number;
  task_id: number;
  task_name: string;
  project_id: number;
  project_name: string;
  allocations: HistoryAllocation[];
}

@Injectable({ providedIn: 'root' })
export class SummaryService {
  constructor(private http: HttpClient) {}

  getGlobal(): Observable<CategorySummary[]> {
    return this.http.get<CategorySummary[]>(`${API_BASE}/summary`);
  }

  getByProject(projectId: number): Observable<CategorySummary[]> {
    return this.http.get<CategorySummary[]>(`${API_BASE}/projects/${projectId}/summary`);
  }

  getHistory(): Observable<HistoryEntry[]> {
    return this.http.get<HistoryEntry[]>(`${API_BASE}/history`);
  }
}
