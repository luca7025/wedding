// Compress photos/* into src/photos/*.webp so Vite can inline them into the single-file build.
import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import sharp from 'sharp'

const IN = 'photos', OUT = 'src/photos'
const MAX_PX = 1400, QUALITY = 68           // gallery / lightbox
const HERO_PX = 1920, HERO_QUALITY = 72     // full-screen cover
const { hero } = JSON.parse(await readFile('src/wedding.json', 'utf8'))

const stem = f => f.replace(/\.[^.]+$/, '')
const files = (await readdir(IN).catch(() => [])).filter(f => /\.(jpe?g|png|webp|avif|tiff?)$/i.test(f))
const skipped = (await readdir(IN).catch(() => [])).filter(f => /\.(heic|heif)$/i.test(f))
if (skipped.length) console.warn(`Skipped (convert to JPG first): ${skipped.join(', ')}`)
await mkdir(OUT, { recursive: true })

// Drop outputs whose source photo was removed
const keep = new Set(files.map(f => `${stem(f)}.webp`))
for (const f of await readdir(OUT)) if (f.endsWith('.webp') && !keep.has(f)) await rm(`${OUT}/${f}`)

let total = 0
const meta = {} // name -> [width, height], lets the page reserve space before images decode
for (const f of files) {
  const out = `${OUT}/${stem(f)}.webp`
  const outTime = await stat(out).then(s => s.mtimeMs, () => 0)
  const fresh = outTime >= (await stat(`${IN}/${f}`)).mtimeMs
  if (!fresh) {
    const isHero = stem(f) === stem(hero ?? '')
    const px = isHero ? HERO_PX : MAX_PX
    await sharp(`${IN}/${f}`)
      .rotate() // respect phone EXIF orientation
      .resize({ width: px, height: px, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: isHero ? HERO_QUALITY : QUALITY })
      .toFile(out)
  }
  const { width, height } = await sharp(out).metadata()
  meta[stem(f)] = [width, height]
  total += (await stat(out)).size
}
await writeFile(`${OUT}/meta.json`, JSON.stringify(meta))
console.log(`${files.length} photos ready in ${OUT}/ (${(total / 1e6).toFixed(1)} MB)`)
if (total > 15e6) console.warn('Over 15 MB: lower MAX_PX/QUALITY in scripts/photos.mjs or use fewer photos.')
