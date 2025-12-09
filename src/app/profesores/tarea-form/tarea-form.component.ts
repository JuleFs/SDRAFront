import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Topic } from 'src/app/estudiantes/recomendacion/tipos.model';
import { Observable } from 'rxjs';
import { OaViewerComponent } from 'src/app/estudiantes/oa-viewer/oa-viewer.component';
import { ContentService } from 'src/app/services/contenido.service';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-topic-form',
  standalone: true,
  imports: [CommonModule, MatDialogModule, FormsModule],
  templateUrl: './tarea-form.component.html',
})
export class TopicFormComponent {
  constructor(
    private route: ActivatedRoute,
    private servicioContenido: ContentService,
    private dialog: MatDialog,
    private contentService: ContentService
  ) {}

  topic$!: Observable<Topic | undefined>;
  objetos$!: Observable<any>;
  showTopicModal = false;
  showObjectModal = false;
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

  saveObject(form: NgForm, fileInput: HTMLInputElement | null): void {
    const values = form.value || {};

    const formData = new FormData();

    formData.append('id_tema', this.topicId ?? '');
    formData.append('id_type', values.id_type ?? '');
    formData.append('nombre', values.nombre ?? '');
    formData.append('descripcion', values.descripcion ?? '');
    // formData.append('contenido', fileInput?.value ?? '');
    formData.append('file', this.file!);

    // adjuntar archivo si existe
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      formData.append('file', file, file.name);
      // formData.append('contenido', file, file.name);
    }

    formData.forEach((valor, clave) => {
      if (clave === 'file') {
        console.log('File name:', (valor as File).name);
      } else {
        console.log(`${clave}: ${valor}`);
      }
    });
    // decidir create / update según editingObject
    const request$ = this.contentService.createLearningObjectWithFile(
      formData,
      this.file!
    );

    this.isLoading = true;
    request$.subscribe({
      next: (res) => {
        this.isLoading = false;
        this.showObjectModal = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error al guardar objeto:', err);
      },
    });
  }

  saveTopic(topic: Partial<Topic>): void {
    topic.id_unidad = Number(this.unitId);
    console.log('Guardando tema:', topic);
    const request = this.topicId
      ? this.contentService.updateTopic(String(this.topicId), topic)
      : this.contentService.createTopic({ ...topic });

    request.subscribe({
      next: () => {
        this.showTopicModal = false;
      },
      error: (err) => console.error('Error al guardar tema:', err),
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

        this.objetos$.subscribe(data => {
          console.log('Datos de recomendación completos:', data);
          this.oas = data.map((item: any) => ({objeto: item}))
        });
      }
    });
  }
}
