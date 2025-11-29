import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Data } from '@angular/router';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlumnoService {

  ///////////////////////////////////////////////////
  /////// RUTA PARA CONECTAR LA API CON EL FRONT ////
  //private urlAPI: string = 'https://apiv2.powerhashing.io/';
  private urlAPI: string = 'http://localhost:3000/';

  /////////////////////////////////////////////////////////////////////
  /////// METODO PARA HACER UN REFRESH A LOS DATOS SI ES NECESARIO ////
  private _refresh$ = new Subject<void>();
  get refresh() {
    return this._refresh$;
  }

  constructor( private http: HttpClient ) { }

  loginAlumno( data: any ):Observable <any> {
    return this.http.post(this.urlAPI + "alumnos/login", data);
  }

  obtenerCuestionariosAlumno(nroCuenta: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.urlAPI}alumnos-cuestionarios/alumno/${nroCuenta}`);
  }

  verificarCuestionarioCompletado(nroCuenta: number, idCuestionario: number): Observable<{ completado: boolean }> {
    return this.http.get<{ completado: boolean }>(
      `${this.urlAPI}alumnos-cuestionarios/verificar/${nroCuenta}/${idCuestionario}`
    );
  }

  obtenerEstadoEncuesta(nroCuenta: number): Observable<any> {
    return this.http.get(`${this.urlAPI}inventario-de-felder/alumno/${nroCuenta}`);
  }

  obtenerPerfil( data:string ) : Observable <any> {
    return this.http.get( this.urlAPI + "perfil-final-inventario-de-felder/alumno/" + data );
  }

  obtenerPreguntas( data:number ) : Observable <any> {
    return this.http.get( this.urlAPI + "preguntas/" + data );
  }

  resultadoEncuesta( data:any ) : Observable <any> {
    return this.http.post( this.urlAPI + "inventario-de-felder/resultado-encuesta", data, {responseType: 'text'} );
  }
}
