import { Injectable, inject } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { documentId } from "firebase/firestore";
import { IQuizQuestion } from '../modules/quiz-question';
import { Observable, map } from 'rxjs';
import { IQuizAttemptedQuestion } from '../modules/quiz-attempted-question';
import { getRandomInt } from '../utils/common-util';

@Injectable({
  providedIn: 'root'
})
export class QuizService {

  private readonly maxOrderValue = 10;
  private readonly quizCollection = 'quiz';
  private readonly quizAttemptCollection = 'quiz-attempt';

  private firestore = inject(AngularFirestore);

  getQuestion(questionIdsToExclude: string[], orderValue: number = getRandomInt(1, this.maxOrderValue)): Observable<IQuizQuestion[]> {
    let collection: AngularFirestoreCollection<IQuizQuestion>;
    if (questionIdsToExclude.length) {
      collection = this.firestore.collection<IQuizQuestion>(this.quizCollection, ref => ref
        .where(documentId(), 'not-in', questionIdsToExclude)
        .where('order', '>=', orderValue)
        .orderBy('order')
        .limit(1)
      );
    } else {
      collection = this.firestore.collection<IQuizQuestion>(this.quizCollection, ref => ref
        .where('order', '>=', orderValue)
        .orderBy('order')
        .limit(1)
      );
    }
    return collection.snapshotChanges()
      .pipe(
        map(changes =>
          changes.map(a => {
            const data = a.payload.doc.data() as IQuizQuestion;
            const id = a.payload.doc.id;
            return { ...data, id };
          })
        )
      );
  }

  async addAttempt(attemptedQuestion: IQuizAttemptedQuestion): Promise<void> {
    await this.firestore.collection(this.quizAttemptCollection).add(attemptedQuestion);
  }

  getAttemptedQuestions(userId: string): Observable<IQuizAttemptedQuestion[]> {
    return this.firestore.collection<IQuizAttemptedQuestion>(this.quizAttemptCollection, ref => ref
      .where('userId', '==', userId)
    ).snapshotChanges().pipe(
      map(changes =>
        changes.map(a => {
          const data = a.payload.doc.data() as IQuizAttemptedQuestion;
          const id = a.payload.doc.id;
          return { ...data, id };
        })
      )
    );
  }
}
