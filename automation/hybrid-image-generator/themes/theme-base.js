/**
 * Central theme definitions and factory.
 *
 * All theme configs live here to eliminate cross-file duplication.
 * Individual theme files (wb-glass-sticky.js, etc.) re-export from this module.
 *
 * Whiteboard theme family — 4 variants:
 *   wb-glass-sticky    Glass-mounted whiteboard with sticky-note accent colors
 *   wb-glass-clean     Glass-mounted whiteboard, minimal and clean
 *   wb-standing-marker Standing whiteboard with bold marker style
 *   wb-standing-minimal Standing whiteboard, clean corporate
 */

const DEFAULT_CSS = {
  '--canvas-width': '1080px',
  '--canvas-height': '1080px',
  '--padding': '60px',
  '--content-width': '960px',
  '--font-size-hero': '56px',
  '--font-size-title': '32px',
  '--font-size-body': '20px',
  '--font-size-small': '16px',
  '--line-height-title': '1.2',
  '--line-height-body': '1.6',
  '--spacing-xs': '8px',
  '--spacing-sm': '16px',
  '--spacing-md': '24px',
  '--spacing-lg': '32px',
  '--spacing-xl': '48px',
  '--icon-size': '80px',
  '--icon-spacing': '20px',
  '--bullet-size': '24px',
  '--column-gap': '40px'
};

function createTheme(config) {
  const css = { ...DEFAULT_CSS, ...config.css };
  css['--title-color'] = css['--title-color'] || css['--text-primary'];
  css['--body-color'] = css['--body-color'] || css['--text-secondary'];
  css['--accent-color'] = css['--accent-color'] || css['--text-accent'];
  css['--bg-color'] = css['--bg-color'] || css['--bg-primary'];
  css['--title-font'] = css['--title-font'] || css['--font-title'];
  css['--body-font'] = css['--body-font'] || css['--font-body'];
  return { ...config, css };
}

// ── Whiteboard Theme Definitions ─────────────────────────────────────

const wbGlassSticky = createTheme({
  name: 'wb-glass-sticky',
  background: {
    dallePrompt:
      'Photorealistic glass whiteboard mounted on a modern office wall with chrome mounting clips at the four corners. The glass surface is clean and white with very subtle reflections. A modern open-plan office with plants and desks is softly blurred behind the glass. Warm natural lighting from overhead. No text, no writing, no drawings, no annotations, no sticky notes, no markers. Completely blank glass surface only. Professional corporate environment. 1024x1024',
    fallbackColor: '#f4f4f6'
  },
  typography: {
    titleFont: 'Architects Daughter, cursive',
    bodyFont: 'Patrick Hand, cursive',
    titleColor: '#1a1a1a',
    bodyColor: '#333333',
    accentColor: '#5b4a9e'
  },
  illustrations: {
    style: 'hand-drawn whiteboard marker style, bold colored lines on transparent',
    examples: ['flowchart boxes', 'sticky note accents', 'connecting arrows', 'process diagram', 'comparison columns']
  },
  css: {
    '--bg-primary': '#f4f4f6',
    '--bg-overlay': 'rgba(0,0,0,0)',
    '--text-primary': '#1a1a1a',
    '--text-secondary': '#333333',
    '--text-accent': '#5b4a9e',
    '--border-color': '#cccccc',
    '--font-title': 'Architects Daughter, cursive',
    '--font-body': 'Patrick Hand, cursive',
    '--font-size-hero': '52px',
    '--font-size-title': '28px',
    '--font-size-body': '19px',
    '--font-size-small': '14px',
    '--text-shadow': 'none',
    '--box-shadow': 'none',
    '--section-bg': 'rgba(255,255,255,1.0)',
    '--section-border': '2px solid #cccccc',
    '--bullet-color': '#5b4a9e',
    '--marker-1': '#7c5cbf',
    '--marker-2': '#2e8b57',
    '--marker-3': '#2980b9',
    '--marker-4': '#d4762c',
    '--pros-bg': 'rgba(46,139,87,0.08)',
    '--cons-bg': 'rgba(214,118,44,0.08)',
    '--pros-border': '#2e8b57',
    '--cons-border': '#d4762c',
    '--punchline-color': '#1a1a1a',
    '--callout-bg': 'rgba(124,92,191,0.08)',
    '--border-radius': '3px'
  },
  colors: {
    primary: '#f4f4f6',
    secondary: '#eaeaee',
    accent: '#5b4a9e',
    success: '#2e8b57',
    warning: '#d4762c',
    error: '#c0392b',
    textPrimary: '#1a1a1a',
    textSecondary: '#333333',
    marker1: '#7c5cbf',
    marker2: '#2e8b57',
    marker3: '#2980b9',
    marker4: '#d4762c'
  },
  recommendedLayouts: ['whiteboard', 'comparison'],
  googleFonts: ['Architects+Daughter', 'Patrick+Hand']
});

