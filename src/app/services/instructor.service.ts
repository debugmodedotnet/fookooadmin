import { Injectable, inject } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { IInstructor } from '../modules/instructors';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InstructorService {

  private firestore = inject(AngularFirestore)

  getInstructors() {
    return this.firestore.collection<IInstructor>('instructor').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as IInstructor;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  addInstructor(instructor: IInstructor) {
    console.log('Adding instructor:', instructor);
    return this.firestore.collection('instructor').add(instructor);
  }

  updateInstructor(id: string, instructor: IInstructor) {
    return this.firestore.doc(`instructor/${id}`).update(instructor);
  }

  deleteInstructor(id: string) {
    return this.firestore.doc(`instructor/${id}`).delete();
  }
}
