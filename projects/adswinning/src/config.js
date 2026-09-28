// Global constants shared by visuals, soundtrack and renderer.
export const W = 1920;
export const H = 1080;
export const FPS = 60;
export const BPM = 128;
export const BEAT = 60 / BPM;          // 0.46875 s
export const BAR = BEAT * 4;           // 1.875 s
export const BARS = 16;
export const DURATION = BAR * BARS;    // 30.000 s
export const FRAMES = Math.round(DURATION * FPS); // 1800

// Light Table tokens, verbatim from adswinning app/src/index.css.
export const C = {
  ground: '#EDF0EF',
  groundSunk: '#E4E8E7',
  surface: '#F8FAF9',
  surfaceLift: '#FFFFFF',
  line: '#D6DDDB',
  lineSoft: '#E3E8E7',
  well: '#0D1A1C',
  wellLift: '#142428',
  wellLine: '#1E2E31',
  wellText: '#CFD9D8',
  wellDim: '#7D9195',
  ink: '#0B1618',
  slate: '#56696D',
  slateSoft: '#83979B',
  petrol: '#0F4C52',
  petrolLift: '#1A6B73',
  petrolSunk: '#0A3A3F',
  petrolWash: '#E6EEED',
  sulphur: '#E0A82E',
  sulphurHot: '#F2BD46',
  sulphurInk: '#8A6410',
  sulphurWash: '#F7EDD4',
  good: '#2F6B4F',
  bad: '#9C3B32',
  meta: '#0866FF',
  tiktok: '#FE2C55',
  // Proof Aperture mark (app/branding-src/mark.svg).
  markSection: '#DCE7E5',
  markTop: '#F2C35B',
  markLeft: '#B87A11',
  markRight: '#E0A82E',
  wordmark: '#18383D',
};

export const FONTS = {
  display: '"Bricolage"',
  sans: '"Instrument Sans"',
  mono: '"IBM Plex Mono"',
};

export const HUD_ID = { name: 'ADSWINNING', sub: 'SHOWREEL ’26 · EVERY FRAME RENDERED IN CODE' };

// One chapter per two bars; drives the HUD caption.
export const CHAPTERS = [
  { n: '01', title: 'LIGHT TABLE', sub: 'three.js · 4,032 instanced frames · focus pull' },
  { n: '02', title: 'LOUPE', sub: 'GLSL refraction · lens portal' },
  { n: '03', title: 'AGENT', sub: 'kinetic UI · live tool receipts' },
  { n: '04', title: 'SIGNAL', sub: '88 results → 16 ranked · FLIP layout' },
  { n: '05', title: 'EVIDENCE', sub: 'readouts · variable type axes' },
  { n: '06', title: 'HONESTY', sub: 'missing is never zero' },
  { n: '07', title: 'APERTURE', sub: 'flat-shaded 3D · anamorphic lock' },
  { n: '08', title: 'SIGNATURE', sub: 'adswinning.com' },
];
