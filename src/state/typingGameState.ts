import { Mistake, TypingText, KeyLog } from "@/types/typing";
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
  keyHistory: KeyLog[]; // 追加: 全打鍵履歴
  flashCorrect: boolean;
  lastTypedKey: string | null;
  courseTexts: TypingText[];
  courseTitle: string | null; // コースタイトルを追加
}

export type GameAction =
  | { type: 'MAP_LOADED'; payload: { typingUnits: string[]; courseTexts: TypingText[] } }
  | { type: 'SET_COURSE_TITLE'; payload: { title: string | null } } // コースタイトル設定アクションを追加
  | { type: 'START_GAME'; payload: { startTime: number; typedKey: string } }
  | { type: 'PROCESS_KEY_INPUT'; payload: { 
      typedKey: string; 
      isCorrect: boolean; 
      isExactMatch: boolean; 
      buffer: string; 
      mistake?: { char: string; expected: string; actual: string; typedKey: string; kanaIndex: number; previousInputBuffer: string };
    } }
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
  keyHistory: [],
  flashCorrect: false,
  lastTypedKey: null,
  courseTexts: [],
  courseTitle: null, // 初期値はnull
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
        // totalKeystrokes: 1, // 削除: PROCESS_KEY_INPUTでカウントされるため、ここでは設定しない
        // START_GAME自体はキー履歴には追加しない（PROCESS_KEY_INPUTに任せるか、あるいはここで追加するか要確認だが、
        // 以下のPROCESS_KEY_INPUTで追加する方が確実な情報(isCorrect)を持てるため、useTypingGame側で調整する）
      };
    case 'PROCESS_KEY_INPUT':
      const { typedKey, isCorrect, isExactMatch, buffer, mistake } = action.payload;
      const newState = {
        ...state,
        lastTypedKey: typedKey,
        totalKeystrokes: state.totalKeystrokes + 1,
        keyHistory: [
          ...state.keyHistory,
          {
            key: typedKey,
            isMistake: !isCorrect,
            timestamp: Date.now(),
          },
        ],
      };

      if (isCorrect) {
        newState.error = false;
        newState.inputBuffer = buffer;

        if (isExactMatch) {
          newState.correctKeystrokes = state.correctKeystrokes + buffer.length; // Use buffer length, as it includes previous chars
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
        newState.inputBuffer = mistake.previousInputBuffer; // Revert buffer
        newState.mistakes = [...state.mistakes, mistake];
      }

      return newState;

    case 'RESET_FLASH':
      return {
        ...state,
        flashCorrect: false,
      };
    default:
      return state;
  }
};
