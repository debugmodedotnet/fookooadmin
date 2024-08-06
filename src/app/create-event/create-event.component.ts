import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';
import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EventService } from '../services/event.service';
import { IEvent } from '../modules/event';
import { first } from 'rxjs';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
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
  isProcessing = false; // Renamed flag to isProcessing

  constructor(private eventService: EventService) {
    this.eventForm = new FormGroup({
      Id: new FormControl(''),
      Title: new FormControl('', Validators.required),
      TotalSeats: new FormControl('', Validators.required),
      RegisteredSeats: new FormControl('', Validators.required),
      Tech: new FormControl('', Validators.required),
      Logo: new FormControl('', Validators.required),
      Tagline: new FormControl('', Validators.required),
      ShortDescription: new FormControl('', Validators.maxLength(200)),
      Description: new FormControl(''),
      Date: new FormControl('', Validators.required),
      City: new FormControl('', Validators.required),
      EventImage: new FormControl('',),
      VenueName: new FormControl('', Validators.required),
      VenueInfo: new FormControl('', Validators.required),
      VenueImg: new FormControl(''),
      VenueIframe: new FormControl(''),
      isOffline: new FormControl(false),
      isPaid: new FormControl(false),
      isCertificateProvided: new FormControl(false),
      displayAtHomePage: new FormControl(false),
      isActive: new FormControl(false),
      isPrivate: new FormControl(false),
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
      return; // Prevent operation if form is processing
    }
  
    if (this.eventForm.invalid) {
      console.warn('Form is invalid. Please fill in all required fields.');
      this.eventForm.markAllAsTouched(); // Highlight invalid fields
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
      this.isProcessing = false; // Reset flag after operation
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
      this.isProcessing = false; // Reset flag after operation
    });
  }

  editEvent(event: IEvent) {
    console.log('Editing event:', event);
    this.eventForm.patchValue(event);
    this.formVisible = true;
    this.editMode = true; // Set editMode to true for editing
    this.currentEventId = event.Id; // Set the current event ID for editing
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

    this.editMode = false; // Reset editMode to false
    this.currentEventId = undefined; // Clear the current event ID
    this.hideForm(); // Hide the form
  }

  showForm() {
    this.resetForm();
    this.formVisible = true;
  }

  hideForm() {
    this.formVisible = false;
  }

}