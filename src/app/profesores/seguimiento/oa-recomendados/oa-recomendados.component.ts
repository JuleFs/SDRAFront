import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AlumnoService } from 'src/app/services/alumno.service';
import { RecommendationService } from 'src/app/services/recomendacion.service';
import { CursoService } from 'src/app/services/curso.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { OaViewerComponent } from 'src/app/estudiantes/oa-viewer/oa-viewer.component';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-oa-recomendados',
  standalone: true,
  imports: [CommonModule, RouterModule, MatDialogModule],
  templateUrl: './oa-recomendados.component.html',
})
export class OaRecomendadosComponent implements OnInit {
  nroCuenta: number = 0;
  cursoId: string = '';
  nombreAlumno: string = '';
  isLoading = true;

  // Estructura: array de unidades con sus temas y OAs recomendados
  unidades: {
    nombre: string;
    temas: {
      id: number;
      nombre: string;
      isLoading: boolean;
      recomendacion: any;
    }[];
  }[] = [];

  constructor(
    private route: ActivatedRoute,
    private alumnoService: AlumnoService,
    private recSrv: RecommendationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.nroCuenta = Number(params.get('nroCuenta'));
      this.cursoId = params.get('cursoId') || '';
      this.cargarNombreAlumno();
      this.cargarUnidades();
    });
  }

  cargarNombreAlumno(): void {
    this.alumnoService.buscarAlumnos(String(this.nroCuenta)).subscribe({
      next: (data) => {
        if (data.data && data.data.length > 0) {
          const a = data.data[0];
          this.nombreAlumno = `${a.nombre} ${a.apellido_1} ${a.apellido_2}`.trim();
        }
      },
      error: (err) => console.error('Error al cargar alumno:', err)
    });
  }

  cargarUnidades(): void {
    this.isLoading = true;
    this.recSrv.getUnits(this.cursoId).subscribe({
      next: (unidades) => {
        this.unidades = unidades.map(u => ({
          nombre: u.nombre,
          temas: (u.temas || []).map(t => ({
            id: t.id,
            nombre: t.nombre,
            isLoading: true,
            recomendacion: null,
          }))
        }));

        this.isLoading = false;
        this.cargarRecomendaciones();
      },
      error: (err) => {
        console.error('Error al cargar unidades:', err);
        this.isLoading = false;
      }
    });
  }

  cargarRecomendaciones(): void {
    this.unidades.forEach(unidad => {
      unidad.temas.forEach(tema => {
        this.recSrv.getRecomendacion(tema.id, this.nroCuenta).subscribe({
          next: (data) => {
            tema.recomendacion = data;
            tema.isLoading = false;
          },
          error: (err) => {
            console.error(`Error al cargar recomendación para tema ${tema.id}:`, err);
            tema.recomendacion = { objetos: [] };
            tema.isLoading = false;
          }
        });
      });
    });
  }

  getEstiloTipo(oa: any): string {
    return oa.estiloObjeto?.tipo ||
           oa.objeto?.estiloObjeto?.tipo ||
           oa.tipo ||
           'Recurso General';
  }

  openResource(oa: any): void {
    this.dialog.open(OaViewerComponent, {
      data: oa,
      width: '80%',
      maxWidth: '900px',
    });
  }
}
