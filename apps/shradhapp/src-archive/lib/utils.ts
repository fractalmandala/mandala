import type { MediaItem } from './backend/types';

/** "75.4" → "1:15" */
export function fmtDur(seconds: number | null | undefined): string {
  if (seconds == null || !isFinite(seconds)) return '—';
  const s = Math.max(0, Math.round(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

export function kindEmoji(kind: MediaItem['kind']): string {
  return kind === 'video' ? '🎬' : kind === 'image' ? '🖼️' : '🎵';
}

export function kindLabel(kind: MediaItem['kind']): string {
  return kind === 'video' ? 'Video' : kind === 'image' ? 'Photo' : 'Audio';
}

export function fmtDate(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/** Generated SVG thumbnail used when an imported item has no thumbnail yet. */
export function svgThumb(label: string, emoji: string, hue: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="hsl(${hue},70%,78%)"/>
    <stop offset="1" stop-color="hsl(${(hue + 40) % 360},65%,62%)"/>
  </linearGradient></defs>
  <rect width="320" height="180" fill="url(#g)"/>
  <text x="160" y="88" font-size="52" text-anchor="middle">${emoji}</text>
  <text x="160" y="140" font-size="17" font-family="sans-serif" fill="rgba(40,25,15,0.75)" text-anchor="middle">${label}</text>
</svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

/** SVG waveform placeholder for audio items without a generated waveform thumbnail. */
export function waveThumb(label: string): string {
  let bars = '';
  let rngState = label.length * 7 + 3;
  const rand = () => {
    rngState = (rngState * 1103515245 + 12345) % 2147483648;
    return rngState / 2147483648;
  };
  for (let i = 0; i < 40; i++) {
    const h = 12 + rand() * 60;
    bars += `<rect x="${10 + i * 7.5}" y="${90 - h / 2}" width="4" height="${h}" rx="2" fill="hsl(28,75%,55%)"/>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180">
  <rect width="320" height="180" fill="#fbf1dc"/>${bars}
  <text x="160" y="160" font-size="15" font-family="sans-serif" fill="rgba(90,60,20,0.7)" text-anchor="middle">${label}</text>
</svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

export function fallbackThumb(item: MediaItem): string {
  if (item.kind === 'audio') return waveThumb(item.filename);
  const hue = item.kind === 'video' ? 210 : 120;
  return svgThumb(item.filename, kindEmoji(item.kind), hue);
}

export function sanitizeFileName(name: string): string {
  return name.replace(/[^\w\-. ]+/g, '_').trim() || 'video';
}

export function timestampName(prefix: string): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${prefix} ${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}.${pad(d.getMinutes())}`;
}

export function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}
