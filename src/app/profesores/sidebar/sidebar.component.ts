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
  templateUrl: './sidebar.component.html',
})
export class TeacherSidebarComponent implements OnDestroy {
  materiaId = '';
  units$: Observable<Unit[]> | undefined;
  openUnits: boolean[] = [];

  unitsSubscription: Subscription | undefined;
  unitsChangedSubscription: Subscription | undefined;

  constructor(
    private contenidoService: ContentService,
    private route: ActivatedRoute
  ) {
    // Suscribirse a cambios en la ruta
    this.route.paramMap.subscribe((params) => {
      const materiaId = params.get('cursoId');
      this.materiaId = materiaId ?? '';
      this.loadUnits();
    });

    // Suscribirse a cambios en las unidades desde cualquier componente
    this.unitsChangedSubscription = this.contenidoService.unitsChanged$.subscribe(() => {
      console.log('Sidebar: Recargando unidades por cambio detectado');
      this.loadUnits();
    });
  }

  private loadUnits(): void {
    // Cancelar suscripción anterior si existe
    this.unitsSubscription?.unsubscribe();

    // Cargar unidades
    this.units$ = this.contenidoService.getUnits(this.materiaId);

    // Suscribirse para mantener el estado de apertura
    this.unitsSubscription = this.units$.subscribe({
      next: (units) => {
        console.log('Sidebar: Unidades actualizadas', units.length);
        // Mantener todas las unidades abiertas por defecto
        this.openUnits = units.map(() => true);
      },
      error: (err) => {
        console.error('Sidebar: Error al cargar unidades', err);
        // Podrías emitir un evento o mostrar un mensaje de error aquí si lo deseas
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
