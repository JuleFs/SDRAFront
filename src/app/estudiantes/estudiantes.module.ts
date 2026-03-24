import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InicioComponent } from './inicio/inicio.component';
import { NgChartsModule } from 'ng2-charts';
import { CuestionarioComponent } from './cuestionario/cuestionario.component';
import { ResultadosComponent } from './resultados/resultados.component';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    InicioComponent,
    CuestionarioComponent,
    ResultadosComponent,
  ],
  imports: [
    CommonModule,
    NgChartsModule,
    FormsModule,
    TranslateModule,
    RouterModule,
  ]
})
export class EstudiantesModule { }
