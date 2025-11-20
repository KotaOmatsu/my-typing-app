import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react"; // Import useSession
import {
  getRomajiCandidates,
  useKanaRomajiMap,
} from "../components/KanaRomajiMap";
import { getTypingUnits } from "../utils/typingUtils";

const TYPING_TEXTS = ["わがはいはねこである。", "て。すと。", "あいうえお"];

// This interface is for the data passed to the result page via localStorage
interface LocalStorageResult {
  accuracy: number;
  wpm: number;
  mistakes: {
    char: string;
    expected: string;
    actual: string;
    typedKey: string;
    kanaIndex: number;
  }[];
  startTime: number;
  endTime: number;
  totalKeystrokes: number;
  correctKeystrokes: number;
  correctKanaUnits: number;
  typedText: string;
  displayUnits: string[];
}

export const useTypingGame = () => {
  const router = useRouter();
  const { data: session } = useSession(); // Get session data
  const isMapLoaded = useKanaRomajiMap();

  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [typingUnits, setTypingUnits] = useState<string[]>([]);
  const [currentKanaIndex, setCurrentKanaIndex] = useState(0);
  const [inputBuffer, setInputBuffer] = useState("");
  const [error, setError] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [correctKanaUnits, setCorrectKanaUnits] = useState(0);
  const [mistakes, setMistakes] = useState<LocalStorageResult['mistakes']>([]);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [flashCorrect, setFlashCorrect] = useState(false);
  const [lastTypedKey, setLastTypedKey] = useState<string | null>(null);

  useEffect(() => {
    if (isMapLoaded) {
      setTypingUnits(getTypingUnits(TYPING_TEXTS[currentTextIndex]));
      if (startTime === null) {
        // setStartTime(Date.now()); // Start time is set on first keypress
      }
    }
  }, [isMapLoaded, currentTextIndex, startTime]);

  const currentKana = typingUnits[currentKanaIndex];

  const calculateResult = useCallback(async () => {
    const endTime = Date.now();
    const durationSeconds = (endTime - (startTime || endTime)) / 1000;
    const accuracy = totalKeystrokes > 0 ? (correctKeystrokes / totalKeystrokes) * 100 : 0;
    const wpm = durationSeconds > 0 ? (correctKanaUnits / (durationSeconds / 60)) : 0;

    const resultDataForLocalStorage: LocalStorageResult = {
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

    // Save to localStorage for result page (for all users)
    localStorage.setItem("typingResult", JSON.stringify(resultDataForLocalStorage));

    // If logged in, save result to database via API (Temporarily Disabled)
    /*
    if (session) {
      const resultForApi = {
        wpm: resultDataForLocalStorage.wpm,
        accuracy: resultDataForLocalStorage.accuracy,
        mistakes: mistakes.length,
      };

      try {
        const response = await fetch('/api/results', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(resultForApi),
        });

        if (response.ok) {
          console.log('Typing result saved successfully!');
        } else {
          console.error('Failed to save typing result:', await response.json());
        }
      } catch (error) {
        console.error('Error while saving typing result:', error);
      }
    }
    */

    router.push("/result");
  }, [
    correctKeystrokes,
    correctKanaUnits,
    mistakes,
    router,
    session, // Add session to dependency array
    startTime,
    totalKeystrokes,
  ]);

  const checkRomajiMatch = useCallback(
    (
      kana: string,
      buffer: string,
      nextTypingUnit?: string
    ): { exact: boolean; partial: boolean } => {
      const symbolMap: { [key: string]: string } = {
        "。": ".",
        "、": ",",
        "「": "[",
        "」": "]",
      };
      if (symbolMap[kana]) {
        const expectedKey = symbolMap[kana];
        return {
          exact: buffer === expectedKey,
          partial: expectedKey.startsWith(buffer),
        };
      }

      let possibleRomajiCandidates: string[] = [];

      if (kana === "っ") {
        possibleRomajiCandidates = [...getRomajiCandidates(kana)];
        if (nextTypingUnit) {
          const nextKanaRomajiCandidates = getRomajiCandidates(nextTypingUnit);
          if (nextKanaRomajiCandidates.length > 0) {
            const firstCharOfNextRomaji = nextKanaRomajiCandidates[0]?.[0];
            if (firstCharOfNextRomaji) {
              possibleRomajiCandidates.push(
                firstCharOfNextRomaji + firstCharOfNextRomaji
              );
            }
          }
        }
      } else if (kana === "ん") {
        if (nextTypingUnit && "あいうえおやゆよ".includes(nextTypingUnit)) {
          possibleRomajiCandidates = ["nn", "n'"];
        } else {
          possibleRomajiCandidates = ["n", "nn", "n'"];
        }
      } else {
        possibleRomajiCandidates = getRomajiCandidates(kana);
      }

      let exact = false;
      let partial = false;

      for (const candidate of possibleRomajiCandidates) {
        if (candidate === buffer) {
          exact = true;
          break; // Found an exact match
        }
        if (candidate.startsWith(buffer)) {
          partial = true; // Found a partial match
        }
      }

      if (exact) {
        partial = false;
      }

      return { exact, partial };
    },
    []
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isMapLoaded) return; // マップがロードされていない場合は処理しない

      if (e.key === "Escape") {
        router.push("/"); // Escキーでスタート画面に戻る
        return;
      }

      if (!isGameStarted) {
        setIsGameStarted(true);
        setStartTime(Date.now());
      }

      const typedChar = e.key;
      setLastTypedKey(typedChar); // 最後に打たれたキーを更新

      // タイピングに必要なキーのみを処理
      const isTypingKey =
        /^[a-zA-Z]$/.test(typedChar) ||
        ["-", ",", ".", "/", "?", "!", "(", ")", "[", "]", ":", ";"].includes(
          typedChar
        );

      if (!isTypingKey) {
        return; // タイピングに関係ないキーは無視
      }

      e.preventDefault(); // ブラウザのデフォルト動作（スペースキーでのスクロールなど）を防止

      const newBuffer = inputBuffer + typedChar;
      setInputBuffer(newBuffer);
      setTotalKeystrokes((prev) => prev + 1); // 総打鍵数をインクリメント

      const { exact: isExactMatch, partial: isPartialMatch } = checkRomajiMatch(
        currentKana,
        newBuffer,
        typingUnits[currentKanaIndex + 1]
      );

      if (isExactMatch) {
        setCorrectKeystrokes((prev) => prev + newBuffer.length); // 正解打鍵数をインクリメント
        setCorrectKanaUnits((prev) => prev + 1); // 正解仮名数をインクリメント
        setError(false);
        setInputBuffer(""); // 即座にクリア
        setFlashCorrect(true); // フラッシュ開始
        setTimeout(() => setFlashCorrect(false), 200); // 200ms後にフラッシュ終了

        if (currentKanaIndex < typingUnits.length - 1) {
          // Use typingUnits.length
          setCurrentKanaIndex((prev) => prev + 1);
        } else {
          if (currentTextIndex < TYPING_TEXTS.length - 1) {
            setCurrentTextIndex((prev) => prev + 1);
            setCurrentKanaIndex(0);
          } else {
            calculateResult();
          }
        }
      } else if (!isPartialMatch) {
        setError(true);
        const expectedRomajiForError =
          currentKana === "っ"
            ? "次の子音"
            : getRomajiCandidates(currentKana).join("/");
        const precedingCharCount = TYPING_TEXTS.slice(0, currentTextIndex)
          .map((text) => getTypingUnits(text).length)
          .reduce((a, b) => a + b, 0);

        // Add the number of newline characters from previous texts
        const absoluteKanaIndex =
          precedingCharCount + currentTextIndex + currentKanaIndex;

        setMistakes((prev) => [
          ...prev,
          {
            char: currentKana,
            expected: expectedRomajiForError,
            actual: newBuffer,
            typedKey: typedChar,
            kanaIndex: absoluteKanaIndex,
          },
        ]);
        setInputBuffer(""); // エラー時はバッファをクリア
      }
    },
    [
      calculateResult,
      checkRomajiMatch,
      currentKana,
      currentKanaIndex,
      currentTextIndex,
      inputBuffer,
      isMapLoaded,
      router,
      isGameStarted,
      typingUnits,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    isMapLoaded,
    typingUnits,
    currentKanaIndex,
    inputBuffer,
    error,
    flashCorrect,
    isGameStarted,
    lastTypedKey,
    mistakes,
    handleKeyDown,
  };
};
