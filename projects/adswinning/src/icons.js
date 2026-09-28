// Lucide icons (the product's icon set) drawn straight onto canvas from their SVG node lists.
const L = '/node_modules/lucide/dist/esm/icons/';
const NAMES = [
  'search', 'globe', 'tags', 'sliders-horizontal', 'arrow-down-wide-narrow', 'check', 'banknote', 'radio',
  'calendar-clock', 'copy', 'trophy', 'eye', 'badge-dollar-sign', 'calendar-days', 'arrow-right', 'play',
  'workflow', 'network', 'arrow-up-right', 'minus', 'library-big', 'chart-column', 'building', 'coins', 'circle-check', 'loader-circle', 'layers',
];
const ICONS = {};

export async function loadIcons() {
  await Promise.all(NAMES.map(async (n) => { ICONS[n] = (await import(`${L}${n}.mjs`)).default; }));
}

const num = (v) => Number(v ?? 0);
const points = (s) => s.trim().split(/[\s,]+/).map(Number);

// Draw icon `name` with its 24-unit box at (x, y), `size` px square, stroked in `color`.
export function icon(ctx, name, x, y, size, color, sw = 2) {
  const node = ICONS[name];
  if (!node) throw new Error(`icon ${name} not loaded`);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 24, size / 24);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = sw;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const [tag, a] of node) {
    ctx.beginPath();
    if (tag === 'path') { ctx.stroke(new Path2D(a.d)); if (a.fill && a.fill !== 'none') ctx.fill(new Path2D(a.d)); continue; }
    if (tag === 'circle') ctx.arc(num(a.cx), num(a.cy), num(a.r), 0, Math.PI * 2);
    else if (tag === 'ellipse') ctx.ellipse(num(a.cx), num(a.cy), num(a.rx), num(a.ry), 0, 0, Math.PI * 2);
    else if (tag === 'rect') ctx.roundRect(num(a.x), num(a.y), num(a.width), num(a.height), num(a.rx));
    else if (tag === 'line') { ctx.moveTo(num(a.x1), num(a.y1)); ctx.lineTo(num(a.x2), num(a.y2)); }
    else if (tag === 'polyline' || tag === 'polygon') {
      const p = points(a.points);
      ctx.moveTo(p[0], p[1]);
      for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]);
      if (tag === 'polygon') ctx.closePath();
    }
    if (a.fill && a.fill !== 'none') ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}
