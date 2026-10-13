import { expect, Page, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';

async function mockDirectoryPicker(page: Page, testFile: string) {
  const fixturesDirectory = path.resolve(path.dirname(testFile), 'fixtures');
  const tekMp3 = readFileSync(path.join(fixturesDirectory, 'tek.mp3'));
  const sineMp3 = readFileSync(path.join(fixturesDirectory, '440Hz-5sec.mp3'));

  await page.addInitScript(
    ({ tekBase64, sineBase64 }) => {
      function base64ToArrayBuffer(base64: string): ArrayBuffer {
        const binaryString = atob(base64);
        const bytes = Uint8Array.from(binaryString, (character) => character.codePointAt(0) ?? 0);
        return bytes.buffer;
      }

      const tekBuffer = base64ToArrayBuffer(tekBase64);
      const sineBuffer = base64ToArrayBuffer(sineBase64);

      const tekFile = new File([tekBuffer], 'tek.mp3', { type: 'audio/mpeg' });
      const sineFile = new File([sineBuffer], '440Hz-5sec.mp3', { type: 'audio/mpeg' });

      const files = [tekFile, sineFile];

      function createMockFileHandle(file: File): FileSystemFileHandle {
        return {
          kind: 'file',
          name: file.name,
          isFile: true,
          isDirectory: false,
          getFile: () => Promise.resolve(file),
          createWritable: () => Promise.reject(new Error('Not implemented')),
          isSameEntry: () => Promise.resolve(false),
          queryPermission: () => Promise.resolve('granted' as PermissionState),
          requestPermission: () => Promise.resolve('granted' as PermissionState)
        };
      }

      const fileHandles = files.map((file) => createMockFileHandle(file));

      const mockEntries = async function* () {
        await Promise.resolve();
        for (const [index, file] of files.entries()) {
          yield [file.name, fileHandles[index]] as [string, FileSystemFileHandle];
        }
      };
      const mockValues = async function* () {
        await Promise.resolve();
        for (const handle of fileHandles) {
          yield handle;
        }
      };

      const mockDirectoryHandle = {
        kind: 'directory',
        name: 'test-music',
        isFile: false,
        isDirectory: true,
        entries: mockEntries,
        async *keys() {
          await Promise.resolve();
          for (const file of files) {
            yield file.name;
          }
        },
        values: mockValues,
        getFileHandle: () => Promise.reject(new Error('Not implemented')),
        getDirectoryHandle: () => Promise.reject(new Error('Not implemented')),
        getFile: () => Promise.reject(new Error('Not implemented')),
        getDirectory: () => Promise.reject(new Error('Not implemented')),
        removeEntry: () => Promise.reject(new Error('Not implemented')),
        resolve: () => Promise.resolve(null),
        getEntries: mockValues,
        [Symbol.asyncIterator]: mockEntries,
        isSameEntry: () => Promise.resolve(false),
        queryPermission: () => Promise.resolve('granted' as PermissionState),
        requestPermission: () => Promise.resolve('granted' as PermissionState)
      } as FileSystemDirectoryHandle;

      Object.defineProperty(globalThis, 'showDirectoryPicker', {
        value: () => Promise.resolve(mockDirectoryHandle),
        configurable: true
      });

      function withoutFileHandle(value: unknown): unknown {
        if (value && typeof value === 'object' && 'fileHandle' in value) {
          const clone = { ...value };
          Reflect.deleteProperty(clone, 'fileHandle');
          return clone;
        }
        return value;
      }

      // Patch IDBObjectStore to strip non-cloneable mock fileHandle before storing
      const originalAdd = IDBObjectStore.prototype.add;
      IDBObjectStore.prototype.add = new Proxy(originalAdd, {
        apply: (target, objectStore, [value, key]) =>
          Reflect.apply(target, objectStore, [withoutFileHandle(value), key])
      });

      const originalPut = IDBObjectStore.prototype.put;
      IDBObjectStore.prototype.put = new Proxy(originalPut, {
        apply: (target, objectStore, [value, key]) =>
          Reflect.apply(target, objectStore, [withoutFileHandle(value), key])
      });
    },
    {
      tekBase64: tekMp3.toString('base64'),
      sineBase64: sineMp3.toString('base64')
    }
  );
}

async function loadFiles(page: Page) {
  await page.locator('#load_files').click();
}

test.describe('gblaster player', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await mockDirectoryPicker(page, testInfo.file);
    await page.goto('/player');

    // turn down volume
    await page.locator('#volume_button').click();
    await page.locator('#volume_slider').click({ position: { x: 0, y: 100 } });

    await loadFiles(page);
    await expect(page.locator('.playlist > mat-list-item')).toHaveCount(2);
  });

  test('should load a file with directory picker', async ({ page }) => {
    const playlistItems = page.locator('.playlist > mat-list-item');

    // initial playlist after load
    await expect(playlistItems).toHaveCount(2);
    await expect(playlistItems.first()).toBeVisible();
    await expect(playlistItems.first()).toContainText('Get U Freak On (_insane_teknology_rmx)');
    await expect(playlistItems.first()).toContainText('Teknambul');

    await expect(playlistItems.nth(1)).toBeVisible();
    await expect(playlistItems.nth(1)).toContainText('440Hz Sine Wave');

    // click second item
    await playlistItems.nth(1).click();
    const borderLeft = await playlistItems.nth(1).evaluate((element) => getComputedStyle(element).borderLeft);
    expect(borderLeft).toMatch(/4px solid/);
  });

  test('should play the file', async ({ page }) => {
    const playlistItems = page.locator('.playlist > mat-list-item');

    // play first song
    await playlistItems.first().dblclick();

    const coverDisplay = page.locator('mtb-cover-display');
    await expect(coverDisplay).toContainText('Get U Freak On (_insane_teknology_rmx)');
    await expect(coverDisplay).toContainText('Teknambul');
  });
});

test('library test', async ({ page }) => {
  await page.goto('/player/library');
  await expect(page.locator('.artists')).toBeVisible();
});
