import { CanActivateFn, Router } from '@angular/router';
import { UserService } from './user.service';
import { map, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { inject } from '@angular/core';

export const userAuthGuard: CanActivateFn = () => {
  const router = inject(Router);
  const userService = inject(UserService);

  return userService.getCurrentUser().pipe(
    map(user => {
      if (user) {
        console.log('User logged in');
        return true;
      } else {
        console.log('User not logged in');
        return false;
      }
    }),
    tap(isLoggedIn => {
      if (!isLoggedIn) {
        router.navigate(['/login']);
      }
    }),
    catchError((err) => {
      console.error(err);
      router.navigate(['/login']);
      return of(false);
    })
  );
};