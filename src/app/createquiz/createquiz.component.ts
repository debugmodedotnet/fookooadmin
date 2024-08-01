import { Component, inject } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { QuizService } from '../services/quiz.service';
import { CommonModule,NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-createquiz',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './createquiz.component.html',
  styleUrl: './createquiz.component.scss'
})
export class CreatequizComponent {
  quizForm: FormGroup;
  quizzes: any[] = [];
  private firestore = inject(AngularFirestore);
  isOptionsInvalid = false;

  constructor() {
    this.quizForm = new FormGroup({
      question: new FormControl('', Validators.required),
      options: new FormArray([this.createOption()]) // Start with one option
    });
  }

  get options(): FormArray {
    return this.quizForm.get('options') as FormArray;
  }

  createOption(): FormGroup {
    return new FormGroup({
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
      const quizData = this.quizForm.value;
      this.firestore.collection('quizzes').add(quizData)
        .then(docRef => {
          console.log(`Document written with ID: ${docRef.id}`);
          this.quizForm.reset();
          this.isOptionsInvalid = false;
          this.loadQuizzes(); // Reload the quizzes to reflect the new data
        })
        .catch(error => {
          console.error("Error adding document: ", error);
        });
    } else {
      this.isOptionsInvalid = true;
    }
  }

  loadQuizzes(): void {
    this.firestore.collection('quizzes').snapshotChanges()
      .subscribe(data => {
        this.quizzes = data.map(e => {
          return {
            id: e.payload.doc.id,
            ...e.payload.doc.data() as any
          };
        });
      });
  }

  onEdit(id: string): void {
    // Implement edit functionality
  }

  onDelete(id: string): void {
    if (confirm("Are you sure you want to delete this quiz?")) {
      this.firestore.collection('quizzes').doc(id).delete()
        .then(() => {
          console.log(`Document with ID ${id} deleted`);
          this.loadQuizzes(); // Reload the quizzes to reflect the deletion
        })
        .catch(error => {
          console.error("Error deleting document: ", error);
        });
    }
  }

  onCancel(): void {
    // Implement cancel functionality (e.g., navigate back or reset the form)
  }

}
