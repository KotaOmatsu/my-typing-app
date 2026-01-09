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
  courseTitle: string | null; // コースタイトルを追加
  penaltyBackspacesNeeded: number; // BackSpaceペナルティ用
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
      settings: {
        realisticMode: boolean;
        backspacePenalty: boolean;
        hardcoreMode: boolean;
      };
      mistake?: { char: string; expected: string; actual: string; typedKey: string; kanaIndex: number; previousInputBuffer: string };
    } }
  | { type: 'PROCESS_BACKSPACE'; payload: { settings: { realisticMode: boolean; backspacePenalty: boolean } } }
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
  courseTitle: null, // 初期値はnull
  penaltyBackspacesNeeded: 0,
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
        totalKeystrokes: 1,
      };
    case 'PROCESS_KEY_INPUT':
      const { typedKey, isCorrect, isExactMatch, buffer, mistake, settings } = action.payload;

      // BackSpaceペナルティがある場合、解消されるまで入力を受け付けない
      if (state.penaltyBackspacesNeeded > 0) {
        return state;
      }

      const newState = {
        ...state,
        lastTypedKey: typedKey,
        totalKeystrokes: state.totalKeystrokes + 1,
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
        // Hardcore failure is handled by dispatching HARDCORE_FAIL from hook immediately after this if needed, 
        // or we can handle it here if we want to be strict. 
        // But for visual feedback, we might want to register the mistake first.
        
        newState.error = true;
        newState.mistakes = [...state.mistakes, mistake];

        if (settings.realisticMode) {
            // In realistic mode, we keep the wrong character in the buffer
            newState.inputBuffer = buffer; 
        } else {
            // In normal mode, we revert the buffer
            newState.inputBuffer = mistake.previousInputBuffer;
        }

        if (settings.backspacePenalty) {
            newState.penaltyBackspacesNeeded = state.penaltyBackspacesNeeded + 1;
        }
      }

      return newState;

    case 'PROCESS_BACKSPACE':
        const { settings: bsSettings } = action.payload;
        
        if (state.penaltyBackspacesNeeded > 0) {
            const newPenalty = state.penaltyBackspacesNeeded - 1;
            let newBuffer = state.inputBuffer;
            
            // If realistic mode is enabled, we need to remove the character from buffer as well
            if (bsSettings.realisticMode && state.inputBuffer.length > 0) {
                newBuffer = state.inputBuffer.slice(0, -1);
            }

            return {
                ...state,
                penaltyBackspacesNeeded: newPenalty,
                error: newPenalty > 0 || (bsSettings.realisticMode && newBuffer !== ""), // Error persists if penalty remains or buffer still has junk? Actually error should clear if penalty clears usually.
                // If realistic mode, error clears only if buffer becomes valid prefix. But simple logic: 
                // If penalty is gone, we let them type. Error flag might be used for styling (red text).
                // If penalty > 0, keep error true.
                // If penalty == 0, error = false (let them try again).
                inputBuffer: newBuffer,
                error: newPenalty > 0
            };
        }
        
        // Normal backspace behavior (no penalty active)
        if (state.inputBuffer.length > 0) {
             return {
                ...state,
                inputBuffer: state.inputBuffer.slice(0, -1),
                error: false, 
             };
        }
        return state;

    case 'HARDCORE_FAIL':
        // Reset game or set status to failed? 
        // "Restart on miss" - essentially reset.
        // We can just reload the map? Or reset vars.
        return {
            ...initialState,
            status: 'running', // Keep running but reset progress
            startTime: Date.now(), // Reset time or keep it? Prompt: "時間はリセットされない" (Time is NOT reset)
            // Ah, "Time is NOT reset". So we keep startTime.
            startTime: state.startTime, 
            typingUnits: state.typingUnits, // Keep current units? Or restart whole course? "Restart from beginning" usually means whole course.
            courseTexts: state.courseTexts,
            // Re-init current text
            currentTextIndex: 0,
            typingUnits: getTypingUnits(state.courseTexts[0]?.reading || ""),
            currentKanaIndex: 0,
            inputBuffer: "",
            error: false,
            // totalKeystrokes: state.totalKeystrokes, // Keep stats? Usually yes if time continues.
            // correctKeystrokes: 0, // Reset progress stats
            // correctKanaUnits: 0,
            mistakes: state.mistakes, // Keep mistakes history?
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
