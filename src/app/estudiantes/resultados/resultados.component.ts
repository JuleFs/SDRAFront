import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js';
import { AlumnoService } from 'src/app/services/alumno.service';
import { chartValues } from '../inicio/lista.model';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-resultados',
  templateUrl: './resultados.component.html',
  styleUrls: ['./resultados.component.css']
})
export class ResultadosComponent implements OnInit, AfterViewInit {

  public chart: any

  activo: number = 0;
  reflexivo: number = 0;
  sensorial: number = 0;
  intuitivo: number = 0;
  visual: number = 0;
  verbal: number = 0;
  secuencial: number = 0;
  global: number = 0;

  constructor(
    private servicio: AlumnoService,
    private router: Router,
    public translate: TranslateService
  ) { }

  ngOnInit(): void {

  }

  ngAfterViewInit() {
        setTimeout(() => {
      this.createChart();
      this.obtenerPerfilAlumno();
    }, 100);
  }

  createChart() {
    const canvas = document.getElementById('MyChart') as HTMLCanvasElement;

    if (!canvas) {
      console.error('No se encontró el canvas MyChart');
      return;
    }

    this.chart = new Chart(canvas, {
      type: 'radar',
      data: {
        labels: [
          this.translate.instant('results.active'),
          this.translate.instant('results.sensory'),
          this.translate.instant('results.visual'),
          this.translate.instant('results.sequential'),
          this.translate.instant('results.reflective'),
          this.translate.instant('results.intuitive'),
          this.translate.instant('results.verbal'),
          this.translate.instant('results.global')
        ],
        datasets: [
          {
            label: this.translate.instant('results.yourProfile'),
            data: [],
            backgroundColor: 'rgba(46, 155, 236, 0.5)',
            borderColor: 'rgba(30, 36, 64, 0.6)',
            borderWidth: 1,
            pointBackgroundColor: '#2E9BEC'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: {
              display: true,
              color: 'rgba(0, 0, 0, 0.1)'
            },
            suggestedMin: 0,
            suggestedMax: 10
          }
        }
      }
    });
  }

