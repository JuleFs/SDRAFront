import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { RecommendationService } from 'src/app/services/recomendacion.service';

@Component({
  selector: 'app-course-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  template: `
    <div class="flex h-screen w-full bg-base-200 relative">
      <aside class="border-r border-base-300 bg-base-100 shadow-sm transition-all duration-300 ease-in-out"
             [class.w-72]="true"
             [class.min-w-0]="true">
        <app-sidebar [units]="units$ | async"></app-sidebar>
      </aside>
      <main class="flex-1 overflow-y-auto">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
export class CourseLayoutComponent implements OnInit {
  units$!: any;

  constructor(
    private route: ActivatedRoute,
    private recomendacionSrv: RecommendationService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const cursoId = params.get('cursoId');
      if (cursoId) {
        this.units$ = this.recomendacionSrv.getUnits(cursoId);
        this.units$.subscribe((data: any) => {
          console.log('Unidades obtenidas:', data);
        });
      }
    });
  }
}
