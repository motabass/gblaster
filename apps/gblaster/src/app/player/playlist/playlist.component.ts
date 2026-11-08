import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  Injector,
  signal,
  Signal,
  untracked,
  viewChild
} from '@angular/core';
import { EMPTY, fromEvent, ignoreElements, map, merge, switchMap, tap } from 'rxjs';
import { PlayerService } from '../player.service';
import { Track } from '../player.types';
import { AudioService } from '../audio.service';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { VisualsDirective } from '../visualizer/visuals/visuals.directive';

import {
  MatList,
  MatListItem,
  MatListItemAvatar,
  MatListItemLine,
  MatListItemMeta,
  MatListItemTitle
} from '@angular/material/list';
import { CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatMenu, MatMenuContent, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';

/** Height of a playlist row in px; must match the list item height in the stylesheet. */
const ITEM_SIZE = 72;
/** Distance from the bottom (px) within which autoscroll stays enabled. */
const AUTOSCROLL_BOTTOM_THRESHOLD = 140;
/** Maximum scroll distance (in items) that is animated; farther jumps are instant. */
const SMOOTH_SCROLL_MAX_DISTANCE = 20;
/** Time window (ms) after a programmatic scroll in which scroll events are not treated as user input. */
const PROGRAMMATIC_SCROLL_TIMEOUT_MS = 1000;
/** Number of items at the viewport edges that count as "not visible" for the current track. */
const VISIBLE_MARGIN_ITEMS = 1;

@Component({
  selector: 'mtb-playlist',
  imports: [
    MatList,
    MatListItem,
    MatListItemAvatar,
    MatListItemTitle,
    MatListItemLine,
    MatListItemMeta,
    VisualsDirective,
    MatIconButton,
    MatIcon,
    CdkVirtualScrollViewport,
    CdkVirtualForOf,
    CdkFixedSizeVirtualScroll,
    MatMenu,
    MatMenuItem,
    MatMenuContent,
    MatMenuTrigger
  ],
  templateUrl: './playlist.component.html',
  styleUrl: './playlist.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaylistComponent {
  readonly #audioService = inject(AudioService);
  readonly #injector = inject(Injector);
  protected readonly playerService = inject(PlayerService);

  private readonly menuTrigger = viewChild<MatMenuTrigger>('menuTrigger');
  private readonly scrollViewport = viewChild<CdkVirtualScrollViewport>('scrollViewport');

  readonly #isAutoScrollEnabled = signal(false);
  readonly #playlistLength = computed(() => this.playerService.currentPlaylist().length);
  readonly #currentHash = computed(() => this.playerService.currentlyLoadedTrack()?.metadata?.hash);

  #programmaticScrollUntil = 0;
  #lastScrolledHash: string | undefined;

  protected readonly itemSize = ITEM_SIZE;

  constructor() {
    this.#trackUserScrolling();

    // Scroll to bottom when tracks are added and autoscroll is enabled
    effect(() => {
      const length = this.#playlistLength();
      const shouldScroll = untracked(this.#isAutoScrollEnabled);
      if (!shouldScroll || length === 0) return;
      afterNextRender(() => this.#scrollToBottom(), { injector: this.#injector });
    });

    // Scroll to the current track once when it starts playing
    effect(() => {
      const hash = this.#currentHash();
      const isPlaying = this.#audioService.isPlaying();
      if (!isPlaying || !hash || hash === this.#lastScrolledHash) return;
      this.#lastScrolledHash = hash;
      afterNextRender(() => this.#scrollToCurrentTrack(), { injector: this.#injector });
    });
  }

  /** Autoscroll is on while the user is at the bottom; our own scrolls are ignored. */
  #trackUserScrolling(): void {
    toObservable(this.scrollViewport)
      .pipe(
        switchMap((viewport) => {
          if (!viewport) return EMPTY;
          const element = viewport.elementRef.nativeElement;

          // Real user input cancels the programmatic-scroll guard
          const userInput$ = merge(
            fromEvent(element, 'wheel', { passive: true }),
            fromEvent(element, 'touchstart', { passive: true }),
            fromEvent(element, 'pointerdown'),
            fromEvent(element, 'keydown')
          ).pipe(
            tap(() => (this.#programmaticScrollUntil = 0)),
            ignoreElements()
          );

          return merge(userInput$, viewport.elementScrolled().pipe(map(() => viewport)));
        }),
        takeUntilDestroyed()
      )
      .subscribe((viewport) => {
        if (performance.now() < this.#programmaticScrollUntil) return;
        this.#isAutoScrollEnabled.set(viewport.measureScrollOffset('bottom') < AUTOSCROLL_BOTTOM_THRESHOLD);
      });
  }

  /** Suppresses user-scroll detection while a programmatic (possibly smooth) scroll is running. */
  #markProgrammaticScroll(): void {
    this.#programmaticScrollUntil = performance.now() + PROGRAMMATIC_SCROLL_TIMEOUT_MS;
  }

  /** Smoothly scrolls to the last playlist entry. */
  #scrollToBottom(): void {
    const viewport = this.scrollViewport();
    const length = this.#playlistLength();
    if (!viewport || length === 0) return;
    this.#markProgrammaticScroll();
    viewport.scrollToIndex(length - 1, 'smooth');
  }

  /**
   * Centers the currently loaded track if it is (nearly) outside the visible area.
   * Uses smooth scrolling for short distances and an instant jump for long ones.
   */
  #scrollToCurrentTrack(): void {
    const viewport = this.scrollViewport();
    const currentTrack = this.playerService.currentlyLoadedTrack();
    if (!viewport || !currentTrack) return;

    const targetIndex = this.playerService
      .currentPlaylist()
      .findIndex((track) => track.metadata?.hash === currentTrack.metadata?.hash);
    if (targetIndex === -1) return;

    const scrollOffset = viewport.measureScrollOffset('top');
    const viewportHeight = viewport.getViewportSize();
    const firstVisible = Math.ceil(scrollOffset / ITEM_SIZE);
    const lastVisible = Math.floor((scrollOffset + viewportHeight) / ITEM_SIZE) - 1;

    const isOutside =
      targetIndex < firstVisible + VISIBLE_MARGIN_ITEMS || targetIndex > lastVisible - VISIBLE_MARGIN_ITEMS;
    if (!isOutside) return;

    // Center the track in the viewport
    const offset = Math.max(0, targetIndex * ITEM_SIZE - viewportHeight / 2 + ITEM_SIZE / 2);
    const distance = Math.abs(offset - scrollOffset) / ITEM_SIZE;

    this.#markProgrammaticScroll();
    viewport.scrollToOffset(offset, distance > SMOOTH_SCROLL_MAX_DISTANCE ? 'instant' : 'smooth');
  }

  isActive(song: Track): Signal<boolean> {
    return computed(() => {
      return (
        (this.#audioService.isPlaying() || this.#audioService.isPaused()) &&
        this.playerService.currentlyLoadedTrack()?.metadata?.hash === song.metadata?.hash
      );
    });
  }

  isPlaying(song: Track): Signal<boolean> {
    return computed(() => {
      return (
        this.#audioService.isPlaying() &&
        this.playerService.currentlyLoadedTrack()?.metadata?.hash === song.metadata?.hash
      );
    });
  }

  async playPauseSong(event: Event, song: Track): Promise<void> {
    event.stopPropagation();
    return this.playerService.playPauseTrack(song);
  }

  trackByHash(index: number, song: Track): string {
    return song.metadata.hash;
  }

  onContextMenu(event: MouseEvent, song: Track): void {
    event.preventDefault();
    const trigger = this.menuTrigger();
    if (!trigger) return;
    trigger.menuData = { song: song };

    // Open with position
    trigger.openMenu();

    // set position
    if (trigger.menu) {
      // Forcefully reset the menu position after it's opened
      setTimeout(() => {
        const overlayRef = document.querySelector('.cdk-overlay-pane:last-child') as HTMLElement;
        if (!overlayRef) {
          return;
        }

        overlayRef.style.position = 'absolute';
        overlayRef.style.left = `${event.clientX}px`;
        overlayRef.style.top = `${event.clientY}px`;
      }, 0);
    }
  }
}
