import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EventService } from '../services/event.service';
import { IEvent } from '../modules/event';
import { first } from 'rxjs';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AngularFireStorage } from '@angular/fire/compat/storage';


@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './create-event.component.html',
  styleUrl: './create-event.component.scss',
})
export class CreateEventComponent implements OnInit {

  events: IEvent[] = [];
  eventForm: FormGroup;
  totalEventCount = 0;
  editMode = false;
  currentEventId?: string;
  formVisible = false;
  isProcessing = false;
  photoURL?: string;
  private storage = inject(AngularFireStorage);
  venueImageURL: string | null = null;

  constructor(private eventService: EventService, private fb: FormBuilder) {
    this.eventForm = this.fb.group({
      Id: [''],
      Title: ['', Validators.required],
      TotalSeats: ['', Validators.required],
      RegisteredSeats: ['', Validators.required],
      Tech: ['', Validators.required],
      Logo: ['', Validators.required],
      Tagline: ['', Validators.required],
      ShortDescription: ['', [Validators.required, Validators.maxLength(145)]],
      Description: ['', [Validators.required, Validators.maxLength(500), Validators.minLength(300)]],
      Date: ['', Validators.required],
      City: ['', Validators.required],
      EventImage: ['', Validators.required],
      VenueName: ['', Validators.required],
      VenueInfo: ['', Validators.required],
      VenueImg: [''],
      VenueIframe: ['', Validators.required],
      isOffline: [false],
      isPaid: [false],
      isCertificateProvided: [false],
      displayAtHomePage: [false],
      isActive: [false],
      isPrivate: [false],

    });
  }

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents() {
    this.eventService.getEvents().pipe(first()).subscribe(
      events => {
        console.log('Loaded events:', events);
        this.events = events;
        this.totalEventCount = events.length;
      },
      error => {
        console.error('Error loading events:', error);
      }
    );
  }

  generateSlug(title: string): string {
    return slugify(title, { lower: true, strict: true });
  }

  addOrUpdateEvent() {
    if (this.isProcessing) {
      console.warn('Form is currently processing, operation skipped.');
      return;
    }

    if (this.eventForm.invalid) {
      console.warn('Form is invalid. Please fill in all required fields.');
      this.eventForm.markAllAsTouched();
      return;
    }

    console.log('Form values on submit:', this.eventForm.value);
    const title = this.eventForm.get('Title')?.value;
    const slug = this.generateSlug(title);
    const uuid = uuidv4();
    const eventId = `${slug}-${uuid}`;

    if (!this.editMode) {
      this.eventForm.get('Id')?.setValue(eventId);
    }

    const event = { ...this.eventForm.value } as IEvent;

    this.isProcessing = true;

    if (this.editMode && this.currentEventId) {
      this.updateEvent(this.currentEventId, event);
    } else {
      this.addEvent(eventId, event);
    }
  }

  addEvent(id: string, event: IEvent) {
    console.log('Attempting to add event with ID:', id);
    this.eventService.addEvent(event, id).then(() => {
      console.log('Event added successfully.');
      this.resetForm();
      this.loadEvents();
    }).catch(error => {
      console.error('Error adding event:', error);
    }).finally(() => {
      this.isProcessing = false;
    });
  }

  updateEvent(id: string, event: IEvent) {
    console.log('Attempting to update event with ID:', id);
    this.eventService.updateEvent(id, event).then(() => {
      console.log('Event updated successfully.');
      this.resetForm();
      this.loadEvents();
    }).catch(error => {
      console.error('Error updating event:', error);
    }).finally(() => {
      this.isProcessing = false;
    });
  }

  editEvent(event: IEvent) {
    console.log('Editing event:', event);
    this.eventForm.patchValue(event);
    this.formVisible = true;
    this.editMode = true;
    this.currentEventId = event.Id;
  }

  deleteEvent(id: string | undefined) {
    if (id) {
      console.log('Attempting to delete event with ID:', id);
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
      Id: '',
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
      isActive: false,
      isPrivate: false,
    });

    this.editMode = false;
    this.currentEventId = undefined;
    this.hideForm();
  }

  showForm() {
    this.resetForm();
    this.formVisible = true;
  }

  hideForm() {
    this.formVisible = false;
  }

  uploadPhoto(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const filePath = `eventPhotos/${new Date().getTime()}_${file.name}`;
      const fileRef = this.storage.ref(filePath);
      const task = this.storage.upload(filePath, file);

      task.snapshotChanges().pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe((url: string) => {
            this.photoURL = url;
            this.eventForm.patchValue({ EventImage: this.photoURL });
          });
        })
      ).subscribe();
    }
  }

  uploadVenueImage(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const filePath = `venuePhotos/${new Date().getTime()}_${file.name}`;
      const fileRef = this.storage.ref(filePath);
      const task = this.storage.upload(filePath, file);

      task.snapshotChanges().pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe((url: string) => {
            this.venueImageURL = url;
            this.eventForm.patchValue({ VenueImg: this.venueImageURL });
          });
        })
      ).subscribe();
    }
  }

}