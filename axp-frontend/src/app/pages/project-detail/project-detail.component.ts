import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { TaskService } from '../../services/task.service';
import { Project } from '../../models/project.model';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss',
})
export class ProjectDetailComponent implements OnInit {
  project: Project | null = null;
  tasks: Task[] = [];
  showForm = false;
  newTaskName = '';
  newTaskDescription = '';
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('projectId'));
    this.projectService.get(id).subscribe({
      next: (p) => (this.project = p),
      error: () => (this.error = 'Project not found.'),
    });
    this.taskService.getByProject(id).subscribe({
      next: (tasks) => (this.tasks = tasks),
      error: () => (this.error = 'Failed to load tasks.'),
    });
  }

  openForm(): void {
    this.showForm = true;
    this.newTaskName = '';
    this.newTaskDescription = '';
  }

  cancelForm(): void {
    this.showForm = false;
  }

  createTask(): void {
    const name = this.newTaskName.trim();
    if (!name || !this.project) return;
    this.taskService
      .create(this.project.id, { name, description: this.newTaskDescription.trim() || undefined })
      .subscribe({
        next: (t) => {
          this.tasks.push(t);
          this.showForm = false;
        },
        error: () => (this.error = 'Failed to create task.'),
      });
  }

  deleteTask(taskId: number, event: MouseEvent): void {
    event.stopPropagation();
    if (!confirm('Delete this task and all its logged hours?')) return;
    this.taskService.delete(taskId).subscribe({
      next: () => (this.tasks = this.tasks.filter((t) => t.id !== taskId)),
      error: () => (this.error = 'Failed to delete task.'),
    });
  }
}
