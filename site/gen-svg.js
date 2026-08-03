/*
 * Generates the classical line-engraving motifs for the Colosseum pages.
 * Written as geometry rather than hand-authored paths — coffers, voussoirs and
 * arcades are all regular subdivisions, and computing them keeps the line work
 * even in a way hand-drawn coordinates never are.
 */
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'assets', 'svg');
fs.mkdirSync(OUT, { recursive: true });

const INK = '#1A1917';
const r2 = n => Math.round(n * 100) / 100;
const P = (x, y) => `${r2(x)},${r2(y)}`;

function wrap(w, h, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" fill="none" `
    + `stroke="${INK}" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">\n`
    + body + `\n</svg>\n`;
}

/* ------------------------------------------------------------------ *
 * Coffered dome, seen from below — the Pantheon oculus.
 * ------------------------------------------------------------------ */
function dome() {
  const W = 1200, H = 620;
  const cx = W / 2, cy = H * 0.98;
  const rx = W * 0.47, ry = H * 0.9;
  const RINGS = [1.0, 0.855, 0.715, 0.585, 0.465, 0.355, 0.255];
  const RIBS = 34;
  const out = [];

  const pt = (k, t) => [cx + rx * k * Math.cos(t), cy - ry * k * Math.sin(t)];

  // Coffers: one inset quad per cell, which is what gives the recessed read.
  for (let r = 0; r < RINGS.length - 1; r++) {
    const kOut = RINGS[r], kIn = RINGS[r + 1];
    for (let i = 0; i < RIBS; i++) {
      const t0 = Math.PI * (i / RIBS), t1 = Math.PI * ((i + 1) / RIBS);
      const pad = 0.16;
      const ta = t0 + (t1 - t0) * pad, tb = t1 - (t1 - t0) * pad;
      const kA = kOut - (kOut - kIn) * pad, kB = kIn + (kOut - kIn) * pad;
      const q = [pt(kA, ta), pt(kA, tb), pt(kB, tb), pt(kB, ta)];
      const op = 0.16 + 0.30 * (r / (RINGS.length - 2));
      out.push(`<path d="M${P(...q[0])} L${P(...q[1])} L${P(...q[2])} L${P(...q[3])} Z" opacity="${r2(op)}"/>`);
      // A second, smaller quad reads as the coffer's inner step.
      const q2 = q.map(([x, y]) => [x + (cx - x) * 0.14, y + (cy - y) * 0.14]);
      out.push(`<path d="M${P(...q2[0])} L${P(...q2[1])} L${P(...q2[2])} L${P(...q2[3])} Z" opacity="${r2(op * 0.55)}"/>`);
    }
  }

  // Ring courses.
  RINGS.forEach((k, i) => {
    const seg = [];
    for (let s = 0; s <= 120; s++) seg.push(P(...pt(k, Math.PI * (s / 120))));
    out.push(`<polyline points="${seg.join(' ')}" opacity="${r2(0.30 + 0.22 * (i / RINGS.length))}"/>`);
  });

  // Oculus with radiating light.
  const ok = 0.185;
  const oc = [];
  for (let s = 0; s <= 120; s++) oc.push(P(...pt(ok, Math.PI * (s / 120))));
  out.push(`<polyline points="${oc.join(' ')}" opacity="0.6"/>`);
  for (let i = 0; i <= 18; i++) {
    const t = Math.PI * (i / 18);
    out.push(`<line x1="${r2(pt(ok, t)[0])}" y1="${r2(pt(ok, t)[1])}" x2="${r2(pt(ok * 0.72, t)[0])}" y2="${r2(pt(ok * 0.72, t)[1])}" opacity="0.3"/>`);
  }

  // Entablature below the springing line.
  [0, 9, 13, 25].forEach((d, i) => {
    out.push(`<line x1="${r2(cx - rx * 1.02)}" y1="${cy + d}" x2="${r2(cx + rx * 1.02)}" y2="${cy + d}" opacity="${i === 0 ? 0.5 : 0.28}"/>`);
  });

  return wrap(W, H, out.join('\n'));
}

