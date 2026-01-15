import { useEffect, useCallback, useReducer } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getRomajiCandidates, useKanaRomajiMap } from "../components/KanaRomajiMap";
import { getTypingUnits } from "../utils/typingUtils";
import { TypingText } from "@/types/typing";
import { initialState, reducer } from "@/state/typingGameState";
import { saveTypingResult } from "@/services/typingResultService";
import { checkRomajiMatch } from "@/utils/romajiUtils";
import { useGameSettings } from "./useGameSettings";
import { soundManager } from "../utils/soundUtils";

// --- Custom Hook ---

export const useTypingGame = (courseId?: string) => {
  const router = useRouter();
  const { data: session } = useSession();
  const isMapLoaded = useKanaRomajiMap();
  const { settings } = useGameSettings();

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
    currentTextIndex,
    courseTexts,
    courseTitle,
  } = state;

  useEffect(() => {
    let isCancelled = false;

    const loadCourse = async () => {
      if (!isMapLoaded) return;

      let texts: TypingText[] = [];
      
      if (courseId) {
        try {
          const res = await fetch(`/api/courses/${courseId}`);
          if (isCancelled) return; 

          if (res.ok) {
            const data = await res.json();
            if (isCancelled) return; 

            if (data.texts && Array.isArray(data.texts) && data.texts.length > 0) {
              texts = data.texts;
            }
            dispatch({ type: 'SET_COURSE_TITLE', payload: { title: data.title || null } });
          } else {
            console.error("Failed to fetch course:", res.statusText);
          }
        } catch (error) {
          if (isCancelled) return;
          console.error("Error fetching course:", error);
        }
      }

      if (texts.length === 0) {
        texts = [{ id: "fallback", display: "読み込みエラー", reading: "よみこみえらー" }];
        dispatch({ type: 'SET_COURSE_TITLE', payload: { title: "デフォルトコース" } });
      }

      if (!isCancelled) {
        dispatch({ 
            type: 'MAP_LOADED', 
            payload: { 
            typingUnits: getTypingUnits(texts[0].reading),
            courseTexts: texts 
            } 
        });
      }
    };

    loadCourse();

    return () => {
      isCancelled = true;
    };
  }, [isMapLoaded, courseId]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (status === 'loading' || status === 'finished') return;

    if (e.key === "Escape") {
      router.push("/");
      return;
    }

    // Handle Backspace
    if (e.key === "Backspace") {
        dispatch({ type: 'PROCESS_BACKSPACE', payload: { settings } });
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

    const { exact: isExactMatch, partial: isPartialMatch } = checkRomajiMatch(currentKana, newBuffer, nextTypingUnit);

    if (isExactMatch) {
      dispatch({ 
        type: 'PROCESS_KEY_INPUT', 
        payload: { 
          typedKey: typedChar, 
          isCorrect: true, 
          isExactMatch: true, 
          buffer: newBuffer,
          settings
        } 
      });
      setTimeout(() => dispatch({ type: 'RESET_FLASH' }), 200);
    } else if (isPartialMatch) {
      dispatch({ 
        type: 'PROCESS_KEY_INPUT', 
        payload: { 
          typedKey: typedChar, 
          isCorrect: true, 
          isExactMatch: false, 
          buffer: newBuffer,
          settings
        } 
      });
    } else {
      soundManager.playMissSound();

      if (settings.hardcoreMode) {
          dispatch({ type: 'HARDCORE_FAIL' });
          return;
      }

      const expectedRomajiForError = getRomajiCandidates(currentKana).join("/");
      const precedingCharCount = courseTexts.slice(0, currentTextIndex).map(text => getTypingUnits(text.reading).length).reduce((a, b) => a + b, 0);
      const absoluteKanaIndex = precedingCharCount + currentKanaIndex;

      dispatch({
        type: 'PROCESS_KEY_INPUT',
        payload: { 
          typedKey: typedChar, 
          isCorrect: false, 
          isExactMatch: false, 
          buffer: newBuffer,
          settings,
          mistake: { 
            char: currentKana, 
            expected: expectedRomajiForError, 
            actual: newBuffer, 
            typedKey: typedChar, 
            kanaIndex: absoluteKanaIndex,
            previousInputBuffer: inputBuffer, 
          }
        },
      });
    }
  }, [status, inputBuffer, typingUnits, currentKanaIndex, currentTextIndex, router, courseTexts, settings]);

    // Game Finished Logic
    useEffect(() => {
        if (status === 'finished' && startTime) {
            const endTime = Date.now();
            const elapsedTime = Math.max(1, endTime - startTime);  
            const durationSeconds = elapsedTime / 1000;

            const wpm = totalKeystrokes > 0 ? (correctKanaUnits / durationSeconds) * 60 : 0;
            const accuracy = totalKeystrokes > 0 ? (correctKeystrokes / totalKeystrokes) * 100 : 0;
            const score = durationSeconds > 0 
                ? Math.max(0, Math.round(((correctKeystrokes - mistakes.length) / durationSeconds) * 1000))
                : 0;

            const allTypedText = courseTexts.map(t => t.reading).join("");
            const allDisplayText = courseTexts.map(t => t.display).join(" ");
            const allDisplayUnits = courseTexts.flatMap(t => getTypingUnits(t.reading));
            const textLengths = courseTexts.map(t => getTypingUnits(t.reading).length);

            const result = {
                wpm: wpm,
                accuracy: accuracy,
                score: score,
                totalKeystrokes: totalKeystrokes,
                correctKeystrokes: correctKeystrokes,
                mistakes: mistakes,
                typedText: allTypedText,
                displayText: allDisplayText,
                displayUnits: allDisplayUnits,
                textLengths: textLengths,
                // Add startTime and endTime for potential future use in result display
                startTime: startTime, 
                endTime: endTime,
            };

            localStorage.setItem('typingResult', JSON.stringify(result));

            if (session) {
                saveTypingResult({
                    wpm: result.wpm,
                    accuracy: result.accuracy,
                    mistakeCount: result.mistakes.length,
                    score: result.score,
                    totalKeystrokes: result.totalKeystrokes,
                    correctKeystrokes: result.correctKeystrokes,
                    text: result.displayText, 
                    mistakeDetails: result.mistakes,
                    courseId: courseId, 
                });
            }

            // Delay redirect slightly to hear fanfare
            setTimeout(() => {
                router.push('/result');
            }, 2000);
        }
    }, [status, startTime, totalKeystrokes, correctKeystrokes, correctKanaUnits, mistakes, currentTextIndex, router, session, typingUnits, courseTexts, courseId, settings.soundEnabled]);

  const finishGame = useCallback(() => {
    dispatch({ type: 'FINISH_GAME' });
  }, []);

  const resetToStart = useCallback(() => {
    dispatch({ type: 'RESET_TO_START' });
  }, []);

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
    currentDisplayText: courseTexts[currentTextIndex]?.display || "",
    courseTitle,
    handleKeyDown,
    finishGame,
    resetToStart,
    // Live Stats
    startTime,
    totalKeystrokes,
    correctKeystrokes,
    // Page number
    currentTextIndex,
    courseTexts,
  };
};