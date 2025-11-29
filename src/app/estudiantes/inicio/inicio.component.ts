import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Lista, chartValues } from './lista.model';
import { Chart } from 'chart.js';
import { AlumnoService } from 'src/app/services/alumno.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit, AfterViewInit {
  Listas: Lista[] = [];
  estadoEncuestas!: Array<any>;
  Description: string;
  nroCuenta: number = 0;

  public chart: any;

  activo: number = 0;
  reflexivo: number = 0;
  sensorial: number = 0;
  intuitivo: number = 0;
  visual: number = 0;
  verbal: number = 0;
  secuencial: number = 0;
  global: number = 0;

  constructor(private servicio: AlumnoService, private route: Router) {
    this.Description = 'Selecciona una encuesta para ver su descripción';
  }

  OnClick(Des: any) {
    this.Description = Des;
  }

  createChart() {
    this.chart = new Chart("MyChart", {
      type: 'radar',
      data: {
        labels: ['Activo', 'Sensorial', 'Visual', 'Secuencial', 'Reflexivo', 'Intuitivo', 'Verbal', 'Global'],
        datasets: [
          {
            label: 'Tu perfil',
            data: [],
            backgroundColor: 'rgba(99, 102, 241, 0.3)',
            borderColor: 'rgba(99, 102, 241, 0.8)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(99, 102, 241, 1)'
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
            suggestedMax: 10,
            ticks: {
              stepSize: 2
            }
          }
        },
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  ngOnInit(): void {
    this.createChart();

    const info_alumno = localStorage.getItem('info_alumno');
    if (info_alumno) {
      this.nroCuenta = JSON.parse(info_alumno).nro_cuenta;
    }

    this.estadoEncuesta();
    this.obtenerEncuestas();
  }

  ngAfterViewInit() {
    this.obtenerPerfilAlumno();
  }

  obtenerEncuestas() {
    this.servicio.obtenerCuestionariosAlumno(this.nroCuenta).subscribe(
      (data) => {
        this.Listas = []; // Limpiar lista

        data.forEach((asignacion) => {
          const listaModel = new Lista();
          listaModel.nombreProfesor = asignacion.cuestionario.id_profesor || 'Francisco Figueroa';
          listaModel.titulo = asignacion.cuestionario.nombre;
          listaModel.descripcion = asignacion.cuestionario.descripcion;
          listaModel.id_cuestionario = asignacion.cuestionario.id_cuestionario;
          this.Listas.push(listaModel);
        });
      },
      (error) => {
        console.error('Error al obtener cuestionarios:', error);
      }
    );
  }

  obtenerPerfilAlumno() {
    const chartVal = new chartValues();
    this.servicio.obtenerPerfil(
      JSON.parse(localStorage.getItem('info_alumno') || "{}").nro_cuenta
    ).subscribe((data) => {
      // Bloque 1: Activo/Reflexivo
      const valorActivoReflexivo = data[0].activo_reflexivo.slice(0, -1);
      const letraActivoReflexivo = data[0].activo_reflexivo.slice(-1);
      if (letraActivoReflexivo === 'A') {
        this.activo = valorActivoReflexivo;
        const el = document.getElementById('a' + this.activo);
        if (el) el.innerHTML = "✓";
        chartVal.activo = 5 + (this.activo / 22) * 10;
        chartVal.reflexivo = 5 - (this.activo / 22) * 10;
      } else if (letraActivoReflexivo === 'B') {
        this.reflexivo = valorActivoReflexivo;
        const el = document.getElementById('r' + this.reflexivo);
        if (el) el.innerHTML = "✓";
        chartVal.activo = 5 - (this.reflexivo / 22) * 10;
        chartVal.reflexivo = 5 + (this.reflexivo / 22) * 10;
      }

      // Bloque 2: Sensorial/Intuitivo
      const valorSensorialIntuitivo = data[0].sensorial_intuitivo.slice(0, -1);
      const letraSensorialIntuitivo = data[0].sensorial_intuitivo.slice(-1);
      if (letraSensorialIntuitivo === 'A') {
        this.sensorial = valorSensorialIntuitivo;
        const el = document.getElementById('s' + this.sensorial);
        if (el) el.innerHTML = "✓";
        chartVal.sensorial = 5 + (this.sensorial / 22) * 10;
        chartVal.intuitivo = 5 - (this.sensorial / 22) * 10;
      } else if (letraSensorialIntuitivo === 'B') {
        this.intuitivo = valorSensorialIntuitivo;
        const el = document.getElementById('i' + this.intuitivo);
        if (el) el.innerHTML = "✓";
        chartVal.sensorial = 5 - (this.intuitivo / 22) * 10;
        chartVal.intuitivo = 5 + (this.intuitivo / 22) * 10;
      }

      // Bloque 3: Visual/Verbal
      const valorVisualVerbal = data[0].visual_verbal.slice(0, -1);
      const letraVisualVerbal = data[0].visual_verbal.slice(-1);
      if (letraVisualVerbal === 'A') {
        this.visual = valorVisualVerbal;
        const el = document.getElementById('v' + this.visual);
        if (el) el.innerHTML = "✓";
        chartVal.visual = 5 + (this.visual / 22) * 10;
        chartVal.verbal = 5 - (this.visual / 22) * 10;
      } else if (letraVisualVerbal === 'B') {
        this.verbal = valorVisualVerbal;
        const el = document.getElementById('ve' + this.verbal);
        if (el) el.innerHTML = "✓";
        chartVal.visual = 5 - (this.verbal / 22) * 10;
        chartVal.verbal = 5 + (this.verbal / 22) * 10;
      }

      // Bloque 4: Secuencial/Global
      const valorSecuencialGlobal = data[0].secuencial_global.slice(0, -1);
      const letraSecuencialGlobal = data[0].secuencial_global.slice(-1);
      if (letraSecuencialGlobal === 'A') {
        this.secuencial = valorSecuencialGlobal;
        const el = document.getElementById('se' + this.secuencial);
        if (el) el.innerHTML = "✓";
        chartVal.secuencial = 5 + (this.secuencial / 22) * 10;
        chartVal.global = 5 - (this.secuencial / 22) * 10;
      } else if (letraSecuencialGlobal === 'B') {
        this.global = valorSecuencialGlobal;
        const el = document.getElementById('g' + this.global);
        if (el) el.innerHTML = "✓";
        chartVal.secuencial = 5 - (this.global / 22) * 10;
        chartVal.global = 5 + (this.global / 22) * 10;
      }

      this.chart.data.datasets.forEach((dataset: any) => {
        dataset.data.push(chartVal.activo);
        dataset.data.push(chartVal.sensorial);
        dataset.data.push(chartVal.visual);
        dataset.data.push(chartVal.secuencial);
        dataset.data.push(chartVal.reflexivo);
        dataset.data.push(chartVal.intuitivo);
        dataset.data.push(chartVal.verbal);
        dataset.data.push(chartVal.global);
      });

      this.chart.update();
    });
  }

    estadoEncuesta() {
    this.servicio.verificarCuestionarioCompletado(this.nroCuenta, 1).subscribe(
      (data) => {
        // Crear array con el estado para mantener compatibilidad con checkStatus()
        if (data.completado) {
          this.estadoEncuestas = [{ nro_cuenta: this.nroCuenta }];
        } else {
          this.estadoEncuestas = [];
        }
      },
      (error) => {
        console.error('Error al verificar estado:', error);
        this.estadoEncuestas = [];
      }
    );
  }

  checkStatus() {
    return this.estadoEncuestas?.some(x => x.nro_cuenta === this.nroCuenta);
  }

  realizarEncuesta(id_cuestionario: number) {
    this.route.navigate(['/Cuestionario/' + id_cuestionario]);
  }

  cambiasGrafica(event: any) {
    // Activar tab de gráfica
    document.getElementById('Grafica')?.classList.add('tab-active');
    document.getElementById('Tabla')?.classList.remove('tab-active');

    // Mostrar gráfica, ocultar tabla
    const grafic = document.querySelector('.info_grafic');
    const table = document.querySelector('.info_table');
    grafic?.classList.remove('hidden');
    table?.classList.add('hidden');
  }

  cambiasTabla(event: any) {
    // Activar tab de tabla
    document.getElementById('Tabla')?.classList.add('tab-active');
    document.getElementById('Grafica')?.classList.remove('tab-active');

    // Mostrar tabla, ocultar gráfica
    const grafic = document.querySelector('.info_grafic');
    const table = document.querySelector('.info_table');
    grafic?.classList.add('hidden');
    table?.classList.remove('hidden');
  }

  navigateCursos() {
    this.route.navigate(['/cursos']);
  }

  verResultados() {
  this.route.navigate(['/Resultado']);
}

}
