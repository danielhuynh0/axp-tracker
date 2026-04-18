import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { ProjectService } from '../../services/project.service';
import { WeeklyEntryService } from '../../services/weekly-entry.service';
import { Task, TaskCategoryWeight } from '../../models/task.model';
import { WeeklyEntry } from '../../models/weekly-entry.model';
import { getAllowedWeeks, toIsoDate, formatWeekLabel } from '../../utils/week.utils';
import { distributeHours, PreviewAllocation } from '../../utils/hours.utils';

interface WeekOption {
  isoStr: string;
  label: string;
}

@Component({
  selector: 'app-task-weeks',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './task-weeks.component.html',
  styleUrl: './task-weeks.component.scss',
})
export class TaskWeeksComponent implements OnInit {
  task: Task | null = null;
  projectName = '';
  weights: TaskCategoryWeight[] = [];
  allEntries: WeeklyEntry[] = [];

  weekOptions: WeekOption[] = [];
  selectedWeekStr = '';
  totalHoursInput: number | null = null;
  preview: PreviewAllocation[] = [];

  saving = false;
  saved = false;
  error = '';
  weightsError = '';

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private projectService: ProjectService,
    private weeklyEntryService: WeeklyEntryService
  ) {}

  ngOnInit(): void {
    const taskId = Number(this.route.snapshot.paramMap.get('taskId'));

    this.weekOptions = getAllowedWeeks().map((d) => ({
      isoStr: toIsoDate(d),
      label: formatWeekLabel(d),
    }));

    const today = new Date();
    const currentMonday = new Date(today);
    const day = today.getDay();
    currentMonday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
    this.selectedWeekStr = toIsoDate(currentMonday);

    this.taskService.get(taskId).subscribe({
      next: (t) => {
        this.task = t;
        this.projectService.get(t.project_id).subscribe({
          next: (p) => (this.projectName = p.name),
        });
      },
      error: () => (this.error = 'Task not found.'),
    });

    this.taskService.getWeights(taskId).subscribe({
      next: (w) => {
        this.weights = w;
        if (!w.some((x) => x.weight > 0)) {
          this.weightsError =
            'No category weights configured for this task. Configure them before logging hours.';
        }
        this.updatePreview();
      },
    });

    this.loadEntries(taskId);
  }

  loadEntries(taskId: number): void {
    this.weeklyEntryService.getByTask(taskId).subscribe({
      next: (entries) => {
        this.allEntries = entries;
        this.onWeekChange();
      },
    });
  }

  onWeekChange(): void {
    const existing = this.allEntries.find((e) => e.week_start_date === this.selectedWeekStr);
    this.totalHoursInput = existing ? existing.total_hours : null;
    this.updatePreview();
  }

  updatePreview(): void {
    const hours = this.totalHoursInput;
    if (hours && hours > 0 && this.weights.length > 0) {
      this.preview = distributeHours(hours, this.weights);
    } else {
      this.preview = [];
    }
  }

  onHoursChange(): void {
    this.updatePreview();
  }

  get selectedEntry(): WeeklyEntry | undefined {
    return this.allEntries.find((e) => e.week_start_date === this.selectedWeekStr);
  }

  get selectedWeekLabel(): string {
    return this.weekOptions.find((w) => w.isoStr === this.selectedWeekStr)?.label ?? '';
  }

  isValidHours(): boolean {
    const h = this.totalHoursInput;
    if (!h || h <= 0) return false;
    return Math.abs(Math.round(h * 4) - h * 4) < 1e-9;
  }

  save(): void {
    if (!this.task || !this.isValidHours() || !this.totalHoursInput) return;
    this.saving = true;
    this.saved = false;
    this.weeklyEntryService
      .upsert(this.task.id, this.selectedWeekStr, this.totalHoursInput)
      .subscribe({
        next: () => {
          this.saving = false;
          this.saved = true;
          setTimeout(() => (this.saved = false), 2500);
          this.loadEntries(this.task!.id);
        },
        error: (err) => {
          this.saving = false;
          this.error = err?.error?.detail ?? 'Failed to save.';
        },
      });
  }

  entriesExcludingSelected(): WeeklyEntry[] {
    return this.allEntries.filter((e) => e.week_start_date !== this.selectedWeekStr);
  }

  weekLabelFor(isoStr: string): string {
    return this.weekOptions.find((w) => w.isoStr === isoStr)?.label ?? isoStr;
  }
}
