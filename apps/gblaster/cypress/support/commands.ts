/* eslint-disable @typescript-eslint/no-namespace */
import 'cypress-file-upload';
import { getLoadFilesButton } from './player.po';

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      loadFiles(): Chainable<void>;
      mockDirectoryPicker(): Chainable<void>;
    }
  }
}

// Store files globally so we can access them from serialized handles
const mockFileStore = new Map<string, File>();

function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = Array.from({ length: byteCharacters.length });
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.codePointAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers as number[]);
  return new Blob([byteArray], { type: mimeType });
}

function createMockFileHandle(file: File): FileSystemFileHandle {
  // Store file in global map
  mockFileStore.set(file.name, file);

  // Create a serializable handle with getFile as a getter
  const handle = {
    kind: 'file',
    name: file.name,
    _mockFileName: file.name // Store reference for serialization
  };

  // Add non-enumerable methods that won't be serialized
  Object.defineProperty(handle, 'getFile', {
    value: () => Promise.resolve(mockFileStore.get(file.name)!),
    enumerable: false,
    writable: true
  });

  Object.defineProperty(handle, 'createWritable', {
    value: () => Promise.reject(new Error('Not implemented')),
    enumerable: false
  });

  Object.defineProperty(handle, 'isSameEntry', {
    value: () => Promise.resolve(false),
    enumerable: false
  });

  Object.defineProperty(handle, 'queryPermission', {
    value: () => Promise.resolve('granted' as PermissionState),
    enumerable: false
  });

  Object.defineProperty(handle, 'requestPermission', {
    value: () => Promise.resolve('granted' as PermissionState),
    enumerable: false
  });

  return handle as FileSystemFileHandle;
}

function createMockDirectoryHandle(files: File[]): FileSystemDirectoryHandle {
  const fileHandles = files.map((file) => createMockFileHandle(file));

  return {
    kind: 'directory',
    name: 'test-music',
    // eslint-disable-next-line @typescript-eslint/require-await
    entries: async function* () {
      for (const [index, file] of files.entries()) {
        yield [file.name, fileHandles[index]] as [string, FileSystemFileHandle];
      }
    },
    // eslint-disable-next-line @typescript-eslint/require-await
    keys: async function* () {
      for (const file of files) {
        yield file.name;
      }
    },
    // eslint-disable-next-line @typescript-eslint/require-await
    values: async function* () {
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
    requestPermission: () => Promise.resolve('granted' as PermissionState)
  } as FileSystemDirectoryHandle;
}

// Helper to restore FileHandle methods after IndexedDB retrieval
function restoreFileHandleMethods(handle: Record<string, unknown>): FileSystemFileHandle {
  if (handle && handle._mockFileName && typeof handle._mockFileName === 'string') {
    const fileName = handle._mockFileName;

    Object.defineProperty(handle, 'getFile', {
      value: () => Promise.resolve(mockFileStore.get(fileName)!),
      enumerable: false,
      writable: true
    });

    Object.defineProperty(handle, 'createWritable', {
      value: () => Promise.reject(new Error('Not implemented')),
      enumerable: false
    });

    Object.defineProperty(handle, 'isSameEntry', {
      value: () => Promise.resolve(false),
      enumerable: false
    });

    Object.defineProperty(handle, 'queryPermission', {
      value: () => Promise.resolve('granted' as PermissionState),
      enumerable: false
    });

    Object.defineProperty(handle, 'requestPermission', {
      value: () => Promise.resolve('granted' as PermissionState),
      enumerable: false
    });
  }

  return handle as FileSystemFileHandle;
}

// Mock File System Access API
Cypress.Commands.add('mockDirectoryPicker', () => {
  cy.fixture('tek.mp3', 'base64').then((tekMp3) => {
    cy.fixture('440Hz-5sec.mp3', 'base64').then((sineWave) => {
      cy.window().then((win) => {
        const tekBlob = base64ToBlob(tekMp3, 'audio/mpeg');
        const sineBlob = base64ToBlob(sineWave, 'audio/mpeg');

        const tekFile = new File([tekBlob], 'tek.mp3', { type: 'audio/mpeg' });
        const sineFile = new File([sineBlob], '440Hz-5sec.mp3', { type: 'audio/mpeg' });

        const mockDirectoryHandle = createMockDirectoryHandle([tekFile, sineFile]);

        // Mock showDirectoryPicker
        // eslint-disable-next-line sonarjs/no-nested-functions
        const mockPicker = () => Promise.resolve(mockDirectoryHandle);
        (win as unknown as Window & { showDirectoryPicker: typeof mockPicker }).showDirectoryPicker = mockPicker;

        // Intercept IndexedDB get operations to restore methods
        const originalOpen = win.indexedDB.open;
        win.indexedDB.open = function (...args) {
          const request = originalOpen.apply(win.indexedDB, args);

          request.addEventListener('success', () => {
            const db = request.result;
            const originalTransaction = db.transaction.bind(db);

            db.transaction = function (...txArgs) {
              const transaction = originalTransaction(...txArgs);
              const originalObjectStore = transaction.objectStore.bind(transaction);

              transaction.objectStore = function (...storeArgs) {
                const store = originalObjectStore(...storeArgs);
                const originalGet = store.get.bind(store);
                const originalGetAll = store.getAll.bind(store);

                store.get = function (...getArgs) {
                  const getRequest = originalGet(...getArgs);
                  getRequest.addEventListener('success', () => {
                    const result = getRequest.result;
                    if (result?.fileHandle?._mockFileName) {
                      result.fileHandle = restoreFileHandleMethods(result.fileHandle);
                    }
                  });
                  return getRequest;
                };

                store.getAll = function (...getAllArgs) {
                  const getAllRequest = originalGetAll(...getAllArgs);
                  getAllRequest.addEventListener('success', () => {
                    const results = getAllRequest.result;
                    if (Array.isArray(results)) {
                      for (const result of results) {
                        if (result?.fileHandle?._mockFileName) {
                          result.fileHandle = restoreFileHandleMethods(result.fileHandle);
                        }
                      }
                    }
                  });
                  return getAllRequest;
                };

                return store;
              };

              return transaction;
            };
          });

          return request;
        };
      });
    });
  });
});

//
// -- This is a parent command --
Cypress.Commands.add('loadFiles', () => {
  cy.log('Loading files...');
  cy.mockDirectoryPicker();
  getLoadFilesButton().click();
});
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
