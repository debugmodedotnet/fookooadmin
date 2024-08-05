import { PostQuizComponent } from './post-quiz/post-quiz.component';
import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: 'event', loadComponent: () => import('./create-event/create-event.component').then(m => m.CreateEventComponent) },
    { path: 'youtube', loadComponent: () => import('./youtube-setting/youtube-setting.component').then(m => m.YoutubeSettingComponent) },
    { path: 'quiz', loadComponent: () => import('./createquiz/createquiz.component').then(m => m.CreatequizComponent) },
    { path: 'post-quiz', loadComponent: () => import('./post-quiz/post-quiz.component').then(m => m.PostQuizComponent) },
    { path: 'instructor-setting', loadComponent: () => import('./instructor-setting/instructor-setting.component').then(m => m.InstructorSettingComponent) },
];
