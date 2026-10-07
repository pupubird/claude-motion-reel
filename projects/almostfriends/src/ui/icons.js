// Lucide icons (ISC) drawn on canvas from the package's own node data. Stroke icons for the iOS chrome and UI.
const NAMES = ['send-horizontal', 'arrow-up', 'chevron-left', 'chevron-right', 'lock', 'lock-open', 'check', 'x', 'plus',
  'sparkles', 'search', 'users', 'user', 'clock', 'timer', 'message-circle', 'eye-off', 'eye', 'shield-check',
  'house', 'briefcase', 'wallet', 'heart-pulse', 'mountain', 'palette', 'graduation-cap', 'hand-heart', 'sprout', 'map-pin',
  'mic', 'camera', 'ellipsis', 'bell', 'settings', 'compass', 'party-popper', 'coffee', 'sun', 'moon'];
const PATHS = {};

function toPath(nodes) {
  const p = new Path2D();
  for (const [tag, a] of nodes) {
    const n = (k) => Number(a[k] ?? 0);
    if (tag === 'path') p.addPath(new Path2D(a.d));
    else if (tag === 'rect') { const q = new Path2D(); q.roundRect(n('x'), n('y'), n('width'), n('height'), n('rx')); p.addPath(q); }
    else if (tag === 'circle') { p.moveTo(n('cx') + n('r'), n('cy')); p.arc(n('cx'), n('cy'), n('r'), 0, Math.PI * 2); }
    else if (tag === 'ellipse') { p.moveTo(n('cx') + n('rx'), n('cy')); p.ellipse(n('cx'), n('cy'), n('rx'), n('ry'), 0, 0, Math.PI * 2); }
    else if (tag === 'line') { p.moveTo(n('x1'), n('y1')); p.lineTo(n('x2'), n('y2')); }
    else if (tag === 'polyline' || tag === 'polygon') {
      const pts = a.points.trim().split(/[\s,]+/).map(Number);
      p.moveTo(pts[0], pts[1]);
      for (let i = 2; i < pts.length; i += 2) p.lineTo(pts[i], pts[i + 1]);
      if (tag === 'polygon') p.closePath();
    }
  }
  return p;
}

export async function loadIcons() {
  await Promise.all(NAMES.map(async (n) => {
    const m = await import(`/node_modules/lucide/dist/esm/icons/${n}.mjs`).catch(() => null);
    if (!m) { console.error(`icon ${n} missing`); return; }
    PATHS[n] = toPath(m.default);
  }));
}

// Draw icon `name` with its 24×24 box at (x, y) scaled to `size`; stroke width is in 24-unit space like Lucide's.
export function icon(ctx, name, x, y, size, color, sw = 2) {
  const p = PATHS[name];
  if (!p) throw new Error(`icon ${name} not loaded`);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 24, size / 24);
  ctx.strokeStyle = color;
  ctx.lineWidth = sw;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke(p);
  ctx.restore();
}