/* ------------------------------------------------------------------ *
 * Triumphal arch with coffered soffit.
 * ------------------------------------------------------------------ */
function arch() {
  const W = 1200, H = 760;
  const cx = W / 2, sy = 520;      // springing line
  const R = 250, Rin = 196;
  const out = [];
  const pol = (r, t) => [cx + r * Math.cos(t), sy - r * Math.sin(t)];

  const ring = (r, op) => {
    const s = [];
    for (let i = 0; i <= 96; i++) s.push(P(...pol(r, Math.PI * (i / 96))));
    return `<polyline points="${s.join(' ')}" opacity="${op}"/>`;
  };
  out.push(ring(R, 0.5), ring(Rin, 0.5), ring(R + 34, 0.32));

  // Voussoirs.
  for (let i = 0; i <= 22; i++) {
    const t = Math.PI * (i / 22);
    const a = pol(Rin, t), b = pol(R + 34, t);
    out.push(`<line x1="${r2(a[0])}" y1="${r2(a[1])}" x2="${r2(b[0])}" y2="${r2(b[1])}" opacity="0.26"/>`);
  }

  // Piers, with fluting.
  [-1, 1].forEach(side => {
    const xo = cx + side * R, xi = cx + side * Rin;
    out.push(`<line x1="${r2(xo)}" y1="${sy}" x2="${r2(xo)}" y2="${H - 40}" opacity="0.5"/>`);
    out.push(`<line x1="${r2(xi)}" y1="${sy}" x2="${r2(xi)}" y2="${H - 40}" opacity="0.5"/>`);
    for (let f = 1; f < 6; f++) {
      const x = xi + (xo - xi) * (f / 6);
      out.push(`<line x1="${r2(x)}" y1="${sy + 26}" x2="${r2(x)}" y2="${H - 76}" opacity="0.16"/>`);
    }
    const xf = cx + side * (R + 34);
    out.push(`<line x1="${r2(xf)}" y1="${sy}" x2="${r2(xf)}" y2="${H - 40}" opacity="0.32"/>`);
  });

  // Entablature and stylobate.
  const top = sy - R - 34;
  [[top - 46, 0.42], [top - 32, 0.26], [top - 16, 0.26], [top, 0.42]].forEach(([y, op]) => {
    out.push(`<line x1="${cx - R - 130}" y1="${r2(y)}" x2="${cx + R + 130}" y2="${r2(y)}" opacity="${op}"/>`);
  });
  // Dentils.
  for (let i = -13; i <= 13; i++) {
    const x = cx + i * 24;
    out.push(`<rect x="${r2(x - 7)}" y="${r2(top - 30)}" width="14" height="12" opacity="0.2"/>`);
  }
  [[H - 40, 0.45], [H - 26, 0.3], [H - 12, 0.22]].forEach(([y, op]) => {
    out.push(`<line x1="${cx - R - 170}" y1="${y}" x2="${cx + R + 170}" y2="${y}" opacity="${op}"/>`);
  });

  return wrap(W, H, out.join('\n'));
}

/* ------------------------------------------------------------------ *
 * Amphitheatre arcade — three tiers, as on the Colosseum facade.
 * ------------------------------------------------------------------ */
