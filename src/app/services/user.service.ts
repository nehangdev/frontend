import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define a basic interface for a User (optional but recommended)
interface User {
  id: string; // or _id, depending on your backend
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = '/api/users';

  constructor(private http: HttpClient) { }

  // Note: We are relying on the AuthInterceptor to add the 'x-auth-token' header
  
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

   // 2. Update User Role
    updateUserRole(userId: number, newRole: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/${userId}/role`, { newRole });
    }
}