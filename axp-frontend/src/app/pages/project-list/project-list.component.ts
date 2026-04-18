import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.scss',
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];
  showForm = false;
  newName = '';
  newDescription = '';
  error = '';

  constructor(private projectService: ProjectService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.projectService.getAll().subscribe({
      next: (data) => (this.projects = data),
      error: () => (this.error = 'Failed to load projects.'),
    });
  }

  openForm(): void {
    this.showForm = true;
    this.newName = '';
    this.newDescription = '';
  }

  cancelForm(): void {
    this.showForm = false;
  }

  create(): void {
    const name = this.newName.trim();
    if (!name) return;
    this.projectService.create({ name, description: this.newDescription.trim() || undefined }).subscribe({
      next: (p) => {
        this.projects.push(p);
        this.showForm = false;
      },
      error: () => (this.error = 'Failed to create project.'),
    });
  }

  goTo(id: number): void {
    this.router.navigate(['/projects', id]);
  }

  delete(id: number, event: MouseEvent): void {
    event.stopPropagation();
    if (!confirm('Delete this project and all its tasks?')) return;
    this.projectService.delete(id).subscribe({
      next: () => (this.projects = this.projects.filter((p) => p.id !== id)),
      error: () => (this.error = 'Failed to delete project.'),
    });
  }
}
