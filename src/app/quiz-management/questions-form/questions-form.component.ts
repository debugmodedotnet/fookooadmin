import { Component, EventEmitter, Input, Output } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IQuizQuestion } from '../../modules/quiz-question';
import { CommonModule } from '@angular/common';
import { IQuizTechnology } from '../../modules/quiz-technology';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-questions-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './questions-form.component.html',
  styleUrl: './questions-form.component.scss'
})
export class QuestionsFormComponent {

  @Input() technologies: IQuizTechnology[] = [];
  @Input() showQuizForm: boolean = false;
  @Output() submit = new EventEmitter<IQuizQuestion>();
  @Output() cancel = new EventEmitter<void>();

  quizForm: FormGroup;
  technologyForm: FormGroup;
  selectedTechnology?: IQuizTechnology;
  technologySelected: boolean = false;

  constructor(
    private fb: FormBuilder,
    private firestore: AngularFirestore
  ) {
    this.quizForm = this.fb.group({
      question: ['', Validators.required],
      order: ['', Validators.required],
      options: this.fb.array([this.createOption(1)], Validators.required),
      answerId: ['', Validators.required],
    });

    this.technologyForm = this.fb.group({
      technology: ['', Validators.required],
    });
  }

  ngOnInit(): void { }

  get options(): FormArray {
    return this.quizForm.get('options') as FormArray;
  }

  createOption(order: number): FormGroup {
    return this.fb.group({
      id: [uuidv4()],
      value: ['', Validators.required],
      order: [order]
    });
  }

  addOption(): void {
    const newOrder = this.options.length + 1;
    this.options.push(this.createOption(newOrder));
  }

  removeOption(index: number): void {
    if (this.options.length > 1) {
      this.options.removeAt(index);
    }
  }

  onTechnologySelect(): void {
    const selectedTechnologyId = this.technologyForm.get('technology')?.value;
    if (selectedTechnologyId) {
      this.selectedTechnology = this.technologies.find(tech => tech.id === selectedTechnologyId);
      this.technologySelected = true;
    }
  }

  onSubmit(): void {
    if (this.quizForm.valid && this.selectedTechnology) {
      this.submit.emit({ ...this.quizForm.value, technologyId: this.selectedTechnology.id });
    }
  }

  hideForms(): void {
    this.cancel.emit();
  }
}
