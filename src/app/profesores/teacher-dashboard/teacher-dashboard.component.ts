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

  // Datos para edición
  editingUnit: Unit | null = null;
  editingTopic: Topic | null = null;
  editingObject: Resource | null = null;
  selectedTopicId: string | null = null;
  nombreNuevaUnidad: string = '';
  descripcionNuevaUnidad: string = '';
  numeroNuevaUnidad: number | null = null;
  fileInput: HTMLInputElement | null = null;

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
        // this.contentService.getUnits('3').subscribe({
        //   next: (units) => {
        //     this.units = units;
        //     this.isLoading = false;
        //   },
        //   error: (err) => {
        //     console.error('Error al cargar curso:', err);
        //     this.isLoading = false;
        //   },
        // });
      }
      this.units$?.subscribe((data: Unit[]) => {
        console.log('Unidades cargadas:', data);
      });
    });
    this.contentService.getObjetosAprendizaje().subscribe({
      next: (oas) => {
        this.learningObjects = oas;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar objetos de aprendizaje:', err);
        this.isLoading = false;
      },
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
    unit.id_materia = this.materiaId;
    const request = this.editingUnit?.id
      ? this.contentService.updateUnit(this.editingUnit.id, unit)
      : this.contentService.createUnit(unit);
    console.log('Guardando unidad:', unit);

    request.subscribe({
      next: () => {
        this.showUnitModal = false;
        this.loadUnits();
      },
      error: (err) => console.error('Error al guardar unidad:', err),
    });
  }

  deleteUnit(id: string): void {
    if (confirm('¿Eliminar esta unidad y todo su contenido?')) {
      this.contentService.deleteUnit(id).subscribe({
        next: () => this.loadUnits(),
        error: (err) => console.error('Error al eliminar:', err),
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
    const request = this.editingTopic?.id
      ? this.contentService.updateTopic(String(this.editingTopic.id), topic)
      : this.contentService.createTopic({ ...topic });

    request.subscribe({
      next: () => {
        this.showTopicModal = false;
        this.loadUnits();
      },
      error: (err) => console.error('Error al guardar tema:', err),
    });
  }

  deleteTopic(id: string): void {
    if (confirm('¿Eliminar este tema?')) {
      this.contentService.deleteTopic(id).subscribe({
        next: () => this.loadUnits(),
        error: (err) => console.error('Error:', err),
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

  saveObject(form: NgForm, fileInput: HTMLInputElement | null): void {
    const values = form.value || {};

    const formData = new FormData();
    // id_tema (viene del hidden o de selectedTopicId)
    const idTema = 1;
    formData.append('id_tema', idTema.toString());

    formData.append('nombre', values.nombre ?? '');
    formData.append('descripcion', values.descripcion ?? '');
    formData.append('id_type', values.id_type ?? '');
    formData.append('contenido', fileInput?.value ?? '');

    // adjuntar archivo si existe
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      formData.append('contenido', file, file.name);
    }

    formData.forEach((valor, clave) => {
      console.log(`${clave}: ${valor}`);
    });
    // decidir create / update según editingObject
    const request$ = this.editingObject?.id
      ? this.contentService.updateLearningObject(
          String(this.editingObject.id),
          formData
        )
      : this.contentService.createLearningObjectWithFile(formData, fileInput!.files![0]);

    this.isLoading = true;
    request$.subscribe({
      next: (res) => {
        this.isLoading = false;
        this.showObjectModal = false;
        // refrescar lista de unidades/temas
        this.loadUnits();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error al guardar objeto:', err);
      },
    });
  }

  deleteObject(id: string): void {
    if (confirm('¿Eliminar este objeto?')) {
      this.contentService.deleteLearningObject(id).subscribe({
        next: () => this.loadUnits(),
        error: (err) => console.error('Error:', err),
      });
    }
  }
}
