import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IInstructor } from '../modules/instructors'; 
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-instructor-setting',
  standalone: true,
  imports: [ReactiveFormsModule, NgFor, NgIf],
  templateUrl: './instructor-setting.component.html',
  styleUrls: ['./instructor-setting.component.scss']
})
export class InstructorSettingComponent implements OnInit {
  instructors: IInstructor[] = [];
  instructorForm: FormGroup;
  editMode = false;
  currentInstructorId?: string;
  formVisible = false;
  skills: string[] = ['Angular', 'React', 'Azure', 'GenAI','Javascript','Dotnet'];
  photoURL: string | null = null;

  private storage = inject(AngularFireStorage);
  private firestore = inject(AngularFirestore);
  private fb = inject(FormBuilder);

  constructor() {
    this.instructorForm = this.fb.group({
      id: [''],
      Name: ['', Validators.required],
      Position: ['', Validators.required],
      Email: ['', [Validators.required, Validators.email]],
      Github: ['', [Validators.required, Validators.pattern('https://github.com/.*')]],
      Twitter: ['', [Validators.required, Validators.pattern('https://x.com/.*')]],
      LinkedIn: ['', [Validators.required, Validators.pattern('https://www.linkedin.com/.*')]],
      Skill1: ['', Validators.required],
      Skill2: [''],
      Skill3: [''],
      Skill4: [''],
      Company1: ['', Validators.required],
      Company2: ['', Validators.required],
      Company3: [''],
      Company4: [''],
      Bio: [''],
      ImageUpload: ['']
    });
  }

  ngOnInit(): void {
    this.loadInstructors();
  }

  loadInstructors(): void {
    this.firestore.collection<IInstructor>('instructor').snapshotChanges().subscribe(instructors => {
      this.instructors = instructors.map(doc => {
        const data = doc.payload.doc.data() as IInstructor;
        const id = doc.payload.doc.id;
        return { ...data, id };
      });
    });
  }
  

  toggleFormVisibility(): void {
    this.formVisible = !this.formVisible;
    if (!this.formVisible) {
      this.instructorForm.reset();
      this.photoURL = null;
      this.editMode = false;
      this.currentInstructorId = undefined;
    }
  }

  onSubmit(): void {
    this.addOrUpdateInstructor();
  }

  addOrUpdateInstructor(): void {
    if (this.instructorForm.valid) {
      const instructorData = { ...this.instructorForm.value, InstructorImg: this.photoURL };

      if (this.editMode && this.currentInstructorId) {
        // Update existing instructor
        this.firestore.collection('instructor').doc(this.currentInstructorId).update(instructorData)
          .then(() => {
            console.log(`Document with ID ${this.currentInstructorId} updated successfully.`);
            this.toggleFormVisibility();
            this.loadInstructors(); // Refresh the list after update
          })
          .catch(error => {
            console.error("Error updating document: ", error);
          });
      } else {
        // Add new instructor
        this.firestore.collection('instructor').add(instructorData)
          .then(docRef => {
            console.log(`Document written with ID: ${docRef.id}`);
            this.toggleFormVisibility();
            this.loadInstructors(); // Refresh the list after adding
          })
          .catch(error => {
            console.error("Error adding document: ", error);
          });
      }
    }
  }

  editInstructor(instructor: IInstructor): void {
    console.log('Instructor object:', instructor);
    if (instructor.id) {
      this.instructorForm.patchValue({
        id: instructor.id,
        Name: instructor.Name,
        Position: instructor.Position,
        Email: instructor.Email,
        Github: instructor.Github,
        Twitter: instructor.Twitter,
        LinkedIn: instructor.LinkedIn,
        Skill1: instructor.Skill1,
        Skill2: instructor.Skill2,
        Skill3: instructor.Skill3,
        Skill4: instructor.Skill4,
        Company1: instructor.Company1,
        Company2: instructor.Company2,
        Company3: instructor.Company3,
        Company4: instructor.Company4,
        Bio: instructor.Bio,
        ImageUpload: instructor.ImageUpload
      });
      this.photoURL = instructor.ImageUpload ?? null; // Handle undefined values
      this.currentInstructorId = instructor.id;
      this.editMode = true;
      this.formVisible = true;
    } else {
      console.error('Instructor ID is not defined.');
      this.formVisible = false;
    }
  }
  
  deleteInstructor(id?: string): void {
    if (id) {
      this.firestore.collection('instructor').doc(id).delete()
        .then(() => {
          console.log(`Document with ID ${id} deleted successfully.`);
          this.loadInstructors(); // Refresh the list after deletion
        })
        .catch(error => {
          console.error("Error deleting document: ", error);
        });
    } else {
      console.error('Instructor ID is not defined.');
    }
  }

  uploadPhoto(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const filePath = `instructors/${new Date().getTime()}_${file.name}`;
      const fileRef = this.storage.ref(filePath);
      const task = this.storage.upload(filePath, file);

      task.snapshotChanges().pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe(url => {
            this.photoURL = url;
            this.instructorForm.patchValue({ ImageUpload: url });
          });
        })
      ).subscribe();
    }
  }
}