function arcade() {
  const W = 1200, H = 420;
  const out = [];
  const TIERS = [
    { y: 40,  h: 118, n: 11 },
    { y: 172, h: 104, n: 11 },
    { y: 290, h: 92,  n: 11 },
  ];
  TIERS.forEach((tier, ti) => {
    const pad = 40 + ti * 6;
    const span = (W - pad * 2) / tier.n;
    const op = 0.42 - ti * 0.06;
    out.push(`<line x1="${pad - 14}" y1="${tier.y}" x2="${W - pad + 14}" y2="${tier.y}" opacity="${r2(op)}"/>`);
    out.push(`<line x1="${pad - 14}" y1="${tier.y + tier.h}" x2="${W - pad + 14}" y2="${tier.y + tier.h}" opacity="${r2(op)}"/>`);
    for (let i = 0; i < tier.n; i++) {
      const x = pad + i * span, w = span * 0.62, ox = x + (span - w) / 2;
      const r = w / 2, base = tier.y + tier.h - 12, headY = base - (tier.h * 0.44);
      out.push(`<path d="M${P(ox, base)} L${P(ox, headY)} A${r2(r)},${r2(r)} 0 0 1 ${P(ox + w, headY)} L${P(ox + w, base)}" opacity="${r2(op + 0.1)}"/>`);
      out.push(`<path d="M${P(ox + 7, base)} L${P(ox + 7, headY)} A${r2(r - 7)},${r2(r - 7)} 0 0 1 ${P(ox + w - 7, headY)} L${P(ox + w - 7, base)}" opacity="${r2(op * 0.5)}"/>`);
      // Pilaster between bays.
      out.push(`<line x1="${r2(x)}" y1="${tier.y + 6}" x2="${r2(x)}" y2="${tier.y + tier.h - 6}" opacity="${r2(op * 0.55)}"/>`);
    }
    out.push(`<line x1="${r2(W - pad)}" y1="${tier.y + 6}" x2="${r2(W - pad)}" y2="${tier.y + tier.h - 6}" opacity="${r2(op * 0.55)}"/>`);
  });
  return wrap(W, H, out.join('\n'));
}

/* ------------------------------------------------------------------ *
 * Fluted column.
 * ------------------------------------------------------------------ */
function column() {
  const W = 200, H = 560;
  const cx = W / 2, out = [];
  const shaftTop = 96, shaftBot = 470, hw = 34;

  for (let i = 0; i <= 8; i++) {
    const x = cx - hw + (hw * 2) * (i / 8);
    const taper = 4 * Math.abs(i / 8 - 0.5) * 2;
    out.push(`<line x1="${r2(x)}" y1="${shaftTop}" x2="${r2(x + taper * 0.4)}" y2="${shaftBot}" opacity="${i === 0 || i === 8 ? 0.5 : 0.2}"/>`);
  }
  // Capital.
  [[shaftTop, 40, 0.5], [shaftTop - 14, 46, 0.4], [shaftTop - 26, 52, 0.45], [shaftTop - 34, 56, 0.3]].forEach(([y, w, op]) => {
    out.push(`<line x1="${r2(cx - w)}" y1="${r2(y)}" x2="${r2(cx + w)}" y2="${r2(y)}" opacity="${op}"/>`);
  });
  out.push(`<path d="M${P(cx - 40, shaftTop)} Q${P(cx - 52, shaftTop - 20)} ${P(cx - 40, shaftTop - 34)}" opacity="0.34"/>`);
  out.push(`<path d="M${P(cx + 40, shaftTop)} Q${P(cx + 52, shaftTop - 20)} ${P(cx + 40, shaftTop - 34)}" opacity="0.34"/>`);
  // Base and plinth.
  [[shaftBot, 40, 0.5], [shaftBot + 12, 46, 0.4], [shaftBot + 26, 52, 0.45], [shaftBot + 44, 58, 0.5], [shaftBot + 62, 64, 0.4]].forEach(([y, w, op]) => {
    out.push(`<line x1="${r2(cx - w)}" y1="${r2(y)}" x2="${r2(cx + w)}" y2="${r2(y)}" opacity="${op}"/>`);
  });
  out.push(`<line x1="${cx - 64}" y1="${shaftBot + 44}" x2="${cx - 64}" y2="${shaftBot + 62}" opacity="0.4"/>`);
  out.push(`<line x1="${cx + 64}" y1="${shaftBot + 44}" x2="${cx + 64}" y2="${shaftBot + 62}" opacity="0.4"/>`);
  return wrap(W, H, out.join('\n'));
}

/* ------------------------------------------------------------------ *
 * Laurel wreath.
 * ------------------------------------------------------------------ */
