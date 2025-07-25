import { DOCUMENT, inject, Injectable } from '@angular/core';
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
  private readonly eventManager = inject(EventManager);
  private readonly document = inject<Document>(DOCUMENT);
  private readonly dialog = inject(MatDialog);

  private readonly defaults: Partial<Hotkey> = {
    element: this.document
  };

  private readonly hotkeys: Map<string, HotkeyInfo> = new Map<string, HotkeyInfo>();

  private helpOpen = false;

  private dialogRef?: MatDialogRef<HotkeysHelpDialogComponent>;

  private _pause = false;

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

    const merged = { ...this.defaults, ...options, keys: options.keys.replaceAll('+', '.') };
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
    const realKeys = keys.replaceAll('+', '.');
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
    if (this.helpOpen) {
      this.helpOpen = false;
      this.dialogRef?.close();
    } else {
      this.helpOpen = true;
      const dialogReference = this.dialog.open(HotkeysHelpDialogComponent, {
        width: '360px',
        hasBackdrop: false,
        data: { registeredHotkeys: this.hotkeys }
      });
      dialogReference.afterClosed().subscribe(() => {
        this.helpOpen = false;
      });
      this.dialogRef = dialogReference;
    }
  }
}
