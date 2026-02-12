import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Resource } from '../recomendacion/tipos.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-oa-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col h-full p-6 bg-base-100">
      <!-- Header -->
      <div class="mb-4">
        <h3 class="text-xl font-bold text-base-content">{{ data.objeto.nombre }}</h3>
        <p class="text-sm text-base-content/60 mt-1">{{ data.objeto.descripcion }}</p>
        <div class="badge badge-sm mt-2" [ngClass]="getBadgeClass()">{{ getTypeLabel() }}</div>
      </div>

      <!-- Content -->
      <div class="flex-1 flex items-center justify-center bg-base-200 rounded-lg overflow-hidden min-h-96">
        <ng-container [ngSwitch]="displayType">
          <!-- Video directo (mp4, webm, etc) -->
          <video
            *ngSwitchCase="'video'"
            [src]="data.objeto.contenido"
            controls
            class="max-w-full max-h-full rounded-lg"
            controlsList="nodownload">
          </video>

          <!-- Image -->
          <img
            *ngSwitchCase="'image'"
            [src]="data.objeto.contenido"
            alt="Recurso de aprendizaje"
            class="max-w-full max-h-full object-contain rounded-lg"
            (error)="onImageError($event)"
          />

          <!-- PDF -->
          <iframe
            *ngSwitchCase="'pdf'"
            [src]="safeUrl"
            class="w-full h-full min-h-96 rounded-lg border-0">
          </iframe>

          <!-- YouTube -->
          <iframe
            *ngSwitchCase="'youtube'"
            [src]="safeUrl"
            class="w-full h-full min-h-96 rounded-lg border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
          </iframe>

          <!-- Vimeo -->
          <iframe
            *ngSwitchCase="'vimeo'"
            [src]="safeUrl"
            class="w-full h-full min-h-96 rounded-lg border-0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowfullscreen>
          </iframe>

          <!-- Google Drive -->
          <iframe
            *ngSwitchCase="'gdrive'"
            [src]="safeUrl"
            class="w-full h-full min-h-96 rounded-lg border-0"
            allowfullscreen>
          </iframe>

          <!-- Document (Office, etc) -->
          <iframe
            *ngSwitchCase="'document'"
            [src]="safeUrl"
            class="w-full h-full min-h-96 rounded-lg border-0"
            allowfullscreen>
          </iframe>

          <!-- Audio -->
          <div *ngSwitchCase="'audio'" class="text-center p-8 w-full">
            <div class="text-6xl mb-6">🎵</div>
            <p class="text-base-content/70 mb-4">{{ data.objeto.nombre }}</p>
            <audio
              [src]="data.objeto.contenido"
              controls
              class="w-full max-w-md mx-auto">
            </audio>
          </div>

          <!-- External Link (generic iframe) -->
          <iframe
            *ngSwitchCase="'external'"
            [src]="safeUrl"
            class="w-full h-full min-h-96 rounded-lg border-0"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            allowfullscreen>
          </iframe>

          <!-- Unknown/Fallback -->
          <div *ngSwitchDefault class="text-center p-8">
            <div class="text-6xl mb-4">🔗</div>
            <p class="text-base-content/70 mb-4">Vista previa no disponible para este tipo de recurso</p>
            <a
              [href]="data.objeto.contenido"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-primary">
              Abrir recurso
            </a>
          </div>
        </ng-container>
      </div>

      <!-- Actions -->
<div class="flex justify-end gap-3 mt-4 pt-4 border-t border-base-300">
  <button
    (click)="openInNewTab()"
    class="btn btn-outline btn-secondary btn-sm gap-2">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
    Abrir en nueva pestaña
  </button>

  <button
    *ngIf="canDownload"
    class="btn btn-outline btn-primary btn-sm gap-2"
    (click)="downloadFile()">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
    Descargar
  </button>

  <button class="btn btn-error btn-sm" (click)="close()">
    Cerrar
  </button>
