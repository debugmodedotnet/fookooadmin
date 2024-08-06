import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IQuizTechnology } from '../../modules/quiz-technology';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-technology-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './technology-table.component.html',
  styleUrl: './technology-table.component.scss'
})
export class TechnologyTableComponent {

  @Input() technologies: IQuizTechnology[] = [];
  @Output() viewQuestions = new EventEmitter<{ id: string }>();
  @Output() editTechnology = new EventEmitter<IQuizTechnology>();
  @Output() deleteTechnology = new EventEmitter<IQuizTechnology>();

  onViewQuestions(id: string): void {
    this.viewQuestions.emit({ id });
  }

  onEdit(technology: IQuizTechnology): void {
    this.editTechnology.emit(technology);
  }

  onDelete(technology: IQuizTechnology): void {
    if (confirm('Are you sure you want to delete this technology?')) {
      this.deleteTechnology.emit(technology);
    }
  }
}
