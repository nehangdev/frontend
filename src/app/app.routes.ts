import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { TaskDashboard } from './dashboard/task-dashboard/task-dashboard';
import { authGuard } from './guards/auth-guard';
import { TaskForm } from './tasks/task-form/task-form';
import { TaskHistory } from './tasks/task-history/task-history';
import { UserManagement } from './admin/user-management/user-management';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'dashboard', component: TaskDashboard, canActivate: [authGuard] }, // Protect this route
  { path: 'tasks/new', component: TaskForm, canActivate: [authGuard] }, // Route for creating a new task
  { path: 'tasks/:id/edit', component: TaskForm, canActivate: [authGuard] }, // Route for editing an existing task
  { path: 'tasks/:id/history', component: TaskHistory, canActivate: [authGuard] }, // New route for history
  // Add this route to your main routing configuration (e.g., app-routing.module.ts)
  { path: 'admin/users', component: UserManagement, canActivate: [authGuard] },
  // Note: You need a front-end AdminGuard to prevent loading the component if not admin.
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Redirect to login by default
  // Add other routes here later
];