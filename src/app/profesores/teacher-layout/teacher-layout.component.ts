import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeacherSidebarComponent } from '../sidebar/sidebar.component';
import { TeacherDashboardComponent } from '../teacher-dashboard/teacher-dashboard.component';

@Component({
  selector: 'app-teacher-layout',
  standalone: true,
  imports: [CommonModule, TeacherSidebarComponent, TeacherDashboardComponent],
  templateUrl: './teacher-layout.component.html',
  styleUrls: ['./teacher-layout.component.css']
})
export class TeacherLayoutComponent {}
