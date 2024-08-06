import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { InstructorService } from '../services/instructor.service';
import { IInstructor } from '../modules/instructors';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-instructor-setting',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './instructor-setting.component.html',
  styleUrls: ['./instructor-setting.component.scss']
})
export class InstructorSettingComponent implements OnInit {

  instructors: IInstructor[] = [];
  instructorForm: FormGroup;
  editMode = false;
  currentInstructorId?: string;
  formVisible = false;
  photoURL: string | null = null;
  skills: string[] = ['Angular', 'React', 'Azure', 'GenAI', 'Javascript', 'Dotnet'];

  private storage = inject(AngularFireStorage);
  private instructorService = inject(InstructorService);
  private fb = inject(FormBuilder);

  constructor() {
    this.instructorForm = this.fb.group({
      id: [''],
      Name: ['', Validators.required],
      Position: ['', Validators.required],
      Email: ['', [Validators.email]],
      Github: ['', [Validators.pattern('https://github.com/.*')]],
      Twitter: ['', [Validators.pattern('https://x.com/.*')]],
      LinkedIn: ['', [Validators.required, Validators.pattern('https://www.linkedin.com/.*')]],
      Skill1: ['', Validators.required],
      Skill2: [''],
      Skill3: [''],
      Skill4: [''],
      Company1: ['', Validators.required],
      Company2: [''],
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
    this.instructorService.getInstructors().subscribe(
      instructors => {
        console.log('Fetched instructors:', instructors); // Log fetched instructors
        this.instructors = instructors;
      },
      error => console.error('Error loading instructors:', error)
    );
  }


  addOrUpdateInstructor(): void {
    if (this.instructorForm.valid) {
      const instructorData: IInstructor = {
        ...this.instructorForm.value,
        InstructorImg: this.photoURL
      };

      if (this.editMode && this.currentInstructorId) {
        this.updateInstructor(this.currentInstructorId, instructorData);
      } else {
        this.addInstructor(instructorData);
      }
    } else {
      // Log detailed errors
      this.instructorForm.markAllAsTouched(); // Show validation errors
      console.error('Form is invalid');
      Object.keys(this.instructorForm.controls).forEach(key => {
        const control = this.instructorForm.get(key);
        if (control?.invalid) {
          console.error(`Control ${key} is invalid`, control.errors);
        }
      });
    }
  }


  addInstructor(instructor: IInstructor): void {
    this.instructorService.addInstructor(instructor).then(() => {
      this.resetForm();
      this.loadInstructors(); // Reload the list after adding
    }).catch(error => {
      console.error('Error adding instructor:', error);
    });
  }

  updateInstructor(id: string, instructor: IInstructor): void {
    this.instructorService.updateInstructor(id, instructor).then(() => {
      this.resetForm();
      this.loadInstructors(); // Reload the list after updating
    }).catch(error => {
      console.error('Error updating instructor:', error);
    });
  }

  editInstructor(instructor: IInstructor): void {
    if (instructor && instructor.id) {
      this.instructorForm.patchValue({
        ...instructor,
        ImageUpload: instructor.InstructorImg || null
      });
      this.photoURL = instructor.InstructorImg || null;
      this.currentInstructorId = instructor.id;
      this.editMode = true;
      this.formVisible = true; // Show the form
    } else {
      console.error('Instructor ID is not defined or is empty:', instructor);
    }
  }



  deleteInstructor(id: string | undefined): void {
    if (id) {
      this.instructorService.deleteInstructor(id).then(() => {
        this.loadInstructors(); // Reload the list after deletion
      }).catch(error => {
        console.error('Error deleting instructor:', error);
      });
    } else {
      console.error('Instructor ID is not defined or is empty, cannot delete.');
    }
  }


  resetForm(): void {
    this.instructorForm.reset({
      id: '',
      Name: '',
      Position: '',
      Email: '',
      Github: '',
      Twitter: '',
      LinkedIn: '',
      Skill1: '',
      Skill2: '',
      Skill3: '',
      Skill4: '',
      Company1: '',
      Company2: '',
      Company3: '',
      Company4: '',
      Bio: '',
      ImageUpload: ''
    });
    this.photoURL = null;
    this.editMode = false;
    this.currentInstructorId = undefined;
    this.formVisible = false;
  }

  showForm(): void {
    this.formVisible = true;
  }

  hideForm(): void {
    this.formVisible = false;
    this.resetForm(); // Reset the form when hiding
  }

  uploadPhoto(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const filePath = `instructorPhotos/${new Date().getTime()}_${file.name}`;
      const fileRef = this.storage.ref(filePath);
      const task = this.storage.upload(filePath, file);

      task.snapshotChanges().pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe(url => {
            this.photoURL = url;
            this.instructorForm.patchValue({ ImageUpload: this.photoURL });
          });
        })
      ).subscribe();
    }
  }

  toggleFormVisibility(): void {
    this.formVisible = !this.formVisible;
    if (!this.formVisible) {
      this.resetForm();
    }
  }
}


