// src/app/services/content.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Unit, Topic, Resource } from '../estudiantes/recomendacion/tipos.model';

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private apiUrl: string = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // UNIDADES
  getUnits(materiaId: string): Observable<Unit[]> {
    return this.http.get<Unit[]>(`${this.apiUrl}/unidades/materia/` + materiaId);
  }

  createUnit(unit: Partial<Unit>): Observable<Unit> {
    return this.http.post<Unit>(`${this.apiUrl}/unidades`, unit);
  }

  updateUnit(id: string, unit: Partial<Unit>): Observable<Unit> {
    return this.http.patch<Unit>(`${this.apiUrl}/unidades/${id}`, unit);
  }

  deleteUnit(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/unidades/${id}`);
  }

  // TEMAS
  createTopic(topic: Partial<Topic>): Observable<Topic> {
    return this.http.post<Topic>(`${this.apiUrl}/temas`, topic);
  }

  updateTopic(id: string, topic: Partial<Topic>): Observable<Topic> {
    return this.http.patch<Topic>(`${this.apiUrl}/temas/${id}`, topic);
  }

  deleteTopic(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/temas/${id}`);
  }

  // OBJETOS DE APRENDIZAJE
  getObjetosAprendizaje(): Observable<Resource[]> {
    return this.http.get<Resource[]>(`${this.apiUrl}/objetos-aprendizaje`);
  }

  createLearningObject(formData: FormData): Observable<Resource> {
    return this.http.post<Resource>(`${this.apiUrl}/objetos-aprendizaje`, formData);
  }

  createLearningObjectWithFile(formData: FormData, file: File): Observable<Resource> {
    formData.append('contenido', file, file.name);
    return this.http.post<Resource>(`${this.apiUrl}/objetos-aprendizaje/upload`, formData);
  }

  updateLearningObject(id: string, formData: FormData): Observable<Resource> {
    return this.http.patch<Resource>(`${this.apiUrl}/objetos-aprendizaje/${id}`, formData);
  }

  deleteLearningObject(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/objetos-aprendizaje/${id}`);
  }
}