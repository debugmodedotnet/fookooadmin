import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { v4 as uuidv4 } from 'uuid';
import { IQuizQuestion } from '../modules/quiz-question';

@Component({
  selector: 'app-add-new-quiz',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './add-new-quiz.component.html',
  styleUrl: './add-new-quiz.component.scss'
})
// Inside add-new-quiz.component.ts
export class AddNewQuizComponent implements OnInit {
  newQuizForm: FormGroup;

  @Output() formClosed = new EventEmitter<any>();

  technologies = ['JavaScript', 'Python', 'Angular', 'React'];
 
  constructor(private fb: FormBuilder, private firestore: AngularFirestore) {
    this.newQuizForm = this.fb.group({
      name: ['', Validators.required],
      logo: [null],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      totalMarks: ['', [Validators.required, Validators.min(1)]],
      passingMarks: ['', [Validators.required, Validators.min(1)]],
      numberOfQuestions: ['', [Validators.required, Validators.min(1)]],
      isPrivate: [false],
      isActive: [false]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.newQuizForm.valid) {
      const newQuizId = uuidv4();  // Generate a unique ID
      const formData = this.newQuizForm.value;
      
      // Construct the quiz data
      const quizData: IQuizQuestion = {
        id: newQuizId,
        ...formData,
        createdAt: new Date()  // Add timestamp
      };

      // Save the quiz data to Firestore
      this.firestore.collection('quiz').doc(newQuizId).set(quizData)
        .then(() => {
          console.log('New quiz added successfully with ID:', newQuizId);
          this.resetForm();
          this.formClosed.emit(false);  // Emit false to indicate form closure
        })
        .catch(error => {
          console.error('Error adding new quiz:', error);
        });
    }
  }
  
  resetForm(): void {
    this.newQuizForm.reset();
    this.formClosed.emit(false); 
  }

  onCancel(): void {
    this.resetForm();
  }
}

