// The film's words, one table per cut. English is the original; Chinese (Simplified, zh) is adapted rather than
// translated word for word (STORYBOARD.md § The Chinese cut gives the reasoning line by line).
//   ?lang=zh selects the Chinese cut (render.mjs --lang=zh, tools/cues.mjs --lang=zh); English is the default.
// Both tables have the same shape: a key or line missing from either throws at load, and reading a key that does not
// exist throws (like score.js's anchors), so a cut can never ship half-translated.
// The brand stays in Latin in every cut: the name (almost / friends.ai), Bub, the "almost → friends" punchline, the
// AI tag. Display lines: a space or a zero-width space (z() below) marks where a line's words pop; the zero-width one
// is never drawn or measured, so Chinese can pop phrase by phrase with no gap. In chat lines \n forces a break. Templates ({n}, {d}, {p}, {who},
// {name}, {age}) are filled by the scenes with fill(). A table may also set a line's type size (s) or baseline (y)
// where the script needs it: Chinese fills the em box, Latin does not.
const z = (...parts) => parts.join('​');

const en = {
  hook: { lines: ['How to', 'make more', 'friends'], s: [150, 150, 240], y: [330, 490, 735] },   // one line a knock
  value: { lines: ['New friends', 'who share', 'your values.'], blue: 2 },
  priority: { family: 'Family', career: 'Career', wealth: 'Wealth', health: 'Health', learning: 'Learning', adventure: 'Adventure' },
  first: '{p} first',
  list: ', ',
  caps: [
    { lines: ['Pick what', 'matters to you'], s: 110 },
    { lines: ['AI finds people', 'who share them'], s: 110 },
    { lines: ['Chat anonymously', 'for 3 days'], s: 102 },
    { lines: ['No names. No photos.', 'Just talk anonymously.'], s: 84, blue: 1 },
    { lines: ['It takes', 'two yeses.'], s: 110 },
  ],
  bub: { hi: 'Hi! I’m Bub \u{1F44B}', ask: 'What matters most to you right now?', got: 'Got it! Let me look around \u{1F50E}', sub: 'AI · finds you friends', looking: 'is looking around…' },
  pick: 'Pick 3 · {n}/3',
  you: 'You',
  otter: 'Curious Otter',
  hero: ['Family first?', 'So are they.'],
  sayHi: 'Say hi \u{1F44B}',
  same: { text: 'SAME!!', s: 250 },
  day: 'Day {d}',
  chat: {
    sub: 'Day {d} of 3 · anonymous',
    ice: ['You both put Family first.', 'What’s a tradition you’d never give up?'],
    thread: [
      'Sunday dinner at my mum’s. Non-negotiable \u{1F602}',
      'WAIT. Same!!',
      'ok we’re trading dumpling recipes',
      'tried yours. my mum cried \u{1F62D}',
      'happy tears I hope??',
      'she wants to meet you lol',
      'my kids would love yours',
      'weekend picnic? \u{1F9FA}',
      'honestly feels like I’ve known you for years',
    ],
    composer: 'Message',
  },
  sheet: { title: '3 days in.', ask: 'Ready to meet properly?', unlock: 'Unlock', waiting: 'Waiting for {who}…', note: 'Nothing is shown unless you both unlock.' },
  both: 'You’re both in!',
  nameAge: '{name}, {age}',
  foam: { same: ['Same values.', 'New friends.'], point: ['Friendship is', 'the whole point.'], tag: 'Make friends outside your bubble.' },
};

