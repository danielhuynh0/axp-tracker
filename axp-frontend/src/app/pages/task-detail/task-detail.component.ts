import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { ProjectService } from '../../services/project.service';
import { Task, TaskCategoryWeight } from '../../models/task.model';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.scss',
})
export class TaskDetailComponent implements OnInit {
  task: Task | null = null;
  projectName = '';
  weights: TaskCategoryWeight[] = [];

  taskName = '';
  taskDescription = '';

  infoSaved = false;
  weightsSaved = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    const taskId = Number(this.route.snapshot.paramMap.get('taskId'));
    this.taskService.get(taskId).subscribe({
      next: (t) => {
        this.task = t;
        this.taskName = t.name;
        this.taskDescription = t.description ?? '';
        this.projectService.get(t.project_id).subscribe({
          next: (p) => (this.projectName = p.name),
        });
      },
      error: () => (this.error = 'Task not found.'),
    });
    this.taskService.getWeights(taskId).subscribe({
      next: (w) => (this.weights = w.map((item) => ({ ...item }))),
      error: () => (this.error = 'Failed to load weights.'),
    });
  }

  totalPercent(): number {
    return this.weights.reduce((sum, w) => sum + (w.weight || 0), 0);
  }

  remainingPercent(): number {
    return Math.round((100 - this.totalPercent()) * 10) / 10;
  }

  weightsValid(): boolean {
    return Math.abs(this.totalPercent() - 100) < 0.05;
  }

  saveInfo(): void {
    if (!this.task) return;
    this.infoSaved = false;
    this.taskService
      .update(this.task.id, {
        name: this.taskName.trim(),
        description: this.taskDescription.trim() || undefined,
      })
      .subscribe({
        next: (t) => {
          this.task = t;
          this.infoSaved = true;
          setTimeout(() => (this.infoSaved = false), 2500);
        },
        error: () => (this.error = 'Failed to save task info.'),
      });
  }

  saveWeights(): void {
    if (!this.task || !this.weightsValid()) return;
    this.weightsSaved = false;
    const payload = this.weights.map((w) => ({
      category_id: w.category_id,
      weight: w.weight || 0,
    }));
    this.taskService.setWeights(this.task.id, payload).subscribe({
      next: (w) => {
        this.weights = w.map((item) => ({ ...item }));
        this.weightsSaved = true;
        setTimeout(() => (this.weightsSaved = false), 2500);
      },
      error: () => (this.error = 'Failed to save weights.'),
    });
  }
}
