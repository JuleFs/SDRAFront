import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AlumnoService } from 'src/app/services/alumno.service';
import { chartValues } from 'src/app/estudiantes/inicio/lista.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  Chart,
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';

Chart.register(
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

@Component({
  selector: 'app-perfil-alumno',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './perfil-alumno.component.html',
})
export class PerfilAlumnoComponent implements OnInit, AfterViewInit {
  nroCuenta: number = 0;
  cursoId: string = '';
  perfil: any = null;
  nombreAlumno: string = '';
  chart: any;
  isLoading = true;
  chartVal: chartValues = new chartValues();

  preferencias: any[] = [];
  porcentajes: { p1: number; p2: number }[] = [];
  estilos: string[] = ['', '', '', ''];
  infos: string[] = ['', '', '', ''];

  constructor(
    private route: ActivatedRoute,
    private alumnoService: AlumnoService,
    public translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.nroCuenta = Number(params.get('nroCuenta'));
      this.cursoId = params.get('cursoId') || '';
      this.cargarPerfil();
      this.cargarNombreAlumno();
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.createChart(), 100);
  }

  cargarNombreAlumno(): void {
    this.alumnoService.buscarAlumnos(String(this.nroCuenta)).subscribe({
      next: (data) => {
        if (data.data && data.data.length > 0) {
          const a = data.data[0];
          this.nombreAlumno = `${a.nombre} ${a.apellido_1} ${a.apellido_2}`.trim();
        }
      },
      error: (err) => console.error('Error al cargar alumno:', err)
    });
  }

  cargarPerfil(): void {
    this.isLoading = true;
    this.alumnoService.obtenerPerfil(String(this.nroCuenta)).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.perfil = data[0];
          this.isLoading = false;
          // Esperar a que Angular renderice el *ngIf con el perfil
          // y luego crear la gráfica y procesar el perfil
          setTimeout(() => {
            this.createChart();
            this.procesarPerfil();
          }, 200);
        } else {
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Error al cargar perfil:', err);
        this.isLoading = false;
      }
    });
  }

  createChart(): void {
    const canvas = document.getElementById('PerfilChart') as HTMLCanvasElement;
      if (!canvas) {
        // Reintentar si el canvas aún no está en el DOM
        setTimeout(() => this.createChart(), 100);
        return;
      }

    if (this.chart) this.chart.destroy();

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
          this.translate.instant('results.global'),
        ],
        datasets: [{
          label: 'Perfil del alumno',
          data: [],
          backgroundColor: 'rgba(99, 102, 241, 0.3)',
          borderColor: 'rgba(99, 102, 241, 0.8)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(99, 102, 241, 1)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: { display: true, color: 'rgba(0,0,0,0.1)' },
            suggestedMin: 0,
            suggestedMax: 10,
            ticks: { stepSize: 2 }
          }
        },
        plugins: { legend: { position: 'bottom' } }
      }
    });

    if (this.perfil) this.actualizarChart();
  }

  procesarPerfil(): void {
    if (!this.perfil) return;
    this.preferencias = [];
    this.porcentajes = [];
    this.estilos = [];
    this.infos = [];

    // Activo / Reflexivo
    const valorAR = Number(this.perfil.activo_reflexivo.slice(0, -1));
    const letraAR = this.perfil.activo_reflexivo.slice(-1);
    if (letraAR === 'A') {
      this.chartVal.activo = 5 + (valorAR / 22) * 10;
      this.chartVal.reflexivo = 5 - (valorAR / 22) * 10;
      this.estilos.push(this.translate.instant('results.active'));
      this.infos.push(this.translate.instant('results.activeDesc'));
      this.preferencias.push(this.calcularPreferencia(valorAR, this.translate.instant('results.active'), this.translate.instant('results.reflective'), this.translate.instant('results.activeDesc'), this.translate.instant('results.reflectiveDesc')));
      this.porcentajes.push(this.calcularPorcentaje(valorAR, 'A'));
      const el = document.getElementById('a' + valorAR);
      if (el) el.innerHTML = 'x';
    } else {
      this.chartVal.activo = 5 - (valorAR / 22) * 10;
      this.chartVal.reflexivo = 5 + (valorAR / 22) * 10;
      this.estilos.push(this.translate.instant('results.reflective'));
      this.infos.push(this.translate.instant('results.reflectiveDesc'));
      this.preferencias.push(this.calcularPreferencia(valorAR, this.translate.instant('results.reflective'), this.translate.instant('results.active'), this.translate.instant('results.reflectiveDesc'), this.translate.instant('results.activeDesc')));
      this.porcentajes.push(this.calcularPorcentaje(valorAR, 'B'));
      const el = document.getElementById('r' + valorAR);
      if (el) el.innerHTML = 'x';
    }

    // Sensorial / Intuitivo
    const valorSI = Number(this.perfil.sensorial_intuitivo.slice(0, -1));
    const letraSI = this.perfil.sensorial_intuitivo.slice(-1);
    if (letraSI === 'A') {
      this.chartVal.sensorial = 5 + (valorSI / 22) * 10;
      this.chartVal.intuitivo = 5 - (valorSI / 22) * 10;
      this.estilos.push(this.translate.instant('results.sensory'));
      this.infos.push(this.translate.instant('results.sensoryDesc'));
      this.preferencias.push(this.calcularPreferencia(valorSI, this.translate.instant('results.sensory'), this.translate.instant('results.intuitive'), this.translate.instant('results.sensoryDesc'), this.translate.instant('results.intuitiveDesc')));
      this.porcentajes.push(this.calcularPorcentaje(valorSI, 'A'));
      const el = document.getElementById('s' + valorSI);
      if (el) el.innerHTML = 'x';
    } else {
      this.chartVal.sensorial = 5 - (valorSI / 22) * 10;
      this.chartVal.intuitivo = 5 + (valorSI / 22) * 10;
      this.estilos.push(this.translate.instant('results.intuitive'));
      this.infos.push(this.translate.instant('results.intuitiveDesc'));
      this.preferencias.push(this.calcularPreferencia(valorSI, this.translate.instant('results.intuitive'), this.translate.instant('results.sensory'), this.translate.instant('results.intuitiveDesc'), this.translate.instant('results.sensoryDesc')));
      this.porcentajes.push(this.calcularPorcentaje(valorSI, 'B'));
      const el = document.getElementById('i' + valorSI);
      if (el) el.innerHTML = 'x';
    }

    // Visual / Verbal
    const valorVV = Number(this.perfil.visual_verbal.slice(0, -1));
    const letraVV = this.perfil.visual_verbal.slice(-1);
    if (letraVV === 'A') {
      this.chartVal.visual = 5 + (valorVV / 22) * 10;
      this.chartVal.verbal = 5 - (valorVV / 22) * 10;
      this.estilos.push(this.translate.instant('results.visual'));
      this.infos.push(this.translate.instant('results.visualDesc'));
      this.preferencias.push(this.calcularPreferencia(valorVV, this.translate.instant('results.visual'), this.translate.instant('results.verbal'), this.translate.instant('results.visualDesc'), this.translate.instant('results.verbalDesc')));
      this.porcentajes.push(this.calcularPorcentaje(valorVV, 'A'));
      const el = document.getElementById('v' + valorVV);
      if (el) el.innerHTML = 'x';
    } else {
      this.chartVal.visual = 5 - (valorVV / 22) * 10;
      this.chartVal.verbal = 5 + (valorVV / 22) * 10;
      this.estilos.push(this.translate.instant('results.verbal'));
      this.infos.push(this.translate.instant('results.verbalDesc'));
      this.preferencias.push(this.calcularPreferencia(valorVV, this.translate.instant('results.verbal'), this.translate.instant('results.visual'), this.translate.instant('results.verbalDesc'), this.translate.instant('results.visualDesc')));
      this.porcentajes.push(this.calcularPorcentaje(valorVV, 'B'));
      const el = document.getElementById('ve' + valorVV);
      if (el) el.innerHTML = 'x';
    }

    // Secuencial / Global
    const valorSG = Number(this.perfil.secuencial_global.slice(0, -1));
    const letraSG = this.perfil.secuencial_global.slice(-1);
    if (letraSG === 'A') {
      this.chartVal.secuencial = 5 + (valorSG / 22) * 10;
      this.chartVal.global = 5 - (valorSG / 22) * 10;
      this.estilos.push(this.translate.instant('results.sequential'));
      this.infos.push(this.translate.instant('results.sequentialDesc'));
      this.preferencias.push(this.calcularPreferencia(valorSG, this.translate.instant('results.sequential'), this.translate.instant('results.global'), this.translate.instant('results.sequentialDesc'), this.translate.instant('results.globalDesc')));
      this.porcentajes.push(this.calcularPorcentaje(valorSG, 'A'));
      const el = document.getElementById('se' + valorSG);
      if (el) el.innerHTML = 'x';
    } else {
      this.chartVal.secuencial = 5 - (valorSG / 22) * 10;
      this.chartVal.global = 5 + (valorSG / 22) * 10;
      this.estilos.push(this.translate.instant('results.global'));
      this.infos.push(this.translate.instant('results.globalDesc'));
      this.preferencias.push(this.calcularPreferencia(valorSG, this.translate.instant('results.global'), this.translate.instant('results.sequential'), this.translate.instant('results.globalDesc'), this.translate.instant('results.sequentialDesc')));
      this.porcentajes.push(this.calcularPorcentaje(valorSG, 'B'));
      const el = document.getElementById('g' + valorSG);
      if (el) el.innerHTML = 'x';
    }

    if (this.chart) this.actualizarChart();
  }

  private calcularPreferencia(
    valor: number,
    dimPredominante: string,
    dimAlternativa: string,
    descPredominante: string,
    descAlternativa: string,
  ): any {
    if (valor >= 1 && valor <= 3) {
      return {
        tipo: 'equilibrio',
        texto: `Presenta un equilibrio apropiado entre ${dimPredominante}/${dimAlternativa}`,
        estiloAlt: dimAlternativa,
        infoAlt: descAlternativa,
      };
    } else if (valor >= 5 && valor <= 7) {
      return {
        tipo: 'moderada',
        texto: 'Presenta una preferencia moderada hacia el estilo de aprendizaje ',
      };
    } else {
      return {
        tipo: 'fuerte',
        texto: 'Presenta una preferencia muy fuerte hacia ',
      };
    }
  }

  private calcularPorcentaje(valor: number, letra: string): { p1: number; p2: number } {
    const mapeoPorcentajes: { [key: number]: number } = {
      1: 54.55,
      3: 63.64,
      5: 72.73,
      7: 81.82,
      9: 90.91,
      11: 100,
    };
    const predominante = mapeoPorcentajes[Number(valor)] || 50;
    const secundario = Number((100 - predominante).toFixed(2));
    if (letra === 'A') {
      return { p1: predominante, p2: secundario };
    } else {
      return { p1: secundario, p2: predominante };
    }
  }

  actualizarChart(): void {
    if (!this.chart) return;
    this.chart.data.datasets[0].data = [
      this.chartVal.activo,
      this.chartVal.sensorial,
      this.chartVal.visual,
      this.chartVal.secuencial,
      this.chartVal.reflexivo,
      this.chartVal.intuitivo,
      this.chartVal.verbal,
      this.chartVal.global,
    ];
    this.chart.update();
  }
}
