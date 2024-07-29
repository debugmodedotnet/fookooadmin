import { inject, Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
    return this.firestore.collection('events').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as IEvent;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  addEvent(event: IEvent, id: string) {
    console.log('Adding event:', event);
    return this.firestore.collection('events').doc(id).set(event);
  }

  updateEvent(id: string, event: IEvent) {
    return this.firestore.collection('events').doc(id).update(event);
  }

  deleteEvent(id: string) {
    return this.firestore.collection('events').doc(id).delete();
  }

  // Speakers 
  getEventSpeakers(eventId: string): Observable<IEventSpeakers[]> {
    return this.firestore.collection('events').doc(eventId).collection('speakers').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as IEventSpeakers;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  addSpeaker(eventId: string, speaker: IEventSpeakers) {
    return this.firestore.collection('events').doc(eventId).collection('speakers').add(speaker);
  }

  updateSpeaker(eventId: string, speakerId: string, speaker: IEventSpeakers) {
    return this.firestore.collection('events').doc(eventId).collection('speakers').doc(speakerId).update(speaker);
  }

  deleteSpeaker(eventId: string, speakerId: string) {
    return this.firestore.collection('events').doc(eventId).collection('speakers').doc(speakerId).delete();
  }

  // Agenda
  getEventAgenda(eventId: string): Observable<IEventAgenda[]> {
    return this.firestore.collection('events').doc(eventId).collection('agenda').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as IEventAgenda;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  addAgenda(eventId: string, agenda: IEventAgenda) {
    return this.firestore.collection('events').doc(eventId).collection('agenda').add(agenda);
  }

  updateAgenda(eventId: string, agendaId: string, agenda: IEventAgenda) {
    return this.firestore.collection('events').doc(eventId).collection('agenda').doc(agendaId).update(agenda);
  }

  deleteAgenda(eventId: string, agendaId: string) {
    return this.firestore.collection('events').doc(eventId).collection('agenda').doc(agendaId).delete();
  }

}
