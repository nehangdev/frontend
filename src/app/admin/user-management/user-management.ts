import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-user-management',
    templateUrl: './user-management.html', // Template defined below
    imports:[CommonModule,FormsModule]
})
export class UserManagement implements OnInit {
    users: any[] = [];
    roles = ['user', 'manager', 'admin'];
    isLoading = true;

    constructor(private userService: UserService) {}

    ngOnInit(): void {
        this.loadUsers();
    }

    loadUsers(): void {
        this.isLoading = true;
        this.userService.getAllUsers().subscribe({
            next: (data) => {
                this.users = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Failed to load users:', err);
                this.isLoading = false;
                alert('Error loading users. Check admin privileges.');
            }
        });
    }

// Change the method signature to accept the new role string directly
onRoleChange(userId: number, newRole: string): void {
    
    // Find the user locally 
    const user = this.users.find(u => Number(u.id) === userId);

    if (confirm(`Are you sure you want to change ${user?.email}'s role to ${newRole.toUpperCase()}?`)) {
        
        // Optimistic update for better UX while waiting for API response
        const originalRole = user.role;
        user.role = newRole; 

        this.userService.updateUserRole(userId, newRole).subscribe({
            next: (res) => {
                alert(res.message);
                // After success, reload the list to confirm/re-sync
                // this.loadUsers(); 
            },
            error: (err) => {
                console.error('Role update failed:', err);
                alert('Role update failed: ' + (err.error.message || 'Server error.'));
                
                // Revert the local change on error
                if (user) user.role = originalRole;
                
                // Reload the list to fix any potential UI desync
                this.loadUsers(); 
            }
        });
    }
}
}