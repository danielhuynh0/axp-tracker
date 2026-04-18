import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WeeklyEntry } from '../models/weekly-entry.model';
import { API_BASE } from './api.config';

@Injectable({ providedIn: 'root' })
export class WeeklyEntryService {
  constructor(private http: HttpClient) {}

  getByTask(taskId: number): Observable<WeeklyEntry[]> {
    return this.http.get<WeeklyEntry[]>(`${API_BASE}/tasks/${taskId}/weekly-entries`);
  }

  get(taskId: number, weekStartDate: string): Observable<WeeklyEntry> {
    return this.http.get<WeeklyEntry>(
      `${API_BASE}/tasks/${taskId}/weekly-entries/${weekStartDate}`
    );
  }

  upsert(taskId: number, weekStartDate: string, totalHours: number): Observable<WeeklyEntry> {
    return this.http.put<WeeklyEntry>(
      `${API_BASE}/tasks/${taskId}/weekly-entries/${weekStartDate}`,
      { week_start_date: weekStartDate, total_hours: totalHours }
    );
  }
}