const wbGlassClean = createTheme({
  name: 'wb-glass-clean',
  background: {
    dallePrompt:
      'Clean glass or acrylic whiteboard panel mounted on a light gray office wall with small chrome clips at top corners. The surface is pristine white with a very faint glossy sheen and subtle light reflection from overhead fluorescent lights. Blurred modern office background visible through the edges. No text, no writing, no drawings, no annotations. Completely blank clean surface. Minimalist professional setting. 1024x1024',
    fallbackColor: '#f6f6f8'
  },
  typography: {
    titleFont: 'Architects Daughter, cursive',
    bodyFont: 'Nunito, sans-serif',
    titleColor: '#1a1a1a',
    bodyColor: '#2d2d2d',
    accentColor: '#1a8a6a'
  },
  illustrations: {
    style: 'clean whiteboard marker drawing, teal and green tones, professional',
    examples: ['data flow diagram', 'layered architecture', 'category grid', 'step process', 'comparison table']
  },
  css: {
    '--bg-primary': '#f6f6f8',
    '--bg-overlay': 'rgba(0,0,0,0)',
    '--text-primary': '#1a1a1a',
    '--text-secondary': '#2d2d2d',
    '--text-accent': '#1a8a6a',
    '--border-color': '#d0d0d0',
    '--font-title': 'Architects Daughter, cursive',
    '--font-body': 'Nunito, sans-serif',
    '--font-size-hero': '50px',
    '--font-size-title': '26px',
    '--font-size-body': '18px',
    '--font-size-small': '13px',
    '--text-shadow': 'none',
    '--box-shadow': 'none',
    '--section-bg': 'rgba(255,255,255,1.0)',
    '--section-border': '2px solid #d0d0d0',
    '--bullet-color': '#1a8a6a',
    '--marker-1': '#1a8a6a',
    '--marker-2': '#27ae60',
    '--marker-3': '#8e44ad',
    '--marker-4': '#e67e22',
    '--pros-bg': 'rgba(26,138,106,0.08)',
    '--cons-bg': 'rgba(142,68,173,0.08)',
    '--pros-border': '#1a8a6a',
    '--cons-border': '#8e44ad',
    '--punchline-color': '#1a1a1a',
    '--callout-bg': 'rgba(26,138,106,0.06)',
    '--border-radius': '3px'
  },
  colors: {
    primary: '#f6f6f8',
    secondary: '#ececf0',
    accent: '#1a8a6a',
    success: '#27ae60',
    warning: '#e67e22',
    error: '#c0392b',
    textPrimary: '#1a1a1a',
    textSecondary: '#2d2d2d',
    marker1: '#1a8a6a',
    marker2: '#27ae60',
    marker3: '#8e44ad',
    marker4: '#e67e22'
  },
  recommendedLayouts: ['dense-infographic', 'evolution'],
  googleFonts: ['Architects+Daughter', 'Nunito:wght@400;600;700']
});

