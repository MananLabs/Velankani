declare module 'node-record-lpcm16' {
  import { Writable } from 'stream';

  interface RecorderOptions {
    sampleRate?: number;
    channels?: number;
    audioType?: string;
    device?: string;
  }

  interface Recorder extends Writable {
    stop(): void;
    pause(): void;
    resume(): void;
  }

  export function record(options?: RecorderOptions): Recorder;
}
