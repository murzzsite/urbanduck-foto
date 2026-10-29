const LEAD_ENDPOINT = 'https://lead-relay.leestygpt.workers.dev/lead/FAW6YD2QJL';

(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches && !/[?&]motion/.test(location.search);
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const fmt = n => Math.round(n).toLocaleString('ru-RU').replace(/ /g, ' ') + ' ₽';

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ===== header / burger =====
  const header = $('#header');
  const onScroll = () => header?.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const burger = $('#burger');
  const nav = $('#nav');
  const setMenu = open => {
    burger.classList.toggle('is-open', open);
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
  };
  burger?.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  $$('a', nav).forEach(a => a.addEventListener('click', () => setMenu(false)));

  // ===== phone mask =====
  $$('input[type="tel"]').forEach(input => {
    input.addEventListener('input', e => {
      let v = e.target.value.replace(/\D/g, '');
      if (v.startsWith('8')) v = '7' + v.slice(1);
      if (!v.startsWith('7')) v = '7' + v;
      v = v.slice(0, 11);
      let out = '+7';
      if (v.length > 1) out += ' (' + v.slice(1, 4);
      if (v.length >= 4) out += ') ' + v.slice(4, 7);
      if (v.length >= 7) out += '-' + v.slice(7, 9);
      if (v.length >= 9) out += '-' + v.slice(9, 11);
      e.target.value = out;
    });
  });

  // ===== smooth anchors =====
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href.length <= 1) return;
      const target = $(href);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 68;
      window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  // ===== hero slideshow: shutter flash + focus box =====
  const stage = $('#stage');
  if (stage) {
    const imgs = $$('.stage__img', stage);
    const flash = $('.stage__flash', stage);
    const focus = $('.stage__focus', stage);
    const bar = $('.stage__bar i', stage);
    const capEl = $('#stageCap');
    const numEl = $('#stageNum');
    const SLIDE = 3600;
    let cur = 0, timer;

    const restartBar = () => {
      bar.classList.remove('run'); void bar.offsetWidth; bar.classList.add('run');
    };
    const show = n => {
      cur = (n + imgs.length) % imgs.length;
      if (!reduce) {
        flash.classList.remove('go'); focus.classList.remove('go'); void flash.offsetWidth;
        flash.classList.add('go'); focus.classList.add('go');
      }
      setTimeout(() => {
        imgs.forEach((im, i) => im.classList.toggle('is-on', i === cur));
        capEl.textContent = imgs[cur].dataset.cap;
        numEl.textContent = String(cur + 1).padStart(2, '0');
      }, reduce ? 0 : 90);
      restartBar();
    };
    const loop = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => show(cur + 1), SLIDE); };
    restartBar();
    loop();
    stage.addEventListener('click', () => { show(cur + 1); loop(); });
    document.addEventListener('visibilitychange', () => document.hidden ? clearInterval(timer) : loop());
  }

  // ===== background demo =====
  const screen = $('#bgScreen');
  if (screen) {
    const img = $('#bgImg');
    const tag = $('#bgTag');
    $$('.sw').forEach(b => b.addEventListener('click', () => {
      $$('.sw').forEach(x => x.classList.toggle('is-on', x === b));
      const clear = b.dataset.bg === 'clear';
      screen.classList.toggle('is-clear', clear);
      screen.style.backgroundColor = clear ? '' : b.dataset.bg;
      tag.textContent = b.dataset.name;
    }));
    $$('.it').forEach(b => b.addEventListener('click', () => {
      $$('.it').forEach(x => x.classList.toggle('is-on', x === b));
      img.classList.add('out');
      setTimeout(() => { img.src = b.dataset.img; img.alt = b.dataset.alt; img.onload = () => img.classList.remove('out'); }, 200);
    }));
  }

  // ===== loupe =====
  const loupe = $('#loupe');
  if (loupe) {
    const li = $('#loupeImg');
    const glass = $('#loupeGlass');
    const Z = 3;
    let loaded = false, auto = null;
    const load = () => {
      if (loaded) return; loaded = true;
      glass.style.backgroundImage = 'url(img/painting-big.jpg)';
    };
    const place = (px, py) => {
      const r = li.getBoundingClientRect();
      const s = glass.offsetWidth;
      const x = Math.min(Math.max(px, 0), r.width), y = Math.min(Math.max(py, 0), r.height);
      glass.style.transform = '';
      glass.style.left = (x - s / 2) + 'px';
      glass.style.top = (y - s / 2) + 'px';
      glass.style.backgroundSize = (r.width * Z) + 'px ' + (r.height * Z) + 'px';
      glass.style.backgroundPosition = (-(x * Z - s / 2)) + 'px ' + (-(y * Z - s / 2)) + 'px';
    };
    loupe.addEventListener('pointerenter', e => {
      if (e.pointerType === 'touch') return;
      load(); loupe.classList.add('is-active');
    });
    loupe.addEventListener('pointermove', e => {
      if (e.pointerType === 'touch') return;
      const r = li.getBoundingClientRect();
      place(e.clientX - r.left, e.clientY - r.top);
    });
    loupe.addEventListener('pointerleave', () => loupe.classList.remove('is-active'));
    // touch / no hover: loupe drifts over the painting by itself
    if (!window.matchMedia('(hover: hover)').matches && !reduce) {
      new IntersectionObserver(([en]) => {
        if (en.isIntersecting) {
          load(); loupe.classList.add('is-active');
          const t0 = performance.now();
          const step = t => {
            const r = li.getBoundingClientRect();
            const k = (t - t0) / 3200;
            place(r.width * (.5 + .32 * Math.sin(k)), r.height * (.5 + .28 * Math.sin(k * 1.3 + 1)));
            auto = requestAnimationFrame(step);
          };
          auto = requestAnimationFrame(step);
        } else { cancelAnimationFrame(auto); loupe.classList.remove('is-active'); }
      }, { threshold: .4 }).observe(loupe);
    }
  }

  // ===== calculator =====
  const PRICE = { a: 200, b: 300, c: 2200, d: 450, e: 2700, f: 1000, g: 1800, h: 2000 };
  const calcForm = $('#calcForm');
  let lastCalc = '';
  let shown = 0;
  if (calcForm) {
    const qty = $('#qty'), kit = $('#kit'), rep = $('#repeat');
    const totalEl = $('#total'), note = $('#calcNote');
    const kindOf = () => calcForm.querySelector('input[name="kind"]:checked');
    const setTotal = v => {
      if (hasGsap && !reduce) {
        const o = { v: shown };
        gsap.to(o, { v, duration: .55, ease: 'power3.out', overwrite: true, onUpdate: () => { totalEl.textContent = fmt(o.v); }, onComplete: () => { totalEl.textContent = fmt(v); } });
      } else totalEl.textContent = fmt(v);
      shown = v;
    };
    const calc = () => {
      const radio = kindOf();
      const k = radio.value;
      $$('.opt').forEach(o => o.classList.toggle('is-on', o.contains(radio)));
      const simple = k === 'a' || k === 'b';
      $('#chkKit').hidden = !simple;
      if (!simple) kit.checked = false;
      const n = Math.min(999, Math.max(1, parseInt(qty.value, 10) || 1));
      let per = PRICE[k];
      if (kit.checked) per += 200 + (k === 'b' ? 200 : 0);
      let total = per * n;
      if (rep.checked) total *= 0.9;
      setTotal(total);
      if (simple && n > 100) note.textContent = 'Цены указаны для заказов до 100 фото. Условия для большой партии назовём отдельно.';
      else if (rep.checked) note.textContent = 'Учтена скидка 10% на повторный заказ.';
      else note.textContent = 'Итоговую сумму подтвердим после просмотра ваших товаров.';
      const name = radio.closest('.opt').querySelector('.opt__name').firstChild.textContent.trim();
      const place = calcForm.querySelector('input[name="place"]:checked').value;
      lastCalc = `Расчёт с сайта: ${name}, ${n} кадров` + (kit.checked ? ', комплект в кадре' : '') + (rep.checked ? ', повторный заказ' : '') + `. Где снимаем: ${place}. Ориентировочно ${fmt(total)}.`;
    };
    calcForm.addEventListener('input', calc);
    calcForm.addEventListener('change', calc);
    $('#qMinus').addEventListener('click', () => { qty.value = Math.max(1, (parseInt(qty.value, 10) || 1) - 5); calc(); });
    $('#qPlus').addEventListener('click', () => { qty.value = Math.min(999, (parseInt(qty.value, 10) || 0) + 5); calc(); });
    calc();
    $('#calcSend').addEventListener('click', () => {
      const c = $('#leadForm [name="comment"]');
      if (c) c.value = lastCalc;
    });
  }

  // ===== form submit =====
  const form = $('#leadForm');
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const label = btn.querySelector('span');
    const orig = label.textContent;
    const payload = {};
    new FormData(form).forEach((v, k) => { payload[k] = v; });
    if (payload._gotcha) return;
    if (!payload.name || !payload.phone || payload.phone.replace(/\D/g, '').length < 11) {
      alert('Укажите имя и телефон полностью');
      return;
    }
    btn.disabled = true;
    label.textContent = 'Отправляем...';
    try {
      const resp = await fetch(LEAD_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      label.textContent = 'Заявка отправлена';
      form.reset();
    } catch (err) {
      console.error(err);
      label.textContent = 'Ошибка, попробуйте ещё раз';
    } finally {
      setTimeout(() => { label.textContent = orig; btn.disabled = false; }, 3000);
    }
  });

  // ===== GSAP animations (page stays fully visible if GSAP fails to load) =====
  if (!hasGsap || reduce) return;
  gsap.registerPlugin(ScrollTrigger);

  // hero intro
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  tl.from('.hero__title .ln > span', { yPercent: 115, duration: 1.05, stagger: .12 })
    .from('[data-hero-fade]', { y: 24, opacity: 0, duration: .8, stagger: .1 }, '-=.6')
    .from('.stage__frame', { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'power3.inOut' }, 0.15)
    .from('.stage__meta, .stage__bar', { opacity: 0, y: 14, duration: .6 }, '-=.4');
  $$('[data-count]').forEach(el => {
    const t = +el.dataset.count;
    const o = { v: 0 };
    gsap.to(o, { v: t, duration: 1.4, delay: .5, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(o.v); } });
  });

  // split headings into masked words
  $$('[data-split]').forEach(h => {
    if (h.children.length) return;
    const words = h.textContent.trim().split(/\s+/);
    h.setAttribute('aria-label', h.textContent.trim());
    h.innerHTML = words.map(w => `<span class="sw-w" aria-hidden="true"><span>${w}</span></span>`).join(' ');
    gsap.from($$('.sw-w > span', h), {
      yPercent: 110, duration: .9, ease: 'power4.out', stagger: .06,
      scrollTrigger: { trigger: h, start: 'top 88%', once: true },
    });
  });

  // rise-in blocks
  ScrollTrigger.batch('[data-rise]', {
    start: 'top 90%', once: true,
    onEnter: els => gsap.from(els, { y: 36, opacity: 0, duration: .85, stagger: .1, ease: 'power3.out', overwrite: true }),
  });

  // magnetic buttons
  if (window.matchMedia('(hover: hover)').matches) {
    $$('[data-magnet]').forEach(b => {
      const xTo = gsap.quickTo(b, 'x', { duration: .4, ease: 'power3' });
      const yTo = gsap.quickTo(b, 'y', { duration: .4, ease: 'power3' });
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * .22);
        yTo((e.clientY - (r.top + r.height / 2)) * .3);
      });
      b.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
  }

  // background demo entrance
  gsap.from('.bgd__screen', { scale: .94, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.bgd__screen', start: 'top 85%', once: true } });
  gsap.from('.sw', { scale: 0, duration: .5, stagger: .06, ease: 'back.out(2)', scrollTrigger: { trigger: '.swatches', start: 'top 90%', once: true } });

  // works: pinned horizontal scroll on desktop
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', () => {
    const track = $('#worksTrack');
    const bar = $('#worksBar');
    if (!track) return;
    document.documentElement.classList.add('works-pin');
    const dist = () => Math.max(0, track.scrollWidth - window.innerWidth + 24);
    gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: '.works__pin', start: 'top top', end: () => '+=' + dist(),
        pin: true, scrub: .6, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: self => gsap.set(bar, { scaleX: self.progress }),
      },
    });
    $$('.w img', track).forEach(im => {
      gsap.fromTo(im, { scale: 1.12 }, {
        scale: 1, ease: 'none',
        scrollTrigger: { trigger: im.parentElement, containerAnimation: ScrollTrigger.getAll().find(s => s.vars.pin)?.animation, start: 'left 95%', end: 'left 40%', scrub: true },
      });
    });
    return () => document.documentElement.classList.remove('works-pin');
  });
  window.addEventListener('load', () => ScrollTrigger.refresh());

  // paintings
  gsap.from('.loupe', { y: 50, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.loupe', start: 'top 88%', once: true } });

  // process line draws with scroll
  const steps = $$('.step');
  if (steps.length) {
    gsap.to('#stepsFill', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '#steps', start: 'top 70%', end: 'bottom 70%', scrub: true } });
    steps.forEach(s => ScrollTrigger.create({ trigger: s, start: 'top 70%', onEnter: () => s.classList.add('is-lit'), onLeaveBack: () => s.classList.remove('is-lit') }));
  }

  // task rows draw in
  $$('.task').forEach(t => gsap.from($('.task__n', t), { x: -20, opacity: 0, duration: .7, scrollTrigger: { trigger: t, start: 'top 85%', once: true } }));
})();
