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

@Injectable({ providedIn: 'root' })
export class SummaryService {
  constructor(private http: HttpClient) {}

  getGlobal(): Observable<CategorySummary[]> {
    return this.http.get<CategorySummary[]>(`${API_BASE}/summary`);
  }

  getByProject(projectId: number): Observable<CategorySummary[]> {
    return this.http.get<CategorySummary[]>(`${API_BASE}/projects/${projectId}/summary`);
  }
}
