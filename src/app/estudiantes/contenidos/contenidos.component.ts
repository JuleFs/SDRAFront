import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RecommendationService } from '../../services/recomendacion.service';
import { Topic, Unit } from '../recomendacion/tipos.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-subject-content',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="p-8 max-w-4xl mx-auto" *ngIf="unit$ | async as unit">
      <!-- Header -->
      <header class="flex items-center gap-4 mb-8 pb-6 border-b border-base-300">
        <div class="text-5xl bg-gradient-to-br from-primary to-secondary p-4 rounded-2xl">
          📚
        </div>
        <div>
          <h2 class="text-3xl font-bold text-base-content">{{ unit.nombre }}</h2>
          <span class="text-sm text-base-content/60 uppercase tracking-wide">Unidad de aprendizaje</span>
        </div>
      </header>

      <!-- Description Card -->
      <div class="card bg-base-100 shadow-md mb-8">
        <div class="card-body">
          <div class="flex items-center gap-3 mb-2">
            <span class="text-xl">📋</span>
            <h3 class="card-title text-lg">Descripción</h3>
          </div>
          <p class="text-base-content/70 leading-relaxed">{{ unit.descripcion }}</p>
        </div>
      </div>

      <!-- Topics Section -->
      <div *ngIf="unit.temas && unit.temas.length > 0">
        <div class="flex items-center gap-3 mb-5">
          <span class="text-xl">📖</span>
          <h3 class="text-xl font-semibold flex-grow">Temas de la unidad</h3>
          <div class="badge badge-primary badge-outline">{{ unit.temas.length }} temas</div>
        </div>

        <div class="flex flex-col gap-3">
          <a *ngFor="let topic of unit.temas; let i = index"
             [routerLink]="['tema', topic.id]"
             class="card bg-base-100 border border-base-300 hover:border-primary hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
            <div class="card-body flex-row items-center gap-4 p-4">
              <div class="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-primary to-secondary text-white font-bold rounded-xl text-sm">
                {{ i + 1 }}
              </div>
              <div class="flex-grow">
                <h4 class="font-semibold text-base-content">{{ topic.nombre }}</h4>
                <span class="text-sm text-primary font-medium">Ver contenido →</span>
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>
  `,
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
