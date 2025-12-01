import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { OnInit } from '@angular/core';
import { RecommendationService } from 'src/app/services/recomendacion.service';
import { Resource, Topic } from '../recomendacion/tipos.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { OaViewerComponent } from '../oa-viewer/oa-viewer.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-tema',
  standalone: true,
  imports: [CommonModule, RouterModule, MatDialogModule],
  templateUrl: './tema.component.html', // ← Ahora usa archivo externo
  styleUrls: ['./tema.component.css']
})
export class TemaComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private recSrv: RecommendationService,
    private dialog: MatDialog
  ) {}

  topic$!: Observable<Topic | undefined>;
  recomendacion$!: Observable<any>;

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
    const tipo = oa.estiloObjeto?.tipo ||
                 oa.objeto?.estiloObjeto?.tipo ||
                 oa.objeto?.tipo ||
                 oa.tipo ||
                 'Recurso General';

    console.log('✅ Tipo final:', tipo);
    return tipo;
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
      const unitId = params.get('id') || '';
      const topicId = params.get('temaId') || '';
      const info_alumno = localStorage.getItem('info_alumno');

      if (info_alumno) {
        const nro_cuenta = JSON.parse(info_alumno).nro_cuenta;
        console.log('Unit ID:', unitId, 'Topic ID:', topicId);

        this.topic$ = this.recSrv.getTopicById(unitId, topicId);
        this.recomendacion$ = this.recSrv.getRecomendacion(
          Number(topicId),
          Number(nro_cuenta)
        );

        // Debug: Ver qué datos llegan
        this.recomendacion$.subscribe(data => {
          console.log('Datos de recomendación completos:', data);
          if (data.objetos && data.objetos.length > 0) {
            console.log('Primer objeto de ejemplo:', data.objetos[0]);
          }
        });
      }
    });
  }
}
