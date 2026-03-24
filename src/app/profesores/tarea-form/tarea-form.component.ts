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
import Swal from 'sweetalert2';

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
    private contentService: ContentService,
  ) {}

  estilosObjeto: any[] = [];

  topic$!: Observable<Topic | undefined>;
  objetos$!: Observable<any>;
  request$!: Observable<any>;
  showTopicModal = false;
  showObjectModal = false;
  showDeleteTopicModal = false;
  showDeleteResourceModal = false;
  selectedInputType: string = 'file';
  oaToDeleteId: string = '';
  fileInput: HTMLInputElement | null = null;
  file: File | null = null;
  isLoading = false;
  topicId?: string;
  unitId: string = '';
  oas: any;

  tiposOA = [
  { id: 1,  nombre: 'Simulación de laboratorio' },
  { id: 2,  nombre: 'Mapa conceptual interactivo' },
  { id: 3,  nombre: 'Video animado de proceso' },
  { id: 4,  nombre: 'Lectura guiada' },
  { id: 5,  nombre: 'Podcast de entrevista' },
  { id: 6,  nombre: 'Ejercicios auto-corregibles' },
  { id: 7,  nombre: 'Simulación abierta exploratoria' },
  { id: 8,  nombre: 'Tutorial paso a paso' },
  { id: 9,  nombre: 'Caso de estudio' },
  { id: 10, nombre: 'Infografía' },
  { id: 11, nombre: 'Foro de debate' },
  { id: 12, nombre: 'Ejemplo resuelto' },
  { id: 13, nombre: 'Proyecto integrador' },
  { id: 14, nombre: 'Diario de aprendizaje' },
  { id: 15, nombre: 'Animación de concepto abstracto' },
  { id: 16, nombre: 'Quiz diagnóstico' },
  { id: 17, nombre: 'Lectura teórica avanzada' },
  { id: 18, nombre: 'Video demostrativo' },
  { id: 19, nombre: 'Actividad de arrastrar y soltar' },
  { id: 20, nombre: 'Resumen ejecutivo' },
  { id: 21, nombre: 'Video comparativo' },
].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

  getResourceType(url: string): string {
    if (url.match(/youtube\.com|youtu\.be/)) return 'Video';
    if (url.match(/\.(mp4|webm|ogg)$/i)) return 'Video';
    if (url.match(/\.(jpg|jpeg|png|gif|svg)$/i)) return 'Imagen';
    if (url.match(/\.(pdf|doc|docx)$/i)) return 'Documento';
    return 'Recurso';
  }

  getEstiloTipo(oa: any): string {
    const tipo =
      oa.estiloObjeto?.tipo ||
      oa.objeto?.estiloObjeto?.tipo ||
      oa.objeto?.tipo ||
      oa.tipo ||
      'Recurso General';
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

    if (!this.topicId || !values.id_type || !values.nombre) {
      Swal.fire({
        title: 'Campos incompletos',
        text: 'Por favor completa todos los campos requeridos.',
        icon: 'warning',
        confirmButtonColor: '#6366f1',
        customClass: { container: 'my-swal' },
      });
      return;
    }

    if (this.file && this.selectedInputType === 'file') {
      const formData = new FormData();
      formData.append('id_tema', String(this.topicId));
      formData.append('id_type', String(values.id_type));
      formData.append('nombre', values.nombre);
      formData.append('descripcion', values.descripcion || '');
      formData.append('file', this.file, this.file.name);
      this.request$ = this.contentService.createLearningObjectWithFile(formData, this.file);
    } else if (this.selectedInputType === 'url' && values.url) {
      const objetoData = {
        id_tema: Number(this.topicId),
        id_type: Number(values.id_type),
        nombre: values.nombre,
        descripcion: values.descripcion || '',
        contenido: values.url,
      };
      this.request$ = this.contentService.createLearningObject(objetoData);
    } else {
      Swal.fire({
        title: 'Fuente requerida',
        text: 'Debes proporcionar un archivo o una URL.',
        icon: 'warning',
        confirmButtonColor: '#6366f1',
        customClass: { container: 'my-swal' },
      });
      return;
    }

    this.isLoading = true;

    Swal.fire({
      title: 'Guardando objeto...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    this.request$.subscribe({
      next: () => {
        this.isLoading = false;
        this.showObjectModal = false;
        this.file = null;
        this.selectedInputType = 'file';
        this.contentService.notifyUnitsChanged();
        this.recargarObjetos();

        Swal.fire({
          title: '¡Objeto creado!',
          text: 'El objeto de aprendizaje se ha guardado correctamente.',
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
          title: 'Error al guardar',
          text: err.error?.message || 'Algo salió mal. Intenta de nuevo.',
          icon: 'error',
          confirmButtonColor: '#ef4444',
          customClass: { container: 'my-swal' },
        });
      },
    });
  }

  saveTopic(topic: Partial<Topic>, topicForm: NgForm): void {
    if (topicForm.invalid) {
      Object.values(topicForm.controls).forEach((c: any) => c.markAsTouched());
      return;
    }

    if (topic.subtemas && typeof topic.subtemas === 'string') {
      const raw = topic.subtemas as unknown as string;
      const arr = raw
        .split(/\r?\n|,/)
        .map((s) => s.trim())
        .filter(Boolean);
      (topic as any).subtemas = arr;
    }

    topic.id_unidad = Number(this.unitId);

    const isEditing = !!this.topicId;
    const request = isEditing
      ? this.contentService.updateTopic(String(this.topicId), topic)
      : this.contentService.createTopic({ ...topic });

    Swal.fire({
      title: 'Guardando tema...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    request.subscribe({
      next: () => {
        this.showTopicModal = false;
        this.contentService.notifyUnitsChanged();

        // Recargar el tema para reflejar los cambios sin recargar la página
        if (this.unitId && this.topicId) {
          this.topic$ = this.servicioContenido.getTopicById(this.unitId, this.topicId);
        }

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

  deleteTopic(): void {
    Swal.fire({
      title: '¿Eliminar tema?',
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
        this.showDeleteTopicModal = false;

        Swal.fire({
          title: 'Eliminando...',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        this.contentService.deleteTopic(this.topicId!).subscribe({
          next: () => {
            this.contentService.notifyUnitsChanged();
            Swal.fire({
              title: '¡Tema eliminado!',
              text: 'El tema se ha eliminado correctamente.',
              icon: 'success',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#6366f1',
              customClass: { container: 'my-swal' },
            }).then(() => {
              this.router.navigate(['../../'], { relativeTo: this.route });
            });
          },
          error: (err) => {
            console.error('Error al eliminar el tema:', err);
            Swal.fire({
              title: 'Error',
              text: 'Ocurrió un error al eliminar el tema. Intenta de nuevo.',
              icon: 'error',
              confirmButtonColor: '#ef4444',
              customClass: { container: 'my-swal' },
            });
          },
        });
      }
    });
  }

  deleteResource(id: string): void {
    Swal.fire({
      title: '¿Eliminar recurso?',
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
        this.showDeleteResourceModal = false;

        Swal.fire({
          title: 'Eliminando...',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        this.contentService.deleteLearningObject(id).subscribe({
          next: () => {
            this.contentService.notifyUnitsChanged();
            this.recargarObjetos();
            Swal.fire({
              title: '¡Recurso eliminado!',
              text: 'El objeto de aprendizaje se ha eliminado correctamente.',
              icon: 'success',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#6366f1',
              customClass: { container: 'my-swal' },
            });
          },
          error: (err) => {
            console.error('Error al eliminar el recurso:', err);
            Swal.fire({
              title: 'Error',
              text: 'Ocurrió un error al eliminar el recurso. Intenta de nuevo.',
              icon: 'error',
              confirmButtonColor: '#ef4444',
              customClass: { container: 'my-swal' },
            });
          },
        });
      }
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
        this.topic$ = this.servicioContenido.getTopicById(this.unitId, this.topicId);
        this.objetos$ = this.servicioContenido.getObjetosAprendizaje(this.topicId);

        this.objetos$.subscribe((data) => {
          this.oas = data.map((item: any) => ({ objeto: item }));
        });
      }
    });

    this.contentService.getEstilosObjeto().subscribe({
      next: (data) => this.estilosObjeto = data,
      error: (err) => console.error('Error al cargar estilos:', err)
    });
  }

  formatearNombre(nombre: string): string {
    const minusculas = ['de', 'del', 'la', 'el', 'y', 'en'];
    return nombre
      .split('_')
      .map((p: string, i: number) =>
        i === 0 || !minusculas.includes(p)
          ? p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()
          : p.toLowerCase()
      )
      .join(' ');
  }

  recargarObjetos(): void {
    if (this.topicId) {
      this.objetos$ = this.servicioContenido.getObjetosAprendizaje(this.topicId);
      this.objetos$.subscribe((data) => {
        this.oas = data.map((item: any) => ({ objeto: item }));
      });
    }
  }
}
