import { Component, inject } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';
import { IQuizQuestion } from '../modules/quiz-question';
import { CommonModule, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-createquiz',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor, CommonModule],
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
      options: new FormArray([this.createOption()]) // Start with one option
    });

    // Fetch quiz data for display
    this.firestore.collection<IQuizQuestion>('quiz').valueChanges().subscribe((data: IQuizQuestion[]) => {
      this.quiz = data;
    });
  }

  get options(): FormArray {
    return this.quizForm.get('options') as FormArray;
  }

  createOption(): FormGroup {
    return new FormGroup({
      id: new FormControl(uuidv4()), // Generate a unique ID for each option
      value: new FormControl('', Validators.required)
    });
  }

  addOption(): void {
    this.options.push(this.createOption());
  }

  removeOption(index: number): void {
    if (this.options.length > 1) {
      this.options.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.quizForm.valid) {
      const quizData: IQuizQuestion = {
        id: uuidv4(), // Generate a unique question ID
        question: this.quizForm.value.question,
        options: this.quizForm.value.options.map((option: any) => ({
          id: option.id || uuidv4(), // Ensure ID is always set
          value: option.value
        }))
      };

      // Store data in Firestore collection 'quiz'
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
    // Fetch and populate quiz data for editing
    this.firestore.collection<IQuizQuestion>('quiz').doc(id).get()
      .subscribe(doc => {
        if (doc.exists) {
          const data = doc.data() as IQuizQuestion;
          // Initialize form with existing data
          this.quizForm.setValue({
            question: data.question || '',
            options: (data.options || []).map(option => ({
              id: option.id || uuidv4(), // Ensure ID is always set
              value: option.value
            }))
          });
        }
      });
  }

  onDelete(id: string): void {
    if (confirm("Are you sure you want to delete this quiz?")) {
      this.firestore.collection('quiz').doc(id).delete()
        .then(() => {
          console.log(`Document with ID ${id} deleted`);
          // Optionally update the local array
          this.quiz = this.quiz.filter(q => q.id !== id);
        })
        .catch(error => {
          console.error("Error deleting document: ", error);
        });
    }
  }

  onCancel(): void {
    // Navigate to the previous page or another route
    this.router.navigate(['/quizzes']); // Adjust the route as needed
  }
}



