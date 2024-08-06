import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IQuizQuestion } from '../../modules/quiz-question';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-questions-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './questions-table.component.html',
  styleUrl: './questions-table.component.scss'
})
export class QuestionsTableComponent {

  @Input() questions: IQuizQuestion[] = [];
  @Output() editQuestion = new EventEmitter<IQuizQuestion>();
  @Output() deleteQuestion = new EventEmitter<string>();

  onEdit(question: IQuizQuestion): void {
    this.editQuestion.emit(question);
  }

  onDelete(id: string): void {
    if (confirm('Are you sure you want to delete this question?')) {
      this.deleteQuestion.emit(id);
    }
  }

}
