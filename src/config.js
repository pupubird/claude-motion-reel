// Global constants shared by visuals, soundtrack and renderer.
export const W = 1920;
export const H = 1080;
export const FPS = 60;
export const BPM = 128;
export const BEAT = 60 / BPM;          // 0.46875 s
export const BAR = BEAT * 4;           // 1.875 s
export const BARS = 8;
export const DURATION = BAR * BARS;    // 15 s
export const FRAMES = Math.round(DURATION * FPS);

export const COLORS = {
  ink: '#0B0B0E',
  bone: '#EFEAE0',
  hot: '#FF4A1C',
  volt: '#2E5BFF',
  acid: '#D4FF3A',
};

export const FONTS = {
  sans: '"Inter Tight"',
  serif: '"Instrument Serif"',
  mono: '"JetBrains Mono"',
};

// One chapter per bar; drives the HUD caption.
export const CHAPTERS = [
  { n: '01', title: 'IGNITION', sub: 'canvas 2D · procedural type' },
  { n: '02', title: 'E—MOTION', sub: 'kinetic type · match cut' },
  { n: '03', title: 'DIMENSION', sub: 'three.js · live tube geometry' },
  { n: '04', title: 'PARTICLES', sub: '80,000 GPU particles · morph targets' },
  { n: '05', title: 'FLUID', sub: 'GLSL · domain-warped noise' },
  { n: '06', title: 'TIMING', sub: 'easing · spacing · onion skin' },
  { n: '07', title: 'RHYTHM', sub: 'cut to the beat · 128 BPM' },
  { n: '08', title: 'SIGNATURE', sub: 'fin' },
];
