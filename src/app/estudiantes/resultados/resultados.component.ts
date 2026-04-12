import { AfterViewInit, Component, OnInit, Input } from '@angular/core';
import { Chart } from 'chart.js';
import { AlumnoService } from 'src/app/services/alumno.service';
import { chartValues } from '../inicio/lista.model';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-resultados',
  templateUrl: './resultados.component.html',
  styleUrls: ['./resultados.component.css'],
})
export class ResultadosComponent implements OnInit, AfterViewInit {
  public chart: any;

  @Input() nroCuenta?: number;

  activo: number = 0;
  reflexivo: number = 0;
  sensorial: number = 0;
  intuitivo: number = 0;
  visual: number = 0;
  verbal: number = 0;
  secuencial: number = 0;
  global: number = 0;

  esVistaMaestro: boolean = false;
  cursoId: string = '';

  preferencias: string[] = ['', '', '', ''];
  porcentajes: { p1: number; p2: number }[] = [];

  constructor(
    private servicio: AlumnoService,
    private router: Router,
    public translate: TranslateService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const paramNroCuenta = this.route.snapshot.paramMap.get('nroCuenta');
    if (paramNroCuenta) {
      this.nroCuenta = Number(paramNroCuenta);
    }

    // Detectar si viene del profesor
    this.route.queryParams.subscribe((params) => {
      if (params['from'] === 'profesor') {
        this.esVistaMaestro = true;
        this.cursoId = params['cursoId'] || '';
      }
    });
    // this.createChart();
    this.obtenerPerfilAlumno();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.createChart();
      // this.obtenerPerfilAlumno();
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
          this.translate.instant('results.global'),
        ],
        datasets: [
          {
            label: this.translate.instant('results.yourProfile'),
            data: [],
            backgroundColor: 'rgba(46, 155, 236, 0.5)',
            borderColor: 'rgba(30, 36, 64, 0.6)',
            borderWidth: 1,
            pointBackgroundColor: '#2E9BEC',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: {
              display: true,
              color: 'rgba(0, 0, 0, 0.1)',
            },
            suggestedMin: 0,
            suggestedMax: 10,
          },
        },
      },
    });
  }

  obtenerPerfilAlumno() {
    const chartVal = new chartValues();
    this.servicio
      .obtenerPerfil(
        this.nroCuenta ??
          JSON.parse(localStorage.getItem('info_alumno') || '{}').nro_cuenta,
      )
      .subscribe((data) => {
        if (!data || data.length === 0) {
          console.error('Datos de perfil no válidos o vacíos');
          return;
        }

        this.preferencias = [];
        this.porcentajes = [];

        const valorActivoReflexivo = data[0].activo_reflexivo.slice(0, -1);
        const letraActivoReflexivo = data[0].activo_reflexivo.slice(-1);
        if (letraActivoReflexivo === 'A') {
          this.activo = valorActivoReflexivo;
          chartVal.activo = 5 + (this.activo / 22) * 10;
          chartVal.reflexivo = 5 - (this.activo / 22) * 10;
          // document.getElementById('a' + this.activo)!.innerHTML = "x";
          document.getElementById('Estilo1')!.innerHTML =
            this.translate.instant('results.active');
          document.getElementById('Info1')!.innerHTML =
            this.translate.instant('results.activeDesc');
          this.preferencias.push(
            this.calcularPreferencia(
              Number(this.activo),
              this.translate.instant('results.active'),
              this.translate.instant('results.active') +
                '/' +
                this.translate.instant('results.reflective'),
            ),
          );
          this.porcentajes.push(
            this.calcularPorcentaje(Number(this.activo), 'A'),
          );
        } else if (letraActivoReflexivo === 'B') {
          this.reflexivo = valorActivoReflexivo;
          chartVal.activo = 5 - (this.reflexivo / 22) * 10;
          chartVal.reflexivo = 5 + (this.reflexivo / 22) * 10;
          // document.getElementById('r' + this.reflexivo)!.innerHTML = "x";
          document.getElementById('Estilo1')!.innerHTML =
            this.translate.instant('results.reflective');
          document.getElementById('Info1')!.innerHTML = this.translate.instant(
            'results.reflectiveDesc',
          );
          this.preferencias.push(
            this.calcularPreferencia(
              Number(this.reflexivo),
              this.translate.instant('results.reflective'),
              this.translate.instant('results.active') +
                '/' +
                this.translate.instant('results.reflective'),
            ),
          );
          this.porcentajes.push(
            this.calcularPorcentaje(Number(this.reflexivo), 'B'),
          );
        }

        // Bloque 2
        const valorSensorialIntuitivo = data[0].sensorial_intuitivo.slice(
          0,
          -1,
        );
        const letraSensorialIntuitivo = data[0].sensorial_intuitivo.slice(-1);
        if (letraSensorialIntuitivo === 'A') {
          this.sensorial = valorSensorialIntuitivo;
          chartVal.sensorial = 5 + (this.sensorial / 22) * 10;
          chartVal.intuitivo = 5 - (this.sensorial / 22) * 10;
          // document.getElementById('s' + this.sensorial)!.innerHTML = "x";
          document.getElementById('Estilo2')!.innerHTML =
            this.translate.instant('results.sensory');
          document.getElementById('Info2')!.innerHTML = this.translate.instant(
            'results.sensoryDesc',
          );
          this.preferencias.push(
            this.calcularPreferencia(
              Number(this.sensorial),
              this.translate.instant('results.sensory'),
              this.translate.instant('results.sensory') +
                '/' +
                this.translate.instant('results.intuitive'),
            ),
          );
          this.porcentajes.push(
            this.calcularPorcentaje(Number(this.sensorial), 'A'),
          );
        } else if (letraSensorialIntuitivo === 'B') {
          this.intuitivo = valorSensorialIntuitivo;
          chartVal.sensorial = 5 - (this.intuitivo / 22) * 10;
          chartVal.intuitivo = 5 + (this.intuitivo / 22) * 10;
          // document.getElementById('i' + this.intuitivo)!.innerHTML = "x";
          document.getElementById('Estilo2')!.innerHTML =
            this.translate.instant('results.intuitive');
          document.getElementById('Info2')!.innerHTML = this.translate.instant(
            'results.intuitiveDesc',
          );
          this.preferencias.push(
            this.calcularPreferencia(
              Number(this.intuitivo),
              this.translate.instant('results.intuitive'),
              this.translate.instant('results.sensory') +
                '/' +
                this.translate.instant('results.intuitive'),
            ),
          );
          this.porcentajes.push(
            this.calcularPorcentaje(Number(this.intuitivo), 'B'),
          );
        }

        // Bloque 3
        const valorVisualVerbal = data[0].visual_verbal.slice(0, -1);
        const letraVisualVerbal = data[0].visual_verbal.slice(-1);
        if (letraVisualVerbal === 'A') {
          this.visual = valorVisualVerbal;
          chartVal.visual = 5 + (this.visual / 22) * 10;
          chartVal.verbal = 5 - (this.visual / 22) * 10;
          // document.getElementById('v' + this.visual)!.innerHTML = "x";
          document.getElementById('Estilo3')!.innerHTML =
            this.translate.instant('results.visual');
          document.getElementById('Info3')!.innerHTML =
            this.translate.instant('results.visualDesc');
          this.preferencias.push(
            this.calcularPreferencia(
              Number(this.visual),
              this.translate.instant('results.visual'),
              this.translate.instant('results.visual') +
                '/' +
                this.translate.instant('results.verbal'),
            ),
          );
          this.porcentajes.push(
            this.calcularPorcentaje(Number(this.visual), 'A'),
          );
        } else if (letraVisualVerbal === 'B') {
          this.verbal = valorVisualVerbal;
          chartVal.visual = 5 - (this.verbal / 22) * 10;
          chartVal.verbal = 5 + (this.verbal / 22) * 10;
          // document.getElementById('ve' + this.verbal)!.innerHTML = "x";
          document.getElementById('Estilo3')!.innerHTML =
            this.translate.instant('results.verbal');
          document.getElementById('Info3')!.innerHTML =
            this.translate.instant('results.verbalDesc');
          this.preferencias.push(
            this.calcularPreferencia(
              Number(this.verbal),
              this.translate.instant('results.verbal'),
              this.translate.instant('results.visual') +
                '/' +
                this.translate.instant('results.verbal'),
            ),
          );
          this.porcentajes.push(
            this.calcularPorcentaje(Number(this.verbal), 'B'),
          );
        }

        // Bloque 4
        const valorSecuencialGlobal = data[0].secuencial_global.slice(0, -1);
        const letraSecuencialGlobal = data[0].secuencial_global.slice(-1);
        if (letraSecuencialGlobal === 'A') {
          this.secuencial = valorSecuencialGlobal;
          chartVal.secuencial = 5 + (this.secuencial / 22) * 10;
          chartVal.global = 5 - (this.secuencial / 22) * 10;
          // document.getElementById('se' + this.secuencial)!.innerHTML = "x";
          document.getElementById('Estilo4')!.innerHTML =
            this.translate.instant('results.sequential');
          document.getElementById('Info4')!.innerHTML = this.translate.instant(
            'results.sequentialDesc',
          );
          this.preferencias.push(
            this.calcularPreferencia(
              Number(this.secuencial),
              this.translate.instant('results.sequential'),
              this.translate.instant('results.sequential') +
                '/' +
                this.translate.instant('results.global'),
            ),
          );
          this.porcentajes.push(
            this.calcularPorcentaje(Number(this.secuencial), 'A'),
          );
        } else if (letraSecuencialGlobal === 'B') {
          this.global = valorSecuencialGlobal;
          chartVal.secuencial = 5 - (this.global / 22) * 10;
          chartVal.global = 5 + (this.global / 22) * 10;
          // document.getElementById('g' + this.global)!.innerHTML = "x";
          document.getElementById('Estilo4')!.innerHTML =
            this.translate.instant('results.global');
          document.getElementById('Info4')!.innerHTML =
            this.translate.instant('results.globalDesc');
          this.preferencias.push(
            this.calcularPreferencia(
              Number(this.global),
              this.translate.instant('results.global'),
              this.translate.instant('results.sequential') +
                '/' +
                this.translate.instant('results.global'),
            ),
          );
          this.porcentajes.push(
            this.calcularPorcentaje(Number(this.global), 'B'),
          );
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

        //console.log(this.chart.data);

        this.chart.update();
      });
  }

  cambiasGrafica(event: any) {
    this.resetTabs();
    document.getElementById('Grafica')?.classList.add('tab-active');
    const grafic = document.querySelector('.info_grafic') as HTMLElement;
    if (grafic) grafic.style.display = 'block';
  }

  cambiasTabla(event: any) {
    this.resetTabs();
    document.getElementById('Tabla')?.classList.add('tab-active');
    const table = document.querySelector('.info_table') as HTMLElement;
    if (table) table.style.display = 'block';
  }

  cambiasDimensiones(event: any) {
    this.resetTabs();
    document.getElementById('Dimensiones')?.classList.add('tab-active');
    const dims = document.querySelector('.info_dimensiones') as HTMLElement;
    if (dims) dims.style.display = 'block';
  }

  private resetTabs() {
    // Quitar active de todos los botones
    document.getElementById('Grafica')?.classList.remove('tab-active');
    document.getElementById('Tabla')?.classList.remove('tab-active');
    document.getElementById('Dimensiones')?.classList.remove('tab-active');

    // Ocultar todos los contenedores
    const grafic = document.querySelector('.info_grafic') as HTMLElement;
    const table = document.querySelector('.info_table') as HTMLElement;
    const dims = document.querySelector('.info_dimensiones') as HTMLElement;

    if (grafic) grafic.style.display = 'none';
    if (table) table.style.display = 'none';
    if (dims) dims.style.display = 'none';
  }

  navigateCursos() {
    this.router.navigate(['/cursos']);
  }

  private calcularPreferencia(
    valor: number,
    dimPredominante: string,
    dimensiones: string,
  ): string {
    if (valor >= 1 && valor <= 3) {
      return `Usted presenta un equilibrio apropiado entre ${dimensiones}`;
    } else if (valor >= 5 && valor <= 7) {
      return `Usted presenta una preferencia moderada hacia ${dimPredominante}`;
    } else if (valor >= 9 && valor <= 11) {
      return `Usted presenta una preferencia muy fuerte por uno de los dos extremos de la escala`;
    }
    return '';
  }

  private calcularPorcentaje(
    valor: number,
    letra: string,
  ): { p1: number; p2: number } {
    // Escala de Felder con 11 preguntas por dimensión.
    // Los porcentajes se asignan fijos basados en la cantidad de respuestas (1-11)
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
