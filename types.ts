
export interface Riddle {
  id: number;
  title: string;
  riddle: string;
  hint: string;
  answer: string;
  imageUrl: string;
  narrative: string;
}

export interface GameState {
  currentLevel: number;
  unlockedLevel: number;
  isFinished: boolean;
}
