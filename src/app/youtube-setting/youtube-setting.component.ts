import { Component, OnInit } from '@angular/core';
import { IYoutubeVideos } from '../modules/home-youtube';
import { YoutubeVideoService } from '../services/youtube-video.service';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-youtube-setting',
  standalone: true,
  imports: [ReactiveFormsModule, NgFor, NgIf],
  templateUrl: './youtube-setting.component.html',
  styleUrl: './youtube-setting.component.scss'
})
export class YoutubeSettingComponent implements OnInit {

  videos: IYoutubeVideos[] = [];
  videoForm: FormGroup;
  editMode = false;
  currentVideoId?: string;
  formVisible = false;
  totalVideoCount = 0;

  constructor(private youtubeVideoService: YoutubeVideoService, private fb: FormBuilder) {
    this.videoForm = this.fb.group({
      Id: [''],
      Info: ['', [Validators.required, Validators.maxLength(100)]],
      Title: ['', Validators.required],
      Thumbnail: [''],
      Link: ['', [Validators.required, this.youtubeUrlValidator]],
      Tech: [''],
      displayAtHomePage: [false]
    });
  }

  ngOnInit(): void {
    this.loadVideos();
  }

  loadVideos() {
    this.youtubeVideoService.getVideos().subscribe(
      videos => {
        this.videos = videos;
        this.totalVideoCount = videos.length;
      },
      error => {
        console.error('Error loading videos:', error);
      }
    );
  }

  addOrUpdateVideo() {
    const vid = "video" + this.totalVideoCount + 1;
    this.videoForm?.get('Id')?.setValue(vid);
    if (this.editMode && this.currentVideoId) {
      this.updateVideo(this.currentVideoId, this.videoForm.value);
    } else {
      this.addVideo();
    }
  }

  addVideo() {
    this.youtubeVideoService.addVideo(this.videoForm.value).then(() => {
      this.resetForm();
      this.loadVideos(); // Reload videos after adding
    }).catch(error => {
      console.error('Error adding video:', error);
    });
  }

  updateVideo(id: string, video: IYoutubeVideos) {
    this.youtubeVideoService.updateVideo(id, video).then(() => {
      this.resetForm();
      this.loadVideos(); // Reload videos after update
    }).catch(error => {
      console.error('Error updating video:', error);
    });
  }

  editVideo(video: IYoutubeVideos) {
    this.videoForm.patchValue(video);
    this.editMode = true;
    this.currentVideoId = video.Id;
    this.formVisible = true; // Show the form
  }

  deleteVideo(id: string | undefined) {
    if (id) {
      this.youtubeVideoService.deleteVideo(id).then(() => {
        this.loadVideos(); // Reload videos after deletion
      }).catch(error => {
        console.error('Error deleting video:', error);
      });
    } else {
      console.error('Video ID is undefined, cannot delete.');
    }
  }

  resetForm() {
    this.videoForm.reset({
      Info: '',
      Title: '',
      Thumbnail: '',
      Link: '',
      Tech: '',
      displayAtHomePage: false
    });
    this.editMode = false;
    this.currentVideoId = undefined;
    this.formVisible = false; // Hide the form
  }

  showForm() {
    this.formVisible = true;
  }

  hideForm() {
    this.formVisible = false;
    this.resetForm(); // Reset the form when hiding
  }

  youtubeUrlValidator(control: AbstractControl): ValidationErrors | null {
    const url = control.value;
    const youtubePattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    if (!url || youtubePattern.test(url)) {
      return null;
    } else {
      return { youtubeUrl: true };
    }
  }
}
