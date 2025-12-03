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
export class TeacherSidebarComponent {
  materiaId = '';
  units$: Observable<Unit[]> | undefined;
  openUnits: boolean[] = [];
  
  unitsSubscription: Subscription | undefined;

  constructor(private contenidoService: ContentService, private route: ActivatedRoute) {
    this.route.paramMap.subscribe((params) => {
      this.unitsSubscription?.unsubscribe();

      const materiaId = params.get('cursoId');
      this.materiaId = materiaId ?? '';
      this.units$ = this.contenidoService.getUnits(this.materiaId);

      this.unitsSubscription = this.units$.subscribe((units) => {
        this.openUnits = units.map(() => true);
      });
    });
  }

  ngOnDestroy(): void {
    this.unitsSubscription?.unsubscribe();
  }

  toggleUnit(index: number, event: Event) {
    event.preventDefault();
    this.openUnits[index] = !this.openUnits[index];
  }
  
}
