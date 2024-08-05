import { Injectable, inject } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { IInstructor } from '../modules/instructors';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InstructorService {

  private firestore = inject(AngularFirestore);

  getInstructors(): Observable<IInstructor[]> {
    return this.firestore.collection<IInstructor>('instructor').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as IInstructor;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }
  
  // Add a new instructor to Firestore and return the ID
  addInstructor(instructor: IInstructor): Promise<void> {
    console.log('Adding instructor:', instructor);
    const id = this.firestore.createId(); // Generate a new ID
    return this.firestore.collection('instructor').doc(id).set({ ...instructor, id })
      .then(() => console.log('Instructor added successfully'))
      .catch(error => console.error('Error adding instructor:', error));
  }

  // Update an existing instructor in Firestore
  updateInstructor(id: string, instructor: IInstructor): Promise<void> {
    console.log('Updating instructor:', id, instructor);
    return this.firestore.doc(`instructor/${id}`).update(instructor)
      .then(() => console.log('Instructor updated successfully'))
      .catch(error => console.error('Error updating instructor:', error));
  }

  // Delete an instructor from Firestore
  deleteInstructor(id: string): Promise<void> {
    console.log('Deleting instructor:', id);
    return this.firestore.doc(`instructor/${id}`).delete()
      .then(() => console.log('Instructor deleted successfully'))
      .catch(error => console.error('Error deleting instructor:', error));
  }
}

