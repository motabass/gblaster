import { DBConfig } from 'ngx-indexed-db';

export const databaseConfig: DBConfig = {
  name: 'gblasterDB',
  version: 3,
  objectStoresMeta: [
    {
      store: 'library',
      storeConfig: { keyPath: 'hash', autoIncrement: false },
      storeSchema: [
        { name: 'hash', keypath: 'hash', options: { unique: true } },
        { name: 'artist', keypath: 'artist', options: { unique: false } },
        { name: 'title', keypath: 'title', options: { unique: false } },
        { name: 'album', keypath: 'album', options: { unique: false } }
      ]
    },
    {
      store: 'directoryHandles',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [{ name: 'handle', keypath: 'handle', options: { unique: false } }]
    }
  ]
};
