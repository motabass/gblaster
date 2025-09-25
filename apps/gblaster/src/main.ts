import { appConfig } from './app/app.config';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

// eslint-disable-next-line no-console
bootstrapApplication(AppComponent, appConfig).catch((error) => console.error(error));
