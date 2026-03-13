import { test, expect, Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const fixturesDir = path.resolve(__dirname, 'fixtures');

async function mockDirectoryPicker(page: Page) {
  const tekMp3 = fs.readFileSync(path.join(fixturesDir, 'tek.mp3'));
  const sineMp3 = fs.readFileSync(path.join(fixturesDir, '440Hz-5sec.mp3'));

  await page.addInitScript(
    ({ tekBase64, sineBase64 }) => {
      function base64ToArrayBuffer(base64: string): ArrayBuffer {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
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
          getFile: () => Promise.resolve(file),
          createWritable: () => Promise.reject(new Error('Not implemented')),
          isSameEntry: () => Promise.resolve(false),
          queryPermission: () => Promise.resolve('granted' as PermissionState),
          requestPermission: () => Promise.resolve('granted' as PermissionState),
        } as FileSystemFileHandle;
      }

      const fileHandles = files.map((file) => createMockFileHandle(file));

      const mockDirectoryHandle = {
        kind: 'directory',
        name: 'test-music',
        async *entries() {
          for (const [index, file] of files.entries()) {
            yield [file.name, fileHandles[index]] as [string, FileSystemFileHandle];
          }
        },
        async *keys() {
          for (const file of files) {
            yield file.name;
          }
        },
        async *values() {
          for (const handle of fileHandles) {
            yield handle;
          }
        },
        getFileHandle: () => Promise.reject(new Error('Not implemented')),
        getDirectoryHandle: () => Promise.reject(new Error('Not implemented')),
        removeEntry: () => Promise.reject(new Error('Not implemented')),
        resolve: () => Promise.resolve(null),
        isSameEntry: () => Promise.resolve(false),
        queryPermission: () => Promise.resolve('granted' as PermissionState),
        requestPermission: () => Promise.resolve('granted' as PermissionState),
      } as FileSystemDirectoryHandle;

      (window as Window & { showDirectoryPicker: () => Promise<FileSystemDirectoryHandle> }).showDirectoryPicker =
        () => Promise.resolve(mockDirectoryHandle);
    },
    {
      tekBase64: tekMp3.toString('base64'),
      sineBase64: sineMp3.toString('base64'),
    }
  );
}

async function loadFiles(page: Page) {
  await page.locator('#load_files').click();
}

test.describe('gblaster player', () => {
  test.beforeEach(async ({ page }) => {
    await mockDirectoryPicker(page);
    await page.goto('/player');

    // turn down volume
    await page.locator('#volume_button').click();
    await page.locator('#volume_slider').click({ position: { x: 0, y: 100 } });

    await loadFiles(page);
    await page.waitForTimeout(2500);
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
    const borderLeft = await playlistItems.nth(1).evaluate((el) => getComputedStyle(el).borderLeft);
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
  await page.goto('/library');
});
