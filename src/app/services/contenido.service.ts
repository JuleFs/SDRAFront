// src/app/services/content.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Unit,
  Topic,
  Resource,
} from '../estudiantes/recomendacion/tipos.model';

@Injectable({
  providedIn: 'root',
})
export class ContentService {
  private apiUrl: string = environment.apiUrl || 'http://localhost:3000/';
  private unitsChangedSubject = new Subject<void>();
  public unitsChanged$ = this.unitsChangedSubject.asObservable();

  constructor(private http: HttpClient) {}

    notifyUnitsChanged(): void {
    this.unitsChangedSubject.next();
  }

  loginProfesor(data: any): Observable<any> {
    return this.http.post(this.apiUrl + 'profesores/login', data);
  }

  // UNIDADES
  getUnits(materiaId: string): Observable<Unit[]> {
    return this.http.get<Unit[]>(
      `${this.apiUrl}unidades/materia/` + materiaId
    );
  }

  getUnitById(id: string): Observable<Unit> {
    return this.http.get<Unit>(this.apiUrl + 'unidades/' + id + '/with-temas');
  }

  createUnit(unit: Partial<Unit>): Observable<Unit> {
    return this.http.post<Unit>(`${this.apiUrl}unidades`, unit);
  }

  updateUnit(id: string, unit: Partial<Unit>): Observable<Unit> {
    return this.http.put<Unit>(`${this.apiUrl}unidades/${id}`, unit);
  }

  deleteUnit(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}unidades/${id}`);
  }

  // TEMAS
  getTopics(unitId: string): Observable<Topic[]> {
    return this.http.get<Topic[]>(`${this.apiUrl}temas/${unitId}`);
  }

  getTopicById(unitId: string, topicId: string): Observable<Topic | undefined> {
      const unit = this.getUnitById(unitId);
      return unit.pipe(map((u) => u.temas.find((t) => t.id === Number(topicId))));
    }

  createTopic(topic: Partial<Topic>): Observable<Topic> {
    return this.http.post<Topic>(`${this.apiUrl}temas`, topic);
  }

  updateTopic(id: string, topic: Partial<Topic>): Observable<Topic> {
    return this.http.put<Topic>(`${this.apiUrl}temas/${id}`, topic);
  }

  deleteTopic(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}temas/${id}`);
  }

  // OBJETOS DE APRENDIZAJE
  getObjetosAprendizaje(idTema: string): Observable<Resource[]> {
    return this.http.get<Resource[]>(`${this.apiUrl}objetos-aprendizaje/tema/${idTema}`);
  }

  createLearningObject(data: any): Observable<Resource> {
    return this.http.post<Resource>(
      `${this.apiUrl}objetos-aprendizaje`,
      data
    );
  }

  createLearningObjectWithFile(
    formData: FormData,
    file: File
  ): Observable<Resource> {
    return this.http.post<Resource>(
      `${this.apiUrl}objetos-aprendizaje/upload`,
      formData
    );
  }

  updateLearningObject(id: string, formData: FormData): Observable<Resource> {
    return this.http.put<Resource>(
      `${this.apiUrl}objetos-aprendizaje/${id}`,
      formData
    );
  }

  deleteLearningObject(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}objetos-aprendizaje/${id}`);
  }
}
