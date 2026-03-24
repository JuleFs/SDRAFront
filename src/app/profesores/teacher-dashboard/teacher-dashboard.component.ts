import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { CursoService } from '../../services/curso.service';
import {
  Course,
  Resource,
  Topic,
  Unit,
} from '../../estudiantes/recomendacion/tipos.model';
import { ContentService } from 'src/app/services/contenido.service';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teacher-dashboard.component.html',
  styleUrls: ['./teacher-dashboard.component.css'],
})
export class TeacherDashboardComponent {
  selectedUnitId: string | null = null;
  oaType: 'video' | 'image' | 'document' | 'external' = 'external';
  curso!: Course | undefined;
  learningObjects: Resource[] = [];
  materiaId?: string;
  units$: Observable<Unit[]> | undefined;
  isLoading = false;

  // Control de modales
  showUnitModal = false;
  showTopicModal = false;
  showObjectModal = false;

  // Datos para edición
  editingUnit: Unit | null = null;
  editingTopic: Topic | null = null;
  editingObject: Resource | null = null;
  selectedTopicId: string | null = null;
  nombreNuevaUnidad: string = '';
  descripcionNuevaUnidad: string = '';
  numeroNuevaUnidad: number | null = null;
  fileInput: HTMLInputElement | null = null;
  file: File | null = null;

  constructor(
    private route: ActivatedRoute,
    private cursoService: CursoService,
    private contentService: ContentService
  ) {}

  ngOnInit(): void {
    this.loadUnits();
  }

  loadUnits(): void {
    this.isLoading = true;
    this.route.paramMap.subscribe((params) => {
      const materiaId = params.get('cursoId');
      this.materiaId = materiaId ?? '';
      if (this.materiaId) {
        this.units$ = this.contentService.getUnits(this.materiaId);
      }
      this.units$?.subscribe((data: Unit[]) => {
        console.log('Unidades cargadas:', data);
      });
    });
  }

  // UNIDADES
  openCreateUnit(): void {
    this.editingUnit = null;
    this.showUnitModal = true;
  }

  openEditUnit(unit: Unit): void {
    this.editingUnit = unit;
    this.showUnitModal = true;
  }

  cancelarNuevaUnidad(form: any): void {
    this.nombreNuevaUnidad = '';
    this.descripcionNuevaUnidad = '';
    this.numeroNuevaUnidad = null;
    form.resetForm();
  }

  saveUnit(unit: Partial<Unit>): void {
    const isEditing = !!this.editingUnit?.id;
    unit.id_materia = this.materiaId;
    const request = isEditing
      ? this.contentService.updateUnit(this.editingUnit!.id, unit)
      : this.contentService.createUnit(unit);

    Swal.fire({
      title: isEditing ? 'Actualizando unidad...' : 'Creando unidad...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    request.subscribe({
      next: () => {
        this.showUnitModal = false;
        this.loadUnits();
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
        console.error('Error al guardar unidad:', err);
        this.showUnitModal = false;
        Swal.fire({
          title: 'Error',
          text: isEditing
            ? 'Error al actualizar la unidad. Por favor, intenta de nuevo.'
            : 'Error al crear la unidad. Por favor, intenta de nuevo.',
          icon: 'error',
          confirmButtonColor: '#ef4444',
          customClass: { container: 'my-swal' },
        });
      },
    });
  }

