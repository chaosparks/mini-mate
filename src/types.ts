export enum FileStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export enum FileType {
  JS = 'JS',
  CSS = 'CSS',
  IMAGE = 'IMAGE',
  UNKNOWN = 'UNKNOWN'
}

export interface MinifyResult {
  blob: Blob;
  fileName: string;
  originalSize: number;
  newSize: number;
}

export interface ProcessedFile {
  id: string;
  file: File;
  status: FileStatus;
  type: FileType;
  progress: number;
  result?: MinifyResult;
  error?: string;
  options?: {
    convertToWebP?: boolean;
  };
}
