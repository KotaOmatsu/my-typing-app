// src/constants/fingerMapping.ts

export type FingerName = 
  | 'left-pinky' | 'left-ring' | 'left-middle' | 'left-index' | 'left-thumb'
  | 'right-thumb' | 'right-index' | 'right-middle' | 'right-ring' | 'right-pinky';

export const KEY_TO_FINGER: { [key: string]: FingerName } = {
  // Left Hand
  '1': 'left-pinky', 'q': 'left-pinky', 'a': 'left-pinky', 'z': 'left-pinky',
  '2': 'left-ring', 'w': 'left-ring', 's': 'left-ring', 'x': 'left-ring',
  '3': 'left-middle', 'e': 'left-middle', 'd': 'left-middle', 'c': 'left-middle',
  '4': 'left-index', 'r': 'left-index', 'f': 'left-index', 'v': 'left-index',
  '5': 'left-index', 't': 'left-index', 'g': 'left-index', 'b': 'left-index',
  
  // Thumbs
  ' ': 'left-thumb', // or right-thumb

  // Right Hand
  '6': 'right-index', 'y': 'right-index', 'h': 'right-index', 'n': 'right-index',
  '7': 'right-index', 'u': 'right-index', 'j': 'right-index', 'm': 'right-index',
  '8': 'right-middle', 'i': 'right-middle', 'k': 'right-middle', ',': 'right-middle',
  '9': 'right-ring', 'o': 'right-ring', 'l': 'right-ring', '.': 'right-ring',
  '0': 'right-pinky', 'p': 'right-pinky', ';': 'right-pinky', '/': 'right-pinky',
  '-': 'right-pinky', '[': 'right-pinky', "'": 'right-pinky',
  ']': 'right-pinky', '\\': 'right-pinky', '=': 'right-pinky'
};

export const FINGER_LABELS: { [key in FingerName]: string } = {
  'left-pinky': '左小',
  'left-ring': '左薬',
  'left-middle': '左中',
  'left-index': '左人',
  'left-thumb': '左親',
  'right-thumb': '右親',
  'right-index': '右人',
  'right-middle': '右中',
  'right-ring': '右薬',
  'right-pinky': '右小',
};
