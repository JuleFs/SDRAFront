import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Unit } from '../../estudiantes/recomendacion/tipos.model';
import { ContentService } from 'src/app/services/contenido.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-teacher-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class TeacherSidebarComponent {
  materiaId = '';
  units: any;
  
  constructor(private contenidoService: ContentService, private route: ActivatedRoute) {
    this.route.paramMap.subscribe((params) => {
      const materiaId = params.get('cursoId');
      this.materiaId = materiaId ?? '';
      this.units = this.contenidoService.getUnits(this.materiaId);
    });
  }
}
