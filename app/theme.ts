'use client';

import React, { createContext, useContext } from 'react';

export interface Theme {
  id: string;
  name: string;
  emoji: string;
  bg: string;
  bgDeep: string;
  panel: string;
  border: string;
  borderStrong: string;
  text: string;
  textMuted: string;
  textFaint: string;
  primary: string;
  primaryDim: string;
  primaryBg: string;
  primaryBorder: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  headerBg: string;
}

export const THEMES: Record<string, Theme> = {
  tan: {
    id: 'tan',
    name: 'Sand & Tan',
    emoji: '🏜️',
    bg: '#fdf6ec',
    bgDeep: '#f5ead8',
    panel: '#fffaf3',
    border: '#e8d8bc',
    borderStrong: '#d4bc94',
    text: '#3a2e1e',
    textMuted: '#7a6248',
    textFaint: '#b09878',
    primary: '#a0722a',
    primaryDim: '#a0722a88',
    primaryBg: '#a0722a15',
    primaryBorder: '#a0722a44',
    secondary: '#c47a2a',
    accent: '#b85c2a',
    success: '#4a8a3a',
    warning: '#c88a18',
    error: '#b83a2a',
    headerBg: '#fdf6ecee',
  },
  neon: {
    id: 'neon',
    name: 'Neon Green',
    emoji: '🟢',
    bg: '#070710',
    bgDeep: '#040408',
    panel: '#0d0d18',
    border: '#111118',
    borderStrong: '#1a1a2e',
    text: '#e0e0e0',
    textMuted: '#888',
    textFaint: '#333',
    primary: '#00ff88',
    primaryDim: '#00ff8888',
    primaryBg: '#00ff8812',
    primaryBorder: '#00ff8833',
    secondary: '#00ccff',
    accent: '#ffaa00',
    success: '#00ff88',
    warning: '#ffaa00',
    error: '#ff0044',
    headerBg: '#07071099',
  },
  ocean: {
    id: 'ocean',
    name: 'Deep Ocean',
    emoji: '🌊',
    bg: '#040d14',
    bgDeep: '#020810',
    panel: '#081422',
    border: '#0e2236',
    borderStrong: '#163550',
    text: '#c8dfe8',
    textMuted: '#5a8099',
    textFaint: '#1e3a4a',
    primary: '#38b8e8',
    primaryDim: '#38b8e888',
    primaryBg: '#38b8e815',
    primaryBorder: '#38b8e833',
    secondary: '#5ee8d8',
    accent: '#7a9fe8',
    success: '#5ed4a8',
    warning: '#e8b838',
    error: '#e84a5e',
    headerBg: '#040d14cc',
  },
  aurora: {
    id: 'aurora',
    name: 'Aurora',
    emoji: '🌌',
    bg: '#080612',
    bgDeep: '#050410',
    panel: '#100e1e',
    border: '#1a1630',
    borderStrong: '#282444',
    text: '#ddd8f0',
    textMuted: '#7870a8',
    textFaint: '#2e2a4a',
    primary: '#b088f8',
    primaryDim: '#b088f888',
    primaryBg: '#b088f815',
    primaryBorder: '#b088f833',
    secondary: '#f088c8',
    accent: '#88d8f8',
    success: '#88f8b0',
    warning: '#f8c848',
    error: '#f85878',
    headerBg: '#080612cc',
  },
  ember: {
    id: 'ember',
    name: 'Ember',
    emoji: '🔥',
    bg: '#100806',
    bgDeep: '#0c0604',
    panel: '#1c1008',
    border: '#2e1a10',
    borderStrong: '#442818',
    text: '#f0dcc8',
    textMuted: '#a07050',
    textFaint: '#3a2010',
    primary: '#f87840',
    primaryDim: '#f8784088',
    primaryBg: '#f8784015',
    primaryBorder: '#f8784033',
    secondary: '#f8b840',
    accent: '#f85040',
    success: '#98d870',
    warning: '#f8c840',
    error: '#f83040',
    headerBg: '#100806cc',
  },
};

export const ThemeContext = createContext<Theme>(THEMES.tan);
export const useTheme = () => useContext(ThemeContext);
