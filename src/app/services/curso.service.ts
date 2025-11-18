import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import {
  Course,
  Unit,
  Topic,
  Resource,
} from '../estudiantes/recomendacion/tipos.model';
import { HttpClient } from '@angular/common/http';
import { info } from 'console';

@Injectable({ providedIn: 'root' })
export class CursoService {
  private urlAPI: string = 'http://localhost:3000/';

  constructor(private http: HttpClient) {}

  addUnit(unit: Unit) {}

  addTopic(unitId: string, topic: Topic) {}

  addLearningObject(unitId: string, topicId: string, obj: Resource) {}

  getCourses(grupo: number): Observable<Course[]> {
    return this.http.get<Course[]>(this.urlAPI + 'materias/grupo/' + grupo);
  }
}
