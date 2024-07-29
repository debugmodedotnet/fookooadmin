import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';
import { isAdminGuard } from './isadminguard.guard';

describe('isAdminGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => isAdminGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
