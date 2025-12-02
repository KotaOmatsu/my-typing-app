import { useEffect, useCallback, useReducer } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getRomajiCandidates, useKanaRomajiMap } from "../components/KanaRomajiMap";
import { getTypingUnits } from "../utils/typingUtils";
import { TypingText } from "@/types/typing";

// --- Custom Hook ---

export const useTypingGame = (courseId?: string) => {
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
    currentTextIndex,
    courseTexts // Added to state
  } = state;

  useEffect(() => {
    const loadCourse = async () => {
      if (!isMapLoaded) return;

      let texts: TypingText[] = [];
      
      if (courseId) {
        try {
          const res = await fetch(`/api/courses/${courseId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.texts && Array.isArray(data.texts) && data.texts.length > 0) {
              texts = data.texts;
            }
          } else {
            console.error("Failed to fetch course:", res.statusText);
          }
        } catch (error) {
          console.error("Error fetching course:", error);
        }
      }

      // Fallback if API failed or no courseId
      if (texts.length === 0) {
        // Minimal fallback to prevent crash
        texts = [{ id: "fallback", display: "読み込みエラー", reading: "よみこみえらー" }];
      }

      dispatch({ 
        type: 'MAP_LOADED', 
        payload: { 
          typingUnits: getTypingUnits(texts[0].reading),
          courseTexts: texts 
        } 
      });
    };

    loadCourse();
  }, [isMapLoaded, courseId]);

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
        if (currentTextIndex < courseTexts.length - 1) {
          dispatch({ type: 'NEXT_TEXT' });
        } else {
          dispatch({ type: 'FINISH_GAME' });
        }
      }
    } else if (!isPartialMatch) {
      const expectedRomajiForError = getRomajiCandidates(currentKana).join("/");
      const precedingCharCount = courseTexts.slice(0, currentTextIndex).map(text => getTypingUnits(text.reading).length).reduce((a, b) => a + b, 0);
      const absoluteKanaIndex = precedingCharCount + currentKanaIndex;

      dispatch({
        type: 'INCORRECT_KEY',
        payload: { char: currentKana, expected: expectedRomajiForError, actual: newBuffer, typedKey: typedChar, kanaIndex: absoluteKanaIndex },
      });
    }
  }, [status, inputBuffer, typingUnits, currentKanaIndex, currentTextIndex, router, courseTexts]);

    // ゲーム終了時の処理
    useEffect(() => {
        if (status === 'finished' && startTime) {
            const endTime = Date.now();
            const elapsedTime = endTime - startTime;

            const wpm = totalKeystrokes > 0 ? (correctKanaUnits / (elapsedTime / 1000)) * 60 : 0;
            const accuracy = totalKeystrokes > 0 ? (correctKeystrokes / totalKeystrokes) * 100 : 0;

            // 全テキストのデータを結合する (courseTextsを使用)
            const allTypedText = courseTexts.map(t => t.reading).join("");
            const allDisplayText = courseTexts.map(t => t.display).join(" ");
            const allDisplayUnits = courseTexts.flatMap(t => getTypingUnits(t.reading));

            const result = {
                wpm: wpm,
                accuracy: accuracy,
                totalKeystrokes: totalKeystrokes,
                correctKeystrokes: correctKeystrokes,
                mistakes: mistakes,
                typedText: allTypedText,
                displayText: allDisplayText,
                displayUnits: allDisplayUnits,
            };

            // 既存のlocalStorageへの保存
            localStorage.setItem('typingResult', JSON.stringify(result));

            // ログインしている場合のみ、分離したサービス関数を呼び出して結果をDBに保存
            if (session) {
                saveTypingResult({
                    wpm: result.wpm,
                    accuracy: result.accuracy,
                    mistakeCount: result.mistakes.length,
                    totalKeystrokes: result.totalKeystrokes,
                    correctKeystrokes: result.correctKeystrokes,
                    text: result.displayText, // DBには表示用テキストを保存
                    mistakeDetails: result.mistakes,
                });
            }

            // 結果ページへのリダイレクト
            router.push('/result');
        }
    }, [status, startTime, totalKeystrokes, correctKeystrokes, correctKanaUnits, mistakes, currentTextIndex, router, session, typingUnits, courseTexts]);

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
    currentDisplayText: courseTexts[currentTextIndex]?.display || "",
    handleKeyDown, // handleKeyDown is still returned for potential future use, though not directly used by TypingGame component anymore
  };
};
