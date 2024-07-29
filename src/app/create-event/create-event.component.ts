import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';
import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EventService } from '../services/event.service';
import { IEvent } from '../modules/event';
import { IEventSpeakers } from '../modules/event-speakers';
import { IEventAgenda } from '../modules/event-agenda';
import { first } from 'rxjs';

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-event.component.html',
  styleUrl: './create-event.component.scss',
})
export class CreateEventComponent implements OnInit {

  events: IEvent[] = [];
  speakers: IEventSpeakers[] = [];
  agendas: IEventAgenda[] = [];

  eventForm: FormGroup;
  totalEventCount = 0;
  editMode = false;
  currentEventId?: string;

  formVisible = false;
  speakerFormVisible = false;
  agendaFormVisible = false;

  editingSpeakerIndex: number | null = null;
  editingAgendaIndex: number | null = null;

  private eventService = inject(EventService);

  constructor() {
    this.eventForm = new FormGroup({
      Id: new FormControl(''),
      Title: new FormControl('', Validators.required),
      TotalSeats: new FormControl('', Validators.required),
      RegisteredSeats: new FormControl('', Validators.required),
      Tech: new FormControl('', Validators.required),
      Logo: new FormControl('', Validators.required),
      Tagline: new FormControl('', Validators.required),
      ShortDescription: new FormControl('', Validators.maxLength(200)),
      Description: new FormControl('', Validators.required),
      Date: new FormControl('', Validators.required),
      City: new FormControl('', Validators.required),
      EventImage: new FormControl('', Validators.required),
      VenueName: new FormControl('', Validators.required),
      VenueInfo: new FormControl('', Validators.required),
      VenueImg: new FormControl('', Validators.required),
      VenueIframe: new FormControl('', Validators.required),
      isOffline: new FormControl(false),
      isPaid: new FormControl(false),
      isCertificateProvided: new FormControl(false),
      displayAtHomePage: new FormControl(false),
      Speakers: new FormArray([]),
      Agenda: new FormArray([]),
    });
  }

  ngOnInit(): void {
    this.loadEvents();
  }

  get agendaFormArray(): FormArray {
    return this.eventForm.get('Agenda') as FormArray;
  }

  get speakersFormArray(): FormArray {
    return this.eventForm.get('Speakers') as FormArray;
  }

  loadEvents() {
    this.eventService.getEvents().pipe(first()).subscribe(
      events => {
        console.log(events)
        this.events = events;
        this.totalEventCount = events.length;
        this.fetchAndAddSpeakers();
        this.fetchAndAddAgenda();
      },
      error => {
        console.error('Error loading events:', error);
      }
    );
  }

  // fetchAndAddSpeakers(): void {
  //   for (let index = 0; index < this.events.length; index++) {
  //     this.eventService.getEventSpeakers(this.events[index].id!).pipe(first()).subscribe(res => {
  //       this.events[index].Speakers = res;
  //       console.log(res)
  //     });
  //   }
  // }

  fetchAndAddSpeakers(): void {
    for (const event of this.events) {
      this.eventService.getEventSpeakers(event.id!).pipe(first()).subscribe(res => {
        event.Speakers = res;
        console.log(res);
      });
    }
  }


  // fetchAndAddAgenda(): void {
  //   for (let index = 0; index < this.events.length; index++) {
  //     this.eventService.getEventAgenda(this.events[index].id!).pipe(first()).subscribe(res => {
  //       this.events[index].Agenda = res;
  //       console.log(res)
  //     });
  //   }
  // }

  fetchAndAddAgenda(): void {
    for (const event of this.events) {
      this.eventService.getEventAgenda(event.id!).pipe(first()).subscribe(res => {
        event.Agenda = res;
        console.log(res);
      });
    }
  }


  generateSlug(title: string): string {
    return slugify(title, { lower: true, strict: true });
  }

  addOrUpdateEvent() {
    const title = this.eventForm.get('Title')?.value;
    const slug = this.generateSlug(title);
    const uuid = uuidv4();
    const eventId = `${slug}-${uuid}`;

    this.eventForm.get('Id')?.setValue(eventId);

    const speakers = this.speakersFormArray.value as IEventSpeakers[];
    const agenda = this.agendaFormArray.value as IEventAgenda[];
    const event = { ...this.eventForm.value } as IEvent;

    delete event.Speakers;
    delete event.Agenda;

    if (this.editMode && this.currentEventId) {
      this.updateEvent(this.currentEventId, event, speakers, agenda);
    } else {
      this.addEvent(eventId, event, speakers, agenda);
    }
  }

