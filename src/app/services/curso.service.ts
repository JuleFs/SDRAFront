import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  Course,
  Unit,
  Topic,
  Resource,
} from '../estudiantes/recomendacion/tipos.model';

@Injectable({ providedIn: 'root' })
export class CursoService {
  private _courses = new BehaviorSubject<Course[]>([
    {
      id: 'c1',
      name: 'Ejemplo curso 1',
      semester: 'Semestre IX',
      progress: 0,
      units: [
        {
          id: 'unit1',
          title: 'Unidad 1',
          objective: 'Introducción a la programación',
          topics: [
            {
              id: 'topic1',
              name: 'Algoritmos y pseudocódigo',
              description: 'Conceptos básicos de algoritmos',
              learningObjects: [
                {
                  id: 'r1',
                  title: 'Video: Qué es un algoritmo',
                  type: 'video',
                  url: 'https://www.youtube.com/watch?v=f10jKIslSUY&pp=ygUTcXVlIGVzIHVuIGFsZ29yaXRtbw%3D%3D',
                  suitability: {
                    visual: 90,
                    auditory: 70,
                    kinesthetic: 40,
                    reading: 50,
                  },
                  description: 'Video introductorio',
                },
              ],
            },
          ],
        },
        {
          id: 'unit2',
          title: 'Unidad 2 - Estructuras Condicionales',
          objective: 'Aprender condicionales simples y anidados',
          topics: [
            {
              id: 'topic2',
              name: 'If, If-Else, Switch',
              description: 'Estructuras condicionales en programación',
              learningObjects: [
                {
                  id: 'r10',
                  title: 'Lectura: Estructuras condicionales',
                  type: 'document',
                  url: 'https://example.com/anim1',
                  suitability: {
                    visual: 95,
                    auditory: 30,
                    kinesthetic: 60,
                    reading: 40,
                  },
                  description:
                    'Documento pdf del tema de estructuras condicionales',
                },
                {
                  id: 'r11',
                  title: 'Video: Estructuras condicionales (intro)',
                  type: 'video',
                  url: 'https://example.com/video-if',
                  suitability: {
                    visual: 85,
                    auditory: 80,
                    kinesthetic: 40,
                    reading: 50,
                  },
                  description: 'Breve video',
                },
                {
                  id: 'r12',
                  title: 'Lectura: If-Else ejemplos',
                  type: 'document',
                  url: 'https://example.com/reading1',
                  suitability: {
                    visual: 40,
                    auditory: 30,
                    kinesthetic: 20,
                    reading: 95,
                  },
                  description: 'Ejemplos de estructuras condicionales',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'c2',
      name: 'Ejemplo curso 2',
      semester: 'Semestre IX',
      progress: 0,
      units: [],
    },
  ]);

  course$ = this._courses.asObservable();

  addUnit(unit: Unit) {
    const current = this._courses.value;
    current[0].units.push(unit);
    this._courses.next({ ...current });
  }

  addTopic(unitId: string, topic: Topic) {
    const current = this._courses.value;
    const unit = current[0].units.find((u) => u.id === unitId);
    if (unit) {
      unit.topics.push(topic);
      this._courses.next({ ...current });
    }
  }

  addLearningObject(unitId: string, topicId: string, obj: Resource) {
    const current = this._courses.value;
    const unit = current[0].units.find((u) => u.id === unitId);
    const topic = unit?.topics.find((t) => t.id === topicId);
    if (topic) {
      topic.learningObjects.push(obj);
      this._courses.next({ ...current });
    }
  }

  private courses: Course[] = [
    {
      id: 'c1',
      name: 'Ejemplo curso 1',
      semester: 'Semestre IX',
      progress: 0,
      units: [
        {
          id: 'unit1',
          title: 'Unidad 1',
          objective: 'Introducción a la programación',
          topics: [
            {
              id: 'topic1',
              name: 'Algoritmos y pseudocódigo',
              description: 'Conceptos básicos de algoritmos',
              learningObjects: [
                {
                  id: 'r1',
                  title: 'Video: Qué es un algoritmo',
                  type: 'video',
                  url: 'https://www.youtube.com/watch?v=f10jKIslSUY&pp=ygUTcXVlIGVzIHVuIGFsZ29yaXRtbw%3D%3D',
                  suitability: {
                    visual: 90,
                    auditory: 70,
                    kinesthetic: 40,
                    reading: 50,
                  },
                  description: 'Video introductorio',
                },
              ],
            },
          ],
        },
        {
          id: 'unit2',
          title: 'Unidad 2 - Estructuras Condicionales',
          objective: 'Aprender condicionales simples y anidados',
          topics: [
            {
              id: 'topic2',
              name: 'If, If-Else, Switch',
              description: 'Estructuras condicionales en programación',
              learningObjects: [
                {
                  id: 'r10',
                  title: 'Lectura: Estructuras condicionales',
                  type: 'document',
                  url: 'https://example.com/anim1',
                  suitability: {
                    visual: 95,
                    auditory: 30,
                    kinesthetic: 60,
                    reading: 40,
                  },
                  description: 'Documento pdf del tema de estructuras condicionales',
                },
                {
                  id: 'r11',
                  title: 'Video: Estructuras condicionales (intro)',
                  type: 'video',
                  url: 'https://example.com/video-if',
                  suitability: {
                    visual: 85,
                    auditory: 80,
                    kinesthetic: 40,
                    reading: 50,
                  },
                  description: 'Breve video',
                },
                {
                  id: 'r12',
                  title: 'Lectura: If-Else ejemplos',
                  type: 'document',
                  url: 'https://example.com/reading1',
                  suitability: {
                    visual: 40,
                    auditory: 30,
                    kinesthetic: 20,
                    reading: 95,
                  },
                  description: 'Ejemplos de estructuras condicionales',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'c2',
      name: 'Ejemplo curso 2',
      semester: 'Semestre IX',
      progress: 0,
      units: [],
    },
  ];

  getCourses(): Course[] {
    return this.courses;
  }
  getCourseById(id: string): Course | undefined {
    return this.courses.find((c) => c.id === id);
  }
}
