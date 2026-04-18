import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategorySummary } from '../../services/summary.service';

interface BreakdownRow {
  category_name: string;
  total_hours: number;
  pct: number;
}

@Component({
  selector: 'app-category-breakdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-breakdown.component.html',
  styleUrl: './category-breakdown.component.scss',
})
export class CategoryBreakdownComponent implements OnChanges {
  @Input() data: CategorySummary[] = [];

  rows: BreakdownRow[] = [];
  totalHours = 0;

  ngOnChanges(): void {
    this.totalHours = this.data.reduce((s, c) => s + c.total_hours, 0);
    this.rows = this.data.map((c) => ({
      category_name: c.category_name,
      total_hours: c.total_hours,
      pct: this.totalHours > 0 ? (c.total_hours / this.totalHours) * 100 : 0,
    }));
  }
}
