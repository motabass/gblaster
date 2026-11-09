import { TestBed } from '@angular/core/testing';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { of, Subject, throwError } from 'rxjs';
import { IndexedDbTrackMetadata } from '../player.types';
import { MetadataService } from '../metadata-service/metadata.service';
import { LibraryService } from './library.service';

function createTrack(hash: string, artist?: string, album?: string): IndexedDbTrackMetadata {
  return {
    hash,
    artist,
    album,
    fileName: `${hash}.mp3`,
    format: {} as IndexedDbTrackMetadata['format'],
    coverUrl: { thumbUrl: '', originalUrl: '' }
  };
}

describe('LibraryService', () => {
  let libraryService: LibraryService;
  let tracks: IndexedDbTrackMetadata[];
  let deleteTrack: ReturnType<typeof vi.fn>;
  let revokeBlobUrlForTrack: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    tracks = [
      createTrack('album-a-1', 'Artist A', 'Shared Album'),
      createTrack('album-a-2', 'Artist A', 'Shared Album'),
      createTrack('album-b-1', 'Artist B', 'Shared Album'),
      createTrack('other-artist', 'Artist C', 'Other Album')
    ];
    deleteTrack = vi.fn().mockReturnValue(of(undefined));
    revokeBlobUrlForTrack = vi.fn();

    await TestBed.configureTestingModule({
      providers: [
        LibraryService,
        {
          provide: NgxIndexedDBService,
          useValue: {
            getAll: vi.fn().mockReturnValue(of(tracks)),
            delete: deleteTrack
          }
        },
        {
          provide: MetadataService,
          useValue: {
            applyEmbeddedCoverObjectUrsl: vi.fn((track: IndexedDbTrackMetadata) => track),
            revokeBlobUrlForTrack,
            revokeBlobUrlsForTracks: vi.fn()
          }
        }
      ]
    }).compileComponents();

    libraryService = TestBed.inject(LibraryService);
    await libraryService.loadLibraryFromDb();
  });

  it('removes the selected tracks from IndexedDB and the in-memory library', async () => {
    await libraryService.removeTracks([tracks[0], tracks[1]]);

    expect(deleteTrack.mock.calls).toEqual([
      ['library', 'album-a-1'],
      ['library', 'album-a-2']
    ]);
    expect(libraryService.indexedDbTracks().map((track) => track.hash)).toEqual(['album-b-1', 'other-artist']);
  });

  it('updates the in-memory library once all batch deletions have completed', async () => {
    const firstDelete = new Subject<void>();
    const secondDelete = new Subject<void>();
    deleteTrack.mockReturnValueOnce(firstDelete).mockReturnValueOnce(secondDelete);
    const currentTracks = libraryService.indexedDbTracks();

    const removal = libraryService.removeTracks([tracks[0], tracks[1]]);

    expect(deleteTrack.mock.calls).toEqual([
      ['library', 'album-a-1'],
      ['library', 'album-a-2']
    ]);
    expect(libraryService.indexedDbTracks()).toBe(currentTracks);

    firstDelete.next();
    firstDelete.complete();
    expect(libraryService.indexedDbTracks()).toBe(currentTracks);

    secondDelete.next();
    secondDelete.complete();
    await removal;

    expect(libraryService.indexedDbTracks()).not.toBe(currentTracks);
    expect(libraryService.indexedDbTracks().map((track) => track.hash)).toEqual(['album-b-1', 'other-artist']);
  });

  it('keeps the in-memory track and its artwork when IndexedDB deletion fails', async () => {
    deleteTrack.mockReturnValueOnce(throwError(() => new Error('database unavailable')));

    await expect(libraryService.removeTracks([tracks[0]])).rejects.toThrow('database unavailable');

    expect(libraryService.indexedDbTracks()).toContain(tracks[0]);
    expect(revokeBlobUrlForTrack).not.toHaveBeenCalled();
  });
});
