import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlumnoService } from '../services/alumno.service';
import { ContentService } from '../services/contenido.service'
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
  userType: string = 'estudiante';

  constructor(
    private fb: FormBuilder,
    private servicio: AlumnoService,
    private route: Router,
    private servicioProfesor: ContentService
  ) {
    this.activeClass = true;
  }

  onClick() {
    this.activeClass = !this.activeClass;
  }

  ngOnInit(): void {
    this.login_form = this.fb.group({
      nro_cuenta: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      password: ['', [Validators.required]],
    });
  }

  onKeydown(event: Event): void {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      // Evitar el comportamiento predeterminado del formulario
      event.preventDefault();
      // Llamar a la función sendLogin
      this.sendLogin();
    }
  }

  sendLogin(): void {
    if (this.login_form.valid) {
      if (this.userType === 'estudiante') {
        this.servicio
          .loginAlumno({
            nro_cuenta: this.login_form.controls['nro_cuenta'].value,
            password: this.login_form.controls['password'].value,
          })
          .subscribe(
            (data) => {
              localStorage.setItem('info_alumno', JSON.stringify(data));
              this.route.navigate(['/cursos']);
            },
            (error) => {
              Swal.fire({
                title: 'Error de inicio de sesión',
                html:
                  'Error: ' +
                  'Datos no válidos o cuenta inexistente, intentelo de nuevo... ',
                icon: 'error',
                customClass: {
                  container: 'my-swal',
                },
              });
            }
          );
      } else if (this.userType === 'profesor') {
        this.servicioProfesor
          .loginProfesor({
            nro_empleado: this.login_form.controls['nro_cuenta'].value,
            contra: this.login_form.controls['password'].value,
          })
          .subscribe(
            (data) => {
              localStorage.setItem('info_profesor', JSON.stringify(data));
              this.route.navigate(['/profesor']);
            },
            (error) => {
              Swal.fire({
                title: 'Error de inicio de sesión',
                html:
                  'Error: ' +
                  'Datos no válidos o cuenta inexistente, intentelo de nuevo... ',
                icon: 'error',
                customClass: {
                  container: 'my-swal',
                },
              });
            }
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