  deleteUnit(id: string): void {
    Swal.fire({
      title: '¿Eliminar esta unidad?',
      text: 'Se eliminará la unidad y todo su contenido. Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6366f1',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: { container: 'my-swal' },
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Eliminando...',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        this.contentService.deleteUnit(id).subscribe({
          next: () => {
            this.loadUnits();
            this.contentService.notifyUnitsChanged();
            Swal.fire({
              title: '¡Unidad eliminada!',
              text: 'La unidad se ha eliminado correctamente.',
              icon: 'success',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#6366f1',
              customClass: { container: 'my-swal' },
            });
          },
          error: (err) => {
            console.error('Error al eliminar:', err);
            Swal.fire({
              title: 'Error',
              text: 'Error al eliminar la unidad. Por favor, intenta de nuevo.',
              icon: 'error',
              confirmButtonColor: '#ef4444',
              customClass: { container: 'my-swal' },
            });
          },
        });
      }
    });
  }

  // TEMAS
  openCreateTopic(unitId: string): void {
    this.selectedUnitId = unitId;
    this.editingTopic = null;
    this.showTopicModal = true;
  }

  openEditTopic(topic: Topic): void {
    this.editingTopic = topic;
    this.showTopicModal = true;
  }

  saveTopic(topic: Partial<Topic>): void {
    const isEditing = !!this.editingTopic?.id;
    const request = isEditing
      ? this.contentService.updateTopic(String(this.editingTopic!.id), topic)
      : this.contentService.createTopic({ ...topic });

    Swal.fire({
      title: isEditing ? 'Actualizando tema...' : 'Creando tema...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    request.subscribe({
      next: () => {
        this.showTopicModal = false;
        this.loadUnits();
        this.contentService.notifyUnitsChanged();

        Swal.fire({
          title: isEditing ? '¡Tema actualizado!' : '¡Tema creado!',
          text: isEditing
            ? 'El tema se ha actualizado correctamente.'
            : 'El nuevo tema se ha creado correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#6366f1',
          customClass: { container: 'my-swal' },
        });
      },
      error: (err) => {
        console.error('Error al guardar tema:', err);
        this.showTopicModal = false;
        Swal.fire({
          title: 'Error',
          text: isEditing
            ? 'Error al actualizar el tema. Por favor, intenta de nuevo.'
            : 'Error al crear el tema. Por favor, intenta de nuevo.',
          icon: 'error',
          confirmButtonColor: '#ef4444',
          customClass: { container: 'my-swal' },
        });
      },
    });
  }

  deleteTopic(id: string): void {
    Swal.fire({
      title: '¿Eliminar este tema?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6366f1',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: { container: 'my-swal' },
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Eliminando...',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        this.contentService.deleteTopic(id).subscribe({
          next: () => {
            this.loadUnits();
            this.contentService.notifyUnitsChanged();
            Swal.fire({
              title: '¡Tema eliminado!',
              text: 'El tema se ha eliminado correctamente.',
              icon: 'success',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#6366f1',
              customClass: { container: 'my-swal' },
            });
          },
          error: (err) => {
            console.error('Error:', err);
            Swal.fire({
              title: 'Error',
              text: 'Error al eliminar el tema. Por favor, intenta de nuevo.',
              icon: 'error',
              confirmButtonColor: '#ef4444',
              customClass: { container: 'my-swal' },
            });
          },
        });
      }
    });
  }

  // OBJETOS DE APRENDIZAJE
  openCreateObject(topicId: string): void {
    this.selectedTopicId = topicId;
    this.editingObject = null;
    this.showObjectModal = true;
  }

  openEditObject(obj: Resource): void {
    this.editingObject = obj;
    this.showObjectModal = true;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.file = input.files[0];
    }
  }

  saveObject(form: NgForm, fileInput: HTMLInputElement | null): void {
    const values = form.value || {};

    if (!values.id_tema || !values.id_type || !values.nombre || !this.file) {
      Swal.fire({
        title: 'Campos incompletos',
        text: 'Por favor completa todos los campos requeridos.',
        icon: 'warning',
        confirmButtonColor: '#6366f1',
        customClass: { container: 'my-swal' },
      });
      return;
    }

    const formData = new FormData();
    formData.append('id_tema', String(values.id_tema));
    formData.append('id_type', String(values.id_type));
    formData.append('nombre', values.nombre);
    formData.append('descripcion', values.descripcion || '');
    formData.append('file', this.file, this.file.name);

    const isEditing = !!this.editingObject?.id;
    const request$ = isEditing
      ? this.contentService.updateLearningObject(String(this.editingObject!.id), formData)
      : this.contentService.createLearningObjectWithFile(formData, this.file);

    this.isLoading = true;

    Swal.fire({
      title: isEditing ? 'Actualizando objeto...' : 'Creando objeto...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    request$.subscribe({
      next: () => {
        this.isLoading = false;
        this.showObjectModal = false;
        this.loadUnits();

        Swal.fire({
          title: isEditing ? '¡Objeto actualizado!' : '¡Objeto creado!',
          text: isEditing
            ? 'El objeto de aprendizaje se ha actualizado correctamente.'
            : 'El nuevo objeto de aprendizaje se ha creado correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#6366f1',
          customClass: { container: 'my-swal' },
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.showObjectModal = false;
        console.error('Error completo:', err);
        Swal.fire({
          title: 'Error',
          text: isEditing
            ? `Error al actualizar el objeto: ${err.error?.message || err.message}`
            : `Error al crear el objeto: ${err.error?.message || err.message}`,
          icon: 'error',
          confirmButtonColor: '#ef4444',
          customClass: { container: 'my-swal' },
        });
      },
    });
  }

  deleteObject(id: string): void {
    Swal.fire({
      title: '¿Eliminar este objeto?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6366f1',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: { container: 'my-swal' },
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Eliminando...',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        this.contentService.deleteLearningObject(id).subscribe({
          next: () => {
            this.loadUnits();
            Swal.fire({
              title: '¡Objeto eliminado!',
              text: 'El objeto de aprendizaje se ha eliminado correctamente.',
              icon: 'success',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#6366f1',
              customClass: { container: 'my-swal' },
            });
          },
          error: (err) => {
            console.error('Error:', err);
            Swal.fire({
              title: 'Error',
              text: 'Error al eliminar el objeto. Por favor, intenta de nuevo.',
              icon: 'error',
              confirmButtonColor: '#ef4444',
              customClass: { container: 'my-swal' },
            });
          },
        });
      }
    });
  }
}
