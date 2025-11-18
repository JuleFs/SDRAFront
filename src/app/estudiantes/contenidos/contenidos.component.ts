import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RecommendationService } from '../../services/recomendacion.service';
import { Topic, Unit } from '../recomendacion/tipos.model';
import { TemaComponent } from '../tema/tema.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-subject-content',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="content" *ngIf="unit$ | async as unit">
      <header class="title-section">
        <h2>{{ unit.nombre }}</h2>
      </header>

      <div class="description">
        <h3>Descripción</h3>
        <div class="desc-text">{{ unit.descripcion }}</div>
      </div>

      <div *ngIf="unit.temas && unit.temas.length > 0" class="topics">
        <h3>Temas</h3>
        <div *ngFor="let topic of unit.temas" class="topic-card">
          <h4>
            <a [routerLink]="['tema', topic.id]">{{ topic.nombre }}</a>
          </h4>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .content {
        padding: 20px;
      }
    `,
  ],
})
export class SubjectContentComponent implements OnInit {
  unitId?: string;
  unit$!: Observable<Unit>;
  topics: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private recSrv: RecommendationService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.unitId = id ?? undefined;
      if (this.unitId) {
        this.unit$ = this.recSrv.getUnitById(this.unitId);
      }
    });
  }
}
