import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Topic, Unit } from 'src/app/estudiantes/recomendacion/tipos.model';
import { Observable } from 'rxjs';
import { ContentService } from 'src/app/services/contenido.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

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
  showDeleteUnitModal = false;
  nombreNuevoTema: string = '';
  numeroNuevoTema: number = 0;
  descripcionNuevoTema: string = '';
  subtemasNuevoTema: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
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

  openDeleteUnit(): void {
    this.showDeleteUnitModal = true;
  }

  saveUnit(unit: Partial<Unit>): void {
    const isEditing = !!this.unitId;
    const request = isEditing
      ? this.contentService.updateUnit(this.unitId!, unit)
      : this.contentService.createUnit(unit);

    Swal.fire({
      title: 'Guardando...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    request.subscribe({
      next: () => {
        this.showUnitModal = false;

        if (isEditing && this.unitId) {
          this.unit$ = this.contentService.getUnitById(this.unitId);
        }
        this.contentService.notifyUnitsChanged();

        Swal.fire({
          title: isEditing ? '¡Unidad actualizada!' : '¡Unidad creada!',
          text: isEditing
            ? 'La unidad se ha actualizado correctamente.'
            : 'La nueva unidad se ha creado correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#6366f1',
          customClass: { container: 'my-swal' },
        });
      },
      error: (err) => {
        console.error('Error al guardar la unidad:', err);
        Swal.fire({
          title: 'Error',
          text: 'Ocurrió un error al guardar la unidad. Intenta de nuevo.',
          icon: 'error',
          confirmButtonColor: '#ef4444',
          customClass: { container: 'my-swal' },
        });
      },
    });
  }

  deleteUnit(): void {
    Swal.fire({
      title: '¿Eliminar unidad?',
      text: 'Esta acción no se puede deshacer. Se eliminará la unidad y todo su contenido.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6366f1',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: { container: 'my-swal' },
    }).then((result) => {
      if (result.isConfirmed) {
        this.showDeleteUnitModal = false;

        Swal.fire({
          title: 'Eliminando...',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        this.contentService.deleteUnit(this.unitId!).subscribe({
          next: () => {
            this.contentService.notifyUnitsChanged();
            Swal.fire({
              title: '¡Unidad eliminada!',
              text: 'La unidad se ha eliminado correctamente.',
              icon: 'success',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#6366f1',
              customClass: { container: 'my-swal' },
            }).then(() => {
              this.router.navigate(['../../'], { relativeTo: this.route });
            });
          },
          error: (err) => {
            console.error('Error al eliminar la unidad:', err);
            Swal.fire({
              title: 'Error',
              text: 'Ocurrió un error al eliminar la unidad. Intenta de nuevo.',
              icon: 'error',
              confirmButtonColor: '#ef4444',
              customClass: { container: 'my-swal' },
            });
          },
        });
      }
    });
  }

  saveTopic(topic: Partial<Topic>): void {
    if (topic.subtemas && typeof topic.subtemas === 'string') {
      const raw = topic.subtemas as unknown as string;
      const arr = raw
        .split(/\r?\n|,/)
        .map((s) => s.trim())
        .filter(Boolean);
      (topic as any).subtemas = arr;
    }

    topic.id_unidad = Number(this.unitId);

    Swal.fire({
      title: 'Guardando...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    this.contentService.createTopic({ ...topic }).subscribe({
      next: () => {
        this.showTopicModal = false;

        if (this.unitId) {
          this.unit$ = this.contentService.getUnitById(this.unitId);
        }
        this.contentService.notifyUnitsChanged();

        Swal.fire({
          title: '¡Tema creado!',
          text: 'El nuevo tema se ha creado correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#6366f1',
          customClass: { container: 'my-swal' },
        });
      },
      error: (err) => {
        console.error('Error al guardar tema:', err);
        Swal.fire({
          title: 'Error',
          text: 'Ocurrió un error al guardar el tema. Intenta de nuevo.',
          icon: 'error',
          confirmButtonColor: '#ef4444',
          customClass: { container: 'my-swal' },
        });
      },
    });
  }
}
