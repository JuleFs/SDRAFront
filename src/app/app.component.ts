import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SidebarComponent } from './estudiantes/sidebar/sidebar.component';
import { RecommendationService } from './services/recomendacion.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'P_TomaDeciciones';
  loggedUser!: string;
  nombre_usuario$!: string;
  grupo$!: string;
  isProfesor: boolean = false;

  constructor(
    private route: Router,
    private recSrv: RecommendationService,
    public translate: TranslateService
  ) {
    // Configurar idiomas disponibles
    translate.addLangs(['es', 'en']);

    // Idioma por defecto
    translate.setDefaultLang('es');

    // Usar idioma guardado o español
    const savedLang = localStorage.getItem('lang') || 'es';
    translate.use(savedLang);

    window.addEventListener('storage', (event) => {
      if (
        event.key === 'info_alumno' ||
        event.key === 'info_profesor' ||
        event.key === null
      ) {
        this.loadUserData();
      }
    });
  }

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    const info_alumno = localStorage.getItem('info_alumno');
    const info_profesor = localStorage.getItem('info_profesor');
    if (info_alumno) {
      const { nombre } = JSON.parse(info_alumno);
      this.nombre_usuario$ = nombre;
      this.grupo$ = JSON.parse(info_alumno).grupo;
    } else if (info_profesor) {
      const { nombre_profesor } = JSON.parse(info_profesor);
      this.nombre_usuario$ = nombre_profesor;
      this.grupo$ = 'Profesor';
      this.isProfesor = true;
    } else {
      this.nombre_usuario$ = '';
      this.grupo$ = '';
      this.isProfesor = false;
    }
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
  }

  navigateInicio() {
    this.route.navigate(['/Inicio']);
  }

  loggedin() {
    return localStorage.getItem('info_alumno');
  }

  logout() {
    localStorage.removeItem('info_alumno');
    localStorage.removeItem('info_profesor');
    this.loadUserData();
    this.route.navigate(['/']);
  }
}
