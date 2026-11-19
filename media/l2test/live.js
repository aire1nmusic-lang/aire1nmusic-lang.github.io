/*
 * Looping video of the Lineage II background (owner 15.11.2026): the rainbow video on wide landscape screens (PC), played at 0.75x.
 * Loaded by index.html only there; it is not part of the site's JavaScript bundle. Phones keep the original still background.
 * Background picking and the glass switch were removed on the owner's word: the look is fixed.
 * The picture itself is html[data-l2bg=rainbow] (styles at the end of src/index.css); the video goes under the same overlays
 * where the L2 picture is painted: the page scene (.l2a .scene), the fixed backdrop of inner pages (.gs-l2-aether-layout)
 * and the world backdrop (.gs-world-backdrop--elf-sunset).
 */
(() => {
  const BASE = '/media/l2test/video/'
  const READY = { now: true, rainbow: true, falls: true, sunset: true, tower2: true } // renders that already exist
  const store = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v) } catch { return null } }
  const small = () => innerWidth < 900
  // owner 15.11.2026: upright screens (phones, tablets) get still 9:16 pictures no video; the original background stays, video is for wide landscape screens only
  const portrait = () => innerHeight > innerWidth
  const videoOn = () => true // fixed on (owner 15.11.2026); the old on/off switch is gone
  // Wan renders move too fast for a calm background (owner 13.11.2026): play slower by default (0.75x, owner's pick 15.11.2026), 1x stays to compare
  const speed = () => 0.75
  const reduced = matchMedia('(prefers-reduced-motion: reduce)')
  const style = document.createElement('style')
  style.textContent = `html.gs-l2v .gs-l2-aether-layout::before,html.gs-l2v .gs-account-layout::before{display:none!important}
html body .gs-account-layout>.gs-l2v-fixed{position:fixed!important;inset:0!important;height:100lvh!important;z-index:0!important}
html body .gs-account-layout>.gs-l2v-fixed::after{display:none}
.gs-l2v-fixed{position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden}
.gs-l2v-fixed::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,#06101bd9,#0b152270 60%),linear-gradient(0deg,#0a1018b0,#0a101850)}
.gs-l2v video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none}
html[data-l2bg='tower2'] .l2a{--art:url('/media/l2test/tower2-1536.webp')!important;--art-mobile:url('/media/l2test/tower2-768.webp')!important}
html[data-l2bg='tower2'] .l2a .scene::before{background-image:url('/media/l2test/tower2-1536.webp')!important}
html[data-l2bg='tower2'] .gs-l2-aether-layout::before{background-image:linear-gradient(90deg,#06101bb0,#0b152240 60%),linear-gradient(0deg,#0a101880,#0a101830),url('/media/l2test/tower2-1536.webp')!important}
@media(max-width:767px){html[data-l2bg='tower2'] .l2a .scene::before{background-image:url('/media/l2test/tower2-768.webp')!important}html[data-l2bg='tower2'] .gs-l2-aether-layout::before{background-image:linear-gradient(90deg,#06101bb0,#0b152240 60%),linear-gradient(0deg,#0a101880,#0a101830),url('/media/l2test/tower2-768.webp')!important}}`
  document.head.appendChild(style)


  const current = () => document.documentElement.dataset.l2bg || 'now'

  function makeVideo(id) {
    const v = document.createElement('video')
    v.muted = true; v.loop = true; v.playsInline = true; v.autoplay = true; v.preload = 'auto'
    v.setAttribute('aria-hidden', 'true'); v.src = `${BASE}${id}-${small() ? 854 : 1280}.mp4`; v.dataset.l2v = id; v.poster = `/media/l2test/${id}-1536.webp`
    v.defaultPlaybackRate = v.playbackRate = speed(); v.addEventListener('loadedmetadata', () => { v.playbackRate = speed() })
    v.play().catch(() => {})
    return v
  }

  function clear() {
    document.querySelectorAll('[data-l2v-host]').forEach(el => el.remove())
    document.documentElement.classList.remove('gs-l2v')
  }

  function sync() {
    const scene = document.querySelector('.l2a .scene'), layout = document.querySelector('.gs-l2-aether-layout'), backdrop = document.querySelector('.gs-world-backdrop--elf-sunset')
    // owner 13.11.2026: the cabinet (account/admin) shows the chosen background too, on screens where it has a picture
    const account = null // the cabinet no longer shows the background video (picking is gone)
    const onL2 = !!(scene || layout || backdrop || account)
    const id = current(), want = !!document.documentElement.dataset.l2bg && onL2 && READY[id] && videoOn() && !reduced.matches && !portrait()
    if (!want) { clear(); return }
    const places = [scene, layout, backdrop, account].filter(Boolean), hosts = [...document.querySelectorAll('[data-l2v-host]')]
    if (hosts.length === places.length && hosts.every(h => h.dataset.l2vHost === id && h.isConnected)) return
    clear()
    document.documentElement.classList.add('gs-l2v')
    if (scene) {
      // inside the scene: above its picture (::before), under its gradients (::after)
      const host = document.createElement('div'); host.dataset.l2vHost = id; host.className = 'gs-l2v'
      host.style.cssText = 'position:absolute;inset:0;overflow:hidden;opacity:.85'
      const v = makeVideo(id), pseudo = getComputedStyle(scene, '::before')
      if (/px/.test(pseudo.backgroundSize)) {
        // phones: the picture is drawn at a fixed height, anchored like the background
        const h = parseFloat(pseudo.backgroundSize.split(' ').pop()) || 735
        v.style.cssText = `position:absolute;top:0;height:${h}px;width:auto;left:0;object-fit:cover`
        v.addEventListener('loadedmetadata', () => { const w = h * v.videoWidth / v.videoHeight; v.style.width = w + 'px'; v.style.left = ((scene.clientWidth - w) * 0.67) + 'px' })
      } else v.style.objectPosition = '54% 12%'
      host.appendChild(v); scene.prepend(host)
    }
    if (account) {
      const host = document.createElement('div'); host.dataset.l2vHost = id; host.className = 'gs-l2v gs-l2v-fixed'
      const v = makeVideo(id); v.style.objectPosition = '60% top'
      host.appendChild(v); account.prepend(host)
    }
    if (layout) {
      const host = document.createElement('div'); host.dataset.l2vHost = id; host.className = 'gs-l2v gs-l2v-fixed'
      const v = makeVideo(id); v.style.objectPosition = '60% top'
      host.appendChild(v); layout.prepend(host)
    }
    if (backdrop) {
      const host = document.createElement('div'); host.dataset.l2vHost = id; host.className = 'gs-l2v'
      host.style.cssText = 'position:absolute;inset:0;overflow:hidden'
      const v = makeVideo(id); v.style.objectPosition = getComputedStyle(backdrop).backgroundPosition || '50% 0'
      host.appendChild(v); backdrop.appendChild(host)
    }
  }

  let queued = false
  const schedule = () => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; sync() }) }
  new MutationObserver(muts => { if (muts.some(m => !(m.target instanceof Element && m.target.closest('[data-l2v-host],.gs-l2v-panel')))) schedule() })
    .observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-l2bg'] })
  document.addEventListener('visibilitychange', () => document.querySelectorAll('[data-l2v-host] video').forEach(v => document.hidden ? v.pause() : v.play().catch(() => {})))
  reduced.addEventListener?.('change', schedule)
  // phones fire resize when the address bar hides on scroll: rebuild only when the screen turns between upright and landscape
  let lastKey = `${portrait()}|${small()}`
  addEventListener('resize', () => { const k = `${portrait()}|${small()}`; if (k === lastKey) return; lastKey = k; clear(); schedule() })
  schedule()
})()
