import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule,RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  constructor(private authService: AuthService, private router: Router) {}


  onLogin(form: any) {
    if (form.valid) {
      this.authService.login(form.value).subscribe({
        next: (res) => {
          console.log('Login successful', res);
          localStorage.setItem('token', res.token);
          alert('Login successful!');
            // Navigate to the dashboard after a successful login
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('Login failed', err);
          alert('Login failed: ' + (err.error.message || 'Server error'));
        }
      });
    }
  }
}
