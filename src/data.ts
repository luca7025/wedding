import cfg from './wedding.json'
import meta from './photos/meta.json'

export { cfg }

// Compressed photos from scripts/photos.mjs, keyed by file name without extension
const urls = import.meta.glob<string>('./photos/*.webp', { eager: true, import: 'default' })
const photo: Record<string, string> = {}
for (const [path, url] of Object.entries(urls)) photo[path.slice('./photos/'.length, -'.webp'.length)] = url
const size: Record<string, number[]> = meta

export const stem = (name = '') => name.replace(/\.[^.]+$/, '')
export const src = (name?: string) => photo[stem(name)]
/** width / height, so layouts can reserve space before the image decodes */
export const ratio = (name: string) => { const [w, h] = size[stem(name)] ?? [3, 4]; return w / h }

const all = Object.keys(photo).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
const storyPhotos = new Set(cfg.story.map(m => stem(m.photo)))
const rest = all.filter(n => !storyPhotos.has(n) && n !== stem(cfg.hero))

export const events = cfg.events.map(e => ({ ...e, photos: rest.filter(n => n.toLowerCase().startsWith(e.prefix.toLowerCase())) }))
// shortcut: every 3rd photo becomes a "Moment"; add a "moments" list to wedding.json if you want to hand-pick them
export const moments = rest.filter((_, i) => i % 3 === 0)

const localMusic = Object.values(import.meta.glob<string>('./music.mp3', { eager: true, import: 'default' }))[0]
export const music = localMusic ?? cfg.music
export const couple = `${cfg.names[0]} & ${cfg.names[1]}`
export const albumUrl = /^https?:\/\//.test(cfg.albumUrl) ? cfg.albumUrl : ''

function youtubeId(url: string) {
  url = url.trim()
  if (/^[\w-]{11}$/.test(url)) return url
  return url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([\w-]{11})/)?.[1] ?? ''
}
export const videoId = youtubeId(cfg.youtube)
