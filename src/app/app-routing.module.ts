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
import { EncuestaGuard } from './guards/encuesta.guard';


const appRoutes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'Inicio', component: InicioComponent },
  { path: 'Cuestionario/:id_cuestionario', component: CuestionarioComponent },
  { path: 'Resultado', component: ResultadosComponent },
  { path: 'cursos', component: CourseListComponent },
  {
    path: 'curso/:cursoId',
    component: CourseLayoutComponent,
    children: [
      {
        path: 'unidad/:id',
        component: SubjectContentComponent,
        canActivate: [EncuestaGuard]
      },
      { path: 'unidad/:id/tema/:temaId', component: TemaComponent },
    ],
  },
  { path: 'profesor', component: TeacherCourseListComponent },
  {
    path: 'profesor/curso/:cursoId',
    component: TeacherLayoutComponent,
    canActivate: [EncuestaGuard],
    children: [
      { path: 'agregar-unidad', component: UnitFormComponent },
      { path: 'tema/:id', component: TopicFormComponent },
      { path: 'recurso/:id', component: ResourceFormComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule, RouterModule.forRoot(appRoutes), CommonModule],
  exports: [RouterModule],
})
export class AppRoutingModule {}
