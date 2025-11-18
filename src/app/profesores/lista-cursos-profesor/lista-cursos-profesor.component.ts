import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CursoService } from '../../services/curso.service';

@Component({
  selector: 'app-teacher-course-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="teacher-courses">
      <h2>Mis cursos (Profesor)</h2>
      <div class="grid">
        <div *ngFor="let c of courses | async" class="card">
          <div class="card-bg"></div>
          <div class="card-body">
            <a [routerLink]="['/profesor/curso', c.id]" class="title">{{
              c.nombre
            }}</a>
            <p>Grupo: {{ c.grupo }}</p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 16px;
        margin-top: 16px;
      }
    `,
    `
      .card {
        border: 1px solid #ddd;
        border-radius: 8px;
        overflow: hidden;
        background: #fff;
      }
    `,
    `
      .card-bg {
        height: 100px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
    `,
    `
      .card-body {
        padding: 12px;
      }
    `,
    `
      .title {
        font-weight: 600;
        display: block;
        margin-bottom: 4px;
        color: #1a73e8;
        text-decoration: none;
      }
    `,
    `
      .teacher-courses {
        margin-bottom: 12px;
        padding: 12px;
      }
    `,
  ],
})
export class TeacherCourseListComponent {
  grupo = 0;
  courses: any;
  
  constructor(private courseSrv: CursoService) {
    const info = localStorage.getItem('info_profesor');
    if (info) {
      this.grupo = JSON.parse(info).grupo;
    }
    this.courses = this.courseSrv.getCourses(502);
  }
}
