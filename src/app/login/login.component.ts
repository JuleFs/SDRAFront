import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlumnoService } from '../services/alumno.service';
import { ContentService } from '../services/contenido.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  activeClass: boolean;
  login_form: FormGroup = new FormGroup({});
  isCheck: any;
  userType: string = 'estudiante'; // ← Esta variable SÍ se actualiza ahora

  constructor(
    private fb: FormBuilder,
    private servicio: AlumnoService,
    private route: Router,
    private servicioProfesor: ContentService,
  ) {
    this.activeClass = true;
  }

  onClick() {
    this.activeClass = !this.activeClass;
  }

  ngOnInit(): void {

    const infoAlumno = localStorage.getItem('info_alumno');
    const infoProfesor = localStorage.getItem('info_profesor');

    if (infoAlumno) {
      this.route.navigate(['/cursos']);
      return;
    }

    if (infoProfesor) {
      this.route.navigate(['/profesor']);
      return;
    }

    this.login_form = this.fb.group({
      nro_cuenta: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      password: ['', [Validators.required]],
    });
  }

  onKeydown(event: Event): void {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      event.preventDefault();
      this.sendLogin();
    }
  }

  // ✅ AGREGAR ESTE MÉTODO
  navigateTo(userType: string): void {
    this.userType = userType; // ← Actualizar userType
    this.activeClass = userType === 'estudiante'; // ← Actualizar activeClass
  }

  sendLogin(): void {
    if (this.login_form.valid) {
      if (this.userType === 'estudiante') {
        // ====== LOGIN ESTUDIANTE ======
        const nroCuenta = Number(this.login_form.controls['nro_cuenta'].value);
        const contra = this.login_form.controls['password'].value;

        this.servicio
          .loginAlumno({
            nro_cuenta: nroCuenta,
            password: contra,
          })
          .subscribe(
            (data) => {
              if (
                !data ||
                data.error ||
                data.message === 'Credenciales inválidas'
              ) {
                Swal.fire({
                  title: 'Error de inicio de sesión',
                  html: 'Error: Datos no válidos o cuenta inexistente, intentelo de nuevo...',
                  icon: 'error',
                  customClass: {
                    container: 'my-swal',
                  },
                });
                return;
              }
              localStorage.setItem('info_alumno', JSON.stringify(data));
              this.route.navigate(['/cursos']).then(() => window.location.reload());
            },
            (error) => {
              Swal.fire({
                title: 'Error de inicio de sesión',
                html: 'Error: Datos no válidos o cuenta inexistente, intentelo de nuevo...',
                icon: 'error',
                customClass: {
                  container: 'my-swal',
                },
              });
            },
          );
      } else if (this.userType === 'profesor') {
        // ====== LOGIN PROFESOR ======
        const nroEmpleado = Number(
          this.login_form.controls['nro_cuenta'].value,
        ); // ← Convertir a número
        const contra = this.login_form.controls['password'].value;

        this.servicioProfesor
          .loginProfesor({
            nro_empleado: nroEmpleado, // ← Enviar como número
            contra: contra, // ← Campo correcto
          })
          .subscribe(
            (data) => {
              if (
                !data ||
                data.error ||
                data.message === 'Credenciales inválidas'
              ) {
                Swal.fire({
                  title: 'Error de inicio de sesión',
                  html: 'Error: Datos no válidos o cuenta inexistente, intentelo de nuevo...',
                  icon: 'error',
                  customClass: {
                    container: 'my-swal',
                  },
                });
                return;
              }
              localStorage.setItem('info_profesor', JSON.stringify(data));
              this.route.navigate(['/profesor']).then(() => window.location.reload());
            },
            (error) => {
              Swal.fire({
                title: 'Error de inicio de sesión',
                html: 'Error: Datos no válidos o cuenta inexistente, intentelo de nuevo...',
                icon: 'error',
                customClass: {
                  container: 'my-swal',
                },
              });
            },
          );
      }
    } else {
      Swal.fire({
        title: 'Error de registro',
        html: 'Por favor, llene todos los campos correctamente e inténtelo de nuevo.',
        icon: 'error',
        customClass: {
          container: 'my-swal',
        },
      });
    }
  }
}
