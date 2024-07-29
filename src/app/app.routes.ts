import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: 'event', loadComponent: () => import('./create-event/create-event.component').then(m => m.CreateEventComponent) },
    { path: 'instructor', loadComponent: () => import('./create-instructor/create-instructor.component').then(m => m.CreateInstructorComponent) },
    { path: 'youtube', loadComponent: () => import('./youtube-setting/youtube-setting.component').then(m => m.YoutubeSettingComponent) },
    { path: 'quiz', loadComponent: () => import('./quiz/quiz.component').then(m => m.QuizComponent) },
    { path: 'instructor-setting', loadComponent: () => import('./instructor-setting/instructor-setting.component').then(m => m.InstructorSettingComponent) },
];