function laurel() {
  const W = 260, H = 240;
  const cx = W / 2, cy = H / 2 - 6, out = [];
  const R = 88;
  const TH_MAX = Math.PI * 0.80;   // stop short of the top, leaving the wreath open
  const N = 11;

  // theta is measured from the bottom of the wreath, growing up each side, so the
  // leaves can be laid along the direction of growth rather than stuck on radially.
  const at = (side, th) => [cx + side * R * Math.sin(th), cy + R * Math.cos(th)];

  [-1, 1].forEach(side => {
    const stem = [];
    for (let i = 0; i <= 48; i++) stem.push(P(...at(side, TH_MAX * (i / 48))));
    out.push(`<polyline points="${stem.join(' ')}" opacity="0.42"/>`);

    for (let i = 0; i < N; i++) {
      const th = TH_MAX * ((i + 0.55) / N);
      const [bx, by] = at(side, th);
      // Unit tangent (direction of growth) and outward normal.
      const tx = side * Math.cos(th), ty = -Math.sin(th);
      const nx = side * Math.sin(th), ny = Math.cos(th);

      const L = 27, Wd = 7.2;
      const grow = 1 - 0.3 * (i / N);          // leaves taper toward the tip
      const tipX = bx + tx * L * 0.86 * grow + nx * L * 0.40 * grow;
      const tipY = by + ty * L * 0.86 * grow + ny * L * 0.40 * grow;
      const mx = bx + tx * L * 0.42 * grow + nx * L * 0.20 * grow;
      const my = by + ty * L * 0.42 * grow + ny * L * 0.20 * grow;

      out.push(`<path d="M${P(bx, by)} Q${P(mx + nx * Wd, my + ny * Wd)} ${P(tipX, tipY)} `
        + `Q${P(mx - nx * Wd, my - ny * Wd)} ${P(bx, by)} Z" opacity="0.33"/>`);
      out.push(`<line x1="${r2(bx)}" y1="${r2(by)}" x2="${r2(tipX)}" y2="${r2(tipY)}" opacity="0.16"/>`);
    }
  });

  // Ribbon tie at the foot.
  out.push(`<path d="M${P(cx - 15, cy + R - 3)} Q${P(cx, cy + R + 9)} ${P(cx + 15, cy + R - 3)}" opacity="0.4"/>`);
  out.push(`<path d="M${P(cx - 9, cy + R + 4)} L${P(cx - 15, cy + R + 22)}" opacity="0.3"/>`);
  out.push(`<path d="M${P(cx + 9, cy + R + 4)} L${P(cx + 15, cy + R + 22)}" opacity="0.3"/>`);
  return wrap(W, H, out.join('\n'));
}

/* ------------------------------------------------------------------ *
 * Trophy on a plinth.
 * ------------------------------------------------------------------ */
function trophy() {
  const W = 200, H = 240;
  const cx = W / 2, out = [];
  out.push(`<path d="M${P(cx - 40, 52)} L${P(cx - 32, 128)} Q${P(cx, 156)} ${P(cx + 32, 128)} L${P(cx + 40, 52)} Z" opacity="0.5"/>`);
  out.push(`<line x1="${cx - 44}" y1="52" x2="${cx + 44}" y2="52" opacity="0.5"/>`);
  for (let i = 1; i < 7; i++) {
    const x = cx - 34 + (68) * (i / 7);
    out.push(`<line x1="${r2(x)}" y1="60" x2="${r2(x + (x - cx) * 0.12)}" y2="126" opacity="0.16"/>`);
  }
  [-1, 1].forEach(s => {
    out.push(`<path d="M${P(cx + s * 40, 62)} Q${P(cx + s * 76, 78)} ${P(cx + s * 58, 108)} Q${P(cx + s * 48, 118)} ${P(cx + s * 36, 112)}" opacity="0.38"/>`);
  });
  out.push(`<line x1="${cx}" y1="156" x2="${cx}" y2="180" opacity="0.45"/>`);
  out.push(`<path d="M${P(cx - 26, 196)} L${P(cx - 20, 180)} L${P(cx + 20, 180)} L${P(cx + 26, 196)} Z" opacity="0.45"/>`);
  [[200, 34], [210, 40]].forEach(([y, w]) => {
    out.push(`<line x1="${r2(cx - w)}" y1="${y}" x2="${r2(cx + w)}" y2="${y}" opacity="0.42"/>`);
  });
  out.push(`<line x1="${cx - 40}" y1="210" x2="${cx - 40}" y2="222" opacity="0.4"/>`);
  out.push(`<line x1="${cx + 40}" y1="210" x2="${cx + 40}" y2="222" opacity="0.4"/>`);
  out.push(`<line x1="${cx - 46}" y1="222" x2="${cx + 46}" y2="222" opacity="0.45"/>`);
  return wrap(W, H, out.join('\n'));
}

