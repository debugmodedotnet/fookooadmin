import { Component } from '@angular/core';
import { IQuizTechnology } from '../modules/quiz-technology';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { TechnologyFormComponent } from './technology-form/technology-form.component';
import { QuestionsFormComponent } from './questions-form/questions-form.component';
import { TechnologyTableComponent } from './technology-table/technology-table.component';
import { QuestionsTableComponent } from './questions-table/questions-table.component';
import { CommonModule } from '@angular/common';
import { IQuizQuestion } from '../modules/quiz-question';
import { QuizService } from '../services/quiz.service';

@Component({
  selector: 'app-quiz-management',
  standalone: true,
  imports: [CommonModule, TechnologyFormComponent, QuestionsFormComponent, TechnologyTableComponent, QuestionsTableComponent],
  templateUrl: './quiz-management.component.html',
  styleUrl: './quiz-management.component.scss'
})
export class QuizManagementComponent {

  technologies: IQuizTechnology[] = [];
  questions: IQuizQuestion[] = [];
  selectedTechnology: IQuizTechnology | null = null;
  showTechnologyForm = false;
  showQuizForm = false;

  constructor(private quizService: QuizService) { }

  ngOnInit(): void {
    this.loadTechnologies();
  }

  loadTechnologies(): void {
    this.quizService.getTechnologies().subscribe(technologies => {
      this.technologies = technologies;
    });
  }

  loadQuestions(technologyId: string): void {
    this.quizService.getQuestionsByTechnology(technologyId).subscribe(questions => {
      this.questions = questions;
    });
  }

  showAddEditTechnologyForm(): void {
    this.showTechnologyForm = true;
    this.selectedTechnology = null;
  }

  showAddQuestionForm(): void {
    if (this.selectedTechnology) {
      this.showQuizForm = true;
    } else {
      alert('Please select a technology first.');
    }
  }

  onTechnologySelected(technologyId: string): void {
    this.selectedTechnology = this.technologies.find(tech => tech.id === technologyId) || null;
    if (this.selectedTechnology) {
      this.loadQuestions(technologyId);
    }
  }

  onEditTechnology(technology: IQuizTechnology): void {
    this.selectedTechnology = technology;
    this.showTechnologyForm = true;
  }

  onDeleteTechnology(technology: IQuizTechnology): void {
    if (technology.id) {
      this.quizService.deleteTechnology(technology.id).subscribe(() => {
        this.loadTechnologies();
      });
    }
  }

  onQuestionFormSubmit(question: IQuizQuestion): void {
    if (this.selectedTechnology) {
      this.quizService.addQuestion(this.selectedTechnology.id, question).then(() => {
        this.loadQuestions(this.selectedTechnology.id);
        this.showQuizForm = false;
      });
    }
  }

  onTechnologyFormSubmit(technology: IQuizTechnology): void {
    if (technology.id) {
      this.quizService.updateTechnology(technology.id, technology).then(() => {
        this.loadTechnologies();
        this.showTechnologyForm = false;
      });
    } else {
      this.quizService.addTechnology(technology).then(() => {
        this.loadTechnologies();
        this.showTechnologyForm = false;
      });
    }
  }

  onEditQuestion(question: IQuizQuestion): void {
    // Handle question edit
  }

  onDeleteQuestion(questionId: string): void {
    if (this.selectedTechnology) {
      this.quizService.deleteQuestion(this.selectedTechnology.id, questionId).then(() => {
        this.loadQuestions(this.selectedTechnology.id);
      });
    }
  }
}