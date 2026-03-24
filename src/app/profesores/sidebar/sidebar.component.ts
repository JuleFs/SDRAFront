import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Unit } from '../../estudiantes/recomendacion/tipos.model';
import { ContentService } from 'src/app/services/contenido.service';
import { Observable, Subscription } from 'rxjs';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-teacher-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Botón hamburguesa flotante cuando está colapsado -->
    <button
      *ngIf="!isOpen"
      (click)="toggleSidebar()"
      class="fixed top-20 left-0 z-50 flex items-center justify-center w-10 h-10 bg-primary text-white rounded-r-xl shadow-lg hover:bg-primary-focus transition-all duration-200 hover:w-12"
      title="Abrir menú"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>

    <nav
      class="flex flex-col h-full bg-base-100 transition-all duration-300 ease-in-out overflow-hidden"
      [class.w-72]="isOpen"
      [class.w-0]="!isOpen"
    >
      <!-- Header -->
      <div class="my-2 flex items-center justify-between px-3 min-w-72">
        <div class="flex items-center gap-2">
          <div
            class="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-primary to-secondary rounded-xl text-white shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h3 class="font-semibold text-sm text-base-content whitespace-nowrap">Contenido del curso</h3>
        </div>

        <!-- Botón cerrar -->
        <button
          (click)="toggleSidebar()"
          class="btn btn-ghost btn-sm btn-circle shrink-0"
          title="Cerrar menú"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7M18 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div class="p-2 border-b border-base-300 text-center min-w-72">
        <a [routerLink]="['/profesor/curso', materiaId]">
          <button class="btn btn-primary w-full">+ Nueva Unidad</button>
        </a>
      </div>

      <!-- Units List -->
      <div class="flex-1 overflow-y-auto p-3 min-w-72">
        <ul class="menu menu-sm gap-2">
          <li *ngFor="let unit of units$ | async; let i = index">
            <details [attr.open]="openUnits[i] ? true : null">
              <summary
                class="font-medium bg-base-200 hover:bg-base-300"
                (click)="toggleUnit(i, $event)"
              >
                <span class="badge badge-primary badge-sm">{{ i + 1 }}</span>
                <a
                  [routerLink]="['unidad', unit.id]"
                  class="flex-1 truncate"
                  (click)="$event.stopPropagation()"
                >
                  {{ unit.nombre }}
                </a>
              </summary>

              <ul class="mt-1">
                <li *ngFor="let topic of unit.temas">
                  <a
                    [routerLink]="['unidad', unit.id, 'tema', topic.id]"
                    routerLinkActive="active"
                    class="text-sm"
                  >
                    <span class="w-1.5 h-1.5 bg-base-300 rounded-full"></span>
                    {{ topic.nombre }}
                  </a>
                </li>
              </ul>
            </details>
          </li>
        </ul>
      </div>
    </nav>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
      position: relative;
    }
  `],
})
export class TeacherSidebarComponent implements OnDestroy {
  materiaId = '';
  units$: Observable<Unit[]> | undefined;
  openUnits: boolean[] = [];
  isOpen: boolean = true;

  unitsSubscription: Subscription | undefined;
  unitsChangedSubscription: Subscription | undefined;

  constructor(
    private contenidoService: ContentService,
    private route: ActivatedRoute
  ) {
    this.route.paramMap.subscribe((params) => {
      const materiaId = params.get('cursoId');
      this.materiaId = materiaId ?? '';
      this.loadUnits();
    });

    this.unitsChangedSubscription = this.contenidoService.unitsChanged$.subscribe(() => {
      this.loadUnits();
    });
  }

  toggleSidebar() {
    this.isOpen = !this.isOpen;
  }

  private loadUnits(): void {
    this.unitsSubscription?.unsubscribe();
    this.units$ = this.contenidoService.getUnits(this.materiaId);

    this.unitsSubscription = this.units$.subscribe({
      next: (units) => {
        this.openUnits = units.map(() => true);
      },
      error: (err) => {
        console.error('Sidebar: Error al cargar unidades', err);
      }
    });
  }

  ngOnDestroy(): void {
    this.unitsSubscription?.unsubscribe();
    this.unitsChangedSubscription?.unsubscribe();
  }

  toggleUnit(index: number, event: Event) {
    event.preventDefault();
    this.openUnits[index] = !this.openUnits[index];
  }
}
