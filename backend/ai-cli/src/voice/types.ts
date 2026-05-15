/**
 * Voice Input Module - Type Definitions
 */

export interface VoiceRecorderConfig {
  sampleRate?: number;
  channels?: number;
  device?: string;
  threshold?: number;
}

export interface RecordingResult {
  success: boolean;
  audioPath: string;
  duration: number;
  error?: string;
}

export interface SarvamSTTResponse {
  transcript: string;
  confidence?: number;
  language?: string;
  error?: string;
}

export interface VoiceInputOptions {
  timeout?: number;
  silenceThreshold?: number;
  maxRecordingTime?: number;
}

export type InputMode = 'text' | 'voice' | 'document' | 'image' | 'web-search';

export interface InputModeSelection {
  mode: InputMode;
  prompt?: string;
}