  addEvent(id: string, event: IEvent, speakers: IEventSpeakers[], agenda: IEventAgenda[]) {
    this.eventService.addEvent(event, id).then(() => {
      this.addSpeakers(id, speakers);
      this.addAgendas(id, agenda);
      this.resetForm();
      this.loadEvents();
    }).catch(error => {
      console.error('Error adding event:', error);
    });
  }

  updateEvent(id: string, event: IEvent, speakers: IEventSpeakers[], agenda: IEventAgenda[]) {
    this.eventService.updateEvent(id, event).then(() => {
      this.updateSpeakers(id, speakers);
      this.updateAgendas(id, agenda);
      this.resetForm();
      this.loadEvents();
    }).catch(error => {
      console.error('Error updating event:', error);
    });
  }

  addSpeakers(eventId: string, speakers: IEventSpeakers[]) {
    speakers.forEach(speaker => {
      this.eventService.addSpeaker(eventId, speaker).catch(error => {
        console.error('Error adding speaker:', error);
      });
    });
  }

  updateSpeakers(eventId: string, speakers: IEventSpeakers[]) {
    speakers.forEach(speaker => {
      if (speaker.id) {
        this.eventService.updateSpeaker(eventId, speaker.id, speaker).catch(error => {
          console.error('Error updating speaker:', error);
        });
      } else {
        this.eventService.addSpeaker(eventId, speaker).catch(error => {
          console.error('Error adding speaker:', error);
        });
      }
    });
  }

  addAgendas(eventId: string, agenda: IEventAgenda[]) {
    agenda.forEach(agendaItem => {
      this.eventService.addAgenda(eventId, agendaItem).catch(error => {
        console.error('Error adding agenda item:', error);
      });
    });
  }

  updateAgendas(eventId: string, agenda: IEventAgenda[]) {
    agenda.forEach(agendaItem => {
      if (agendaItem.id) {
        this.eventService.updateAgenda(eventId, agendaItem.id, agendaItem).catch(error => {
          console.error('Error updating agenda item:', error);
        });
      } else {
        this.eventService.addAgenda(eventId, agendaItem).catch(error => {
          console.error('Error adding agenda item:', error);
        });
      }
    });
  }

  editEvent(event: IEvent) {
    this.eventForm.patchValue(event);

    const speakersFormArray = this.eventForm.get('Speakers') as FormArray;
    const agendaFormArray = this.eventForm.get('Agenda') as FormArray;

    speakersFormArray.clear();
    agendaFormArray.clear();

    if (event.Speakers) {
      this.speakers = event.Speakers;
      event.Speakers.forEach(speaker => {
        speakersFormArray.push(new FormGroup({
          id: new FormControl(speaker.id),
          Name: new FormControl(speaker.Name),
          Image: new FormControl(speaker.Image),
          Position: new FormControl(speaker.Position),
          Info: new FormControl(speaker.Info),
          Github: new FormControl(speaker.Github),
          LinkedIn: new FormControl(speaker.LinkedIn),
          X: new FormControl(speaker.X),
        }));
      });
    }

    if (event.Agenda) {
      this.agendas = event.Agenda;
      event.Agenda.forEach(agendaItem => {
        agendaFormArray.push(new FormGroup({
          id: new FormControl(agendaItem.id),
          Info: new FormControl(agendaItem.Info),
          Speaker: new FormControl(agendaItem.Speaker),
          Tech: new FormControl(agendaItem.Tech),
          Time: new FormControl(agendaItem.Time),
          Title: new FormControl(agendaItem.Title),
          SpeakerImg: new FormControl(agendaItem.SpeakerImg),
        }));
      });
    }

    this.editMode = true;
    this.currentEventId = event.Id;
    this.showForm();
  }

  deleteEvent(id: string | undefined) {
    if (id) {
      this.eventService.deleteEvent(id).then(() => {
        this.loadEvents();
      }).catch(error => {
        console.error('Error deleting event:', error);
      });
    } else {
      console.error('Event ID is undefined, cannot delete.');
    }
  }

  resetForm() {
    this.eventForm.reset({
      Title: '',
      TotalSeats: '',
      RegisteredSeats: '',
      Tech: '',
      Logo: '',
      Tagline: '',
      ShortDescription: '',
      Description: '',
      Date: '',
      City: '',
      EventImage: '',
      VenueName: '',
      VenueInfo: '',
      VenueImg: '',
      VenueIframe: '',
      isOffline: false,
      isPaid: false,
      isCertificateProvided: false,
      displayAtHomePage: false,
      Speakers: [],
      Agenda: [],
    });
    this.speakersFormArray.clear();
    this.agendaFormArray.clear();
    this.editMode = false;
    this.currentEventId = undefined;
    this.hideForm();
  }

  showForm() {
    this.formVisible = true;
  }

