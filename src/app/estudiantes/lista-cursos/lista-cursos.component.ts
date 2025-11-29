import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CursoService } from '../../services/curso.service';
import { Course } from '../recomendacion/tipos.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './lista-cursos.component.html',
  styleUrls: ['./lista-cursos.component.css']
})
export class CourseListComponent implements OnInit {
  grupo = 0;
  courses$!: Observable<Course[]>;

  constructor(private courseSrv: CursoService) {}

  ngOnInit(): void {
    const info = localStorage.getItem('info_alumno');
    if (info) {
      this.grupo = JSON.parse(info).grupo;
    }
    this.courses$ = this.courseSrv.getCourses(this.grupo);
  }
}
