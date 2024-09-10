import { NgClass } from '@angular/common';
import { Component, ElementRef, ViewChild, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';
import { IQuizQuestion } from '../modules/quiz-question';
import { IQuizTechnology } from '../modules/quiz-technology';
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-createquiz',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, NgClass, FormsModule, QuillModule],
  templateUrl: './createquiz.component.html',
  styleUrls: ['./createquiz.component.scss']
})
export class CreatequizComponent implements OnInit {

  @ViewChild('formSection') formSection!: ElementRef;

  quizForm: FormGroup;
  technologyForm: FormGroup;
  technologyCreationForm: FormGroup;
  quizzes: IQuizQuestion[] = [];
  technologies: IQuizTechnology[] = [];

  currentQuizId?: string;
  selectedTechnology?: string;

  formVisible = false;
  editMode = false;
  technologyEditMode = false;
  isOptionsInvalid = false;
  technologySelected = false;
  showQuestionsTable = false;
  showTechnologyTable = true;
  isAddingNewTechnology = false;


  private cd = inject(ChangeDetectorRef);
  private firestore = inject(AngularFirestore);
  private fb = inject(FormBuilder);

  constructor() {
    this.quizForm = this.fb.group({
      question: ['', [Validators.required]],
      order: ['', [Validators.required]],
      options: this.fb.array([this.createOption(1)], [Validators.required, Validators.minLength(2)]),
      answerId: ['', [Validators.required]],
    });

    this.technologyForm = this.fb.group({
      technology: ['select technology', [Validators.required]],
    });

    this.technologyCreationForm = this.fb.group({
      Name: ['', [Validators.required]],
      logo: [''],
      StartDate: [''],
      EndDate: [''],
      TotalMarks: [''],
      numberOfQuestions: [''],
      isPrivate: [false],
      isActive: [true],
    });
  }

