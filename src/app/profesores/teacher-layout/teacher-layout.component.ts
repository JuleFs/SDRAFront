import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeacherSidebarComponent } from '../sidebar/sidebar.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-teacher-layout',
  standalone: true,
  imports: [CommonModule, TeacherSidebarComponent, RouterModule],
  templateUrl: './teacher-layout.component.html',
})
export class TeacherLayoutComponent {}
