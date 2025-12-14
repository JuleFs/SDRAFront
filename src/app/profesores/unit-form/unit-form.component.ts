import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Topic, Unit } from 'src/app/estudiantes/recomendacion/tipos.model';
import { Observable } from 'rxjs';
import { ContentService } from 'src/app/services/contenido.service';

@Component({
  selector: 'app-unit-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './unit-form.component.html',
})
export class UnitFormComponent {
  unitId?: string;
  unit$!: Observable<Unit>;
  topics: any[] = [];
  showUnitModal = false;
  showTopicModal = false;
  nombreNuevoTema: string = '';
  numeroNuevoTema: number = 0;
  descripcionNuevoTema: string = '';
  subtemasNuevoTema: string = '';

  constructor(
    private route: ActivatedRoute,
    private contentService: ContentService
  ) {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.unitId = id ?? undefined;
      if (this.unitId) {
        this.unit$ = this.contentService.getUnitById(this.unitId);
      }
    });
  }

  openCreateUnit(): void {
    this.showUnitModal = true;
  }

  openCreateTopic(): void {
    this.showTopicModal = true;
  }

  saveUnit(unit: Partial<Unit>): void {
    const request = this.unitId
      ? this.contentService.updateUnit(this.unitId, unit)
      : this.contentService.createUnit(unit);
    console.log('Guardando unidad:', unit);

    request.subscribe({
      next: () => {
        this.showTopicModal = false;
      },
      error: (err) => console.error('Error al guardar la unidad:', err),
    });
  }

  saveTopic(topic: Partial<Topic>): void {
    // convertir subtemas (string) a array de strings si viene como texto
    if (topic.subtemas && typeof topic.subtemas === 'string') {
      const raw = topic.subtemas as unknown as string;
      const arr = raw
        .split(/\r?\n|,/) // separar por saltos de línea o comas
        .map((s) => s.trim()) // quitar espacios
        .filter(Boolean); // eliminar entradas vacías
      (topic as any).subtemas = arr;
    }

    topic.id_unidad = Number(this.unitId);
    const request = this.contentService.createTopic({ ...topic });

    console.log('Guardando tema:', topic);

    request.subscribe({
      next: () => {
        this.showTopicModal = false;
      },
      error: (err) => console.error('Error al guardar tema:', err),
    });
  }
}
