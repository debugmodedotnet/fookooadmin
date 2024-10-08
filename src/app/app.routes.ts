import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: 'event', loadComponent: () => import('./create-event/create-event.component').then(m => m.CreateEventComponent) },
    { path: 'add-speakers/:eventId', loadComponent: () => import('./create-event/add-speakers/add-speakers.component').then(m => m.AddSpeakersComponent) },
    { path: 'add-agenda/:eventId', loadComponent: () => import('./create-event/add-agenda/add-agenda.component').then(m => m.AddAgendaComponent) },

    { path: 'youtube', loadComponent: () => import('./youtube-setting/youtube-setting.component').then(m => m.YoutubeSettingComponent) },

    { path: 'quiz', loadComponent: () => import('./createquiz/createquiz.component').then(m => m.CreatequizComponent) },

    { path: 'instructor-setting', loadComponent: () => import('./instructor-setting/instructor-setting.component').then(m => m.InstructorSettingComponent) },
];
