/*
 * Matte glass for the top two panels of the Lineage II world page: the search field and «Хроники» (owner 15.11.2026: «такое же матовое как внизу»).
 * Same material as the «Твой сервер в GameScout» panel (.l2a .owner): white gradient 12 % -> 4.3 %, white 23 % edge, inset highlight, soft shadow, blur 5.
 * These two are painted by the site's glass lab with inline !important styles, which no stylesheet can override, so this small script (outside the
 * JavaScript bundle) rewrites those inline values and keeps them after every lab repaint (synchronously, before paint). Values are compared before writing, so it does not loop.
 */
(() => {
  const SEL = '.l2a form.search-box, .l2a details.chronicle-picker'
  const LOOK = {
    'background-color': 'rgba(var(--page-glass-rgb, 12, 14, 18), var(--page-glass, 0.16))', // faint dark base (the «Стекло табличек» slider sets --page-glass): the two read the same matte over bright and dark parts of the picture
    'background-image': 'linear-gradient(150deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.043))',
    'border-color': 'rgba(255, 255, 255, 0.23)',
    'box-shadow': 'rgba(255, 255, 255, 0.14) 0px 1px 0px 0px inset, rgba(0, 0, 0, 0.55) 0px 12px 32px -24px',
    'backdrop-filter': 'blur(5px) saturate(1.1)',
    '-webkit-backdrop-filter': 'blur(5px) saturate(1.1)'
  }
  function paint() {
    for (const el of document.querySelectorAll(SEL)) {
      // a picked chronicle / mode (the «Все серверы» link is not current) gets a lime edge, so the choice is easy to see
      const picked = el.matches('.chronicle-picker') && !el.querySelector(':scope > .gs-inline-reset[aria-current="page"]')
      const look = picked ? { ...LOOK, 'border-color': 'rgba(200, 255, 85, 0.6)' } : LOOK
      for (const k in look) {
        const cur = el.style.getPropertyValue(k)
        if (cur !== look[k] && !(cur && cur.replace(/\s+/g, '') === look[k].replace(/\s+/g, '')) || el.style.getPropertyPriority(k) !== 'important') el.style.setProperty(k, look[k], 'important')
      }
    }
  }
  // Server page background by place (owner 15.11.2026): the Lineage II server in place 1/2/3 gets waterfalls / day tower / sunset behind the page.
  // The page reads --profile-art / --profile-art-mobile from the inline style of .gs-server-bg (React). Inline !important wins over every stylesheet,
  // and the original values are remembered so a server without a place gets its own picture back.
  const PLACE_ART = { 1: 'falls', 2: 'tower2', 3: 'sunset' }
  // Phones (owner 17.11): portrait 9:16 pictures — place 1 waterfalls, place 2 storm tower, place 3 sunset, every other server the rainbow.
  const PHONE_ART = { 1: 'falls', 2: 'storm', 3: 'sunset' }
  const OURS = /\/media\/(l2test\/(falls|tower2|sunset)-|worlds\/lineage-2\/bg-)/
  function paintServerPage() {
    for (const bg of document.querySelectorAll('.gs-server-bg')) {
      const root = bg.closest('.gs-server-profile')
      const isL2 = !!root && /^(lineage2|l2-)/.test(root.getAttribute('data-theme') || '')
      const place = isL2 ? root.getAttribute('data-profile-place') : null
      const id = isL2 ? PLACE_ART[place] : undefined
      const want = {}
      if (id) want['--profile-art'] = `url("/media/l2test/${id}-1536.webp")`
      if (isL2) want['--profile-art-mobile'] = `url("/media/worlds/lineage-2/bg-${PHONE_ART[place] || 'rainbow'}-p.webp")`
      for (const k of ['--profile-art', '--profile-art-mobile']) {
        const cur = bg.style.getPropertyValue(k), mine = bg.style.getPropertyPriority(k) === 'important' && OURS.test(cur)
        if (want[k]) {
          if (cur === want[k] && bg.style.getPropertyPriority(k) === 'important') continue
          if (!mine) bg.dataset['orig' + k.length] = cur
          bg.style.setProperty(k, want[k], 'important')
        } else if (mine) {
          const orig = bg.dataset['orig' + k.length]
          if (orig) bg.style.setProperty(k, orig); else bg.style.removeProperty(k)
        }
      }
    }
  }
  // The rainbow background is for Lineage II only (owner 15.11.2026: GTA and Minecraft get their own later). The app sets html[data-world]; index.html
  // only guessed the first paint from the address. Wide screens only (data-l2wide); phones keep the original background.
  function syncWorld() {
    const d = document.documentElement
    if (!d.hasAttribute('data-l2wide') || !d.dataset.world) return
    if (d.dataset.world === 'lineage2') { if (d.dataset.l2bg !== 'rainbow') d.dataset.l2bg = 'rainbow' }
    else if (d.dataset.l2bg) delete d.dataset.l2bg
  }
  // No timer here: the glass lab repaints these panels in a requestAnimationFrame and a delayed fix would show its colours for a frame or two
  // (the panels "trembled" on every click). A MutationObserver callback runs right after the lab's write and before the browser paints, so the
  // lab's look never reaches the screen. The values are compared before writing, so our own writes settle at once instead of looping.
  new MutationObserver(() => { syncWorld(); paint(); paintServerPage() }).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['style', 'data-glass-surface', 'aria-current', 'data-profile-place', 'data-theme', 'open', 'data-world'] })
  syncWorld()
  paint()
  paintServerPage()
})()
