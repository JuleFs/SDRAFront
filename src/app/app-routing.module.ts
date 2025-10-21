import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Router, RouterModule, Routes } from '@angular/router';
import { InicioComponent } from './estudiantes/inicio/inicio.component';
import { LoginComponent } from './login/login.component';
import { CuestionarioComponent } from './estudiantes/cuestionario/cuestionario.component';
import { ResultadosComponent } from './estudiantes/resultados/resultados.component';
import { SubjectContentComponent } from './estudiantes/contenidos/contenidos.component';
import { CourseListComponent } from './estudiantes/lista-cursos/lista-cursos.component';
import { CourseLayoutComponent } from './estudiantes/curso-layout/curso-layout.component';
import { TeacherCourseListComponent } from './profesores/lista-cursos-profesor/lista-cursos-profesor.component';
import { TeacherLayoutComponent } from './profesores/teacher-layout/teacher-layout.component';
import { UnitFormComponent } from './profesores/unit-form/unit-form.component';
import { TopicFormComponent } from './profesores/tarea-form/tarea-form.component';
import { ResourceFormComponent } from './profesores/recurso-form/recurso-form.component';
import { TemaComponent } from './estudiantes/tema/tema.component';

const appRoutes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'Inicio', component: InicioComponent },
  { path: 'Cuestionario/:id_cuestionario', component: CuestionarioComponent },
  { path: 'Resultado', component: ResultadosComponent },
  { path: 'cursos', component: CourseListComponent },
  {
    path: 'course/:courseId',
    component: CourseLayoutComponent,
    children: [
      {
        path: 'unit/:id',
        component: SubjectContentComponent,
      },
      { path: 'unit/:id/topic/:topicId', component: TemaComponent },
    ],
  },
  { path: 'teacher', component: TeacherCourseListComponent },
  {
    path: 'teacher/course/:courseId',
    component: TeacherLayoutComponent,
    children: [
      { path: 'add-unit', component: UnitFormComponent },
      { path: 'topic/:id', component: TopicFormComponent },
      { path: 'resource/:id', component: ResourceFormComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule, RouterModule.forRoot(appRoutes), CommonModule],
  exports: [RouterModule],
})
export class AppRoutingModule {}
