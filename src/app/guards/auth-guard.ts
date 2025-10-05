import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
   const token = localStorage.getItem('token');
  if (token) {
    return true;
  }
  // You can add a redirect to the login page here
  return false;
};
