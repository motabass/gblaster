import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EventManager } from '@angular/platform-browser';
import { Observable, Subscription } from 'rxjs';
import { HotkeysHelpDialogComponent } from './hotkeys-help-dialog.component';

export interface Hotkey {
  element: any;
  keys: string;
  description: string;
  callback: () => any;
}

export interface HotkeyInfo {
  description: string;
  subscription: Subscription;
}

@Injectable({ providedIn: 'root' })
export class HotkeysService {
  private eventManager = inject(EventManager);
  private document = inject<Document>(DOCUMENT);
  private dialog = inject(MatDialog);

  defaults: Partial<Hotkey> = {
    element: this.document
  };

  hotkeys: Map<string, HotkeyInfo> = new Map<string, HotkeyInfo>();

  helpOpen = false;

  dialogRef?: MatDialogRef<HotkeysHelpDialogComponent>;

  _pause = false;

  initialize() {
    this.register({
      keys: 'shift+h',
      description: 'Öffnet diesen Hilfe-Dialog',
      callback: () => {
        this.toggleHelpDialog();
      }
    });
  }

  register(options: Partial<Hotkey>): string | undefined {
    if (!options.keys) {
      return;
    }

    if (this.hotkeys.get(options.keys)) {
      console.warn(`Hotkey ${options.keys} ist bereits registriert!`);
      return;
    }

    const merged = { ...this.defaults, ...options, keys: options.keys.replace(/\+/g, '.') };
    const event = `keydown.${merged.keys}`;

    const observable = new Observable((observer) => {
      const handler = (e: KeyboardEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!this._pause) {
          observer.next(e);
        }
        return false;
      };

      const dispose = this.eventManager.addEventListener(merged.element, event, handler);

      return () => {
        dispose();
        this.hotkeys.delete(merged.keys);
      };
    });

    const sub = observable.subscribe(options.callback);
    this.hotkeys.set(merged.keys, { description: merged.description ?? '', subscription: sub });

    return merged.keys;
  }

  unregister(keys: string) {
    const realKeys = keys.replace(/\+/g, '.');
    const hk = this.hotkeys.get(realKeys);

    if (hk) {
      hk.subscription.unsubscribe();
    } else {
      console.warn(`Hotkey ${keys} ist nicht registriert`);
    }
  }

  pause() {
    this._pause = true;
  }

  resume() {
    this._pause = false;
  }

  toggleHelpDialog() {
    if (!this.helpOpen) {
      this.helpOpen = true;
      const dialogRef = this.dialog.open(HotkeysHelpDialogComponent, {
        width: '360px',
        hasBackdrop: false,
        data: { registeredHotkeys: this.hotkeys }
      });
      dialogRef.afterClosed().subscribe(() => {
        this.helpOpen = false;
      });
      this.dialogRef = dialogRef;
    } else {
      this.helpOpen = false;
      this.dialogRef?.close();
    }
  }
}
