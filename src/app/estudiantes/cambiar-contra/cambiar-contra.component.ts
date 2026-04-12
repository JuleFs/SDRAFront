import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AlumnoService } from '../../services/alumno.service'; // ajusta la ruta

// Validador personalizado: las contraseñas deben coincidir
function passwordMatchValidator(control: AbstractControl) {
  const newPass = control.get('newPassword')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return newPass && confirm && newPass !== confirm ? { mismatch: true } : null;
}
@Component({
  selector: 'app-cambiar-contra',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './cambiar-contra.component.html',
})
export class CambiarContraComponent {
  passwordForm!: FormGroup;

  // Estados UI
  loading = false;
  success = false;
  apiError = '';

  // Visibilidad campos
  showCurrent = false;
  showNew = false;
  showConfirm = false;

  constructor(
    private fb: FormBuilder,
    private alumnoService: AlumnoService,
  ) {}

  ngOnInit(): void {
    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/), // al menos 1 mayúscula y 1 número
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      { validators: passwordMatchValidator },
    );
  }

  // ─── Getters de conveniencia ──────────────────────────────────────────────

  get passwordMismatch(): boolean {
    const form = this.passwordForm;
    return (
      form.hasError('mismatch') && (form.get('confirmPassword')?.dirty ?? false)
    );
  }

  isFieldInvalid(field: string): boolean {
    const control = this.passwordForm.get(field);
    return !!(control?.invalid && control?.touched);
  }

  // ─── Fortaleza de contraseña ──────────────────────────────────────────────

  private getStrengthScore(): number {
    const value: string = this.passwordForm.get('newPassword')?.value ?? '';
    let score = 0;
    if (value.length >= 8) score++;
    if (value.length >= 12) score++;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
    if (/\d/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;
    return Math.min(score, 4); // 0-4
  }

  getStrengthBarClass(bar: number): string {
    const score = this.getStrengthScore();
    if (bar > score) return 'bg-slate-700';
    const colors = [
      '',
      'bg-red-500',
      'bg-orange-400',
      'bg-yellow-400',
      'bg-emerald-500',
    ];
    return colors[score] ?? 'bg-slate-700';
  }

  getStrengthLabel(): string {
    const labels = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'];
    return labels[this.getStrengthScore()] ?? '';
  }

  getStrengthTextClass(): string {
    const classes = [
      '',
      'text-red-400',
      'text-orange-400',
      'text-yellow-400',
      'text-emerald-400',
    ];
    return classes[this.getStrengthScore()] ?? '';
  }

  // ─── Submit ───────────────────────────────────────────────────────────────

  onSubmit(): void {
    this.passwordForm.markAllAsTouched();
    this.apiError = '';

    if (this.passwordForm.invalid) return;

    const { currentPassword, newPassword } = this.passwordForm.value;

    const infoAlumnoStr = localStorage.getItem('info_alumno');
    if (!infoAlumnoStr) {
      this.apiError =
        'No se encontró información del alumno. Por favor, reinicia sesión.';
      return;
    }

    const infoAlumno = JSON.parse(infoAlumnoStr);
    const nro_cuenta = infoAlumno.nro_cuenta;

    if (!nro_cuenta) {
      this.apiError = 'Error al identificar la cuenta del alumno.';
      return;
    }

    this.loading = true;

    this.alumnoService
      .cambiarContrasena({ nro_cuenta, currentPassword, newPassword })
      .subscribe({
        next: () => {
          this.loading = false;
          this.success = true;
        },
        error: (err: any) => {
          this.loading = false;
          // El backend devuelve 401 cuando la contraseña actual es incorrecta
          this.apiError =
            err.status === 401
              ? 'La contraseña actual es incorrecta.'
              : 'Ocurrió un error. Inténtalo de nuevo más tarde.';
        },
      });
  }

  resetForm(): void {
    this.success = false;
    this.apiError = '';
    this.passwordForm.reset();
  }
}
