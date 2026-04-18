import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SummaryService, CategorySummary } from '../../services/summary.service';
import { CategoryBreakdownComponent } from '../../components/category-breakdown/category-breakdown.component';

@Component({
  selector: 'app-global-summary',
  standalone: true,
  imports: [CommonModule, CategoryBreakdownComponent],
  templateUrl: './global-summary.component.html',
  styleUrl: './global-summary.component.scss',
})
export class GlobalSummaryComponent implements OnInit {
  data: CategorySummary[] = [];
  error = '';

  constructor(private summaryService: SummaryService) {}

  ngOnInit(): void {
    this.summaryService.getGlobal().subscribe({
      next: (d) => (this.data = d),
      error: () => (this.error = 'Failed to load summary.'),
    });
  }
}
