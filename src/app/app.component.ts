import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppUser, UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'P_TomaDeciciones';
  loggedUser!: string;
  nombre_usuario$!: any;
  grupo$!: any;
  isProfesor: boolean = false;

  constructor(
    private route: Router,
    public translate: TranslateService,
    private userSrv: UserService
  ) {
    // Configurar idiomas disponibles
    translate.addLangs(['es', 'en']);

    // Idioma por defecto
    translate.setFallbackLang('es');

    // Usar idioma guardado o español
    const savedLang = localStorage.getItem('lang') || 'es';
    translate.use(savedLang);
  }

  ngOnInit() {
    this.userSrv.user$.subscribe((user) => {
      this.loadUserData(user);
    });
  }

  loadUserData(user: AppUser | null = null) {
    if (user?.grupo === 'Profesor') {
      this.nombre_usuario$ = user?.nombre;
      this.grupo$ = 'Profesor';
      this.isProfesor = true;
    } else if (user?.grupo) {
      this.nombre_usuario$ = user?.nombre;
      this.grupo$ = user?.grupo;
      this.isProfesor = false;
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
    this.userSrv.clear();
    this.route.navigate(['/']);
  }
}
