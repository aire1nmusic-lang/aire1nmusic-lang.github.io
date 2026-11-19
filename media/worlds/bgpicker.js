/*
 * Owner/admin picker of the Minecraft and GTA RP world backgrounds (bottom-left button «Вид»), owner 16.11.2026.
 * Lives outside the JavaScript bundle (the bundle budget is full); styles are in src/components/layout/world-bg-picker.css.
 * The app sets html[data-admin=1] for accounts with the ADMIN role and html[data-world] for the current world. Visitors never get a panel.
 * Picking sets html[data-wbg] and --wbg-d/--wbg-m/--wbg-p; the CSS replaces the world backdrop and the world page scene. Personal server pages are left alone.
 * Change the ?v= in index.html whenever this file changes.
 */
(() => {
  const BG = {
    minecraft: { dir: 'minecraft', items: [['village', 'Деревня на закате'], ['oasis', 'Золотой оазис'], ['nether', 'Крепость Нижнего мира'], ['sky', 'Парящий замок'], ['cave', 'Пещера кристаллов']] },
    gtarp: { dir: 'gta-rp', items: [['race', 'Гонка к городу'], ['night', 'Вертолёт под луной'], ['sunset', 'Неоновый закат'], ['la', 'Лос-Анджелес'], ['heli', 'Площадка с героями']] },
    // Lineage 2 on phones only (owner 17.11: portrait 9:16 pictures to try with the new phone design); the desktop keeps its rainbow video
    // Lineage 2 on phones only: the owner's 9:16 pictures (bg-<id>-p.webp 900x1600, bg-<id>-320.webp thumbnails), like Minecraft and GTA RP
    lineage2: { phone: true, dir: 'lineage-2', items: [['rainbow', 'Радуга'], ['falls', 'Водопады'], ['sunset', 'Закат у озера'], ['tower2', 'Башня днём'], ['storm', 'Башня в грозу'], ['elf', 'Эльфийка на закате'], ['castle', 'Замок над морем']] },
  }
  const root = document.documentElement
  const get = k => { try { return localStorage.getItem(k) } catch { return null } }
  const put = (k, v) => { try { v === null ? localStorage.removeItem(k) : localStorage.setItem(k, v) } catch { /* private mode */ } }
  const url = (g, id, size) => `/media/worlds/${BG[g].dir}/bg-${id}-${size}.webp`
  let open = false, shownFor = ''

  // Tint is chosen per kind of page (owner 17.11: «точечно, например в ЛК»): the world pages, the inner lists, a server page, the cabinet.
  const KINDS = { world: 'Главная мира и хроники', inner: 'Каталог, ТОП, открытия', server: 'Страница сервера', account: 'Кабинет' }
  const DEFAULT_TINT = { world: 100, inner: 100, server: 100, account: 55 }
  const pageKind = () => { const p = location.pathname.replace(/^\/en(?=\/|$)/, ''); return /^\/account/.test(p) ? 'account' : /^\/server\//.test(p) ? 'server' : /^\/(catalog|rating|openings|favorites)(\/|$)/.test(p) ? 'inner' : 'world' }
  const bgText = (k, v) => (k === 'account' ? 'Фон кабинета (затемнение)' : 'Фон: ' + KINDS[k] + ' (яркость картинки)') + ' · ' + v + '%'
  const glassKey = k => k === 'account' ? 'gs.wbg.glass' : 'gs.wbg.glass.' + k
  const DEFAULT_GLASS = { world: 20, inner: 20, server: 20, account: 95 }
  const readTint = k => { const v = Number(get('gs.wbg.tint.' + k) ?? get('gs.wbg.tint')); return Math.min(140, Math.max(10, Number.isFinite(v) && v > 0 ? v : DEFAULT_TINT[k])) }

  function state() {
    const g = root.dataset.world
    const on = root.dataset.admin === '1' && !!BG[g] && (!BG[g].phone || matchMedia('(max-width:767px)').matches) && !/(^|\/)server\//.test(location.pathname)
    const cur = on ? get('gs.wbg.' + g) || 'now' : 'now'
    // the animation switch belongs to the cave only: the picked cave, or «Текущий фон» of Minecraft (the cave is its default on desktop)
    const tintOn = root.dataset.admin === '1' && !!BG[g] && (!BG[g].phone || matchMedia('(max-width:767px)').matches)
    return { g, on, tintOn, cur, cave: on && g === 'minecraft' && (cur === 'cave' || cur === 'now'), anim: get('gs.wbg.anim') !== 'off', speed: ['0.5', '0.75', '1'].includes(get('gs.wbg.speed')) ? get('gs.wbg.speed') : '0.5' }
  }

  function apply() {
    const { g, on, tintOn, cur, anim, speed } = state()
    if (on && !anim) root.dataset.wbgAnim = 'off'; else delete root.dataset.wbgAnim
    if (on) root.dataset.wbgSpeed = speed; else delete root.dataset.wbgSpeed
    // tint (brightness of the picture, 40–140 %, owner 17.11): html[data-wbg-tint] + --wbg-bright, see l2test/world.css block 12
    const kind = pageKind(), tint = tintOn ? readTint(kind) : 100
    // the cabinet gets a full-screen veil (--acc-veil, default in m2.css), every other page a brightness filter on its picture layers
    // cabinet glass: how dense the cards are, 0 (clear) … 100 (black), independent of the picture (--acc-glass)
    // plaques of every other page: --page-glass (GlassLab surfaces and m2.css), chosen per kind of page, the picture stays as it is
    const gk = glassKey(kind), glassRaw = get(gk), glass = Number(glassRaw), glassOn = tintOn && glassRaw !== null && Number.isFinite(glass)
    const alpha = String(Math.min(0.92, Math.max(0, glass / 100 * 0.92)))
    if (glassOn && kind === 'account') root.style.setProperty('--acc-glass', alpha); else root.style.removeProperty('--acc-glass')
    if (glassOn && kind !== 'account') { root.style.setProperty('--page-glass', alpha); root.style.setProperty('--page-glass-rgb', '16,20,27'); root.dataset.pageGlass = '1' } else { root.style.removeProperty('--page-glass'); root.style.removeProperty('--page-glass-rgb'); delete root.dataset.pageGlass }
    if (tintOn && kind === 'account') root.style.setProperty('--acc-veil', String(Math.max(0, Math.min(0.9, (100 - tint) / 100)))); else root.style.removeProperty('--acc-veil')
    if (kind !== 'account' && tint !== 100) { root.dataset.wbgTint = '1'; root.style.setProperty('--wbg-bright', String(tint / 100)) } else { delete root.dataset.wbgTint; root.style.removeProperty('--wbg-bright') }
    const items = on ? BG[g].items : []
    if (on && cur !== 'now' && items.some(i => i[0] === cur)) {
      root.dataset.wbg = cur
      root.style.setProperty('--wbg-d', `url('${url(g, cur, 1920)}')`)
      root.style.setProperty('--wbg-m', `url('${url(g, cur, 1280)}')`)
      root.style.setProperty('--wbg-p', `url('${url(g, cur, 'p')}')`)
    } else { delete root.dataset.wbg; for (const v of ['--wbg-d', '--wbg-m', '--wbg-p']) root.style.removeProperty(v) }
  }

  function render() {
    const { g, on, cur, cave, anim, speed } = state()
    const key = on ? `${g}|${cur}|${open}|${cave}|${anim}|${speed}|${pageKind()}` : ''
    if (key === shownFor) return
    shownFor = key
    document.querySelector('.gs-wbg')?.remove()
    if (!on) return
    const box = document.createElement('aside'); box.className = 'gs-wbg'; box.setAttribute('aria-label', 'Выбор фона')
    const label = cur === 'now' ? 'Текущий' : (BG[g].items.find(i => i[0] === cur) || [0, 'Текущий'])[1]
    if (open) {
      const list = document.createElement('div'); list.className = 'gs-wbg-list'; list.setAttribute('role', 'radiogroup')
      const add = (id, name, n) => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'gs-wbg-item'; b.setAttribute('role', 'radio')
        b.setAttribute('aria-checked', String(cur === id)); b.dataset.on = String(cur === id)
        const th = id === 'now' ? Object.assign(document.createElement('span'), { className: 'gs-wbg-thumb gs-wbg-thumb-now', textContent: 'Сейчас' }) : Object.assign(document.createElement('img'), { className: 'gs-wbg-thumb', src: url(g, id, 320), alt: '', width: 96, height: 54 })
        if (BG[g].phone && th.tagName === 'IMG') { th.style.width = '36px'; th.style.height = '64px' }
        const nm = document.createElement('span'); nm.className = 'gs-wbg-name'; nm.textContent = (n ? n + ' ' : '') + name
        b.append(th, nm)
        b.onclick = () => { put('gs.wbg.' + g, id === 'now' ? null : id); apply(); render() }
        list.appendChild(b)
      }
      // what this device has set, in one line, so the owner can send a screenshot and the values become everybody's default (owner 18.11)
      const note = document.createElement('p'); note.className = 'gs-wbg-mine'
      const showMine = () => {
        const mine = Object.keys(KINDS).map(k => { const t = get('gs.wbg.tint.' + k), gv = get(glassKey(k)); return (t !== null || gv !== null) ? KINDS[k] + ': фон ' + (t ?? DEFAULT_TINT[k]) + '%, стекло ' + (gv ?? DEFAULT_GLASS[k]) + '%' : '' }).filter(Boolean)
        note.textContent = mine.length ? 'Мои значения (пришли скрин — сделаю для всех): ' + mine.join(' · ') : 'Мои значения: пока по умолчанию'
      }
      // tint slider: live while dragging (the panel is not rebuilt), saved when released
      const kind = pageKind(), tintNow = readTint(kind)
      const tr = document.createElement('div'); tr.className = 'gs-wbg-tint'
      const tl = document.createElement('span'); tl.textContent = bgText(kind, tintNow)
      const ti = document.createElement('input'); ti.type = 'range'; ti.min = '10'; ti.max = '140'; ti.step = '5'; ti.value = String(tintNow); ti.setAttribute('aria-label', 'Тонировка фона')
      ti.oninput = () => { put('gs.wbg.tint.' + kind, ti.value); apply(); tl.textContent = bgText(kind, ti.value) ; showMine() }
      const tz = document.createElement('button'); tz.type = 'button'; tz.textContent = 'Сброс'
      tz.onclick = () => { put('gs.wbg.tint.' + kind, null); put('gs.wbg.tint', null); apply(); ti.value = String(readTint(kind)); tl.textContent = bgText(kind, ti.value) ; showMine() }
      tr.append(tl, ti, tz); list.appendChild(tr)
      {
        const gk = glassKey(kind), dflt = DEFAULT_GLASS[kind]
        const gNow = get(gk) === null ? dflt : Math.min(100, Math.max(0, Number(get(gk)) || 0))
        const gr = document.createElement('div'); gr.className = 'gs-wbg-tint'
        const gl = document.createElement('span'); const glText = v => 'Стекло табличек: прозрачное → тёмное · ' + v + '%'; gl.textContent = glText(gNow)
        const gi = document.createElement('input'); gi.type = 'range'; gi.min = '0'; gi.max = '100'; gi.step = '5'; gi.value = String(gNow); gi.setAttribute('aria-label', 'Плотность стекла табличек')
        gi.oninput = () => { put(gk, gi.value); apply(); gl.textContent = glText(gi.value) ; showMine() }
        const gz = document.createElement('button'); gz.type = 'button'; gz.textContent = 'Сброс'
        gz.onclick = () => { put(gk, null); apply(); gi.value = String(dflt); gl.textContent = glText(dflt) ; showMine() }
        gr.append(gl, gi, gz); list.appendChild(gr)
      }
      list.appendChild(note); showMine()
      add('now', 'Текущий фон', 0)
      BG[g].items.forEach((it, i) => add(it[0], it[1], i + 1))
      if (cave) {
        const sw = document.createElement('button'); sw.type = 'button'; sw.className = 'gs-wbg-anim'; sw.setAttribute('role', 'switch'); sw.setAttribute('aria-checked', String(anim)); sw.dataset.on = String(anim)
        const nm = document.createElement('span'); nm.textContent = 'Анимация пещеры'
        const st = document.createElement('b'); st.textContent = anim ? 'Вкл' : 'Выкл'
        sw.append(nm, st)
        sw.onclick = () => { put('gs.wbg.anim', anim ? 'off' : null); apply(); render() }
        list.appendChild(sw)
        if (anim) {
          const row = document.createElement('div'); row.className = 'gs-wbg-speed'; row.setAttribute('role', 'radiogroup'); row.setAttribute('aria-label', 'Скорость анимации')
          const lb = document.createElement('span'); lb.textContent = 'Скорость'; row.appendChild(lb)
          for (const v of ['0.5', '0.75', '1']) {
            const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', String(speed === v)); b.dataset.on = String(speed === v)
            b.textContent = v.replace('.', ',') + '×'
            b.onclick = () => { put('gs.wbg.speed', v === '0.5' ? null : v); apply(); render() }
            row.appendChild(b)
          }
          list.appendChild(row)
        }
      }
      box.appendChild(list)
    }
    const t = document.createElement('button'); t.type = 'button'; t.className = 'gs-wbg-toggle'; t.setAttribute('aria-expanded', String(open))
    t.textContent = '🖼 Вид · ' + label
    t.onclick = () => { open = !open; render() }
    box.appendChild(t); document.body.appendChild(box)
  }

  let queued = false
  const sync = () => { queued = false; apply(); render() }
  const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(sync) } }
  new MutationObserver(muts => { if (muts.some(m => !(m.target instanceof Element && m.target.closest('.gs-wbg')))) schedule() })
    .observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-world', 'data-admin'] })
  addEventListener('popstate', schedule)
  // single-page navigation: the kind of page changes without a reload
  for (const m of ['pushState', 'replaceState']) { const orig = history[m]; history[m] = function () { const r = orig.apply(this, arguments); schedule(); return r } }
  schedule()
})()
