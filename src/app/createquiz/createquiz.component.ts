import { Component, inject } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';
import { IQuizQuestion } from '../modules/quiz-question';
import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-createquiz',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, NgIf, NgFor], // Import NgClass here
  templateUrl: './createquiz.component.html',
  styleUrls: ['./createquiz.component.scss']
})
export class CreatequizComponent {
  quizForm: FormGroup;
  private firestore = inject(AngularFirestore);
  private router = inject(Router);
  isOptionsInvalid = false;
  quiz: IQuizQuestion[] = [];

  constructor() {
    this.quizForm = new FormGroup({
      question: new FormControl('', Validators.required),
      order: new FormControl('', Validators.required),
      options: new FormArray([this.createOption(1)]),
      answerId: new FormControl('')
    });

    this.firestore.collection<IQuizQuestion>('quiz').valueChanges().subscribe((data: IQuizQuestion[]) => {
      this.quiz = data;
    });
  }

  get options(): FormArray {
    return this.quizForm.get('options') as FormArray;
  }

  createOption(order: number): FormGroup {
    return new FormGroup({
      id: new FormControl(uuidv4()),
      value: new FormControl('', Validators.required),
      order: new FormControl(order)
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

      this.firestore.collection('quiz').add(quizData)
        .then(docRef => {
          console.log(`Document written with ID: ${docRef.id}`);
          this.quizForm.reset();
          this.isOptionsInvalid = false;
        })
        .catch(error => {
          console.error("Error adding document: ", error);
        });
    } else {
      this.isOptionsInvalid = true;
    }
  }

  onEdit(id: string): void {
    this.firestore.collection<IQuizQuestion>('quiz').doc(id).get()
      .subscribe(doc => {
        if (doc.exists) {
          const data = doc.data() as IQuizQuestion;
          this.quizForm.setValue({
            question: data?.question || '',
            order: data?.order || '', 
            options: data?.options || [],
            answerId: data?.answerId || ''
          });
        }
      });
  }

  onDelete(id: string): void {
    if (confirm("Are you sure you want to delete this quiz?")) {
      this.firestore.collection('quiz').doc(id).delete()
        .then(() => {
          console.log(`Document with ID ${id} deleted`);
        })
        .catch(error => {
          console.error("Error deleting document: ", error);
        });
    }
  }

  onCancel(): void {
    this.router.navigate(['/quizzes']);
  }
}

