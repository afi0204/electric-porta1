// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component'; // It should import AppComponent

// This is the correct way to start a modern standalone application
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
