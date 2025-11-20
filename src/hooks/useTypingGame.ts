import { useEffect, useCallback, useReducer } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getRomajiCandidates, useKanaRomajiMap } from "../components/KanaRomajiMap";
import { getTypingUnits } from "../utils/typingUtils";
import { TypingResult, Mistake } from "@/types/typing";
import { TYPING_TEXTS, LOCAL_STORAGE_RESULT_KEY } from "@/constants/typing";

// --- State, Action, Reducer ---

interface GameState {
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

type GameAction =
  | { type: 'MAP_LOADED'; payload: { typingUnits: string[] } }
  | { type: 'START_GAME'; payload: { startTime: number; typedKey: string } }
  | { type: 'TYPE_KEY'; payload: { typedKey: string; isCorrect: boolean; isPartial: boolean; buffer: string } }
  | { type: 'CORRECT_KEY'; payload: { bufferLength: number } }
  | { type: 'INCORRECT_KEY'; payload: { char: string; expected: string; actual: string; typedKey: string; kanaIndex: number } }
  | { type: 'NEXT_KANA' }
  | { type: 'NEXT_TEXT' }
  | { type: 'FINISH_GAME' }
  | { type: 'RESET_FLASH' };

const initialState: GameState = {
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

const reducer = (state: GameState, action: GameAction): GameState => {
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
        typingUnits: getTypingUnits(TYPING_TEXTS[state.currentTextIndex + 1]),
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

// --- Custom Hook ---

export const useTypingGame = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const isMapLoaded = useKanaRomajiMap();

  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    status,
    typingUnits,
    currentKanaIndex,
    inputBuffer,
    error,
    flashCorrect,
    lastTypedKey,
    mistakes,
    startTime,
    totalKeystrokes,
    correctKeystrokes,
    correctKanaUnits,
    currentTextIndex
  } = state;

  useEffect(() => {
    if (isMapLoaded) {
      dispatch({ type: 'MAP_LOADED', payload: { typingUnits: getTypingUnits(TYPING_TEXTS[0]) } });
    }
  }, [isMapLoaded]);

  const calculateResult = useCallback(async () => {
    const endTime = Date.now();
    const durationSeconds = (endTime - (startTime || endTime)) / 1000;
    const accuracy = totalKeystrokes > 0 ? (correctKeystrokes / totalKeystrokes) * 100 : 0;
    const wpm = durationSeconds > 0 ? (correctKanaUnits / (durationSeconds / 60)) : 0;

    const resultData: TypingResult = {
      accuracy: isNaN(accuracy) ? 0 : accuracy,
      wpm: isNaN(wpm) ? 0 : wpm,
      mistakes,
      startTime: startTime || 0,
      endTime,
      totalKeystrokes,
      correctKeystrokes,
      correctKanaUnits,
      typedText: TYPING_TEXTS.join("\n"),
      displayUnits: getTypingUnits(TYPING_TEXTS.join('\n')),
    };

    localStorage.setItem(LOCAL_STORAGE_RESULT_KEY, JSON.stringify(resultData));

    // Future database saving logic will go here
    if (session) {
      // const response = await fetch('/api/results', { ... });
    }

    router.push("/result");
  }, [correctKeystrokes, correctKanaUnits, mistakes, router, session, startTime, totalKeystrokes]);

  const checkRomajiMatch = useCallback((kana: string, buffer: string, nextTypingUnit?: string): { exact: boolean; partial: boolean } => {
    const symbolMap: { [key: string]: string } = { "。": ".", "、": ",", "「": "[", "」": "]" };
    if (symbolMap[kana]) {
      const expectedKey = symbolMap[kana];
      return { exact: buffer === expectedKey, partial: expectedKey.startsWith(buffer) };
    }

    let possibleRomajiCandidates: string[] = getRomajiCandidates(kana);
    if (kana === "っ" && nextTypingUnit) {
      const nextKanaRomaji = getRomajiCandidates(nextTypingUnit);
      if (nextKanaRomaji.length > 0 && nextKanaRomaji[0][0]) {
        possibleRomajiCandidates = [...possibleRomajiCandidates, nextKanaRomaji[0][0].repeat(2)];
      }
    } else if (kana === "ん") {
      possibleRomajiCandidates = (nextTypingUnit && "あいうえおやゆよ".includes(nextTypingUnit))
        ? ["nn", "n'"]
        : ["n", "nn", "n'"];
    }

    const exact = possibleRomajiCandidates.some(c => c === buffer);
    const partial = !exact && possibleRomajiCandidates.some(c => c.startsWith(buffer));
    return { exact, partial };
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (status === 'loading' || status === 'finished') return;

    if (e.key === "Escape") {
      router.push("/");
      return;
    }

    const typedChar = e.key;
    const isTypingKey = /^[a-zA-Z]$/.test(typedChar) || ["-", ",", ".", "[", "]"].includes(typedChar);
    if (!isTypingKey) return;

    e.preventDefault();

    if (status === 'idle') {
      dispatch({ type: 'START_GAME', payload: { startTime: Date.now(), typedKey: typedChar } });
    }

    const newBuffer = inputBuffer + typedChar;
    const currentKana = typingUnits[currentKanaIndex];
    const nextTypingUnit = typingUnits[currentKanaIndex + 1];

    dispatch({ type: 'TYPE_KEY', payload: { typedKey: typedChar, buffer: newBuffer, isCorrect: false, isPartial: false } });

    const { exact: isExactMatch, partial: isPartialMatch } = checkRomajiMatch(currentKana, newBuffer, nextTypingUnit);

    if (isExactMatch) {
      dispatch({ type: 'CORRECT_KEY', payload: { bufferLength: newBuffer.length } });
      setTimeout(() => dispatch({ type: 'RESET_FLASH' }), 200);

      if (currentKanaIndex < typingUnits.length - 1) {
        dispatch({ type: 'NEXT_KANA' });
      } else {
        if (currentTextIndex < TYPING_TEXTS.length - 1) {
          dispatch({ type: 'NEXT_TEXT' });
        } else {
          dispatch({ type: 'FINISH_GAME' });
        }
      }
    } else if (!isPartialMatch) {
      const expectedRomajiForError = getRomajiCandidates(currentKana).join("/");
      const precedingCharCount = TYPING_TEXTS.slice(0, currentTextIndex).map(text => getTypingUnits(text).length).reduce((a, b) => a + b, 0);
      const absoluteKanaIndex = precedingCharCount + currentTextIndex + currentKanaIndex;

      dispatch({
        type: 'INCORRECT_KEY',
        payload: { char: currentKana, expected: expectedRomajiForError, actual: newBuffer, typedKey: typedChar, kanaIndex: absoluteKanaIndex },
      });
    }
  }, [status, inputBuffer, typingUnits, currentKanaIndex, currentTextIndex, checkRomajiMatch, router]);

  useEffect(() => {
    if (status === 'finished') {
      calculateResult();
    }
  }, [status, calculateResult]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    isMapLoaded: status !== 'loading',
    typingUnits,
    currentKanaIndex,
    inputBuffer,
    error,
    flashCorrect,
    isGameStarted: status === 'running' || status === 'finished',
    lastTypedKey,
    mistakes,
    handleKeyDown, // handleKeyDown is still returned for potential future use, though not directly used by TypingGame component anymore
  };
};
