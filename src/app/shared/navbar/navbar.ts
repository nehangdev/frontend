import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule,RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {

  // 👈 State to manage the dropdown visibility
  isDropdownOpen: boolean = false;

  // 👈 Variable to hold the user data
  userData: any | null = null;
  userInitials: string = '';
   isOpen = false;
  constructor(protected authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    // Get the user data on component load
    this.userData = this.authService.getUserData();
    this.userInitials = this.authService.getUserInitials();
  }

  // Method to toggle the dropdown state
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  onLogout(): void {
    this.authService.logout();
  }

  // Expose the isLoggedIn status for the template
  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}
