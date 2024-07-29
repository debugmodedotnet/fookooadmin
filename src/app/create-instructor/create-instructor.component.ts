import { Component, inject } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-create-instructor',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-instructor.component.html',
  styleUrls: ['./create-instructor.component.scss'],
})
export class CreateInstructorComponent {
  instructorForm: FormGroup;
  private firestore = inject(AngularFirestore);
  private storage = inject(AngularFireStorage);
  skills: string[] = ["Angular", "Azure", "Dotnet", "GenAI", "Python", "Firebase"];
  photoURL: string | null = null;

  constructor() {
    this.instructorForm = new FormGroup({
      Name: new FormControl('', Validators.required),
      Position: new FormControl('', Validators.required),
      Email: new FormControl('', [Validators.required, Validators.email]),
      Github: new FormControl('', [Validators.required, Validators.pattern('https://github.com/.*')]),
      Twitter: new FormControl('', [Validators.required, Validators.pattern('https://x.com/.*')]),
      LinkedIn: new FormControl('', [Validators.required, Validators.pattern('https://www.linkedin.com/.*')]),
      Skill1: new FormControl('', Validators.required),
      Skill2: new FormControl('', Validators.required),
      Skill3: new FormControl('', Validators.required),
      Skill4: new FormControl('', Validators.required),
      Company1: new FormControl('', Validators.required),
      Company2: new FormControl('', Validators.required),
      Company3: new FormControl(''),
      Company4: new FormControl(''),
      Bio: new FormControl('', Validators.maxLength(800)),
      InstructorImg: new FormControl('', Validators.required),
    });
  }

  uploadPhoto(event: any) {
    const file = event.target.files[0];
    if (file) {
      const filePath = `instructorPhotos/${new Date().getTime()}_${file.name}`;
      const fileRef = this.storage.ref(filePath);
      const task = this.storage.upload(filePath, file);

      task.snapshotChanges().pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe(url => {
            this.photoURL = url;
            // Update the form control with the photo URL
            this.instructorForm.patchValue({ InstructorImg: this.photoURL });
          });
        })
      ).subscribe();
    }
  }

  onSubmit() {
    if (this.instructorForm.valid) {
      const instructorData = { ...this.instructorForm.value, InstructorImg: this.photoURL };
      this.firestore.collection('instructor').add(instructorData)
        .then(docRef => {
          console.log(`Document written with ID: ${docRef.id}`);
          // Reset the form and clear the photo URL
          this.instructorForm.reset();
          this.photoURL = null;
        })
        .catch(error => {
          console.error("Error adding document: ", error);
        });
    }
  }
}