  ngOnInit(): void {
    this.loadTechnologies();
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

  addOption(): void {
    const newOrder = this.options.length + 1;
    this.options.push(this.createOption(newOrder));
  }

  removeOption(index: number): void {
    if (this.options.length > 1) {
      this.options.removeAt(index);
    }
  }

  loadTechnologies(): void {
    this.firestore.collection<IQuizTechnology>('quiz').valueChanges({ idField: 'id' }).subscribe(
      (data: IQuizTechnology[]) => {
        this.technologies = data;
      },
      error => {
        console.error('Error loading technologies:', error);
      }
    );
  }

  viewQuestions(tech: IQuizTechnology): void {
    this.selectedTechnology = tech.Name;
    this.showTechnologyTable = false;
    this.showQuestionsTable = true;
    this.loadQuestions();
  }

  loadQuestions(): void {
    if (this.selectedTechnology) {
      this.firestore.collection<IQuizQuestion>(`quiz/${this.selectedTechnology}/questions`).valueChanges({ idField: 'id' }).subscribe(
        (data: IQuizQuestion[]) => {
          this.quizzes = data;
        },
        error => {
          console.error('Error loading quizzes:', error);
        }
      );
    } else {
      console.warn('No technology selected.');
    }
  }

  hideQuestionsTable(): void {
    this.showTechnologyTable = true;
    this.showQuestionsTable = false;
  }

  addOrUpdateQuestions(): void {
    if (this.quizForm.invalid || !this.quizForm.value.answerId) {
      this.isOptionsInvalid = true;
      return;
    }

    if (this.editMode && this.currentQuizId) {
      this.updateQuestions(this.currentQuizId, this.quizForm.value);
    } else {
      this.addQuestions();
    }
  }

  addQuestions(): void {
    if (this.quizForm.valid) {
      this.firestore.collection('quiz').doc(this.selectedTechnology!).collection('questions').add(this.quizForm.value)
        .then(() => {
          this.updateNumberOfQuestions(1);
          this.resetForms();
          this.loadQuestions();
          this.cd.detectChanges();
        })
        .catch(error => {
          console.error('Error adding quiz:', error);
        });
    }
  }

  updateQuestions(id: string, quiz: IQuizQuestion): void {
    this.firestore.collection('quiz').doc(this.selectedTechnology!).collection('questions').doc(id).update(quiz)
      .then(() => {
        this.resetForms();
        this.loadQuestions();
      })
      .catch(error => {
        console.error('Error updating quiz:', error);
      });
  }

  updateNumberOfQuestions(change: number): void {
    const techDocRef = this.firestore.collection('quiz').doc(this.selectedTechnology!);

    techDocRef.get().subscribe((doc) => {
      if (doc.exists) {
        const techData = doc.data() as IQuizTechnology;

        const currentCount = techData.numberOfQuestions || 0;
        techDocRef.update({ numberOfQuestions: currentCount + change })
          .catch(error => console.error('Error updating number of questions:', error));
      } else {
        console.error('Technology not found!');
      }
    });
  }

  editQuestions(quiz: IQuizQuestion): void {
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

  deleteQuestions(id: string): void {
    if (confirm('Are you sure you want to delete this quiz?')) {
      this.firestore.collection('quiz').doc(this.selectedTechnology!).collection('questions').doc(id).delete()
        .then(() => {
          this.updateNumberOfQuestions(-1);
          this.loadQuestions();
        })
        .catch(error => {
          console.error('Error deleting quiz:', error);
        });
    }
  }

  showCreateTechnologyForm(): void {
    this.isAddingNewTechnology = true;
    this.formVisible = false;
    this.technologyEditMode = false;
  }

  // createTechnology(): void {
  //   const techName = this.technologyCreationForm.value.Name;
  //   this.firestore.collection('quiz').doc(techName).get().subscribe(docSnapshot => {
  //     if (docSnapshot.exists) {
  //       alert('Technology name already exists. Please choose a different name.');
  //     } else {
  //       this.firestore.collection('quiz').doc(techName).set(this.technologyCreationForm.value)
  //         .then(() => {
  //           this.resetForms();
  //           this.loadTechnologies();
  //         })
  //         .catch(error => {
  //           console.error('Error adding technology:', error);
  //         });
  //     }
  //   });
  // }

  createTechnology(): void {
    const techData = this.technologyCreationForm.getRawValue();
    const techName = techData.Name;

    if (this.technologyEditMode) {
      this.firestore.collection('quiz').doc(techName).update({
        logo: techData.logo,
        StartDate: techData.StartDate,
        EndDate: techData.EndDate,
        TotalMarks: techData.TotalMarks,
        numberOfQuestions: techData.numberOfQuestions,
        isPrivate: techData.isPrivate,
        isActive: techData.isActive,
      })
        .then(() => {
          this.resetForms();
          this.loadTechnologies();
          this.technologyCreationForm.get('Name')?.enable();
        })
        .catch(error => {
          console.error('Error updating technology:', error);
        });
    } else {
      this.firestore.collection('quiz').doc(techName).set(techData)
        .then(() => {
          this.resetForms();
          this.loadTechnologies();
        })
        .catch(error => {
          console.error('Error adding technology:', error);
        });
    }
  }

  editTechnology(tech: IQuizTechnology): void {
    this.technologyCreationForm.patchValue(tech);
    this.isAddingNewTechnology = true;
    this.technologyEditMode = true;
    this.scrollToForm();

    if (this.technologyEditMode) {
      this.technologyCreationForm.get('Name')?.disable();
    }
  }

  deleteTechnology(tech: IQuizTechnology): void {
    if (confirm('Are you sure you want to delete this technology?')) {
      this.firestore.collection('quiz').doc(tech.Name).delete()
        .then(() => {
          this.loadTechnologies();
        })
        .catch(error => {
          console.error('Error deleting technology:', error);
        });
    }
  }

  showTechnologyForm(): void {
    this.formVisible = true;
  }

  hideTechnologyForm(): void {
    this.isAddingNewTechnology = false;
    this.formVisible = false;
  }

  onTechnologySelect(): void {
    if (this.technologyForm.valid) {
      this.selectedTechnology = this.technologyForm.get('technology')?.value;
      this.technologySelected = true;
      this.loadQuestions();
    }
  }

  onSubmit(): void {
    if (this.quizForm.invalid || !this.quizForm.get('answerId')?.value) {
      this.isOptionsInvalid = true;
      return;
    }

    this.addOrUpdateQuestions();
  }

  scrollToForm(): void {
    if (this.formSection) {
      this.formSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  resetForms(): void {
    this.quizForm.reset({
      question: '',
      order: '',
      //options: this.fb.array([this.createOption(1)]),
      answerId: '',
    });

    const optionsArray = this.quizForm.get('options') as FormArray;
    optionsArray.clear();
    optionsArray.push(this.createOption(1));

    this.technologyForm.reset({
      technology: 'select technology'
    });

    this.technologyCreationForm.reset();
    this.technologyEditMode = false;
    this.editMode = false;
    this.currentQuizId = undefined;
    this.formVisible = false;
    this.isOptionsInvalid = false;
    this.technologySelected = false;
    this.isAddingNewTechnology = false;
  }

  hideForms(): void {
    this.resetForms();
  }
}