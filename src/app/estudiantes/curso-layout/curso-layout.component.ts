import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { RecommendationService } from 'src/app/services/recomendacion.service';
import { CursoService } from 'src/app/services/curso.service';

@Component({
  selector: 'app-course-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  template: `
    <div class="flex h-screen w-full bg-base-200 overflow-hidden">
      <!-- Sidebar colapsable -->
      <aside
        class="transition-all duration-300 ease-in-out border-r border-base-300 bg-base-100 shadow-sm overflow-hidden"
        [class.w-72]="sidebarOpen"
        [class.w-0]="!sidebarOpen"
      >
        <div class="min-w-72 h-full">
          <app-sidebar
            [units]="units$ | async"
            [onClose]="closeSidebar.bind(this)"
            [cursoNombre]="cursoNombre"
          >
          </app-sidebar>
        </div>
      </aside>

      <!-- Botón hamburguesa cuando el sidebar está cerrado -->
      <button
        *ngIf="!sidebarOpen"
        (click)="sidebarOpen = true"
        class="fixed left-0 top-1/2 -translate-y-1/2 z-50 bg-primary text-primary-content w-8 h-12 flex items-center justify-center rounded-r-lg shadow-lg hover:bg-primary-focus transition-colors"
        title="Abrir menú"
      >
        ☰
      </button>

      <!-- Contenido principal -->
      <main class="flex-1 overflow-y-auto">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
export class CourseLayoutComponent implements OnInit {
  units$!: any;
  cursoNombre: string = '';
  cursos$!: any;
  grupo = 0;
  sidebarOpen = true;

  constructor(
    private route: ActivatedRoute,
    private recomendacionSrv: RecommendationService,
    private courseSrv: CursoService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const cursoId = params.get('cursoId');
      const info = localStorage.getItem('info_alumno');
      if (info) {
        this.grupo = JSON.parse(info).grupo;
      }
      this.cursos$ = this.courseSrv.getCourses(this.grupo);
      if (cursoId) {
        this.cursos$.subscribe((cursos: any[]) => {
          const cursoActual = cursos.find((c) => c.id === Number(cursoId));
          if (cursoActual) {
            this.cursoNombre = cursoActual.nombre;
          }
        });
        this.units$ = this.recomendacionSrv.getUnits(cursoId);
        this.units$.subscribe((data: any) => {
          console.log('Unidades obtenidas:', data);
        });
      }
    });
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }
}
