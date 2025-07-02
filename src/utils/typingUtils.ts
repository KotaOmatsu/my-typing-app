import { getRomajiCandidates } from '../components/KanaRomajiMap';

// Helper function to break down text into typing units (handling 拗音 and 促音)
export const getTypingUnits = (text: string): string[] => {
  const units: string[] = [];
  let i = 0;
  while (i < text.length) {
    let currentUnit = text[i];
    let foundUnit = false;

    // Try to form a two-character unit first (e.g., 拗音, 促音)
    if (i + 1 < text.length) {
      const potentialTwoCharUnit = text.substring(i, i + 2);
      if (getRomajiCandidates(potentialTwoCharUnit).length > 0) {
        currentUnit = potentialTwoCharUnit;
        units.push(currentUnit);
        i += 2;
        foundUnit = true;
      }
    }

    // If no two-character unit found, try a single character unit
    if (!foundUnit) {
      if (getRomajiCandidates(currentUnit).length > 0) {
        units.push(currentUnit);
      } else {
        // If it's not a kana with romaji candidates (e.g., punctuation, space), add as is
        units.push(currentUnit);
      }
      i++;
    }
  }
  return units;
};
