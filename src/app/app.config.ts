import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { AngularFireModule } from '@angular/fire/compat';
import { QuillModule } from 'ngx-quill'

const firebaseConfig = {
  apiKey: "AIzaSyBVl1Xpr8fF_Gc1G4KEcqJWX5eRWO7JNkE",
  authDomain: "nomadcoder-5020f.firebaseapp.com",
  projectId: "nomadcoder-5020f",
  storageBucket: "nomadcoder-5020f.appspot.com",
  messagingSenderId: "512585300990",
  appId: "1:512585300990:web:01a299717f417f05da9eaf",
  measurementId: "G-6BJP8YXTZ8"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),    
    importProvidersFrom(AngularFireModule.initializeApp(firebaseConfig), QuillModule.forRoot()),
  ]
};