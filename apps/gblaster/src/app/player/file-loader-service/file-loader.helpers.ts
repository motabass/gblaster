export const ALLOWED_MIMETYPES = [
  'audio/mp3',
  'audio/mpeg',
  'audio/x-aiff',
  'audio/ogg',
  'audio/vorbis',
  'audio/vnd.wav',
  'audio/flac',
  'audio/wav',
  'audio/mp4',
  'audio/opus'
];

export const ALLOWED_EXTENSIONS = ['mp3', 'flac', 'ogg', 'wav', 'aiff', 'opus', 'mp4'];

export interface FileData {
  file: File;
  fileHandle?: FileSystemFileHandle;
}
