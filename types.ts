
export interface Shape {
  type: string;
  count: number;
}

export interface RecognitionResult {
  id: string;
  timestamp: number;
  text: string;
  shapes: Shape[];
  thumbnail: string;
}

export interface GeminiResponse {
  text: string;
  shapes: Shape[];
}
