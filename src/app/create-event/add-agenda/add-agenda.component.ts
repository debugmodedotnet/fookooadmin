import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { IEventAgenda } from '../../modules/event-agenda';
import { IEventSpeakers } from '../../modules/event-speakers';

@Component({
  selector: 'app-add-agenda',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './add-agenda.component.html',
  styleUrl: './add-agenda.component.scss'
})
export class AddAgendaComponent implements OnInit {

  eventId?: string;
  agendas: IEventAgenda[] = [];
  speakers: IEventSpeakers[] = [];
  agendaForm!: FormGroup;
  formVisible = false;
  isEditMode = false;
  editingAgendaId?: string;

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
        this.loadAgendas();
        this.loadSpeakers();
      } else {
        console.error('Event ID is not available');
      }
    });
  }

  initForm(): void {
    this.agendaForm = this.fb.group({
      Info: [''],
      Speaker: [''],
      Tech: [''],
      Time: ['', Validators.required],
      Title: ['', Validators.required],
      SpeakerImg: [''],
    });
  }

  loadAgendas(): void {
    this.firestore.collection(`events/${this.eventId}/agendas`).valueChanges({ idField: 'id' })
      .subscribe((data: any[]) => {
        this.agendas = data.map((item: any) => ({
          id: item.id,
          Info: item.Info,
          Speaker: item.Speaker,
          Tech: item.Tech,
          Time: item.Time,
          Title: item.Title,
          SpeakerImg: item.SpeakerImg,
        } as IEventAgenda));
      });
  }

  loadSpeakers(): void {
    this.firestore.collection(`events/${this.eventId}/speakers`).valueChanges({ idField: 'id' })
      .subscribe((data: any[]) => {
        this.speakers = data.map((item: any) => ({
          id: item.id,
          Name: item.Name,
          Image: item.Image,
        }));
      });
  }

  onSpeakerChange(event: any): void {
    const selectedSpeakerName = event.target.value;
    if (selectedSpeakerName === '') {
      this.agendaForm.patchValue({
        SpeakerImg: ''
      });
    } else {
      const selectedSpeaker = this.speakers.find(speaker => speaker.Name === selectedSpeakerName);
      if (selectedSpeaker) {
        this.agendaForm.patchValue({
          SpeakerImg: selectedSpeaker.Image
        });
      }
    }
  }  

  showForm(agenda?: IEventAgenda): void {
    if (agenda) {
      this.isEditMode = true;
      this.editingAgendaId = agenda.id;
      this.agendaForm.patchValue(agenda);
    } else {
      this.isEditMode = false;
      this.agendaForm.reset();
    }
    this.formVisible = true;
  }

  hideForm(): void {
    this.formVisible = false;
  }

  addOrUpdateAgenda(): void {
    if (this.agendaForm.invalid) {
      return;
    }
    const agendaData = this.agendaForm.value;
    if (this.isEditMode && this.editingAgendaId) {
      this.firestore.doc(`events/${this.eventId}/agendas/${this.editingAgendaId}`).update(agendaData)
        .then(() => {
          this.loadAgendas();
          this.hideForm();
        })
        .catch(error => {
          console.error('Error updating agenda: ', error);
        });
    } else {
      this.firestore.collection(`events/${this.eventId}/agendas`).add(agendaData)
        .then(() => {
          this.loadAgendas();
          this.hideForm();
        })
        .catch(error => {
          console.error('Error adding agenda: ', error);
        });
    }
  }

  deleteAgenda(agendaId?: string): void {
    if (agendaId) {
      this.firestore.doc(`events/${this.eventId}/agendas/${agendaId}`).delete().then(() => {
        this.loadAgendas();
      });
    }
  }

  editAgenda(agenda: IEventAgenda): void {
    this.showForm(agenda);
  }

}
