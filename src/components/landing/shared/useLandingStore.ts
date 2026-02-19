'use client';

import { create } from 'zustand';

interface CursorState {
  x: number;
  y: number;
  isPointer: boolean;
  setCursor: (x: number, y: number, isPointer: boolean) => void;
}

const useLandingStore = create<CursorState>((set) => ({
  x: 0,
  y: 0,
  isPointer: false,
  setCursor: (x, y, isPointer) => set({ x, y, isPointer }),
}));