const wbStandingMarker = createTheme({
  name: 'wb-standing-marker',
  background: {
    dallePrompt:
      'Freestanding whiteboard on a metal frame in a bright office or classroom. The whiteboard surface is clean white with a thin aluminum frame border visible at the edges. A narrow marker tray with colored dry-erase markers sits at the bottom edge. Background shows blurred office chairs, desks, and warm lighting. No text, no writing, no drawings, no annotations on the board surface. Completely blank white surface. Photorealistic. 1024x1024',
    fallbackColor: '#fafafa'
  },
  typography: {
    titleFont: 'Caveat, cursive',
    bodyFont: 'Patrick Hand, cursive',
    titleColor: '#1a1a1a',
    bodyColor: '#333333',
    accentColor: '#c0392b'
  },
  illustrations: {
    style: 'bold whiteboard marker drawing, thick colored lines, hand-drawn feel',
    examples: ['vertical flowchart', 'numbered steps', 'bold arrows', 'hub diagram', 'process timeline']
  },
  css: {
    '--bg-primary': '#fafafa',
    '--bg-overlay': 'rgba(0,0,0,0)',
    '--text-primary': '#1a1a1a',
    '--text-secondary': '#333333',
    '--text-accent': '#c0392b',
    '--border-color': '#333333',
    '--font-title': 'Caveat, cursive',
    '--font-body': 'Patrick Hand, cursive',
    '--font-size-hero': '56px',
    '--font-size-title': '30px',
    '--font-size-body': '20px',
    '--font-size-small': '15px',
    '--text-shadow': 'none',
    '--box-shadow': 'none',
    '--section-bg': 'rgba(255,255,255,1.0)',
    '--section-border': '2px solid #333333',
    '--bullet-color': '#c0392b',
    '--marker-1': '#c0392b',
    '--marker-2': '#2471a3',
    '--marker-3': '#229954',
    '--marker-4': '#d4762c',
    '--pros-bg': 'rgba(34,153,84,0.08)',
    '--cons-bg': 'rgba(192,57,43,0.08)',
    '--pros-border': '#229954',
    '--cons-border': '#c0392b',
    '--punchline-color': '#1a1a1a',
    '--callout-bg': 'rgba(192,57,43,0.06)',
    '--border-radius': '3px'
  },
  colors: {
    primary: '#fafafa',
    secondary: '#f0f0f0',
    accent: '#c0392b',
    success: '#229954',
    warning: '#d4762c',
    error: '#c0392b',
    textPrimary: '#1a1a1a',
    textSecondary: '#333333',
    marker1: '#c0392b',
    marker2: '#2471a3',
    marker3: '#229954',
    marker4: '#d4762c'
  },
  recommendedLayouts: ['evolution', 'dense-infographic'],
  googleFonts: ['Caveat:wght@400;700', 'Patrick+Hand']
});

const wbStandingMinimal = createTheme({
  name: 'wb-standing-minimal',
  background: {
    dallePrompt:
      'Large wall-mounted dry-erase whiteboard with clean white surface, very subtle gray smudge marks from previous erasing barely visible. Thin silver aluminum frame at edges. Bottom edge has a narrow marker tray casting a slight shadow upward. Plain office wall visible at frame edges. Soft even overhead lighting. No text, no writing, no drawings, no annotations. Completely blank surface only. Corporate meeting room setting. 1024x1024',
    fallbackColor: '#f8f8f8'
  },
  typography: {
    titleFont: 'Architects Daughter, cursive',
    bodyFont: 'Nunito, sans-serif',
    titleColor: '#222222',
    bodyColor: '#444444',
    accentColor: '#2c3e50'
  },
  illustrations: {
    style: 'clean whiteboard marker drawing, thin lines, minimal and professional',
    examples: ['comparison chart', 'two-column layout', 'side-by-side boxes', 'simple flowchart', 'labeled diagram']
  },
  css: {
    '--bg-primary': '#f8f8f8',
    '--bg-overlay': 'rgba(0,0,0,0)',
    '--text-primary': '#222222',
    '--text-secondary': '#444444',
    '--text-accent': '#2c3e50',
    '--border-color': '#aaaaaa',
    '--font-title': 'Architects Daughter, cursive',
    '--font-body': 'Nunito, sans-serif',
    '--font-size-hero': '50px',
    '--font-size-title': '26px',
    '--font-size-body': '18px',
    '--font-size-small': '13px',
    '--text-shadow': 'none',
    '--box-shadow': 'none',
    '--section-bg': 'rgba(255,255,255,1.0)',
    '--section-border': '2px solid #aaaaaa',
    '--bullet-color': '#2c3e50',
    '--marker-1': '#2c3e50',
    '--marker-2': '#1a8a6a',
    '--marker-3': '#6c3483',
    '--marker-4': '#b9770e',
    '--pros-bg': 'rgba(26,138,106,0.06)',
    '--cons-bg': 'rgba(108,52,131,0.06)',
    '--pros-border': '#1a8a6a',
    '--cons-border': '#6c3483',
    '--punchline-color': '#222222',
    '--callout-bg': 'rgba(44,62,80,0.05)',
    '--border-radius': '3px'
  },
  colors: {
    primary: '#f8f8f8',
    secondary: '#eeeeee',
    accent: '#2c3e50',
    success: '#1a8a6a',
    warning: '#b9770e',
    error: '#c0392b',
    textPrimary: '#222222',
    textSecondary: '#444444',
    marker1: '#2c3e50',
    marker2: '#1a8a6a',
    marker3: '#6c3483',
    marker4: '#b9770e'
  },
  recommendedLayouts: ['comparison', 'whiteboard'],
  googleFonts: ['Architects+Daughter', 'Nunito:wght@400;600;700']
});

module.exports = {
  createTheme,
  DEFAULT_CSS,
  wbGlassSticky,
  wbGlassClean,
  wbStandingMarker,
  wbStandingMinimal
};
