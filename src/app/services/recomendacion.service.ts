import { Injectable } from '@angular/core';
import {
  Unit,
  Resource,
  LearningProfile,
  Topic,
  Course,
} from '../estudiantes/recomendacion/tipos.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/internal/operators/map';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class RecommendationService {
  private urlAPI: string = environment.apiUrl || 'http://localhost:3000/';
  private grupo: number = 0;

  constructor(private http: HttpClient) {}

  getProfile(): number {
    return this.grupo;
  }

  getUnits(materiaId: string): Observable<Unit[]> {
    console.log('Materia ID en el servicio de recomendacion: ', materiaId);
    return this.http.get<Unit[]>(this.urlAPI + 'unidades/materia/' + materiaId);
  }

  getUnitById(id: string): Observable<Unit> {
    return this.http.get<Unit>(this.urlAPI + 'unidades/' + id + '/with-temas');
  }

  getTopics(unitId: string): Observable<Topic[]> {
    const unit = this.getUnitById(unitId);
    return unit.pipe(map((u) => u.temas));
  }

  getTopicById(unitId: string, topicId: string): Observable<Topic | undefined> {
    const unit = this.getUnitById(unitId);
    return unit.pipe(map((u) => u.temas.find((t) => t.id === Number(topicId))));
  }

  getRecomendacion(temaId: number, nro_cuenta: number): Observable<any[]> {
    return this.http.get<any[]>(
      this.urlAPI +
        'perfil-final-inventario-de-felder/recomendacion/' +
        nro_cuenta +
        '/tema/' +
        temaId
    );
  }
}
