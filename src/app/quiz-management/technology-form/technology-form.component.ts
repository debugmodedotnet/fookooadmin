import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IQuizTechnology } from '../../modules/quiz-technology';

@Component({
  selector: 'app-technology-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './technology-form.component.html',
  styleUrl: './technology-form.component.scss'
})
export class TechnologyFormComponent {
  @Output() technologySelected = new EventEmitter<IQuizTechnology>();

  technologyForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.technologyForm = this.fb.group({
      name: ['', Validators.required],
      logo: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      totalMarks: ['', Validators.required],
      numberOfQuestions: [0],
      isPrivate: [false],
      isActive: [true],
    });
  }

  onSubmit(): void {
    if (this.technologyForm.valid) {
      this.technologySelected.emit(this.technologyForm.value);
    }
  }
}
