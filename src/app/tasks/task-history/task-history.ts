import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-history',
  imports: [CommonModule,RouterLink],
  templateUrl: './task-history.html',
  styleUrl: './task-history.css'
})
export class TaskHistory {
 taskId: string | null = null;
  history: any[] = [];
  taskTitle: string = 'Task History';

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    this.taskId = this.route.snapshot.paramMap.get('id');
    if (this.taskId) {
      this.fetchTaskHistory();
    }
  }

  fetchTaskHistory(): void {
    this.taskService.getTaskHistory(this.taskId!).subscribe({
      next: (data) => {
        this.history = data;
        // Optionally fetch task details to display the title
        this.taskService.getTaskById(this.taskId!).subscribe(task => {
          this.taskTitle = `History for: ${task.title}`;
        });
      },
      error: (err) => {
        alert('Failed to load task history.');
        console.error('History Error:', err);
      }
    });
  }
}
