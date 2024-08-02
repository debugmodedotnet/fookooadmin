import { Component, ElementRef, ViewChild, inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';
import { IQuizQuestion } from '../modules/quiz-question';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-createquiz',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './createquiz.component.html',
  styleUrls: ['./createquiz.component.scss']
})
export class CreatequizComponent implements OnInit {
  @ViewChild('formSection') formSection!: ElementRef; // Reference to the form section

  quizForm: FormGroup;
  private firestore = inject(AngularFirestore);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  isOptionsInvalid = false;
  quiz: IQuizQuestion[] = [];
  editMode = false;
  currentQuizId?: string;

  constructor() {
    this.quizForm = this.fb.group({
      question: ['', Validators.required],
      order: ['', Validators.required],
      options: this.fb.array([this.createOption(1)]),
      answerId: ['']
    });

    this.firestore.collection<IQuizQuestion>('quiz').valueChanges({ idField: 'id' }).subscribe((data: IQuizQuestion[]) => {
      this.quiz = data;
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

  loadQuizzes(): void {
    this.firestore.collection<IQuizQuestion>('quiz').valueChanges({ idField: 'id' }).subscribe((data: IQuizQuestion[]) => {
      this.quiz = data;
    });
  }

  onSubmit(): void {
    if (this.quizForm.valid) {
      const quizData = {
        question: this.quizForm.value.question,
        order: this.quizForm.value.order,
        options: this.quizForm.value.options.map((option: any) => ({
          id: option.id,
          value: option.value,
        })),
        answerId: this.quizForm.value.answerId
      };

      if (this.editMode && this.currentQuizId) {
        this.firestore.collection('quiz').doc(this.currentQuizId).update(quizData)
          .then(() => {
            console.log(`Document with ID ${this.currentQuizId} updated`);
            this.resetForm();
            this.loadQuizzes();
          })
          .catch(error => {
            console.error("Error updating document: ", error);
          });
      } else {
        this.firestore.collection('quiz').add(quizData)
          .then(docRef => {
            console.log(`Document written with ID: ${docRef.id}`);
            this.quizForm.reset();
            this.isOptionsInvalid = false;
            this.loadQuizzes();
          })
          .catch(error => {
            console.error("Error adding document: ", error);
          });
      }
    } else {
      this.isOptionsInvalid = true;
    }
  }

  onEdit(id: string): void {
    this.firestore.collection<IQuizQuestion>('quiz').doc(id).get()
      .subscribe(doc => {
        if (doc.exists) {
          const data = doc.data() as IQuizQuestion;
          this.quizForm.patchValue({
            question: data?.question || '',
            order: data?.order || '',
            answerId: data?.answerId || ''
          });

          // Clear current options form array
          this.options.clear();

          // Add options from the fetched data
          data?.options.forEach((option, index) => {
            this.options.push(this.fb.group({
              id: [option.id],
              value: [option.value, Validators.required],
              order: [index + 1]
            }));
          });

          this.editMode = true;
          this.currentQuizId = id;

          // Scroll to the form section
          this.scrollToForm();
        }
      });
  }

  onDelete(id: string): void {
    if (confirm("Are you sure you want to delete this quiz?")) {
      this.firestore.collection('quiz').doc(id).delete()
        .then(() => {
          console.log(`Document with ID ${id} deleted`);
          this.loadQuizzes();
        })
        .catch(error => {
          console.error("Error deleting document: ", error);
        });
    }
  }

  onCancel(): void {
    this.router.navigate(['/quizzes']);
  }

  resetForm(): void {
    this.quizForm.reset({
      question: '',
      order: '',
      options: this.fb.array([this.createOption(1)]),
      answerId: ''
    });
    this.editMode = false;
    this.currentQuizId = undefined;
    this.isOptionsInvalid = false;
  }

  scrollToForm(): void {
    if (this.formSection) {
      this.formSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
