import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router'; // Import Router
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth';

  constructor(private http: HttpClient, private router: Router) { } // Inject Router

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  login(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, user);
  }
  // New method for logging out
  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    // Check if the token exists (a simple way to check login status)
    return !!localStorage.getItem('token');
  }

  // Helper to get the token from localStorage
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  // 1. Method to decode the JWT and extract the payload
  private decodeToken(): any | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      // WARNING: Using a library like 'jwt-decode' is safer in a real app.
      // This is a basic function for demonstration only:
      const payload = token.split('.')[1];
      const decodedPayload = atob(payload);
      return JSON.parse(decodedPayload);

    } catch (e) {
      console.error('Error decoding token:', e);
      return null;
    }
  }

  // 2. Extracts the user ID (used for 'user' role task filtering)
  getUserIdFromToken(): string {
    const payload = this.decodeToken();
    // The structure is payload.user.id
    return payload && payload.user && payload.user.id ? String(payload.user.id) : '';
  }

  // 3. Extracts the user Role (used for RBAC visibility logic)
  getUserRoleFromToken(): string {
    const payload = this.decodeToken();
    // The structure is payload.user.role
    return payload && payload.user && payload.user.role ? payload.user.role : '';
  }

  // 👈 NEW: Get full user data for display
  getUserData(): { firstName: string, lastName: string, email: string, role: string } | null {
    const payload = this.decodeToken();
    if (payload && payload.user) {
      // You'll need to update your backend's JWT payload creation 
      // to include first_name and last_name for this to work perfectly.
      return {
        firstName: payload.user.first_name || '', // Assuming you update JWT payload
        lastName: payload.user.last_name || '',   // Assuming you update JWT payload
        email: payload.user.email,
        role: payload.user.role
      };
    }
    return null;
  }

  getUserName(): string{
    console.log('Getting user name from token:', `${this.getUserData()?.firstName ?? ''}${this.getUserData()?.lastName ?? ''}`.trim()|| 'Guest');
    return `${this.getUserData()?.firstName ?? ''}${this.getUserData()?.lastName ?? ''}`.trim()|| 'Guest';
  }

  // 👈 NEW: Get the initials for the badge
  getUserInitials(): string {
    const data = this.getUserData();
    if (data && data.firstName && data.lastName) {
      return `${data.firstName.charAt(0)}${data.lastName.charAt(0)}`.toUpperCase();
    }
    // Fallback if full name isn't in token yet
    return data?.email.charAt(0).toUpperCase() || '?';
  }
}