  obtenerPerfilAlumno() {
    const chartVal = new chartValues();
    this.servicio.obtenerPerfil(
      JSON.parse(localStorage.getItem('info_alumno') || "{}").nro_cuenta,
    ).subscribe ( (data) => {

      if (!data || data.length === 0) {
        console.error('Datos de perfil no válidos o vacíos');
        return;
      }
      const valorActivoReflexivo = data[0].activo_reflexivo.slice(0, -1);
      const letraActivoReflexivo = data[0].activo_reflexivo.slice(-1);
      if (letraActivoReflexivo === 'A') {
        this.activo = valorActivoReflexivo;
        chartVal.activo = 5 + (this.activo / 22)*10;
        chartVal.reflexivo = 5 - (this.activo / 22)*10;
        document.getElementById('a' + this.activo)!.innerHTML = "x";
        document.getElementById('Estilo1')!.innerHTML = this.translate.instant('results.active');
        document.getElementById('Info1')!.innerHTML = this.translate.instant('results.activeDesc');
      } else if (letraActivoReflexivo === 'B')  {
        this.reflexivo = valorActivoReflexivo;
        chartVal.activo = 5 - (this.reflexivo / 22)*10;
        chartVal.reflexivo = 5 + (this.reflexivo / 22)*10;
        document.getElementById('r' + this.reflexivo)!.innerHTML = "x";
        document.getElementById('Estilo1')!.innerHTML = this.translate.instant('results.reflective');
        document.getElementById('Info1')!.innerHTML = this.translate.instant('results.reflectiveDesc');
      }

      // Bloque 2
      const valorSensorialIntuitivo = data[0].sensorial_intuitivo.slice(0, -1);
      const letraSensorialIntuitivo = data[0].sensorial_intuitivo.slice(-1);
      if (letraSensorialIntuitivo === 'A') {
        this.sensorial = valorSensorialIntuitivo;
        chartVal.sensorial = 5 + (this.sensorial / 22)*10;
        chartVal.intuitivo = 5 - (this.sensorial / 22)*10;
        document.getElementById('s' + this.sensorial)!.innerHTML = "x";
        document.getElementById('Estilo2')!.innerHTML = this.translate.instant('results.sensory');
        document.getElementById('Info2')!.innerHTML = this.translate.instant('results.sensoryDesc');
      } else if (letraSensorialIntuitivo === 'B') {
        this.intuitivo = valorSensorialIntuitivo;
        chartVal.sensorial = 5 - (this.intuitivo / 22)*10;
        chartVal.intuitivo = 5 + (this.intuitivo / 22)*10;
        document.getElementById('i' + this.intuitivo)!.innerHTML = "x";
        document.getElementById('Estilo2')!.innerHTML = this.translate.instant('results.intuitive');
        document.getElementById('Info2')!.innerHTML = this.translate.instant('results.intuitiveDesc');
      }

      // Bloque 3
      const valorVisualVerbal = data[0].visual_verbal.slice(0, -1);
      const letraVisualVerbal = data[0].visual_verbal.slice(-1);
      if (letraVisualVerbal === 'A') {
        this.visual = valorVisualVerbal;
        chartVal.visual = 5 + (this.visual / 22)*10;
        chartVal.verbal = 5 - (this.visual / 22)*10;
        document.getElementById('v' + this.visual)!.innerHTML = "x";
        document.getElementById('Estilo3')!.innerHTML = this.translate.instant('results.visual');
        document.getElementById('Info3')!.innerHTML = this.translate.instant('results.visualDesc');
      } else if (letraVisualVerbal === 'B') {
        this.verbal = valorVisualVerbal;
        chartVal.visual = 5 - (this.verbal / 22)*10;
        chartVal.verbal = 5 + (this.verbal / 22)*10;
        document.getElementById('ve' + this.verbal)!.innerHTML = "x";
        document.getElementById('Estilo3')!.innerHTML = this.translate.instant('results.verbal');
        document.getElementById('Info3')!.innerHTML = this.translate.instant('results.verbalDesc');
      }

      // Bloque 4
      const valorSecuencialGlobal = data[0].secuencial_global.slice(0, -1);
      const letraSecuencialGlobal = data[0].secuencial_global.slice(-1);
      if (letraSecuencialGlobal === 'A') {
        this.secuencial = valorSecuencialGlobal;
        chartVal.secuencial = 5 + (this.secuencial / 22)*10;
        chartVal.global = 5 - (this.secuencial / 22)*10;
        document.getElementById('se' + this.secuencial)!.innerHTML = "x";
        document.getElementById('Estilo4')!.innerHTML = this.translate.instant('results.sequential');
        document.getElementById('Info4')!.innerHTML = this.translate.instant('results.sequentialDesc');
      } else if (letraSecuencialGlobal === 'B') {
        this.global = valorSecuencialGlobal;
        chartVal.secuencial = 5 - (this.global / 22)*10;
        chartVal.global = 5 + (this.global / 22)*10;
        document.getElementById('g' + this.global)!.innerHTML = "x";
        document.getElementById('Estilo4')!.innerHTML = this.translate.instant('results.global');
        document.getElementById('Info4')!.innerHTML = this.translate.instant('results.globalDesc');
      }


      this.chart.data.datasets.forEach((dataset:any) => {
        dataset.data.push(chartVal.activo);
        dataset.data.push(chartVal.sensorial);
        dataset.data.push(chartVal.visual);
        dataset.data.push(chartVal.secuencial);
        dataset.data.push(chartVal.reflexivo);
        dataset.data.push(chartVal.intuitivo);
        dataset.data.push(chartVal.verbal);
        dataset.data.push(chartVal.global);
      });

      //console.log(this.chart.data);

      this.chart.update();

    } )

  }

  cambiasGrafica(event: any) {
  // Activar tab de gráfica
  document.getElementById('Grafica')?.classList.add('tab-active');
  document.getElementById('Tabla')?.classList.remove('tab-active');

  // Mostrar gráfica, ocultar tabla
  const grafic = document.querySelector('.info_grafic') as HTMLElement;
  const table = document.querySelector('.info_table') as HTMLElement;

  if (grafic) grafic.style.display = 'block';
  if (table) table.style.display = 'none';
}

cambiasTabla(event: any) {
  // Activar tab de tabla
  document.getElementById('Tabla')?.classList.add('tab-active');
  document.getElementById('Grafica')?.classList.remove('tab-active');

  // Mostrar tabla, ocultar gráfica
  const grafic = document.querySelector('.info_grafic') as HTMLElement;
  const table = document.querySelector('.info_table') as HTMLElement;

  if (grafic) grafic.style.display = 'none';
  if (table) table.style.display = 'block';
}

  navigateCursos() {
    this.router.navigate(['/cursos']);
  }
}
