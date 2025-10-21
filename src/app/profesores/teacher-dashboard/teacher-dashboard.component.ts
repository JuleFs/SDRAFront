import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CursoService } from  '../../services/curso.service';
import { Course } from '../../estudiantes/recomendacion/tipos.model';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teacher-dashboard.component.html',
  styleUrls: ['./teacher-dashboard.component.css']
})
export class TeacherDashboardComponent {
  unitName = '';
  unitDescription = '';
  selectedUnitId: string | null = null;
  topicName = '';
  topicDescription = '';
  oaName = '';
  oaDescription = '';
  oaUrl = '';
  oaType: 'video' | 'image' | 'document' | 'external'= 'external';
  course: Course | null = null;

  constructor(private courseSrv: CursoService) {
    this.courseSrv.course$.subscribe((course: Course[]) => {
      this.course = course[0];
    });
  }

  addUnit() {
    this.courseSrv.addUnit({
      id: Date.now().toString(),
      title: this.unitName,
      objective: this.unitDescription,
      topics: []
    });
    this.unitName = '';
    this.unitDescription = '';
  }

  addTopic() {
    if (!this.selectedUnitId) return;
    this.courseSrv.addTopic(this.selectedUnitId, {
      id: Date.now().toString(),
      name: this.topicName,
      description: this.topicDescription,
      learningObjects: []
    });
    this.topicName = '';
    this.topicDescription = '';
  }

  addOA() {
    if (!this.selectedUnitId) return;
    const course = this.courseSrv['_courses'].value[0];
    const unit = course.units.find((u) => u.id === this.selectedUnitId);
    const topicId = unit?.topics[0]?.id; // demo: agrega al primer tema
    if (!topicId) return;
    this.courseSrv.addLearningObject(this.selectedUnitId, topicId, {
      id: Date.now().toString(),
      title: this.oaName,
      description: this.oaDescription,
      url: this.oaUrl,
      type: this.oaType,
    });
    this.oaName = this.oaDescription = this.oaUrl = '';
  }
}
