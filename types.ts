
export type ComparisonResult = '<' | '>' | '=';

export interface MathQuestion {
  leftExpression: string;
  leftValue: number;
  rightExpression: string;
  rightValue: number;
  correctAnswer: ComparisonResult;
}

export interface Player {
  name: string;
  score: number;
  streak: number;
  questionsAnswered: number;
  color: string;
  avatar: string;
}

export enum GameState {
  START = 'START',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}
