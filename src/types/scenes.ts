export interface Scene {
  id: number;
  title: string;
  narration: string;
  visual: string;
  emoji: string;
  keyPoint: string;
}

export interface ScenesResponse {
  scenes: Scene[];
}
