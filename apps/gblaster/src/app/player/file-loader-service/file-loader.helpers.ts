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

export interface FileData {
  file: File;
  fileHandle?: FileSystemFileHandle;
}
