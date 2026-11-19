/*
 * Looping video of the Minecraft «Кристальная пещера» background (owner 16.11.2026), like the Lineage II one (media/l2test/live.js).
 * Loaded by index.html on wide landscape screens only (phones/tablets keep the still pictures; data-saver users keep the still too).
 * Plays while the cave is the world's background: html[data-world=minecraft], no other admin pick (data-wbg absent or cave), animation not switched off
 * by the admin panel (html[data-wbg-anim=off]), desktop/landscape.
 * Not part of the site's JavaScript bundle. Change the ?v= in index.html whenever this file or the videos change.
 */
(() => {
  const BASE = '/media/worlds/minecraft/video/'
  const reduced = matchMedia('(prefers-reduced-motion: reduce)')
  const wide = () => innerWidth >= 1024 && innerWidth > innerHeight
  const small = () => innerWidth < 1400
  // playback speed: 0.5 for everyone (owner 17.11); the admin panel can set 0.5 / 0.75 / 1 (html[data-wbg-speed])
  const speed = () => ['0.5', '0.75', '1'].includes(document.documentElement.dataset.wbgSpeed) ? Number(document.documentElement.dataset.wbgSpeed) : 0.5
  const style = document.createElement('style')
  style.textContent = '.gs-mcv{position:absolute;inset:0;overflow:hidden;pointer-events:none}.gs-mcv video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none}'
  document.head.appendChild(style)

  function makeVideo() {
    const v = document.createElement('video')
    v.muted = true; v.loop = true; v.playsInline = true; v.autoplay = true; v.preload = 'auto'
    v.setAttribute('aria-hidden', 'true'); v.dataset.mcv = '1'; v.poster = '/media/worlds/minecraft/bg-cave-1920.webp'
    v.src = `${BASE}cave-${small() ? 854 : 1280}.mp4`
    v.defaultPlaybackRate = v.playbackRate = speed(); v.addEventListener('loadedmetadata', () => { v.playbackRate = speed() })
    v.play().catch(() => {})
    return v
  }
  const clear = () => document.querySelectorAll('[data-mcv-host]').forEach(el => el.remove())

  function sync() {
    const root = document.documentElement
    document.querySelectorAll('[data-mcv-host] video').forEach(v => { v.defaultPlaybackRate = v.playbackRate = speed() })
    // the cave is also what an admin gets by picking «Пещера кристаллов» (data-wbg=cave), so the video plays there too
    const want = root.dataset.world === 'minecraft' && (!root.dataset.wbg || root.dataset.wbg === 'cave') && root.dataset.wbgAnim !== 'off' && wide() && !reduced.matches
    if (!want) { clear(); return }
    const scene = document.querySelector('.l2a .scene'), backdrop = document.querySelector('.gs-world-backdrop'), account = document.querySelector('.gs-account-layout')
    // the cabinet shows the same background as the world pages (owner 17.11.2026); its backdrop is hidden, so the video goes into the layout itself
    const places = (account ? [account] : [scene, backdrop]).filter(p => p && getComputedStyle(p).display !== 'none')
    const hosts = [...document.querySelectorAll('[data-mcv-host]')]
    if (hosts.length === places.length && hosts.every(h => h.isConnected)) return
    clear()
    for (const place of places) {
      const host = document.createElement('div'); host.dataset.mcvHost = '1'; host.className = place === account ? 'gs-mcv gs-mcv-fixed' : 'gs-mcv'
      const v = makeVideo(); v.style.objectPosition = place === scene ? '50% 18%' : '50% 40%'
      host.appendChild(v)
      // scene: above its picture (::before), under its gradients (::after); backdrop: under its ::after veil
      place.prepend(host)
    }
  }

  let queued = false
  const schedule = () => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; sync() }) }
  new MutationObserver(muts => { if (muts.some(m => !(m.target instanceof Element && m.target.closest('[data-mcv-host]')))) schedule() })
    .observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-world', 'data-wbg', 'data-wbg-anim', 'data-wbg-speed'] })
  document.addEventListener('visibilitychange', () => document.querySelectorAll('[data-mcv-host] video').forEach(v => document.hidden ? v.pause() : v.play().catch(() => {})))
  reduced.addEventListener?.('change', schedule)
  addEventListener('resize', () => { clear(); schedule() })
  schedule()
})()
