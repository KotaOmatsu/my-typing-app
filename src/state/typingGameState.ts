import { Mistake } from "@/types/typing";
import { getTypingUnits } from "@/utils/typingUtils";
import { TYPING_TEXTS } from "@/constants/typing";

// --- State, Action, Reducer ---

export interface GameState {
  status: 'loading' | 'idle' | 'running' | 'finished';
  currentTextIndex: number;
  typingUnits: string[];
  currentKanaIndex: number;
  inputBuffer: string;
  error: boolean;
  startTime: number | null;
  totalKeystrokes: number;
  correctKeystrokes: number;
  correctKanaUnits: number;
  mistakes: Mistake[];
  flashCorrect: boolean;
  lastTypedKey: string | null;
}

export type GameAction =
  | { type: 'MAP_LOADED'; payload: { typingUnits: string[] } }
  | { type: 'START_GAME'; payload: { startTime: number; typedKey: string } }
  | { type: 'TYPE_KEY'; payload: { typedKey: string; isCorrect: boolean; isPartial: boolean; buffer: string } }
  | { type: 'CORRECT_KEY'; payload: { bufferLength: number } }
  | { type: 'INCORRECT_KEY'; payload: { char: string; expected: string; actual: string; typedKey: string; kanaIndex: number } }
  | { type: 'NEXT_KANA' }
  | { type: 'NEXT_TEXT' }
  | { type: 'FINISH_GAME' }
  | { type: 'RESET_FLASH' };

export const initialState: GameState = {
  status: 'loading',
  currentTextIndex: 0,
  typingUnits: [],
  currentKanaIndex: 0,
  inputBuffer: "",
  error: false,
  startTime: null,
  totalKeystrokes: 0,
  correctKeystrokes: 0,
  correctKanaUnits: 0,
  mistakes: [],
  flashCorrect: false,
  lastTypedKey: null,
};

export const reducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'MAP_LOADED':
      return {
        ...state,
        status: 'idle',
        typingUnits: action.payload.typingUnits,
      };
    case 'START_GAME':
      return {
        ...state,
        status: 'running',
        startTime: action.payload.startTime,
        lastTypedKey: action.payload.typedKey,
        totalKeystrokes: 1,
      };
    case 'TYPE_KEY':
      return {
        ...state,
        inputBuffer: action.payload.buffer,
        lastTypedKey: action.payload.typedKey,
        totalKeystrokes: state.totalKeystrokes + 1,
        error: false,
      };
    case 'CORRECT_KEY':
      return {
        ...state,
        correctKeystrokes: state.correctKeystrokes + action.payload.bufferLength,
        correctKanaUnits: state.correctKanaUnits + 1,
        inputBuffer: "",
        flashCorrect: true,
      };
    case 'INCORRECT_KEY':
      return {
        ...state,
        error: true,
        inputBuffer: "",
        mistakes: [...state.mistakes, action.payload],
      };
    case 'NEXT_KANA':
      return {
        ...state,
        currentKanaIndex: state.currentKanaIndex + 1,
      };
    case 'NEXT_TEXT':
      return {
        ...state,
        currentTextIndex: state.currentTextIndex + 1,
        currentKanaIndex: 0,
        typingUnits: getTypingUnits(TYPING_TEXTS[state.currentTextIndex + 1].reading),
      };
    case 'FINISH_GAME':
      return {
        ...state,
        status: 'finished',
      };
    case 'RESET_FLASH':
      return {
        ...state,
        flashCorrect: false,
      };
    default:
      return state;
  }
};
