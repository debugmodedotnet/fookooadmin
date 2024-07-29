import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from './user.service';
import { catchError, map, of, tap } from 'rxjs';

export const isAdminGuard: CanActivateFn = () => {

  const router = inject(Router);
  const userService = inject(UserService);

  return userService.getCurrentUser().pipe(
    map(user => {
      console.log('User data:', user); // Log user data
      if (user && user.isadmin) {
        console.log('User is an admin');
        return true;
      } else {
        console.log('User is not an admin');
        return false;
      }
    }),
    tap(isAdmin => {
      if (!isAdmin) {
        router.navigate(['/home']);
      }
    }),
    catchError(err => {
      console.error(err);
      router.navigate(['/home']);
      return of(false);
    })
  );
};