</div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 80vh;
      max-height: 700px;
    }
  `]
})
export class OaViewerComponent implements OnInit {
  safeUrl!: SafeResourceUrl;
  displayType: 'video' | 'image' | 'document' | 'youtube' | 'vimeo' | 'gdrive' | 'pdf' | 'audio' | 'external' | 'unknown' = 'unknown';
  canDownload = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<OaViewerComponent>,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const url = this.data.objeto.contenido;

    this.displayType = this.detectType(url);
    this.canDownload = ['video', 'image', 'pdf', 'audio'].includes(this.displayType);

    // Crear safeUrl para tipos que usan iframe
    if (['document', 'youtube', 'vimeo', 'gdrive', 'pdf', 'external'].includes(this.displayType)) {
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.getEmbedUrl(url));
    }
  }

  private detectType(url: string): 'video' | 'image' | 'document' | 'youtube' | 'vimeo' | 'gdrive' | 'pdf' | 'audio' | 'external' | 'unknown' {
    const lowerUrl = url.toLowerCase();

    // ===== PLATAFORMAS EXTERNAS =====

    // YouTube
    if (lowerUrl.match(/youtube\.com|youtu\.be/)) {
      return 'youtube';
    }

    // Vimeo
    if (lowerUrl.includes('vimeo.com')) {
      return 'vimeo';
    }

    // Google Drive
    if (lowerUrl.includes('drive.google.com')) {
      return 'gdrive';
    }

    // ===== ARCHIVOS POR EXTENSIÓN =====

    // Videos con extensión
    if (lowerUrl.match(/\.(mp4|webm|ogg|mov|avi|mkv)($|\?)/)) {
      return 'video';
    }

    // Imágenes con extensión
    if (lowerUrl.match(/\.(jpg|jpeg|png|gif|svg|webp|bmp|ico)($|\?)/)) {
      return 'image';
    }

    // Audio con extensión
    if (lowerUrl.match(/\.(mp3|wav|flac|aac|m4a)($|\?)/)) {
      return 'audio';
    }

    // PDF con extensión
    if (lowerUrl.match(/\.pdf($|\?)/)) {
      return 'pdf';
    }

    // Documentos de Office con extensión
    if (lowerUrl.match(/\.(doc|docx|ppt|pptx|xls|xlsx)($|\?)/)) {
      return 'document';
    }

    // ===== CLOUDINARY (sin extensión) =====

    if (lowerUrl.includes('cloudinary.com') || lowerUrl.includes('res.cloudinary.com')) {
      // /raw/upload/ = PDFs y documentos
      if (lowerUrl.includes('/raw/upload/')) {
        return 'pdf';
      }
      // /video/upload/ = videos
      if (lowerUrl.includes('/video/upload/')) {
        return 'video';
      }
      // /image/upload/ = imágenes
      if (lowerUrl.includes('/image/upload/')) {
        return 'image';
      }
    }

    // ===== OTRAS PLATAFORMAS =====

    // Spotify
    if (lowerUrl.includes('spotify.com')) {
      return 'external';
    }

    // SoundCloud
    if (lowerUrl.includes('soundcloud.com')) {
      return 'external';
    }

    // Slideshare
    if (lowerUrl.includes('slideshare.net')) {
      return 'external';
    }

    // Prezi
    if (lowerUrl.includes('prezi.com')) {
      return 'external';
    }

    // Canva
    if (lowerUrl.includes('canva.com')) {
      return 'external';
    }

    // Genially
    if (lowerUrl.includes('genial.ly') || lowerUrl.includes('genially')) {
      return 'external';
    }

    // Padlet
    if (lowerUrl.includes('padlet.com')) {
      return 'external';
    }

    // Si tiene protocolo http/https pero no reconocemos el tipo, intentar como external
    if (lowerUrl.startsWith('http://') || lowerUrl.startsWith('https://')) {
      return 'external';
    }

    return 'unknown';
  }

  private getEmbedUrl(url: string): string {
    // YouTube watch URL
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = new URL(url).searchParams.get('v');
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // YouTube short URL
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // YouTube embed (ya está en formato correcto)
    if (url.includes('youtube.com/embed/')) {
      return url;
    }

    // Vimeo
    if (url.includes('vimeo.com/') && !url.includes('player.vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1].split('?')[0].split('/')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }

    // Vimeo player (ya está en formato correcto)
    if (url.includes('player.vimeo.com')) {
      return url;
    }

    // Google Drive file
    if (url.includes('drive.google.com/file/d/')) {
      const fileId = url.split('/d/')[1].split('/')[0];
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }

    // Google Drive folder o otros formatos
    if (url.includes('drive.google.com')) {
      return url.replace('/view', '/preview').replace('/edit', '/preview');
    }

    // PDF - usar Google Docs Viewer
    if (this.displayType === 'pdf') {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    }

    // Office documents - usar Office Online Viewer
    if (url.match(/\.(doc|docx|ppt|pptx|xls|xlsx)($|\?)/i)) {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
    }

    return url;
  }

  // Obtener etiqueta del tipo para mostrar
  getTypeLabel(): string {
    const labels: Record<string, string> = {
      'video': 'Video',
      'image': 'Imagen',
      'pdf': 'PDF',
      'audio': 'Audio',
      'youtube': 'YouTube',
      'vimeo': 'Vimeo',
      'gdrive': 'Google Drive',
      'document': 'Documento',
      'external': 'Enlace externo',
      'unknown': 'Recurso'
    };
    return labels[this.displayType] || 'Recurso';
  }

  // Obtener clase del badge según el tipo
  getBadgeClass(): string {
    const classes: Record<string, string> = {
      'video': 'badge-error',
      'image': 'badge-success',
      'pdf': 'badge-warning',
      'audio': 'badge-info',
      'youtube': 'badge-error',
      'vimeo': 'badge-primary',
      'gdrive': 'badge-accent',
      'document': 'badge-warning',
      'external': 'badge-neutral',
      'unknown': 'badge-ghost'
    };
    return classes[this.displayType] || 'badge-ghost';
  }

  onImageError(event: any): void {
    event.target.src = 'data:image/svg+xml,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="gray" stroke-width="1">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    `);
  }



  async downloadFile(): Promise<void> {
    try {
      const url = this.data.objeto.contenido;

      if (!url) {
        console.error('No hay URL de contenido');
        alert('No se puede descargar: archivo no encontrado');
        return;
      }

      const filename = this.data.objeto.nombre || this.extractFileName(url);

      console.log('Descargando:', filename);
      console.log('URL original:', url);

      //Descargar usando fetch + blob
      if (url.includes('cloudinary.com')) {
        this.downloadFromCloudinary(url, filename);
      } else {
        // Para URLs externas, usar el método tradicional
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }

    } catch (error) {
      console.error('Error al descargar archivo:', error);
      alert('Error al intentar descargar el archivo.');
    }
  }

  /**
   * Descargar archivos de Cloudinary correctamente
   */
  private async downloadFromCloudinary(url: string, filename: string): Promise<void> {
    try {
      // Asegurar que el filename tenga extensión
      const extension = this.getFileExtension(url);
      const finalFilename = filename.includes('.') ? filename : `${filename}.${extension}`;

      console.log('Descargando de Cloudinary:', finalFilename);

      // Hacer fetch del archivo
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Convertir a blob
      const blob = await response.blob();

      // Crear URL temporal del blob
      const blobUrl = window.URL.createObjectURL(blob);

      // Crear link de descarga
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = finalFilename;
      a.style.display = 'none';

      document.body.appendChild(a);
      a.click();

      // Limpiar
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
      }, 100);

      console.log('Descarga iniciada:', finalFilename);

    } catch (error) {
      console.error('Error al descargar de Cloudinary:', error);

      // Fallback: intentar abrir en nueva pestaña
      alert('No se pudo descargar automáticamente. Se abrirá en una nueva pestaña.');
      window.open(url, '_blank');
    }
  }

  /**
   * Extraer extensión del archivo de la URL
   */
  private getFileExtension(url: string): string {
    try {
      // Intentar extraer de la URL
      const match = url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
      if (match && match[1]) {
        return match[1];
      }

      // Si la URL de Cloudinary contiene el resource_type
      if (url.includes('/image/upload/')) {
        // Buscar extensión en el nombre del archivo
        const parts = url.split('/');
        const lastPart = parts[parts.length - 1];
        const extMatch = lastPart.match(/\.([a-zA-Z0-9]+)/);
        if (extMatch) return extMatch[1];
        return 'jpg';
      }
      if (url.includes('/video/upload/')) {
        const parts = url.split('/');
        const lastPart = parts[parts.length - 1];
        const extMatch = lastPart.match(/\.([a-zA-Z0-9]+)/);
        if (extMatch) return extMatch[1];
        return 'mp4';
      }
      if (url.includes('/raw/upload/')) {
        const parts = url.split('/');
        const lastPart = parts[parts.length - 1];
        const extMatch = lastPart.match(/\.([a-zA-Z0-9]+)/);
        if (extMatch) return extMatch[1];
        return 'pdf';
      }

      // Fallback basado en el tipo detectado
      const extensionMap: Record<string, string> = {
        'pdf': 'pdf',
        'video': 'mp4',
        'image': 'jpg',
        'audio': 'mp3',
        'document': 'pdf'
      };

      return extensionMap[this.displayType] || 'file';
    } catch (error) {
      console.error('Error al obtener extensión:', error);
      return 'file';
    }
  }

  private extractFileName(url: string): string {
    try {
      const parts = url.split('/');
      const lastPart = parts[parts.length - 1];
      const decoded = decodeURIComponent(lastPart.split('?')[0]);
      return decoded || 'recurso';
    } catch (error) {
      console.error('Error al extraer nombre:', error);
      return 'recurso';
    }
  }

  /**
   * NUEVO: Abrir archivo en nueva pestaña (para visualización)
   */
  openInNewTab(): void {
    const url = this.data.objeto.contenido;

    if (!url) {
      alert('No hay URL disponible');
      return;
    }

    console.log('Abriendo en nueva pestaña:', url);
    console.log('Tipo detectado:', this.displayType);

    // Para archivos de Cloudinary, usar visualizadores según el tipo
    if (url.includes('cloudinary.com')) {
      this.openCloudinaryFile(url);
    } else {
      // Para URLs externas, abrir directamente
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  /**
   * Abrir archivos de Cloudinary con visualizadores apropiados
   */
  private openCloudinaryFile(url: string): void {
    // Limpiar URL de transformaciones de descarga
    const cleanUrl = url.replace(/\/fl_attachment[^\/]*\//g, '/');

    // Según el tipo de archivo, usar el visualizador apropiado
    switch (this.displayType) {
      case 'pdf':
        // Usar Google Docs Viewer para PDFs
        const pdfViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(cleanUrl)}&embedded=false`;
        window.open(pdfViewerUrl, '_blank', 'noopener,noreferrer');
        break;

      case 'document':
        // Usar Office Online Viewer para documentos de Office
        const officeViewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(cleanUrl)}`;
        window.open(officeViewerUrl, '_blank', 'noopener,noreferrer');
        break;

      //case 'image':
      case 'audio':
        // Para multimedia, intentar abrir directamente
        // Si no funciona, mostrar en un visor básico
        this.openInMediaViewer(cleanUrl);
        break;

      default:
        // Para otros tipos, intentar abrir directamente
        window.open(cleanUrl, '_blank', 'noopener,noreferrer');
    }
  }

    /**
   * Abrir archivos multimedia en un visor simple
   */
  private openInMediaViewer(url: string): void {
    const extension = this.getFileExtension(url);
    const filename = this.data.objeto.nombre || 'archivo';

    // Crear HTML para el visor
    let viewerHtml = '';

    if (this.displayType === 'image') {
      viewerHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${filename}</title>
          <style>
            body {
              margin: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: #000;
            }
            img {
              max-width: 100%;
              max-height: 100vh;
              object-fit: contain;
            }
          </style>
        </head>
        <body>
          <img src="${url}" alt="${filename}">
        </body>
        </html>
      `;
    } else if (this.displayType === 'video') {
      viewerHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${filename}</title>
          <style>
            body {
              margin: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: #000;
            }
            video {
              max-width: 100%;
              max-height: 100vh;
            }
          </style>
        </head>
        <body>
          <video src="${url}" controls autoplay></video>
        </body>
        </html>
      `;
    } else if (this.displayType === 'audio') {
      viewerHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${filename}</title>
          <style>
            body {
              margin: 0;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: #1a1a1a;
              color: white;
              font-family: Arial, sans-serif;
            }
            h2 { margin-bottom: 2rem; }
            audio {
              width: 80%;
              max-width: 500px;
            }
          </style>
        </head>
        <body>
          <h2>🎵 ${filename}</h2>
          <audio src="${url}" controls autoplay></audio>
        </body>
        </html>
      `;
    }

    if (viewerHtml) {
      // Abrir en nueva ventana con el HTML del visor
      const newWindow = window.open('', '_blank', 'noopener,noreferrer');
      if (newWindow) {
        newWindow.document.write(viewerHtml);
        newWindow.document.close();
      }
    } else {
      // Fallback: intentar abrir directamente
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
