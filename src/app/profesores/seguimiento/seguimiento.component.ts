import { AfterViewInit, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { AlumnoService } from 'src/app/services/alumno.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
@Component({
  selector: 'app-seguimiento',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './seguimiento.component.html',
})
export class SeguimientoComponent implements OnInit {
  // Datos
  alumnos: any[] = [];
  grupos: number[] = [];
  cursoId: string = '';
  Math = Math;

  // Filtros
  searchText: string = '';
  grupoSeleccionado: number | undefined = undefined;

  // Paginación
  page: number = 1;
  limit: number = 10;
  total: number = 0;
  totalPages: number = 0;

  // Estado
  isLoading: boolean = false;

  // Subject para debounce en el search
  private searchSubject = new Subject<string>();

  constructor(
    private alumnoService: AlumnoService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
      this.route.parent?.paramMap.subscribe(params => {
    this.cursoId = params.get('cursoId') || '';
  });



    this.obtenerGrupos();
    this.buscarAlumnos();

    // Debounce para el search bar
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => {
      this.page = 1;
      this.buscarAlumnos();
    });
  }

  obtenerGrupos(): void {
    this.alumnoService.obtenerGrupos().subscribe({
      next: (data) => this.grupos = data,
      error: (err) => console.error('Error al obtener grupos:', err)
    });
  }

  buscarAlumnos(): void {
    this.isLoading = true;
    this.alumnoService.buscarAlumnos(
      this.searchText || undefined,
      this.grupoSeleccionado,
      this.page,
      this.limit
    ).subscribe({
      next: (data) => {
        this.alumnos = data.data;
        this.total = data.total;
        this.totalPages = data.totalPages;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al buscar alumnos:', err);
        this.isLoading = false;
      }
    });
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchText);
  }

  onGrupoChange(): void {
    this.page = 1;
    this.buscarAlumnos();
  }

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina < 1 || nuevaPagina > this.totalPages) return;
    this.page = nuevaPagina;
    this.buscarAlumnos();
  }

  getPaginasVisibles(): number[] {
    const paginas: number[] = [];
    const inicio = Math.max(1, this.page - 2);
    const fin = Math.min(this.totalPages, this.page + 2);
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    return paginas;
  }

  getNombreCompleto(alumno: any): string {
    return `${alumno.nombre} ${alumno.apellido_1} ${alumno.apellido_2}`.trim();
  }
}