  hideForm() {
    this.formVisible = false;
    this.resetForm();
  }

  showSpeakerForm() {
    this.speakerFormVisible = true;
  }

  hideSpeakerForm() {
    this.speakerFormVisible = false;
    this.editingSpeakerIndex = null;
  }

  showAgendaForm() {
    this.agendaFormVisible = true;
  }

  hideAgendaForm() {
    this.agendaFormVisible = false;
    this.editingAgendaIndex = null;
  }

  fetchSpeakers() {
    if (this.currentEventId) {
      // this.eventService.getEventSpeakers(this.currentEventId).subscribe(
      //   speakers => {
      //     this.speakers = speakers;
      //   },
      //   error => {
      //     console.error('Error fetching speakers:', error);
      //   }
      // );
      const index = this.events.findIndex((event) => event.id === this.currentEventId);
      if (index !== -1) {
        this.speakers = this.events[index].Speakers ?? [];
      }
    }
  }

  addOrUpdateSpeaker() {
    if (this.editingSpeakerIndex !== null) {
      this.updateSpeaker();
    } else {
      const speakerForm = this.speakersFormArray.at(this.editingSpeakerIndex!) as FormGroup;
      const speakerData = speakerForm.value;
      const eventId = this.currentEventId;

      if (eventId) {
        this.eventService.addSpeaker(eventId, speakerData).then(() => {
          this.fetchSpeakers();
          this.hideSpeakerForm();
        }).catch(error => {
          console.error('Error adding speaker:', error);
        });
      }
    }
  }

  addSpeaker() {
    this.speakersFormArray.push(new FormGroup({
      id: new FormControl(''),
      Name: new FormControl('', Validators.required),
      Image: new FormControl('', Validators.required),
      Position: new FormControl('', Validators.required),
      Info: new FormControl('', Validators.required),
      Github: new FormControl(''),
      LinkedIn: new FormControl(''),
      X: new FormControl(''),
    }));
  }

  editSpeaker(index: number) {
    this.editingSpeakerIndex = index;
    this.showSpeakerForm();
  }

  updateSpeaker() {
    if (this.editingSpeakerIndex !== null) {
      const speakerForm = this.speakersFormArray.at(this.editingSpeakerIndex) as FormGroup;
      const speakerData = speakerForm.value;
      const eventId = this.currentEventId;

      if (eventId && speakerData.id) {
        this.eventService.updateSpeaker(eventId, speakerData.id, speakerData).then(() => {
          this.fetchSpeakers();
          this.hideSpeakerForm();
        }).catch(error => {
          console.error('Error updating speaker:', error);
        });
      }
    }
  }

  removeSpeaker(index: number) {
    this.speakersFormArray.removeAt(index);
  }

  fetchAgenda() {
    if (this.currentEventId) {
      this.eventService.getEventAgenda(this.currentEventId).subscribe(
        agendas => {
          this.agendas = agendas;
        },
        error => {
          console.error('Error fetching agenda:', error);
        }
      );
    }
  }

  addOrUpdateAgenda() {
    if (this.editingAgendaIndex !== null) {
      this.updateAgenda();
    } else {
      const agendaForm = this.agendaFormArray.at(this.editingAgendaIndex!) as FormGroup;
      const agendaData = agendaForm.value;
      const eventId = this.currentEventId;

      if (eventId) {
        this.eventService.addAgenda(eventId, agendaData).then(() => {
          this.fetchAgenda();
          this.hideAgendaForm();
        }).catch(error => {
          console.error('Error adding agenda:', error);
        });
      }
    }
  }

  addAgenda() {
    this.agendaFormArray.push(new FormGroup({
      id: new FormControl(''),
      Info: new FormControl('', Validators.required),
      Speaker: new FormControl('', Validators.required),
      Tech: new FormControl('', Validators.required),
      Time: new FormControl('', Validators.required),
      Title: new FormControl('', Validators.required),
      SpeakerImg: new FormControl('', Validators.required),
    }));
  }

  removeAgenda(index: number) {
    this.agendaFormArray.removeAt(index);
  }

  editAgenda(index: number) {
    this.editingAgendaIndex = index;
    this.showAgendaForm();
  }

  updateAgenda() {
    if (this.editingAgendaIndex !== null) {
      const agendaForm = this.agendaFormArray.at(this.editingAgendaIndex) as FormGroup;
      const agendaData = agendaForm.value;
      const eventId = this.currentEventId;

      if (eventId && agendaData.id) {
        this.eventService.updateAgenda(eventId, agendaData.id, agendaData).then(() => {
          this.fetchAgenda();
          this.hideAgendaForm();
        }).catch(error => {
          console.error('Error updating agenda:', error);
        });
      }
    }
  }

}