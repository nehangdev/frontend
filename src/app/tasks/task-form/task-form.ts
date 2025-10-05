import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service'; // <-- Import UserService

@Component({
  selector: 'app-task-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-form.html',
  styleUrl: './task-form.css'
})
export class TaskForm {
  taskForm: FormGroup;
  isEditMode: boolean = false;
  taskId: string | null = null;
  users: any[] = []; // <-- Variable to hold the list of users

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private userService: UserService, // <-- Inject UserService
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      status: ['pending', Validators.required],
      due_date: [''],
      assigned_to_user_id: ['', Validators.required] // <-- Add validation for assignment
    });
  }

  ngOnInit(): void {
    this.fetchUsers(); // <-- Fetch users when component initializes
    this.taskId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.taskId;

    if (this.isEditMode) {
      this.taskService.getTaskById(this.taskId!).subscribe(task => {
        this.taskForm.patchValue(task);
      });
    }
  }

  fetchUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (err) => {
        console.error('Failed to load users for assignment:', err);
        // Handle error, maybe display a message
      }
    });
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      const taskData = this.taskForm.value;

      if (this.isEditMode) {
        const updatedData = { title: this.taskForm.controls["title"].value, status: this.taskForm.controls["status"].value }; // Set default status to 'to_do' on creation
        this.taskService.updateTask(this.taskId!, updatedData).subscribe(() => {
          alert('Task updated successfully!');
          this.router.navigate(['/dashboard']);
        });
      } else {

        this.taskService.createTask(taskData).subscribe(() => {
          alert('Task created successfully!');
          this.router.navigate(['/dashboard']);
        });
      }
    }
  }
}
