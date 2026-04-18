import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SummaryService, CategorySummary, HistoryEntry } from '../../services/summary.service';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category.model';
import { CategoryBreakdownComponent } from '../../components/category-breakdown/category-breakdown.component';
import { formatWeekLabel } from '../../utils/week.utils';

type SortKey = 'week' | 'project' | 'task' | 'total' | string;

@Component({
  selector: 'app-global-summary',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CategoryBreakdownComponent],
  templateUrl: './global-summary.component.html',
  styleUrl: './global-summary.component.scss',
})
export class GlobalSummaryComponent implements OnInit {
  summaryData: CategorySummary[] = [];
  allEntries: HistoryEntry[] = [];
  categories: Category[] = [];

  filterProject = '';
  filterTask = '';
  sortKey: SortKey = 'week';
  sortAsc = false;

  error = '';

  constructor(
    private summaryService: SummaryService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.summaryService.getGlobal().subscribe({
      next: (d) => (this.summaryData = d),
      error: () => (this.error = 'Failed to load summary.'),
    });
    this.summaryService.getHistory().subscribe({
      next: (d) => (this.allEntries = d),
      error: () => (this.error = 'Failed to load history.'),
    });
    this.categoryService.getAll().subscribe({
      next: (c) => (this.categories = c),
    });
  }

  get projectOptions(): string[] {
    return [...new Set(this.allEntries.map((e) => e.project_name))].sort();
  }

  get taskOptions(): string[] {
    return [
      ...new Set(
        this.allEntries
          .filter((e) => !this.filterProject || e.project_name === this.filterProject)
          .map((e) => e.task_name)
      ),
    ].sort();
  }

  onProjectFilterChange(): void {
    this.filterTask = '';
  }

  get filteredEntries(): HistoryEntry[] {
    let rows = this.allEntries;
    if (this.filterProject) rows = rows.filter((e) => e.project_name === this.filterProject);
    if (this.filterTask) rows = rows.filter((e) => e.task_name === this.filterTask);
    return this.sortRows(rows);
  }

  private sortRows(rows: HistoryEntry[]): HistoryEntry[] {
    const dir = this.sortAsc ? 1 : -1;
    return [...rows].sort((a, b) => {
      switch (this.sortKey) {
        case 'week':
          return dir * a.week_start_date.localeCompare(b.week_start_date);
        case 'project':
          return dir * a.project_name.localeCompare(b.project_name);
        case 'task':
          return dir * a.task_name.localeCompare(b.task_name);
        case 'total':
          return dir * (a.total_hours - b.total_hours);
        default:
          return dir * (this.hoursFor(a, this.sortKey) - this.hoursFor(b, this.sortKey));
      }
    });
  }

  setSort(key: SortKey): void {
    if (this.sortKey === key) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortKey = key;
      this.sortAsc = key !== 'week';
    }
  }

  sortIcon(key: SortKey): string {
    if (this.sortKey !== key) return '↕';
    return this.sortAsc ? '↑' : '↓';
  }

  hoursFor(entry: HistoryEntry, categoryName: string): number {
    return entry.allocations.find((a) => a.category_name === categoryName)?.hours ?? 0;
  }

  weekLabel(isoStr: string): string {
    const [y, m, d] = isoStr.split('-').map(Number);
    return formatWeekLabel(new Date(y, m - 1, d));
  }
}
