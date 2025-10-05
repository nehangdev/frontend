import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule,RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  
  // 👈 1. Model for user input data
  user = {
    first_name: '',
    last_name: '',
    email: '',
    password: ''
  };
  
  constructor(private authService: AuthService, private router: Router) {} // Inject Router

  // 2. Computed Getter for the Full Name display
  get fullNameDisplay(): string {
    const first = this.user.first_name.trim();
    const last = this.user.last_name.trim();
    
    if (first || last) {
        // Only show a space if both names are present
        return `${first} ${last}`.trim(); 
    }
    return ''; 
  }

  onRegister(form: NgForm) { // Use NgForm type
    if (form.valid) {
      // Send the updated 'user' object from the model
      this.authService.register(this.user).subscribe({
        next: (res) => {
          console.log('Registration successful', res);
          alert('Registration successful! Please log in.');
          this.router.navigate(['/login']); // Redirect to the login page
        },
        error: (err) => {
          console.error('Registration failed', err);
          alert('Registration failed: ' + (err.error.message || 'Server error'));
        }
      });
    }
  }
}
