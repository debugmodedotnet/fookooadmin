import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Job } from '../modules/job';
import { Observable } from 'rxjs';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  constructor(private firestore: AngularFirestore) { }

  getJobs(): Observable<Job[]> {
    return this.firestore.collection<Job>('jobs').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Job;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  getJobsByUserId(userId: string): Observable<Job[]> {
    return this.firestore.collection<Job>('jobs', ref => ref.where('userId', '==', userId)).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Job;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  async addJob(job: Job): Promise<void> {
    await this.firestore.collection('jobs').add(job);
  }

  getJobById(jobId: string): Observable<Job | undefined> {
    return this.firestore.collection('jobs').doc<Job>(jobId).valueChanges().pipe(
      map(data => data ? { id: jobId, ...data } : undefined)
    );
  }

  updateJob(jobId: string, job: Partial<Job>): Promise<void> {
    return this.firestore.collection('jobs').doc(jobId).update(job);
  }

  deleteJob(jobId: string): Promise<void> {
    return this.firestore.collection('jobs').doc(jobId).delete();
  }
}


/*import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { Job } from '../modules/job';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  constructor(private firestore: AngularFirestore) {}

  // Fetch jobs with the document ID included
  getJobs(): Observable<Job[]> {
    return this.firestore.collection<Job>('jobs').valueChanges({ idField: 'id' });
  }

  getJobById(id: string): Observable<Job | undefined> {
    return this.firestore.collection<Job>('jobs').doc(id).valueChanges();
  }

  addJob(job: Job): Promise<void> {
    const id = this.firestore.createId();
    return this.firestore.collection('jobs').doc(id).set({ ...job, id });
  }

  updateJob(id: string, job: Job): Promise<void> {
    return this.firestore.collection('jobs').doc(id).update(job);
  }

  deleteJob(id: string): Promise<void> {
    return this.firestore.collection('jobs').doc(id).delete();
  }
} */


