import sharp from 'sharp';
import { mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC  = join(ROOT, 'src', 'img', 'profile-full.jpg');
const OUT  = join(ROOT, '_site', 'img');

const BG = { r: 17, g: 24, b: 39 }; // #111827 gray-900

async function main() {
  await mkdir(OUT, { recursive: true });

  const src = sharp(SRC);

  // ── Profile photo variants ──────────────────────────────────────────────────
  // 384×384 (2× display size) and 192×192 (1× fallback + apple-touch-icon)
  for (const size of [384, 192]) {
    const resized = src.clone().resize(size, size, { fit: 'cover' });
    const suffix  = size === 384 ? '' : `-${size}`;

    await resized.clone()
      .jpeg({ quality: 85, progressive: true })
      .toFile(join(OUT, `profile${suffix}.jpg`));

    await resized.clone()
      .webp({ quality: 80 })
      .toFile(join(OUT, `profile${suffix}.webp`));
  }

  // ── OG social card 1200×630 ─────────────────────────────────────────────────
  // Circular photo centred on a dark (#111827) background
  const ogW   = 1200;
  const ogH   = 630;
  const r     = 175;           // photo radius
  const diam  = r * 2;

  const photoBuf = await src.clone()
    .resize(diam, diam, { fit: 'cover' })
    .ensureAlpha()
    .png()
    .toBuffer();

  const mask = Buffer.from(
    `<svg width="${diam}" height="${diam}">` +
    `<circle cx="${r}" cy="${r}" r="${r}" fill="white"/>` +
    `</svg>`
  );

  const circularPhoto = await sharp(photoBuf)
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  await sharp({
    create: { width: ogW, height: ogH, channels: 4, background: BG },
  })
    .composite([{
      input: circularPhoto,
      left: Math.round((ogW - diam) / 2),
      top:  Math.round((ogH - diam) / 2),
    }])
    .jpeg({ quality: 90, progressive: true })
    .toFile(join(OUT, 'og.jpg'));

  console.log('✓ profile.jpg (384), profile.webp (384), profile-192.jpg, profile-192.webp, og.jpg (1200×630)');

  // Remove any legacy files that may linger from old builds
  const toRemove = [
    'profile_full.jpg',          // legacy name (underscore)
    'ARD 4390 Setz-27 - edit.jpg', // legacy source photo
  ];
  for (const name of toRemove) {
    const f = join(OUT, name);
    if (existsSync(f)) await unlink(f);
  }
}

main().catch(err => {
  console.error('✗ Image build failed:', err.message);
  process.exit(1);
});
