import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service'; // Ensure this path is correct
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { shareReplay } from 'rxjs';
// Assuming you created this interface (or define it here)
interface TaskSummary {
  label: string;
  count: number;
  filterKey: 'created' | 'assigned' | 'in-progress' | 'completed' | 'overdue' | null;
  filterValue: string;
  iconClass: string;
}

@Component({
  selector: 'app-task-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './task-dashboard.html',
  styleUrl: './task-dashboard.css'
})

export class TaskDashboard implements OnInit {
  tasks: any[] = [];
  errorMessage: string | null = null;
  currentUserId: string = '';
  currentUserRole: string = '';
  ComparisonType: 'before' | 'after' | 'equal' = 'equal';

  filteredTasks: any[] = []; // 👈 New array to hold the currently displayed tasks
  taskSummary: TaskSummary[] = [];
  isLoading = true;
  activeFilter: TaskSummary['filterKey'] | null = null; // Store the currently active filter

  constructor(
    private taskService: TaskService,
    private authService: AuthService
  ) {
    this.currentUserId = this.authService.getUserIdFromToken();
    this.currentUserRole = this.authService.getUserRoleFromToken();
  }

  ngOnInit(): void {
    this.getTasks();
  }

  getTasks(): void {
    this.taskService.getTasks().subscribe({
      next: (data) => {
        this.tasks = data;
        // Initialize the view by applying base visibility (Admin/Manager/User rules)
        this.filteredTasks = this.applyBaseVisibility(data);
        this.calculateSummary();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load tasks:', err);
        this.isLoading = false;
      }
    });
  }

  // --- RBAC BASE VISIBILITY FILTER ---
  private applyBaseVisibility(allTasks: any[]): any[] {
    const userId = this.currentUserId;
    const userRole = this.currentUserRole;

    // 1. ADMIN: See everyone's tasks
    if (userRole === 'admin') {
      return allTasks;
    }

    // 2. MANAGER: See all tasks fetched from the backend (assumed to be hierarchy-filtered)
    if (userRole === 'manager') {
      return allTasks;
    }

    // 3. STANDARD USER: See tasks assigned TO them OR created BY them.
    if (userRole === 'user') {
      return allTasks.filter(task =>
        task.assigned_to_user_id == userId ||
        task.created_by_user_id == userId
      );
    }

    return [];
  }

  // Method to handle deletion
  onDeleteTask(taskId: string): void {
    if (confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      this.taskService.deleteTask(taskId).subscribe({
        next: () => {
          alert('Task deleted successfully!');
          // 👈 Crucial: Refresh the task list after deletion
          this.getTasks();
        },
        error: (err) => {
          alert('Failed to delete task: ' + (err.error.message || 'Server error'));
          console.error('Delete Error:', err);
        }
      });
    }
  }

  // --- WIDGET SUMMARY CALCULATION ---
  calculateSummary(): void {
    // Start with the full list of tasks that the user is allowed to see (base visibility)
    const baseVisibleTasks = this.applyBaseVisibility(this.tasks);

    const summaryMap = {
      created: baseVisibleTasks.filter(t => t.created_by_user_id == this.currentUserId).length,
      assigned: baseVisibleTasks.filter(t => t.assigned_to_user_id == this.currentUserId).length,
      'in-progress': baseVisibleTasks.filter(t => t.status === 'in-progress').length,
      completed: baseVisibleTasks.filter(t => t.status === 'completed').length,
      overdue: baseVisibleTasks.filter(t => t.status !== 'completed' && this.compareDates(t.due_date, new Date())).length,
    };

    this.taskSummary = [
      { label: 'All Visible Tasks', count: baseVisibleTasks.length, filterKey: null, filterValue: 'all', iconClass: 'fa-list-check' },
      { label: 'Created By Me', count: summaryMap.created, filterKey: 'created', filterValue: this.currentUserId, iconClass: 'fa-user-tag' },
      { label: 'Assigned To Me', count: summaryMap.assigned, filterKey: 'assigned', filterValue: this.currentUserId, iconClass: 'fa-inbox' },
      { label: 'In Progress', count: summaryMap['in-progress'], filterKey: 'in-progress', filterValue: 'in-progress', iconClass: 'fa-spinner' },
      { label: 'Completed', count: summaryMap.completed, filterKey: 'completed', filterValue: 'completed', iconClass: 'fa-circle-check' },
      { label: 'Overdue', count: summaryMap.overdue, filterKey: 'overdue', filterValue: 'overdue', iconClass: 'fa-hourglass-end' },
    ];
  }



  compareDates(
    date1: string | Date,
    date2: string | Date,
    useLocalDate: boolean = true // true: compare local date only, false: compare exact time
  ): boolean {
    const toComparable = (d: string | Date): string => {
      const dateObj = (d instanceof Date) ? d : new Date(d);

      if (useLocalDate) {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`; // local date only
      } else {
        return dateObj.toISOString(); // full UTC date-time
      }
    };

    const d1 = toComparable(date1);
    const d2 = toComparable(date2);

    return d1 < d2;
  }


  // --- WIDGET FILTER APPLICATION ---
  applyFilter(filter: TaskSummary): void {
    this.activeFilter = filter.filterKey;

    // 1. Start with the list restricted by the base visibility rules
    let tempTasks = this.applyBaseVisibility(this.tasks);

    // 2. Apply the specific WIDGET filter on the BASE list
    const userId = this.currentUserId;

    if (filter.filterKey === 'created') {
      tempTasks = tempTasks.filter(t => t.created_by_user_id == userId);
    } else if (filter.filterKey === 'assigned') {
      tempTasks = tempTasks.filter(t => t.assigned_to_user_id == userId);
    } else if (filter.filterKey === 'in-progress') {
      tempTasks = tempTasks.filter(t => t.status === 'in-progress');
    } else if (filter.filterKey === 'completed') {
      tempTasks = tempTasks.filter(t => t.status === 'completed');
    } else if (filter.filterKey === 'overdue') {
      tempTasks = tempTasks.filter(t => t.status !== 'completed' && this.compareDates(t.due_date, new Date()));
    }

    this.filteredTasks = tempTasks;
  }

  get activeFilterLabel(): string {
    if (!this.activeFilter) {
      return 'All Visible Tasks'; // Or whatever your default label is
    }

    const summaryItem = this.taskSummary.find(s => s.filterKey === this.activeFilter);

    // Use optional chaining inside the getter for safety
    return summaryItem?.label || 'Filtered Tasks';
  }

  // --- ACTION BUTTON VISIBILITY (Remains the same) ---
  canModifyTask(task: any): boolean {
    if (this.currentUserRole === 'admin' || this.currentUserRole === 'manager') {
      return true;
    }
    return task.created_by_user_id == this.currentUserId;
  }
}
