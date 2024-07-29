import { inject, Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { IEvent } from '../modules/event';
import { IEventSpeakers } from '../modules/event-speakers';
import { IEventAgenda } from '../modules/event-agenda';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  private firestore = inject(AngularFirestore);

  // Events 
  getEvents(): Observable<IEvent[]> {
    return this.firestore.collection<IEvent>('events').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        return { id, ...data };
      })),
      catchError(error => {
        console.error('Error fetching events:', error);
        return of([]); // Return an empty array in case of error
      })
    );
  }

  addEvent(event: IEvent, id: string): Promise<void> {
    console.log('Adding event:', event);
    return this.firestore.collection('events').doc(id).set(event).catch(error => {
      console.error('Error adding event:', error);
      throw error; // Re-throw the error for further handling if needed
    });
  }

  updateEvent(eventId: string, event: IEvent): Promise<void> {
    const eventRef = this.firestore.collection('events').doc(eventId);

    return eventRef.get().toPromise().then(doc => {
      if (doc && doc.exists) {
        return eventRef.update(event);
      } else {
        return eventRef.set(event);
      }
    }).catch(error => {
      console.error(`Error updating/creating event: ${error}`);
      throw error; // Re-throw the error for further handling if needed
    });
  }

  deleteEvent(id: string): Promise<void> {
    return this.firestore.collection('events').doc(id).delete().catch(error => {
      console.error('Error deleting event:', error);
      throw error; // Re-throw the error for further handling if needed
    });
  }

  // Speakers 
  getEventSpeakers(eventId: string): Observable<IEventSpeakers[]> {
    return this.firestore.collection('events').doc(eventId).collection<IEventSpeakers>('speakers').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        return { id, ...data };
      })),
      catchError(error => {
        console.error('Error fetching event speakers:', error);
        return of([]); // Return an empty array in case of error
      })
    );
  }

  addSpeaker(eventId: string, speaker: IEventSpeakers): Promise<void> {
    return this.firestore.collection('events').doc(eventId).collection('speakers').add(speaker).then(() => {
      console.log('Speaker added successfully');
    }).catch(error => {
      console.error('Error adding speaker:', error);
      throw error; // Re-throw the error for further handling if needed
    });
  }

  updateSpeaker(eventId: string, speakerId: string, speaker: IEventSpeakers): Promise<void> {
    return this.firestore.collection('events').doc(eventId).collection('speakers').doc(speakerId).update(speaker).then(() => {
      console.log('Speaker updated successfully');
    }).catch(error => {
      console.error('Error updating speaker:', error);
      throw error; // Re-throw the error for further handling if needed
    });
  }

  deleteSpeaker(eventId: string, speakerId: string): Promise<void> {
    return this.firestore.collection('events').doc(eventId).collection('speakers').doc(speakerId).delete().then(() => {
      console.log('Speaker deleted successfully');
    }).catch(error => {
      console.error('Error deleting speaker:', error);
      throw error; // Re-throw the error for further handling if needed
    });
  }

  // Agenda
  getEventAgenda(eventId: string): Observable<IEventAgenda[]> {
    return this.firestore.collection('events').doc(eventId).collection<IEventAgenda>('agenda').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        return { id, ...data };
      })),
      catchError(error => {
        console.error('Error fetching event agenda:', error);
        return of([]); // Return an empty array in case of error
      })
    );
  }

  addAgenda(eventId: string, agenda: IEventAgenda): Promise<void> {
    return this.firestore.collection('events').doc(eventId).collection('agenda').add(agenda).then(() => {
      console.log('Agenda added successfully');
    }).catch(error => {
      console.error('Error adding agenda:', error);
      throw error; // Re-throw the error for further handling if needed
    });
  }

  updateAgenda(eventId: string, agendaId: string, agenda: IEventAgenda): Promise<void> {
    return this.firestore.collection('events').doc(eventId).collection('agenda').doc(agendaId).update(agenda).then(() => {
      console.log('Agenda updated successfully');
    }).catch(error => {
      console.error('Error updating agenda:', error);
      throw error; // Re-throw the error for further handling if needed
    });
  }

  deleteAgenda(eventId: string, agendaId: string): Promise<void> {
    return this.firestore.collection('events').doc(eventId).collection('agenda').doc(agendaId).delete().then(() => {
      console.log('Agenda deleted successfully');
    }).catch(error => {
      console.error('Error deleting agenda:', error);
      throw error; // Re-throw the error for further handling if needed
    });
  }
}
