import { Mistake, TypingText } from "@/types/typing";
import { getTypingUnits } from "@/utils/typingUtils";

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
  courseTexts: TypingText[];
  courseTitle: string | null;
}

export type GameAction =
  | { type: 'MAP_LOADED'; payload: { typingUnits: string[]; courseTexts: TypingText[] } }
  | { type: 'SET_COURSE_TITLE'; payload: { title: string | null } }
  | { type: 'START_GAME'; payload: { startTime: number; typedKey: string } }
  | { type: 'PROCESS_KEY_INPUT'; payload: { 
      typedKey: string; 
      isCorrect: boolean; 
      isExactMatch: boolean; 
      buffer: string; 
      settings: {
        realisticMode: boolean;
        hardcoreMode: boolean;
      };
      mistake?: { char: string; expected: string; actual: string; typedKey: string; kanaIndex: number; previousInputBuffer: string };
    } }
  | { type: 'PROCESS_BACKSPACE'; payload: { settings: { realisticMode: boolean } } }
  | { type: 'HARDCORE_FAIL' }
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
  courseTexts: [],
  courseTitle: null,
};

export const reducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'MAP_LOADED':
      return {
        ...state,
        status: 'idle',
        typingUnits: action.payload.typingUnits,
        courseTexts: action.payload.courseTexts,
      };
    case 'SET_COURSE_TITLE':
      return {
        ...state,
        courseTitle: action.payload.title,
      };
    case 'START_GAME':
      return {
        ...state,
        status: 'running',
        startTime: action.payload.startTime,
        lastTypedKey: action.payload.typedKey,
        totalKeystrokes: 0,
      };
    case 'PROCESS_KEY_INPUT':
      const { typedKey, isCorrect, isExactMatch, buffer, mistake, settings } = action.payload;

      const newState = {
        ...state,
        lastTypedKey: typedKey,
        totalKeystrokes: state.totalKeystrokes + 1,
      };

      if (isCorrect) {
        newState.correctKeystrokes = state.correctKeystrokes + 1;
        newState.error = false;
        newState.inputBuffer = buffer;

        if (isExactMatch) {
          newState.correctKanaUnits = state.correctKanaUnits + 1;
          newState.inputBuffer = ""; // Clear buffer on completion
          newState.flashCorrect = true;

          // Check if kana is finished
          if (state.currentKanaIndex < state.typingUnits.length - 1) {
            newState.currentKanaIndex = state.currentKanaIndex + 1;
          } else {
            // Check if text is finished
            if (state.currentTextIndex < state.courseTexts.length - 1) {
              newState.currentTextIndex = state.currentTextIndex + 1;
              newState.currentKanaIndex = 0;
              newState.typingUnits = getTypingUnits(state.courseTexts[state.currentTextIndex + 1]?.reading || "");
            } else {
              // Game finished
              newState.status = 'finished';
            }
          }
        }
      } else if (mistake) {
        newState.error = true;
        newState.mistakes = [...state.mistakes, mistake];

        if (settings.realisticMode) {
            // In realistic mode, we keep the wrong character in the buffer
            newState.inputBuffer = buffer; 
        } else {
            // In normal mode, we revert the buffer
            newState.inputBuffer = mistake.previousInputBuffer;
        }
      }

      return newState;

    case 'PROCESS_BACKSPACE':
        // Backspace behavior
        if (state.inputBuffer.length > 0) {
             return {
                ...state,
                inputBuffer: state.inputBuffer.slice(0, -1),
                error: false, 
             };
        }
        return state;

    case 'HARDCORE_FAIL':
        return {
            ...initialState,
            status: 'running', 
            startTime: state.startTime, 
            typingUnits: state.typingUnits, 
            courseTexts: state.courseTexts,
            currentTextIndex: 0,
            typingUnits: getTypingUnits(state.courseTexts[0]?.reading || ""),
            currentKanaIndex: 0,
            inputBuffer: "",
            error: false,
            mistakes: state.mistakes, 
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