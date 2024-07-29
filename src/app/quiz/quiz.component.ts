import { Component, OnInit, inject } from '@angular/core';
import { QuizService } from '../services/quiz.service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IQuizQuestion } from '../modules/quiz-question';
import { first } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { shuffleItems } from '../utils/common-util';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.scss'
})
export class QuizComponent implements OnInit {

  readonly TOTAL_ALLOWED_ATTEMPTS = 10;
  quizForm: FormGroup;
  totalAttemptedQuestions = 0;
  question?: IQuizQuestion;
  userId?: string;

  private quizService = inject(QuizService);
  private afAuth = inject(AngularFireAuth);
  private fb = inject(FormBuilder);

  constructor() {
    this.quizForm = this.fb.group({
      optionId: new FormControl(null, [Validators.required])
    });
  }

  async ngOnInit(): Promise<void> {
    this.afAuth.user.pipe(first()).subscribe(async res => {
      console.log(res)
      this.userId = res?.uid;
      this.loadNewQuestion();
    });
  }

  async handleNextClick(): Promise<void> {
    if (this.quizForm.valid) {
      if (!this.question?.id) {
        throw new Error("questionId not found");
      }
      console.log("submitted: ", this.quizForm.get('optionId')?.value)
      await this.quizService.addAttempt({
        userId: this.getUserId(),
        questionId: this.question?.id,
        optionId: this.quizForm.get('optionId')?.value,
      });
      this.loadNewQuestion();
      this.quizForm.reset();
    }
  }

  getUserId(): string {
    if (!this.userId) {
      throw new Error("UserId not found");
    }
    return this.userId;
  }

  getQuestion(questionIdsToExclude: string[]): void {
    this.quizService.getQuestion(questionIdsToExclude).pipe(first()).subscribe(firstRes => {
      console.log(">>>>> first res", firstRes, questionIdsToExclude)
      if (firstRes.length) {
        this.question = firstRes[0];
        shuffleItems(this.question.options);
      }
      else {
        this.quizService.getQuestion(questionIdsToExclude, 1).pipe(first()).subscribe(secondRes => {
          console.log(">>>>> second res", firstRes, questionIdsToExclude)
          if (!secondRes.length) {
            throw new Error("Didn't find question");
          }
          this.question = secondRes[0];
          shuffleItems(this.question.options);
        });
      }
    });
  }

  loadNewQuestion(): void {
    this.quizService.getAttemptedQuestions(this.getUserId()).pipe(first()).subscribe(res => {
      console.log(res)
      this.totalAttemptedQuestions = res.length;
      if (this.totalAttemptedQuestions < this.TOTAL_ALLOWED_ATTEMPTS) {
        this.getQuestion(res.map((attemptedQuestion) => attemptedQuestion.questionId));
      }
    });
  }
}
