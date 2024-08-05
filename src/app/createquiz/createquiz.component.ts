import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ReactiveFormsModule } from '@angular/forms';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';
import { IQuizQuestion } from '../modules/quiz-question';
import { QuizService } from '../services/quiz.service';

@Component({
  selector: 'app-createquiz',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './createquiz.component.html',
  styleUrls: ['./createquiz.component.scss']
})
export class CreatequizComponent implements OnInit {

  @ViewChild('formSection') formSection!: ElementRef;

  quizForm: FormGroup;
  technologyForm: FormGroup;
  quiz: IQuizQuestion[] = [];

  technologies = ['JavaScript', 'Python', 'Angular', 'React'];
  editMode = false;
  currentQuizId?: string;
  formVisible = false;
  isOptionsInvalid = false;
  selectedTechnology?: string;
  technologySelected = false;

  private firestore = inject(AngularFirestore);
  private fb = inject(FormBuilder);

  constructor() {
    this.quizForm = this.fb.group({
      question: ['', [Validators.required]],
      order: ['', [Validators.required]],
      options: this.fb.array([this.createOption(1)], [Validators.required, Validators.minLength(2)]),
      answerId: ['', [Validators.required]]
    });

    this.technologyForm = this.fb.group({
      technology: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadQuizzes();
  }

  get options(): FormArray {
    return this.quizForm.get('options') as FormArray;
  }

  createOption(order: number): FormGroup {
    return this.fb.group({
      id: [uuidv4()],
      value: ['', [Validators.required]],
      order: [order]
    });
  }

  loadQuizzes(): void {
    if (this.selectedTechnology) {
      this.firestore.collection<IQuizQuestion>(`quiz/${this.selectedTechnology}/quizzes`).valueChanges({ idField: 'id' }).subscribe(
        (data: IQuizQuestion[]) => {
          console.log('Quizzes loaded:', data);
          this.quiz = data;
        },
        error => {
          console.error('Error loading quizzes:', error);
        }
      );
    } else {
      console.warn('No technology selected.');
    }
  }
  

  addOrUpdateQuiz(): void {
    if (this.editMode && this.currentQuizId) {
      this.updateQuiz(this.currentQuizId, this.quizForm.value);
    } else {
      this.addQuiz();
    }
  }

  addQuiz(): void {
    this.firestore.collection('quiz').doc(this.selectedTechnology!).collection('quizzes').add(this.quizForm.value)
      .then(() => {
        this.resetForms();
        this.loadQuizzes();
      })
      .catch(error => {
        console.error('Error adding quiz:', error);
      });
  }

  updateQuiz(id: string, quiz: IQuizQuestion): void {
    this.firestore.collection('quiz').doc(this.selectedTechnology!).collection('quizzes').doc(id).update(quiz)
      .then(() => {
        this.resetForms();
        this.loadQuizzes();
      })
      .catch(error => {
        console.error('Error updating quiz:', error);
      });
  }

  editQuiz(quiz: IQuizQuestion): void {
    this.quizForm.patchValue(quiz);
    this.editMode = true;
    this.currentQuizId = quiz.id;
    this.formVisible = true;
    this.technologySelected = true;

    this.options.clear();
    quiz.options.forEach((option, index) => {
      this.options.push(this.createOption(index + 1));
      this.options.at(index).patchValue(option);
    });

    this.scrollToForm();
  }

  deleteQuiz(id: string): void {
    if (confirm('Are you sure you want to delete this quiz?')) {
      this.firestore.collection('quiz').doc(this.selectedTechnology!).collection('quizzes').doc(id).delete()
        .then(() => {
          this.loadQuizzes();
        })
        .catch(error => {
          console.error('Error deleting quiz:', error);
        });
    }
  }

  resetForms(): void {
    this.quizForm.reset({
      question: '',
      order: '',
      options: this.fb.array([this.createOption(1)]),
      answerId: ''
    });
    this.technologyForm.reset();
    this.editMode = false;
    this.currentQuizId = undefined;
    this.formVisible = false;
    this.isOptionsInvalid = false;
    this.technologySelected = false;
  }

  showTechnologyForm(): void {
    this.formVisible = true;
  }

  onTechnologySelect(): void {
    if (this.technologyForm.valid) {
      this.selectedTechnology = this.technologyForm.get('technology')?.value;
      this.technologySelected = true;
      this.loadQuizzes(); 
    }
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

  onSubmit(): void {
    if (this.quizForm.invalid) {
      this.isOptionsInvalid = true;
      return;
    }

    this.addOrUpdateQuiz();
  }

  scrollToForm(): void {
    if (this.formSection) {
      this.formSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  hideForms(): void {
    this.resetForms();
  }
}