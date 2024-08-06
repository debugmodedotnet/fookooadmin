import { Component, inject } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './event-form.component.html',
  styleUrl: './event-form.component.scss'
})
export class EventFormComponent {

  eventForm: FormGroup;
  private firestore = inject(AngularFirestore);

  constructor() {
    this.eventForm = new FormGroup({
      Id: new FormControl('', Validators.required),
      Title: new FormControl('', Validators.required),
      isOffline: new FormControl(false),
      City: new FormControl(''),
      Address: new FormControl(''),
      isCertificateProvided: new FormControl(false),
      isPaid: new FormControl(false),
      Tech: new FormControl(''),
      Logo: new FormControl(''),
      ShortDescription: new FormControl('', Validators.maxLength(200)),
      Description: new FormControl(''),
      Date: new FormControl('', Validators.required),
    });
  }



  onSubmit() {
    if (this.eventForm.valid) {
      this.firestore.collection('events').add(this.eventForm.value)
        .then(docRef => {
          console.log(`Document written with ID: ${docRef.id}`);
        })
        .catch(error => {
          console.error("Error adding document: ", error);
        });
    }
  }

}
