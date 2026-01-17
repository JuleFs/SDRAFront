import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean {
    const expectedRole = route.data['role'] as 'alumno' | 'profesor';

    const alumnoSession = localStorage.getItem('info_alumno');
    const profesorSession = localStorage.getItem('info_profesor');

    if (expectedRole === 'alumno' && alumnoSession) {
      return true;
    }

    if (expectedRole === 'profesor' && profesorSession) {
      return true;
    }

    this.clearSession();
    this.router.navigate(['/login']);
    return false;
  }

  private clearSession(): void {
    localStorage.removeItem('info_alumno');
    localStorage.removeItem('info_profesor');
  }
}
