import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'projects', pathMatch: 'full' },
  {
    path: 'projects',
    loadComponent: () =>
      import('./pages/project-list/project-list.component').then(
        (m) => m.ProjectListComponent
      ),
  },
  {
    path: 'projects/:projectId',
    loadComponent: () =>
      import('./pages/project-detail/project-detail.component').then(
        (m) => m.ProjectDetailComponent
      ),
  },
  {
    path: 'tasks/:taskId',
    loadComponent: () =>
      import('./pages/task-detail/task-detail.component').then(
        (m) => m.TaskDetailComponent
      ),
  },
  {
    path: 'tasks/:taskId/weeks',
    loadComponent: () =>
      import('./pages/task-weeks/task-weeks.component').then(
        (m) => m.TaskWeeksComponent
      ),
  },
];
