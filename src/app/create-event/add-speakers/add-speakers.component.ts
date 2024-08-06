import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { CommonModule } from '@angular/common';
import { IEventSpeakers } from '../../modules/event-speakers';

@Component({
  selector: 'app-add-speakers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-speakers.component.html',
  styleUrl: './add-speakers.component.scss'
})
export class AddSpeakersComponent {

  eventId?: string;
  speakers: IEventSpeakers[] = [];
  speakerForm!: FormGroup;
  formVisible = false;
  isEditMode = false;
  editingSpeakerId?: string;

  constructor(
    private fb: FormBuilder,
    private firestore: AngularFirestore,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const paramEventId = params.get('eventId');
      if (paramEventId) {
        this.eventId = paramEventId;
        console.log("Event id", this.eventId);
        this.initForm();
        this.loadSpeakers();
      } else {
        console.error('Event ID is not available');
      }
    });
  }

  initForm(): void {
    this.speakerForm = this.fb.group({
      Name: ['', Validators.required],
      Image: [''],
      Position: ['', Validators.required],
      Info: ['', Validators.required],
      Github: [''],
      LinkedIn: ['', [Validators.required, Validators.pattern('https://www.linkedin.com/.*')]],
      X: ['']
    });
  }

  loadSpeakers(): void {
    this.firestore.collection(`events/${this.eventId}/speakers`).valueChanges({ idField: 'id' })
      .subscribe((data: any[]) => {
        this.speakers = data.map((item: any) => ({
          id: item.id,
          Name: item.Name,
          Image: item.Image,
          Position: item.Position,
          Info: item.Info,
          Github: item.Github,
          LinkedIn: item.LinkedIn,
          X: item.X
        } as IEventSpeakers));
      });
  }

  showForm(speaker?: IEventSpeakers): void {
    if (speaker) {
      this.isEditMode = true;
      this.editingSpeakerId = speaker.id;
      this.speakerForm.patchValue(speaker);
    } else {
      this.isEditMode = false;
      this.speakerForm.reset();
    }
    this.formVisible = true;
  }

  hideForm(): void {
    this.formVisible = false;
  }

  addOrUpdateSpeaker(): void {
    if (this.speakerForm.invalid) {
      return;
    }
    const speakerData = this.speakerForm.value;
    if (this.isEditMode && this.editingSpeakerId) {
      this.firestore.doc(`events/${this.eventId}/speakers/${this.editingSpeakerId}`).update(speakerData)
        .then(() => {
          this.loadSpeakers();
          this.hideForm();
        })
        .catch(error => {
          console.error('Error updating speaker: ', error);
        });
    } else {
      this.firestore.collection(`events/${this.eventId}/speakers`).add(speakerData)
        .then(() => {
          this.loadSpeakers();
          this.hideForm();
        })
        .catch(error => {
          console.error('Error adding speaker: ', error);
        });
    }
  }


  deleteSpeaker(speakerId?: string): void {
    if (speakerId) {
      this.firestore.doc(`events/${this.eventId}/speakers/${speakerId}`).delete().then(() => {
        this.loadSpeakers();
      });
    }
  }

  editSpeaker(speaker: IEventSpeakers): void {
    this.showForm(speaker);
  }
}