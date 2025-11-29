import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Unit } from '../recomendacion/tipos.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="flex flex-col h-full bg-base-100">
      <!-- Header -->
      <div class="p-4 border-b border-base-300 flex items-center gap-3">
        <div class="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-primary to-secondary rounded-xl text-white">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 class="font-semibold text-sm text-base-content">Contenido del curso</h3>
      </div>

      <!-- Units List -->
      <div class="flex-1 overflow-y-auto p-3">
        <ul class="menu menu-sm gap-2">
          <li *ngFor="let unit of units; let i = index">
            <!-- Unit Header -->
            <details [attr.open]="openUnits[i] ? true : null">
              <summary class="font-medium bg-base-200 hover:bg-base-300" (click)="toggleUnit(i, $event)">
                <span class="badge badge-primary badge-sm">{{ i + 1 }}</span>
                <a [routerLink]="['unidad', unit.id]" class="flex-1 truncate" (click)="$event.stopPropagation()">
                  {{ unit.nombre }}
                </a>
              </summary>

              <!-- Topics List -->
              <ul class="mt-1">
                <li *ngFor="let topic of unit.temas">
                  <a [routerLink]="['unidad', unit.id, 'tema', topic.id]"
                     routerLinkActive="active"
                     class="text-sm">
                    <span class="w-1.5 h-1.5 bg-base-300 rounded-full"></span>
                    {{ topic.nombre }}
                  </a>
                </li>
              </ul>
            </details>
          </li>
        </ul>
      </div>

      <!-- Footer with Progress -->
      <div class="p-4 border-t border-base-300 bg-base-200/50">
        <div class="text-xs font-medium text-base-content/60 mb-2">Tu progreso</div>
        <progress class="progress progress-primary w-full h-2" value="45" max="100"></progress>
        <div class="text-xs text-base-content/50 mt-1">45% completado</div>
      </div>
    </nav>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }
    `,
    `
      .menu li > details > summary::after {
        content: none;
      }
    `,
    `
      .menu li > details > summary {
        gap: 0.5rem;
      }
    `,
    `
      .menu li > details[open] > summary {
        background: oklch(var(--b3));
      }
    `,
  ],
})
export class SidebarComponent {
  @Input() units: Unit[] | null = [];
  @Input() courseId?: string;
  openUnits: boolean[] = [];

  ngOnInit() {
    if (this.units) {
      this.openUnits = this.units.map(() => true);
    }
  }

  ngOnChanges() {
    if (this.units) {
      this.openUnits = this.units.map(() => true);
    }
  }

  toggleUnit(index: number, event: Event) {
    event.preventDefault();
    this.openUnits[index] = !this.openUnits[index];
  }
}
