import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AlumnoService } from '../services/alumno.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class EncuestaGuard implements CanActivate {

  constructor(
    private alumnoService: AlumnoService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    // Obtener nro_cuenta del localStorage
    const info_alumno = localStorage.getItem('info_alumno');

    if (!info_alumno) {
      // No hay sesión, redirigir a login
      this.router.navigate(['/']);
      return of(false);
    }

    const nroCuenta = JSON.parse(info_alumno).nro_cuenta;

    // Verificar si completó el cuestionario
    return this.alumnoService.verificarCuestionarioCompletado(nroCuenta, 1).pipe(
      map(response => {
        if (response.completado) {
          // Ya completó la encuesta, permitir acceso
          return true;
        } else {
          // No ha completado la encuesta, mostrar alerta y redirigir
          Swal.fire({
            title: 'Encuesta pendiente',
            text: 'Debes completar el cuestionario de estilo de aprendizaje antes de acceder a los cursos.',
            icon: 'warning',
            confirmButtonText: 'Ir a encuesta',
            confirmButtonColor: '#6366f1',
            allowOutsideClick: false,
            customClass: {
              container: 'my-swal',
            },
          }).then(() => {
            this.router.navigate(['/Inicio']);
          });
          return false;
        }
      }),
      catchError(error => {
        console.error('Error al verificar encuesta:', error);
        // En caso de error, redirigir a inicio
        this.router.navigate(['/Inicio']);
        return of(false);
      })
    );
  }
}
