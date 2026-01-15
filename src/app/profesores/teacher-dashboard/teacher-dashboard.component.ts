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
  showSuccessModal = false;
  showErrorModal = false;
  successMessage = '';
  errorMessage = '';

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
      console.log('Materia ID:', this.materiaId);
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

  saveUnit(unit: Partial<Unit>): void {
    const isEditing = !!this.editingUnit?.id;
    unit.id_materia = this.materiaId;
    const request = isEditing
      ? this.contentService.updateUnit(this.editingUnit!.id, unit)
      : this.contentService.createUnit(unit);

    console.log('Guardando unidad:', unit);

    request.subscribe({
      next: () => {
        console.log('Unidad guardada exitosamente');
        this.showUnitModal = false;
        this.successMessage = isEditing
          ? 'Unidad actualizada exitosamente'
          : 'Unidad creada exitosamente';
        this.showSuccessModal = true;
        console.log('showSuccessModal:', this.showSuccessModal);
        console.log('successMessage:', this.successMessage);

        this.loadUnits();
        this.contentService.notifyUnitsChanged();
      },
      error: (err) => {
        console.error('Error al guardar unidad:', err);
        this.showUnitModal = false;
        this.errorMessage = isEditing
          ? 'Error al actualizar la unidad. Por favor, intenta de nuevo.'
          : 'Error al crear la unidad. Por favor, intenta de nuevo.';
        this.showErrorModal = true;
      },
    });
  }

  deleteUnit(id: string): void {
    if (confirm('¿Eliminar esta unidad y todo su contenido?')) {
      this.contentService.deleteUnit(id).subscribe({
        next: () => {
          this.successMessage = 'Unidad eliminada exitosamente';
          this.showSuccessModal = true;
          this.loadUnits();
          this.contentService.notifyUnitsChanged();
        },
        error: (err) => {
          console.error('Error al eliminar:', err);
          this.errorMessage = 'Error al eliminar la unidad. Por favor, intenta de nuevo.';
          this.showErrorModal = true;
        },
      });
    }
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

    request.subscribe({
      next: () => {
        this.showTopicModal = false;
        this.successMessage = isEditing
          ? 'Tema actualizado exitosamente'
          : 'Tema creado exitosamente';
        this.showSuccessModal = true;

        this.loadUnits();
        this.contentService.notifyUnitsChanged();
      },
      error: (err) => {
        console.error('Error al guardar tema:', err);
        this.showTopicModal = false;
        this.errorMessage = isEditing
          ? 'Error al actualizar el tema. Por favor, intenta de nuevo.'
          : 'Error al crear el tema. Por favor, intenta de nuevo.';
        this.showErrorModal = true;
      },
    });
  }

  deleteTopic(id: string): void {
    if (confirm('¿Eliminar este tema?')) {
      this.contentService.deleteTopic(id).subscribe({
        next: () => {
          this.successMessage = 'Tema eliminado exitosamente';
          this.showSuccessModal = true;
          this.loadUnits();
          this.contentService.notifyUnitsChanged();
        },
        error: (err) => {
          console.error('Error:', err);
          this.errorMessage = 'Error al eliminar el tema. Por favor, intenta de nuevo.';
          this.showErrorModal = true;
        },
      });
    }
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

  //Validar que tenemos todos los datos necesarios
  if (!values.id_tema || !values.id_type || !values.nombre || !this.file) {
    console.error('Faltan datos requeridos:', {
      id_tema: values.id_tema,
      id_type: values.id_type,
      nombre: values.nombre,
      file: this.file
    });
    this.errorMessage = 'Por favor completa todos los campos requeridos';
    this.showErrorModal = true;
    return;
  }

  const formData = new FormData();

  //Convertir a números/strings explícitamente
  formData.append('id_tema', String(values.id_tema));
  formData.append('id_type', String(values.id_type));
  formData.append('nombre', values.nombre);
  formData.append('descripcion', values.descripcion || '');

  //Agregar el archivo UNA SOLA VEZ
  formData.append('file', this.file, this.file.name);

  // Debug: Ver qué se está enviando
  console.log('Datos a enviar:');
  formData.forEach((valor, clave) => {
    if (clave === 'file') {
      console.log(`${clave}:`, (valor as File).name, (valor as File).type, (valor as File).size);
    } else {
      console.log(`${clave}: ${valor}`);
    }
  });

  const isEditing = !!this.editingObject?.id;
  const request$ = isEditing
    ? this.contentService.updateLearningObject(
        String(this.editingObject!.id),
        formData
      )
    : this.contentService.createLearningObjectWithFile(formData, this.file);

  this.isLoading = true;
  request$.subscribe({
    next: (res) => {
      this.isLoading = false;
      this.showObjectModal = false;
      this.successMessage = isEditing
        ? 'Objeto actualizado exitosamente'
        : 'Objeto creado exitosamente';
      this.showSuccessModal = true;

      this.loadUnits();
    },
    error: (err) => {
      this.isLoading = false;
      this.showObjectModal = false;
      console.error('Error completo:', err);
      console.error('Error status:', err.status);
      console.error('Error body:', err.error);

      //Mostrar error específico
      this.errorMessage = isEditing
        ? `Error al actualizar el objeto: ${err.error?.message || err.message}`
        : `Error al crear el objeto: ${err.error?.message || err.message}`;
      this.showErrorModal = true;
    },
  });
}

  deleteObject(id: string): void {
    if (confirm('¿Eliminar este objeto?')) {
      this.contentService.deleteLearningObject(id).subscribe({
        next: () => {
          this.successMessage = 'Objeto eliminado exitosamente';
          this.showSuccessModal = true;
          this.loadUnits();
        },
        error: (err) => {
          console.error('Error:', err);
          this.errorMessage = 'Error al eliminar el objeto. Por favor, intenta de nuevo.';
          this.showErrorModal = true;
        },
      });
    }
  }

  closeSuccessModal(): void {
    console.log('Cerrando modal de éxito');
    this.showSuccessModal = false;
  }

  closeErrorModal(): void {
    console.log('Cerrando modal de error');
    this.showErrorModal = false;
  }
}
