import { DOCUMENT, inject, Service } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EventManager } from '@angular/platform-browser';
import { Observable, Subscription } from 'rxjs';
import { HotkeysHelpDialogComponent } from './hotkeys-help-dialog.component';

export interface Hotkey {
  element: HTMLElement;
  keys: string;
  description: string;
  callback: () => unknown;
}

export interface HotkeyInfo {
  description: string;
  subscription: Subscription;
}

/**
Registers keyboard shortcuts and manages their help dialog.
*/
@Service()
export class HotkeysService {
  readonly #eventManager = inject(EventManager);
  readonly #document = inject(DOCUMENT);
  readonly #dialog = inject(MatDialog);

  readonly #defaults: Partial<Hotkey> = {
    element: this.#document.documentElement
  };

  readonly #hotkeys: Map<string, HotkeyInfo> = new Map<string, HotkeyInfo>();

  #helpOpen = false;

  #dialogRef?: MatDialogRef<HotkeysHelpDialogComponent>;

  #pause = false;

  /**
  Registers the shortcut that opens the hotkeys help dialog.
  */
  initialize() {
    this.register({
      keys: 'shift+h',
      description: 'Öffnet diesen Hilfe-Dialog',
      callback: () => {
        this.toggleHelpDialog();
      }
    });
  }

  /**
  Registers a hotkey and returns its normalized key string when successful.
  @param options Hotkey configuration, including its key combination and callback.
  */
  register(options: Partial<Hotkey>): string | undefined {
    if (!options.keys) {
      return;
    }

    if (this.#hotkeys.get(options.keys)) {
      console.warn(`Hotkey ${options.keys} ist bereits registriert!`);
      return;
    }

    const merged = {
      ...this.#defaults,
      ...options,
      keys: options.keys.replaceAll('+', '.')
    };
    const event = `keydown.${merged.keys}`;

    const observable = new Observable((observer) => {
      const handler = (e: KeyboardEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!this.#pause) {
          observer.next(e);
        }
        return false;
      };

      if (merged.element) {
        const dispose = this.#eventManager.addEventListener(merged.element, event, handler);
        return () => {
          dispose();
          this.#hotkeys.delete(merged.keys);
        };
      }
      return () => {
        /*
        empty
        */
      };
    });

    const sub = observable.subscribe(options.callback);
    this.#hotkeys.set(merged.keys, {
      description: merged.description ?? '',
      subscription: sub
    });

    return merged.keys;
  }

  /**
  Removes a previously registered hotkey by its key combination.
  @param keys Key combination used when the hotkey was registered.
  */
  unregister(keys: string) {
    const realKeys = keys.replaceAll('+', '.');
    const hk = this.#hotkeys.get(realKeys);

    if (hk) {
      hk.subscription.unsubscribe();
    } else {
      console.warn(`Hotkey ${keys} ist nicht registriert`);
    }
  }

  /**
  Temporarily disables registered hotkey callbacks.
  */
  pause() {
    this.#pause = true;
  }

  /**
  Re-enables registered hotkey callbacks.
  */
  resume() {
    this.#pause = false;
  }

  /**
  Opens or closes the dialog listing all registered hotkeys.
  */
  toggleHelpDialog() {
    if (this.#helpOpen) {
      this.#helpOpen = false;
      this.#dialogRef?.close();
    } else {
      this.#helpOpen = true;
      const dialogReference = this.#dialog.open(HotkeysHelpDialogComponent, {
        width: '360px',
        hasBackdrop: false,
        data: { registeredHotkeys: this.#hotkeys }
      });
      dialogReference.afterClosed().subscribe(() => {
        this.#helpOpen = false;
      });
      this.#dialogRef = dialogReference;
    }
  }
}
