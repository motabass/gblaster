import { getTestBed, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { BrowserTestingModule } from '@angular/platform-browser/testing';
import { afterEach, beforeAll } from 'vitest';

beforeAll(() => {
  getTestBed().initTestEnvironment(BrowserTestingModule, {
    errorOnUnknownElements: true,
    errorOnUnknownProperties: true
  });
  TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection()]
  });
});

afterEach(() => {
  getTestBed().resetTestingModule();
});
