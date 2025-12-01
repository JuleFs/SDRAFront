import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlumnoService } from 'src/app/services/alumno.service';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cuestionario',
  templateUrl: './cuestionario.component.html',
  styleUrls: ['./cuestionario.component.css'],
})
export class CuestionarioComponent implements OnInit {

  Cuestionario!: Array<any>;
  num_pregunta: number = 1;
  respuestas_compactadas: string = "";

  constructor(
    private servicio: AlumnoService,
    private route: ActivatedRoute,
    private routing: Router,
    private translate: TranslateService
  ) {}

    ngOnInit(): void {
    this.obtenerPreguntas();
  }

  obtenerPreguntas() {
    this.servicio.obtenerPreguntas(
      this.route.snapshot.params['id_cuestionario']
    ).subscribe((data) => {
      this.Cuestionario = data;
    });
  }

  // Calcular progreso del cuestionario
  getProgress(): number {
    if (!this.Cuestionario) return 0;
    const answered = this.Cuestionario.filter(p => p.respuesta).length;
    return (answered / this.Cuestionario.length) * 100;
  }

  // Obtener cantidad de respuestas completadas
  getAnsweredCount(): number {
    if (!this.Cuestionario) return 0;
    return this.Cuestionario.filter(p => p.respuesta).length;
  }

  registrarRespuestas() {
    // Mostrar loading
    Swal.fire({
      title: 'Procesando respuestas',
      html: 'Por favor espera...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Construir respuestas compactadas
    this.respuestas_compactadas = "";
    for (let index = 1; index <= 44; index++) {
      const aux = document.querySelector("[id='" + index + "-A']") as HTMLInputElement;
      if (aux?.checked) {
        this.respuestas_compactadas += "A";
      } else {
        this.respuestas_compactadas += "B";
      }
    }

    const infoAlumno = JSON.parse(localStorage.getItem('info_alumno') || "{}");

    this.servicio.resultadoEncuesta({
      nro_cuenta: infoAlumno.nro_cuenta,
      respuestas_compactadas: this.respuestas_compactadas,
      grupo: infoAlumno.grupo
    }).subscribe(
      (data) => {
        Swal.fire({
          title: '¡Completado!',
          text: 'Tus respuestas han sido registradas exitosamente',
          icon: 'success',
          confirmButtonText: 'Ver resultados',
          confirmButtonColor: '#6366f1',
          customClass: {
            container: 'my-swal',
          },
        }).then(() => {
          this.routing.navigate(['/Resultado']);
        });
      },
      (error) => {
        Swal.fire({
          title: 'Error de registro',
          html: 'Algo salió mal en el registro de las respuestas. Por favor intenta más tarde.',
          icon: 'error',
          confirmButtonColor: '#ef4444',
          customClass: {
            container: 'my-swal',
          },
        });
      }
    );
  }

  cancelar() {
  // Confirmar antes de cancelar si hay respuestas
  const respondidas = this.Cuestionario?.filter(p => p.respuesta).length || 0;

  if (respondidas > 0) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Perderás todas las respuestas que has dado hasta ahora',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6366f1',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'Continuar encuesta',
      customClass: {
        container: 'my-swal',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.routing.navigate(['/Inicio']);
      }
    });
  } else {
    // Si no hay respuestas, regresar directamente
    this.routing.navigate(['/Inicio']);
  }
}
  contarRespondidas(): number {
    if (!this.Cuestionario) return 0;
    return this.Cuestionario.filter(p => p.respuesta).length;
  }
}