// 简体中文. Spoken, young, and in the viewer's own idiom: 三观一致 ("share your values"), 志同道合 (like-minded), 聊得来
// (we click), 纯友谊 (friendship, not dating), 圈子 (your circle: the social sense of "bubble"). Full-width
// punctuation; a declarative full stop on the big lines (Apple's Chinese headline style); casual chat types "!!" and
// "??" half-width, as people do.
const zh = {
  // Han ink rises 0.81–0.87 em (Noto Sans SC 800, measured), a Latin capital 0.7: the question sets smaller, 朋友 as
  // wide as 交到更多, the block between the safe zone's top (220) and Bub (760)
  hook: { lines: ['怎么', '交到更多', '朋友'], s: [128, 128, 248], y: [330, 478, 733] },
  value: { lines: ['认识', z('三观', '一致的'), '新朋友。'], blue: 1 },
  priority: { family: '家庭', career: '事业', wealth: '财富', health: '健康', learning: '学习', adventure: '冒险' },
  first: '{p}第一',
  list: '、',
  caps: [
    { lines: ['选出', '你最在乎的'], s: 100 },
    { lines: ['AI 帮你找到', '志同道合的人'], s: 100 },
    { lines: ['先匿名', '聊 3 天'], s: 100 },
    { lines: [z('不看名字，', '不看照片。'), z('只看', '聊不聊得来。')], s: 84, blue: 1 },
    { lines: ['要两个人', '都点头。'], s: 100 },
  ],
  bub: { hi: '嗨！我是 Bub \u{1F44B}', ask: '你现在最看重什么？', got: '收到！我去帮你找找 \u{1F50E}', sub: 'AI · 帮你找朋友', looking: '正在四处看看…' },
  pick: '选 3 个 · {n}/3',
  you: '你',
  otter: '好奇水獭',
  hero: ['家庭第一？', 'TA 也是。'],
  sayHi: '打个招呼 \u{1F44B}',
  same: { text: '我也是!!', s: 210 },
  day: '第 {d} 天',
  chat: {
    sub: '匿名中 · 第 {d}/3 天',
    ice: ['你们都把家庭放在第一位。', '哪个传统，你绝不会放弃？'],
    thread: [
      '每周日都回我妈家吃饭，\n雷打不动 \u{1F602}',    // \n: a break the writer chose (never inside 雷打不动)
      '等等，我也是!!',
      '行，那必须交换饺子秘方了',
      '试了你的做法，我妈都哭了 \u{1F62D}',
      '是感动的眼泪吧??',
      '她说想见见你哈哈',
      '我家孩子肯定跟你家的玩得来',
      '周末去野餐？\u{1F9FA}',
      '说真的，感觉认识你好多年了',
    ],
    composer: '发消息',
  },
  sheet: { title: '3 天到了。', ask: '要正式认识一下吗？', unlock: '解锁', waiting: '等{who}解锁…', note: '两个人都解锁，才会看到彼此。' },
  both: z('双双', '解锁！'),
  nameAge: '{name}，{age}岁',
  foam: { same: ['三观一致。', '新朋友。'], point: ['纯友谊，', '才是重点。'], tag: z('走出圈子，', '交新朋友。') },
};

export const LANGS = { en, zh };

// every table has the shape of the original: the same keys, and arrays of the same length
function sameShape(a, b, at) {
  if (Array.isArray(a) !== Array.isArray(b) || typeof a !== typeof b) throw new Error(`copy: ${at} differs in kind`);
  if (Array.isArray(a)) { if (a.length !== b.length) throw new Error(`copy: ${at} has ${b.length} entries, not ${a.length}`); a.forEach((v, i) => sameShape(v, b[i], `${at}[${i}]`)); return; }
  if (a && typeof a === 'object') {
    const ka = Object.keys(a).sort().join(), kb = Object.keys(b).sort().join();
    if (ka !== kb) throw new Error(`copy: ${at} has keys {${kb}}, not {${ka}}`);
    for (const k of Object.keys(a)) sameShape(a[k], b[k], `${at}.${k}`);
  }
}
for (const [k, t] of Object.entries(LANGS)) if (t !== en) sameShape(en, t, k);

// reading a key a table does not have throws (objects only; caption entries in arrays are plain)
const strict = (name, o) => new Proxy(o, {
  get(t, k) {
    if (typeof k === 'symbol' || k in t) { const v = t[k]; return v && typeof v === 'object' && !Array.isArray(v) ? strict(`${name}.${k}`, v) : v; }
    throw new Error(`copy: ${name}.${String(k)} does not exist`);
  },
});

export const copyFor = (lang) => {
  if (!LANGS[lang]) throw new Error(`copy: no "${lang}" cut (have ${Object.keys(LANGS).join(', ')})`);
  return strict(lang, LANGS[lang]);
};
export const LANG = (typeof location !== 'undefined' && new URLSearchParams(location.search).get('lang')) || 'en';
export const T = copyFor(LANG);

export const fill = (s, v) => s.replace(/\{(\w+)\}/g, (_, k) => {
  if (!(k in v)) throw new Error(`copy: "${s}" needs {${k}}`);
  return String(v[k]);
});
// the words of a display line as they pop (spaces and zero-width spaces), for the cue sheet
export const words = (s) => s.split(/[ ​]+/).filter(Boolean);
// every character a cut can draw, for loading its fonts (templates' braces and names are Latin)
export function allText(lang = LANG) {
  const out = [];
  const walk = (v) => { if (typeof v === 'string') out.push(v); else if (v && typeof v === 'object') Object.values(v).forEach(walk); };
  walk(LANGS[lang]);
  return [...new Set(out.join('').replace(/​/g, ''))].join('');
}