/* ------------------------------------------------------------------ *
 * Obelisk — used where a tall, quiet vertical is needed.
 * ------------------------------------------------------------------ */
function obelisk() {
  const W = 160, H = 480;
  const cx = W / 2, out = [];
  out.push(`<path d="M${P(cx, 24)} L${P(cx + 26, 96)} L${P(cx + 20, 392)} L${P(cx - 20, 392)} L${P(cx - 26, 96)} Z" opacity="0.5"/>`);
  out.push(`<line x1="${cx - 26}" y1="96" x2="${cx + 26}" y2="96" opacity="0.4"/>`);
  out.push(`<line x1="${cx}" y1="24" x2="${cx}" y2="392" opacity="0.16"/>`);
  for (let i = 1; i < 8; i++) {
    const y = 120 + (392 - 120) * (i / 8);
    out.push(`<line x1="${r2(cx - 17)}" y1="${r2(y)}" x2="${r2(cx + 17)}" y2="${r2(y)}" opacity="0.13"/>`);
  }
  [[392, 32], [408, 40], [426, 48], [444, 56]].forEach(([y, w]) => {
    out.push(`<line x1="${r2(cx - w)}" y1="${y}" x2="${r2(cx + w)}" y2="${y}" opacity="0.42"/>`);
  });
  out.push(`<line x1="${cx - 56}" y1="444" x2="${cx - 56}" y2="460" opacity="0.4"/>`);
  out.push(`<line x1="${cx + 56}" y1="444" x2="${cx + 56}" y2="460" opacity="0.4"/>`);
  out.push(`<line x1="${cx - 62}" y1="460" x2="${cx + 62}" y2="460" opacity="0.45"/>`);
  return wrap(W, H, out.join('\n'));
}

/* ------------------------------------------------------------------ *
 * Placeholder company marks — geometric, in the manner of the render.
 * ------------------------------------------------------------------ */
function mark(seed) {
  const W = 64, H = 64, out = [];
  const rnd = (n => () => (n = (n * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff)(seed * 7919 + 13);
  out.push(`<rect x="14" y="16" width="36" height="32" opacity="0.85"/>`);
  const k = Math.floor(rnd() * 4);
  if (k === 0) { out.push(`<line x1="14" y1="32" x2="42" y2="32" opacity="0.85"/>`, `<circle cx="32" cy="32" r="3.5" opacity="0.85"/>`); }
  else if (k === 1) { out.push(`<line x1="22" y1="16" x2="22" y2="48" opacity="0.85"/>`, `<line x1="22" y1="26" x2="50" y2="26" opacity="0.85"/>`); }
  else if (k === 2) { out.push(`<path d="M14 48 L32 24 L50 48" opacity="0.85"/>`, `<line x1="24" y1="38" x2="40" y2="38" opacity="0.85"/>`); }
  else { out.push(`<circle cx="32" cy="32" r="11" opacity="0.85"/>`, `<line x1="32" y1="16" x2="32" y2="48" opacity="0.85"/>`); }
  return wrap(W, H, out.join('\n'));
}

const files = { dome, arch, arcade, column, laurel, trophy, obelisk };
Object.entries(files).forEach(([name, fn]) => {
  fs.writeFileSync(path.join(OUT, name + '.svg'), fn());
  console.log('wrote', name + '.svg');
});
for (let i = 0; i < 8; i++) {
  fs.writeFileSync(path.join(OUT, `mark-${i}.svg`), mark(i));
}
console.log('wrote 8 company marks');
