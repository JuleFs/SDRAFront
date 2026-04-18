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

  preferencias: any[] = [];
  porcentajes: { p1: number; p2: number }[] = [];
  estilos: string[] = ['', '', '', ''];
  infos: string[] = ['', '', '', ''];

  constructor(private servicio: AlumnoService, private route: Router) {
    this.Description = 'Selecciona un cuestionario para ver su descripción';
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
      this.preferencias = [];
      this.porcentajes = [];
      this.estilos = [];
      this.infos = [];

      // Bloque 1: Activo/Reflexivo
      const valorActivoReflexivo = data[0].activo_reflexivo.slice(0, -1);
      const letraActivoReflexivo = data[0].activo_reflexivo.slice(-1);
      if (letraActivoReflexivo === 'A') {
        this.activo = valorActivoReflexivo;
        const el = document.getElementById('a' + this.activo);
        if (el) el.innerHTML = "X";
        chartVal.activo = 5 + (this.activo / 22) * 10;
        chartVal.reflexivo = 5 - (this.activo / 22) * 10;
        this.estilos.push('Activo');
        this.infos.push('Los estudiantes activos tienden a retener y comprender mejor la información si hacen algo con ella (discutiéndola, aplicándola o explicándosela a otros).');
        this.preferencias.push(this.calcularPreferencia(Number(this.activo), 'Activo', 'Reflexivo', 'Los estudiantes activos tienden a retener y comprender mejor la información si hacen algo con ella (discutiéndola, aplicándola o explicándosela a otros).', 'Los estudiantes reflexivos prefieren pensar las cosas primero en silencio.'));
        this.porcentajes.push(this.calcularPorcentaje(Number(this.activo), 'A'));
      } else if (letraActivoReflexivo === 'B') {
        this.reflexivo = valorActivoReflexivo;
        const el = document.getElementById('r' + this.reflexivo);
        if (el) el.innerHTML = "X";
        chartVal.activo = 5 - (this.reflexivo / 22) * 10;
        chartVal.reflexivo = 5 + (this.reflexivo / 22) * 10;
        this.estilos.push('Reflexivo');
        this.infos.push('Los estudiantes reflexivos prefieren pensar las cosas primero en silencio.');
        this.preferencias.push(this.calcularPreferencia(Number(this.reflexivo), 'Reflexivo', 'Activo', 'Los estudiantes reflexivos prefieren pensar las cosas primero en silencio.', 'Los estudiantes activos tienden a retener y comprender mejor la información si hacen algo con ella (discutiéndola, aplicándola o explicándosela a otros).'));
        this.porcentajes.push(this.calcularPorcentaje(Number(this.reflexivo), 'B'));
      }

      // Bloque 2: Sensorial/Intuitivo
      const valorSensorialIntuitivo = data[0].sensorial_intuitivo.slice(0, -1);
      const letraSensorialIntuitivo = data[0].sensorial_intuitivo.slice(-1);
      if (letraSensorialIntuitivo === 'A') {
        this.sensorial = valorSensorialIntuitivo;
        const el = document.getElementById('s' + this.sensorial);
        if (el) el.innerHTML = "X";
        chartVal.sensorial = 5 + (this.sensorial / 22) * 10;
        chartVal.intuitivo = 5 - (this.sensorial / 22) * 10;
        this.estilos.push('Sensorial');
        this.infos.push('A los estudiantes sensoriales les gusta aprender hechos; a los intuitivos les gusta descubrir posibilidades y relaciones.');
        this.preferencias.push(this.calcularPreferencia(Number(this.sensorial), 'Sensorial', 'Intuitivo', 'A los estudiantes sensoriales les gusta aprender hechos; a los intuitivos les gusta descubrir posibilidades y relaciones.', 'A los estudiantes intuitivos les gusta descubrir posibilidades y relaciones.'));
        this.porcentajes.push(this.calcularPorcentaje(Number(this.sensorial), 'A'));
      } else if (letraSensorialIntuitivo === 'B') {
        this.intuitivo = valorSensorialIntuitivo;
        const el = document.getElementById('i' + this.intuitivo);
        if (el) el.innerHTML = "X";
        chartVal.sensorial = 5 - (this.intuitivo / 22) * 10;
        chartVal.intuitivo = 5 + (this.intuitivo / 22) * 10;
        this.estilos.push('Intuitivo');
        this.infos.push('A los estudiantes intuitivos les gusta descubrir posibilidades y relaciones.');
        this.preferencias.push(this.calcularPreferencia(Number(this.intuitivo), 'Intuitivo', 'Sensorial', 'A los estudiantes intuitivos les gusta descubrir posibilidades y relaciones.', 'A los estudiantes sensoriales les gusta aprender hechos; a los intuitivos les gusta descubrir posibilidades y relaciones.'));
        this.porcentajes.push(this.calcularPorcentaje(Number(this.intuitivo), 'B'));
      }

      // Bloque 3: Visual/Verbal
      const valorVisualVerbal = data[0].visual_verbal.slice(0, -1);
      const letraVisualVerbal = data[0].visual_verbal.slice(-1);
      if (letraVisualVerbal === 'A') {
        this.visual = valorVisualVerbal;
        const el = document.getElementById('v' + this.visual);
        if (el) el.innerHTML = "X";
        chartVal.visual = 5 + (this.visual / 22) * 10;
        chartVal.verbal = 5 - (this.visual / 22) * 10;
        this.estilos.push('Visual');
        this.infos.push('Los estudiantes visuales recuerdan mejor lo que ven (imágenes, diagramas, diagramas de flujo, líneas de tiempo, películas y demostraciones).');
        this.preferencias.push(this.calcularPreferencia(Number(this.visual), 'Visual', 'Verbal', 'Los estudiantes visuales recuerdan mejor lo que ven (imágenes, diagramas, diagramas de flujo, líneas de tiempo, películas y demostraciones).', 'Los estudiantes verbales obtienen más de las palabras (explicaciones escritas y habladas).'));
        this.porcentajes.push(this.calcularPorcentaje(Number(this.visual), 'A'));
      } else if (letraVisualVerbal === 'B') {
        this.verbal = valorVisualVerbal;
        const el = document.getElementById('ve' + this.verbal);
        if (el) el.innerHTML = "X";
        chartVal.visual = 5 - (this.verbal / 22) * 10;
        chartVal.verbal = 5 + (this.verbal / 22) * 10;
        this.estilos.push('Verbal');
        this.infos.push('Los estudiantes verbales obtienen más de las palabras (explicaciones escritas y habladas).');
        this.preferencias.push(this.calcularPreferencia(Number(this.verbal), 'Verbal', 'Visual', 'Los estudiantes verbales obtienen más de las palabras (explicaciones escritas y habladas).', 'Los estudiantes visuales recuerdan mejor lo que ven (imágenes, diagramas, diagramas de flujo, líneas de tiempo, películas y demostraciones).'));
        this.porcentajes.push(this.calcularPorcentaje(Number(this.verbal), 'B'));
      }

      // Bloque 4: Secuencial/Global
      const valorSecuencialGlobal = data[0].secuencial_global.slice(0, -1);
      const letraSecuencialGlobal = data[0].secuencial_global.slice(-1);
      if (letraSecuencialGlobal === 'A') {
        this.secuencial = valorSecuencialGlobal;
        const el = document.getElementById('se' + this.secuencial);
        if (el) el.innerHTML = "X";
        chartVal.secuencial = 5 + (this.secuencial / 22) * 10;
        chartVal.global = 5 - (this.secuencial / 22) * 10;
        this.estilos.push('Secuencial');
        this.infos.push('Los estudiantes secuenciales tienden a ganar comprensión en pasos lineales, con cada paso siguiendo lógicamente al anterior.');
        this.preferencias.push(this.calcularPreferencia(Number(this.secuencial), 'Secuencial', 'Global', 'Los estudiantes secuenciales tienden a ganar comprensión en pasos lineales, con cada paso siguiendo lógicamente al anterior.', 'Los estudiantes globales tienden a aprender en grandes saltos, absorbiendo material casi al azar sin ver conexiones, y luego de repente "captan" todo.'));
        this.porcentajes.push(this.calcularPorcentaje(Number(this.secuencial), 'A'));
      } else if (letraSecuencialGlobal === 'B') {
        this.global = valorSecuencialGlobal;
        const el = document.getElementById('g' + this.global);
        if (el) el.innerHTML = "X";
        chartVal.secuencial = 5 - (this.global / 22) * 10;
        chartVal.global = 5 + (this.global / 22) * 10;
        this.estilos.push('Global');
        this.infos.push('Los estudiantes globales tienden a aprender en grandes saltos, absorbiendo material casi al azar sin ver conexiones, y luego de repente "captan" todo.');
        this.preferencias.push(this.calcularPreferencia(Number(this.global), 'Global', 'Secuencial', 'Los estudiantes globales tienden a aprender en grandes saltos, absorbiendo material casi al azar sin ver conexiones, y luego de repente "captan" todo.', 'Los estudiantes secuenciales tienden a ganar comprensión en pasos lineales, con cada paso siguiendo lógicamente al anterior.'));
        this.porcentajes.push(this.calcularPorcentaje(Number(this.global), 'B'));
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

  navigateCursos() {
    this.route.navigate(['/cursos']);
  }

  verResultados() {
    this.route.navigate(['/Resultado']);
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
        texto: `Presentas un equilibrio apropiado entre ${dimPredominante}/${dimAlternativa}`,
        estiloAlt: dimAlternativa,
        infoAlt: descAlternativa,
      };
    } else if (valor >= 5 && valor <= 7) {
      return {
        tipo: 'moderada',
        texto: `Presentas una preferencia moderada hacia el estilo de aprendizaje `,
      };
    } else {
      return {
        tipo: 'fuerte',
        texto: `Presentas una preferencia muy fuerte hacia `,
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
}
