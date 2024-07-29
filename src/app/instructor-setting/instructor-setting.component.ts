import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { InstructorService } from '../services/instructor.service'; // Update with your service
import { IInstructor } from '../modules/instructors';  // Update with your model/interface
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs';

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
  skills: string[] = ['Skill A', 'Skill B', 'Skill C', 'Skill D']; // Example skills
  photoURL: string | null = null;

  private storage = inject(AngularFireStorage);

  constructor(private instructorService: InstructorService, private fb: FormBuilder) {
    this.instructorForm = this.fb.group({
      Id: [''],
      Name: ['', Validators.required],
      Position: ['', Validators.required],
      Email: ['', [Validators.required, Validators.email]],
      Github: ['', [Validators.required, Validators.pattern('https://github.com/.*')]],
      Twitter: ['', [Validators.required, Validators.pattern('https://twitter.com/.*')]],
      LinkedIn: ['', [Validators.required, Validators.pattern('https://www.linkedin.com/.*')]],
      Skill1: ['', Validators.required],
      Skill2: ['', Validators.required],
      Skill3: ['', Validators.required],
      Skill4: ['', Validators.required],
      Company1: ['', Validators.required],
      Company2: ['', Validators.required],
      Company3: [''],
      Company4: [''],
      Bio: ['', Validators.required],
      ImageUpload: ['']
    });
  }

  ngOnInit(): void {
    this.loadInstructors();
  }

  loadInstructors() {
    this.instructorService.getInstructors().subscribe(
      instructors => {
        this.instructors = instructors;
      },
      error => {
        console.error('Error loading instructors:', error);
      }
    );
  }

  addOrUpdateInstructor() {
    if (this.editMode && this.currentInstructorId) {
      this.updateInstructor(this.currentInstructorId, this.instructorForm.value);
    } else {
      this.addInstructor();
    }
  }

  addInstructor() {
    this.instructorService.addInstructor({ ...this.instructorForm.value, ImageUpload: this.photoURL }).then(
      () => {
        this.resetForm();
        this.loadInstructors(); // Reload instructors after adding
      }).catch(error => {
        console.error('Error adding instructor:', error);
      });
  }

  updateInstructor(id: string, instructor: IInstructor) {
    this.instructorService.updateInstructor(id, { ...instructor, InstructorImg: this.photoURL }).then(
      () => {
        this.resetForm();
        this.loadInstructors(); // Reload instructors after update
      }).catch(error => {
        console.error('Error updating instructor:', error);
      });
  }

  editInstructor(instructor: IInstructor) {
    this.instructorForm.patchValue(instructor);
    this.editMode = true;
    this.currentInstructorId = instructor.id;
    this.formVisible = true; // Show the form
  }

  deleteInstructor(id: string | undefined) {
    if (id) {
      this.instructorService.deleteInstructor(id).then(
        () => {
          this.loadInstructors(); // Reload instructors after deletion
        }).catch(error => {
          console.error('Error deleting instructor:', error);
        });
    } else {
      console.error('Instructor ID is undefined, cannot delete.');
    }
  }

  uploadPhoto(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Create a unique file path
      const filePath = `instructorPhotos/${new Date().getTime()}_${file.name}`;
      const fileRef = this.storage.ref(filePath);
      const task = this.storage.upload(filePath, file);

      // Get notified when the download URL is available
      task.snapshotChanges().pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe(url => {
            this.photoURL = url;
          });
        })
      ).subscribe();
    }
  }

  resetForm() {
    this.instructorForm.reset();
    this.editMode = false;
    this.currentInstructorId = undefined;
    this.formVisible = false; // Hide the form
  }

  toggleFormVisibility() {
    this.formVisible = !this.formVisible;
    if (!this.formVisible) {
      this.resetForm();
    }
  }

  // Custom validator for URLs
  urlValidator(control: AbstractControl): ValidationErrors | null {
    const url = control.value;
    if (!url || /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/.test(url)) {
      return null;
    } else {
      return { url: true };
    }
  }
}
