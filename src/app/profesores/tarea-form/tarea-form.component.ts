import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Topic } from 'src/app/estudiantes/recomendacion/tipos.model';
import { Observable } from 'rxjs';
import { OaViewerComponent } from 'src/app/estudiantes/oa-viewer/oa-viewer.component';
import { ContentService } from 'src/app/services/contenido.service';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';

interface Subtema {
  titulo: string;
}

@Component({
  selector: 'app-topic-form',
  standalone: true,
  imports: [CommonModule, MatDialogModule, FormsModule],
  templateUrl: './tarea-form.component.html',
})
export class TopicFormComponent {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private servicioContenido: ContentService,
    private dialog: MatDialog,
    private contentService: ContentService
  ) {}

  topic$!: Observable<Topic | undefined>;
  objetos$!: Observable<any>;
  showSuccessModal = false;
  successMessage = '';
  showTopicModal = false;
  showObjectModal = false;
  showDeleteTopicModal = false;
  showDeleteResourceModal = false;
  oaToDeleteId: string = '';
  fileInput: HTMLInputElement | null = null;
  file: File | null = null;
  isLoading = false;
  topicId?: string;
  unitId: string = '';
  oas: any;

  getResourceType(url: string): string {
    if (url.match(/youtube\.com|youtu\.be/)) return 'Video';
    if (url.match(/\.(mp4|webm|ogg)$/i)) return 'Video';
    if (url.match(/\.(jpg|jpeg|png|gif|svg)$/i)) return 'Imagen';
    if (url.match(/\.(pdf|doc|docx)$/i)) return 'Documento';
    return 'Recurso';
  }

  getEstiloTipo(oa: any): string {
    console.log('Objeto completo recibido:', oa);
    console.log('oa.objeto:', oa.objeto);
    console.log('oa.estiloObjeto:', oa.estiloObjeto);
    console.log('oa.objeto?.estiloObjeto:', oa.objeto?.estiloObjeto);

    // Intentar múltiples rutas posibles
    const tipo =
      oa.estiloObjeto?.tipo ||
      oa.objeto?.estiloObjeto?.tipo ||
      oa.objeto?.tipo ||
      oa.tipo ||
      'Recurso General';

    console.log('✅ Tipo final:', tipo);
    return tipo;
  }

  openEditTopic(): void {
    this.showTopicModal = true;
  }

  openCreateOa(): void {
    this.showObjectModal = true;
  }

  openDeleteTopic(): void {
    this.showDeleteTopicModal = true;
  }

  openDeleteResource(id: string): void {
    this.oaToDeleteId = id;
    this.showDeleteResourceModal = true;
  }

  saveObject(form: NgForm, fileInput: HTMLInputElement | null): void {
  const values = form.value || {};

  //Validar que tenemos todos los datos necesarios
  if (!this.topicId || !values.id_type || !values.nombre || !this.file) {
    console.error('Faltan datos requeridos:', {
      topicId: this.topicId,
      id_type: values.id_type,
      nombre: values.nombre,
      file: this.file
    });
    alert('Por favor completa todos los campos requeridos');
    return;
  }

  const formData = new FormData();

  //Convertir a números explícitamente
  formData.append('id_tema', String(this.topicId));
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

  // decidir create / update según editingObject
  const request$ = this.contentService.createLearningObjectWithFile(
    formData,
    this.file
  );

  this.isLoading = true;
  request$.subscribe({
    next: () => {
      this.isLoading = false;
      this.showObjectModal = false;
      this.successMessage = 'Recurso creado exitosamente';
      this.showSuccessModal = true;
      this.contentService.notifyUnitsChanged();
      this.router.navigate(['../../'], { relativeTo: this.route });
    },
    error: (err) => {
      this.isLoading = false;
      this.showObjectModal = false;
      console.error('Error completo:', err);
      console.error('Error status:', err.status);
      console.error('Error body:', err.error);
      alert(`Error al guardar: ${err.error?.message || err.message}`);
    },
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
    console.log('Guardando tema:', topic);
    const request = this.topicId
      ? this.contentService.updateTopic(String(this.topicId), topic)
      : this.contentService.createTopic({ ...topic });

    request.subscribe({
      next: () => {
        this.showTopicModal = false;
        this.successMessage = this.topicId
          ? 'Tema actualizado exitosamente'
          : 'Tema creado exitosamente';
        this.showSuccessModal = true;
        this.contentService.notifyUnitsChanged();
      },
      error: (err) => console.error('Error al guardar tema:', err),
    });
  }

  deleteTopic(): void {
    const request = this.contentService.deleteTopic(this.topicId!);

    request.subscribe({
      next: () => {
        this.showDeleteTopicModal = false;
        this.successMessage = 'Tema eliminado exitosamente';
        this.showSuccessModal = true;
        this.contentService.notifyUnitsChanged();
        this.router.navigate(['../../'], { relativeTo: this.route });
      },
      error: (err) => console.error('Error al eliminar el tema:', err),
    });
  }

  deleteResource(id: string): void {
    const request = this.contentService.deleteLearningObject(id);

    request.subscribe({
      next: () => {
        this.showDeleteResourceModal = false;
        this.successMessage = 'Recurso eliminado exitosamente';
        this.showSuccessModal = true;
        this.contentService.notifyUnitsChanged();
        this.router.navigate(['../../'], { relativeTo: this.route });
      },
      error: (err) => console.error('Error al eliminar el recurso:', err),
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.file = input.files[0];
    }
  }

  openResource(oa: any): void {
    this.dialog.open(OaViewerComponent, {
      data: oa,
      width: '80%',
      maxWidth: '900px',
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.unitId = params.get('id') || '';
      this.topicId = params.get('temaId') || '';
      const info_profesor = localStorage.getItem('info_profesor');

      if (info_profesor) {
        console.log('Unit ID:', this.unitId, 'Topic ID:', this.topicId);

        this.topic$ = this.servicioContenido.getTopicById(
          this.unitId,
          this.topicId
        );
        this.objetos$ = this.servicioContenido.getObjetosAprendizaje(
          this.topicId
        );

        this.objetos$.subscribe((data) => {
          console.log('Datos de recomendación completos:', data);
          this.oas = data.map((item: any) => ({ objeto: item }));
        });
      }
    });
  }

  closeSuccessModal(): void {
    console.log('Cerrando modal de éxito');
    this.showSuccessModal = false;
  }
}
