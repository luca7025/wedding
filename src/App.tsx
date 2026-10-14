import { Fragment, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { MotionConfig, motion, useMotionValue, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { ReactLenis, useLenis } from 'lenis/react'
import 'lenis/dist/lenis.css'
import Lightbox from 'yet-another-react-lightbox'
import Counter from 'yet-another-react-lightbox/plugins/counter'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/counter.css'
import { albumUrl, cfg, couple, events, moments, music, ratio, src, videoId } from './data'

type Open = (list: string[], index: number) => void
const ease = [0.22, 1, 0.36, 1] as const
const inView = { once: true, margin: '0px 0px -12% 0px' }

/** Image that drifts inside its frame as the page scrolls */
function ParallaxImg({ name, alt = '', className = '', amount = 10 }: { name: string; alt?: string; className?: string; amount?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const still = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [`-${amount}%`, `${amount}%`])
  return (
    <div ref={ref} className={`pframe ${className}`}>
      <motion.img src={src(name)} alt={alt} loading="lazy" decoding="async" style={still ? undefined : { y }} />
    </div>
  )
}

/** Text that rises in letter by letter; words stay unbroken */
function Letters({ text, delay = 0 }: { text: string; delay?: number }) {
  let i = 0
  return (
    <span aria-label={text}>
      {text.split(' ').map((word, w) => (
        <Fragment key={w}>
          {w > 0 && ' '}
          <span className="word" aria-hidden="true">
            {[...word].map((ch, c) => (
              <motion.span
                key={c}
                className="letter"
                initial={{ opacity: 0, y: '0.6em', filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.9, ease, delay: delay + 0.05 * i++ }}
              >
                {ch}
              </motion.span>
            ))}
          </span>
        </Fragment>
      ))}
    </span>
  )
}

function Heading({ kicker, children }: { kicker?: string; children: ReactNode }) {
  return (
    <motion.div className="heading" initial="hidden" whileInView="show" viewport={inView}>
      {kicker && <motion.small variants={{ hidden: { opacity: 0, letterSpacing: '0.1em' }, show: { opacity: 1, letterSpacing: '0.35em' } }} transition={{ duration: 1.2, ease }}>{kicker}</motion.small>}
      <motion.h2 variants={{ hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0 } }} transition={{ duration: 1, ease }}>{children}</motion.h2>
      <motion.div className="ornament" aria-hidden="true" variants={{ hidden: { scaleX: 0, opacity: 0 }, show: { scaleX: 1, opacity: 1 } }} transition={{ duration: 1.2, ease, delay: 0.3 }}>❦</motion.div>
    </motion.div>
  )
}

const PETALS = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 37) % 100}%`, delay: `${(i * 1.7) % 12}s`, duration: `${11 + (i % 5) * 2}s`, size: `${10 + (i % 4) * 4}px`,
}))

function Hero() {
  const ref = useRef<HTMLElement>(null)
  const still = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.2])
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-50%'])
  const fade = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  return (
    <header ref={ref} className="hero">
      <motion.div
        className="hero-bg"
        style={{ backgroundImage: src(cfg.hero) ? `url(${src(cfg.hero)})` : undefined, ...(still ? {} : { y: bgY, scale: bgScale }) }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, ease }}
      />
      <div className="petals" aria-hidden="true">
        {PETALS.map((p, i) => <span key={i} style={{ left: p.left, animationDelay: p.delay, animationDuration: p.duration, width: p.size, height: p.size }} />)}
      </div>
      <motion.div className="hero-inner" style={still ? undefined : { y: textY, opacity: fade }}>
        <motion.small initial={{ opacity: 0, letterSpacing: '0.1em' }} animate={{ opacity: 1, letterSpacing: '0.4em' }} transition={{ duration: 1.8, ease, delay: 0.3 }}>
          Together forever
        </motion.small>
        <h1>
          <Letters text={cfg.names[0]} delay={0.6} />
          <motion.span className="amp" initial={{ opacity: 0, scale: 0.4, rotate: -20 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 1.2, ease, delay: 1 }}>&amp;</motion.span>
          <Letters text={cfg.names[1]} delay={1.2} />
        </h1>
        <motion.div className="hero-rule" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.4, ease, delay: 1.8 }} />
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease, delay: 2.1 }}>
          {[cfg.dateText, cfg.venue].filter(Boolean).join('  ·  ')}
        </motion.p>
      </motion.div>
      <motion.a className="scroll-cue" href="#story" aria-label="Scroll to our story" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.8 }}>
        <span>Scroll</span><i />
      </motion.a>
    </header>
  )
}

function Story() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 60%'] })
  return (
    <section id="story">
      <div className="wrap">
        <Heading kicker="How it began">Our Story</Heading>
        <div className="timeline" ref={ref}>
          <motion.div className="timeline-line" style={{ scaleY: scrollYProgress }} />
          {cfg.story.map((m, i) => (
            <div key={m.title} className={`milestone ${i % 2 ? 'flip' : ''}`}>
              <motion.div className="milestone-pic" initial={{ opacity: 0, x: i % 2 ? 60 : -60, rotate: i % 2 ? 3 : -3 }} whileInView={{ opacity: 1, x: 0, rotate: 0 }} viewport={inView} transition={{ duration: 1.1, ease }}>
                {src(m.photo) && <ParallaxImg name={m.photo} alt={m.title} />}
              </motion.div>
              <span className="milestone-dot" aria-hidden="true" />
              <motion.div className="milestone-txt" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={inView} transition={{ duration: 1, ease, delay: 0.2 }}>
                <time>{m.date}</time>
                <h3>{m.title}</h3>
                <p>{m.text}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Chapter({ ev, index, onOpen }: { ev: (typeof events)[number]; index: number; onOpen: Open }) {
  const reel = useRef<HTMLDivElement>(null)
  const cover = ev.photos.reduce((a, b) => (ratio(b) > ratio(a) ? b : a), ev.photos[0])
  const list = ev.photos.filter(n => n !== cover)
  const slide = (dir: number) => reel.current?.scrollBy({ left: dir * reel.current.clientWidth * 0.8, behavior: 'smooth' })
  return (
    <section className="chapter">
      <div className="chapter-banner">
        {cover && <ParallaxImg name={cover} amount={14} className="chapter-bg" />}
        <motion.div className="chapter-title" initial="hidden" whileInView="show" viewport={inView} transition={{ staggerChildren: 0.15 }}>
          <motion.small variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease }}>
            Chapter {String(index + 1).padStart(2, '0')}
          </motion.small>
          <motion.h2 variants={{ hidden: { opacity: 0, y: 50, filter: 'blur(10px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)' } }} transition={{ duration: 1.2, ease }}>
            {ev.name}
          </motion.h2>
          <motion.time variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} transition={{ duration: 1 }}>{ev.date}</motion.time>
        </motion.div>
      </div>
      <div className="wrap">
        {ev.text && <motion.p className="chapter-text" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={inView} transition={{ duration: 1, ease }}>{ev.text}</motion.p>}
      </div>
      {list.length > 0 && (
        <div className="reel-wrap">
          <div className="reel" ref={reel}>
            {list.map((name, i) => (
              <motion.button
                key={name}
                type="button"
                className="reel-item"
                style={{ aspectRatio: ratio(name) }}
                aria-label={`Open ${ev.name} photo ${i + 1} of ${list.length}`}
                onClick={() => onOpen(list, i)}
                initial={{ opacity: 0, y: 60, scale: 0.94 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.9, ease, delay: Math.min(i, 4) * 0.08 }}
              >
                <img src={src(name)} alt="" loading="lazy" decoding="async" />
              </motion.button>
            ))}
          </div>
          <button type="button" className="reel-nav prev" aria-label="Previous photos" onClick={() => slide(-1)}>‹</button>
          <button type="button" className="reel-nav next" aria-label="Next photos" onClick={() => slide(1)}>›</button>
        </div>
      )}
    </section>
  )
}

/** Vertical scrolling drives a sideways ribbon of photos while the section stays pinned */
function Moments({ list, onOpen }: { list: string[]; onOpen: Open }) {
  const ref = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const dist = useMotionValue(0)
  const [height, setHeight] = useState(0)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const x = useTransform(() => -scrollYProgress.get() * dist.get())

  useLayoutEffect(() => {
    const measure = () => {
      const d = Math.max(0, (track.current?.scrollWidth ?? 0) - window.innerWidth)
      dist.set(d)
      setHeight(d)
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (track.current) ro.observe(track.current)
    window.addEventListener('resize', measure)
    return () => { ro.disconnect(); window.removeEventListener('resize', measure) }
  }, [dist])

  return (
    <section id="moments" ref={ref} className="moments" style={{ height: `calc(100svh + ${height}px)` }}>
      <div className="moments-sticky">
        <Heading kicker="Little things">Moments</Heading>
        <motion.div className="moments-track" ref={track} style={{ x }}>
          {list.map((name, i) => (
            <button key={name} type="button" className={`moment ${i % 2 ? 'low' : ''}`} style={{ aspectRatio: ratio(name) }} aria-label={`Open moment ${i + 1} of ${list.length}`} onClick={() => onOpen(list, i)}>
              <img src={src(name)} alt="" loading="lazy" decoding="async" />
            </button>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function Thanks() {
  const words = cfg.thankYou.split('\n')
  return (
    <section id="thanks" className="thanks">
      {cfg.thankYouPhoto && src(cfg.thankYouPhoto) && <ParallaxImg name={cfg.thankYouPhoto} amount={15} className="thanks-bg" />}
      <div className="wrap thanks-inner">
        <Heading kicker="From our hearts">Thank You</Heading>
        {words.map((line, l) => (
          <motion.p key={l} initial="hidden" whileInView="show" viewport={inView} transition={{ staggerChildren: 0.025 }}>
            {line.split(' ').map((w, i) => (
              <motion.span key={i} className="tw" variants={{ hidden: { opacity: 0, y: 12, filter: 'blur(6px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)' } }} transition={{ duration: 0.7, ease }}>
                {w}{' '}
              </motion.span>
            ))}
          </motion.p>
        ))}
        <motion.p className="sign" initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={inView} transition={{ duration: 1.2, ease, delay: 0.6 }}>
          With love, {couple}
        </motion.p>
      </div>
    </section>
  )
}

function MusicButton({ url }: { url: string }) {
  const audio = useRef<HTMLAudioElement>(null)
  const [on, setOn] = useState(false)
  const toggle = () => {
    if (!audio.current) return
    if (on) audio.current.pause()
    else audio.current.play().catch(() => setOn(false))
    setOn(!on)
  }
  return (
    <>
      <audio ref={audio} src={url} loop preload="none" />
      <button className={`music ${on ? 'on' : ''}`} aria-pressed={on} aria-label={on ? 'Pause background music' : 'Play background music'} onClick={toggle}>
        {on ? '❚❚' : '♫'}
      </button>
    </>
  )
}

function Page() {
  const [viewer, setViewer] = useState<{ list: string[]; index: number } | null>(null)
  const open: Open = (list, index) => setViewer({ list, index })
  const lenis = useLenis()
  const { scrollYProgress } = useScroll()

  useEffect(() => { document.title = `${couple} · ${cfg.dateText}` }, [])
  // Smooth scrolling must pause while the photo viewer is open
  useEffect(() => { if (viewer) lenis?.stop(); else lenis?.start() }, [viewer, lenis])

  return (
    <>
      <motion.div className="progress" style={{ scaleX: scrollYProgress }} />
      <Hero />
      <main>
        <Story />
        <div id="events">
          <div className="wrap events-intro"><Heading kicker="The celebrations">Our Wedding Journey</Heading></div>
          {events.map((ev, i) => <Chapter key={ev.name} ev={ev} index={i} onOpen={open} />)}
        </div>
        {moments.length > 0 && <Moments list={moments} onOpen={open} />}
        {videoId && (
          <section id="video">
            <div className="wrap">
              <Heading kicker="Relive the day">Wedding Film</Heading>
              <motion.div className="video" initial={{ opacity: 0, scale: 0.9, y: 40 }} whileInView={{ opacity: 1, scale: 1, y: 0 }} viewport={inView} transition={{ duration: 1.2, ease }}>
                <iframe src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`} title="Wedding video" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" />
              </motion.div>
            </div>
          </section>
        )}
        <Thanks />
      </main>
      <footer>
        {albumUrl && (
          <motion.a className="btn" href={albumUrl} target="_blank" rel="noopener" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={inView} transition={{ duration: 0.9, ease }}>
            View full album
          </motion.a>
        )}
        <p>{couple} · {cfg.dateText}</p>
      </footer>
      {music && <MusicButton url={music} />}
      <Lightbox
        open={viewer !== null}
        close={() => setViewer(null)}
        index={viewer?.index ?? 0}
        slides={viewer?.list.map(n => ({ src: src(n) })) ?? []}
        plugins={[Counter]}
        controller={{ closeOnBackdropClick: true }}
        styles={{ container: { backgroundColor: '#140709' } }}
      />
    </>
  )
}

export default function App() {
  const still = useReducedMotion()
  return (
    <MotionConfig reducedMotion="user">
      {!still && <ReactLenis root options={{ lerp: 0.09, anchors: true }} />}
      <Page />
    </MotionConfig>
  )
}
