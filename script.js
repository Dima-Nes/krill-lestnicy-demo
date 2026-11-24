(function () {
  // Mobile menu
  const menuBtn = document.querySelector('.menu-btn');
  const menu = document.getElementById('menu');

  function setMenu(open) {
    if (!menuBtn || !menu) return;
    menuBtn.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (menuBtn && menu) {
    menuBtn.addEventListener('click', () => {
      setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
    });
    menu.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => setMenu(false));
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        menuBtn.focus();
      }
    });
  }

  // Reveal on scroll
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -20px 0px' }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-in'));
  }

  // Lightbox
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbCap = document.getElementById('lbCap');

  if (lightbox && lbImg && lbCap) {
    document.querySelectorAll('.g-btn[data-full]').forEach((btn) => {
      btn.addEventListener('click', () => {
        lbImg.src = btn.dataset.full || '';
        lbImg.alt = btn.querySelector('img')?.alt || '';
        lbCap.textContent = btn.dataset.cap || '';
        lightbox.showModal();
      });
    });

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) lightbox.close();
    });
  }

  // Stair profile calculator in step 3
  const hRange = document.getElementById('hRange');
  const hNum = document.getElementById('hNum');
  const profile = document.getElementById('profile');
  const calcText = document.getElementById('calcText');

  function updateStairProfile(rawVal) {
    const height = Math.max(2000, Math.min(5000, Number(rawVal) || 3000));
    if (hRange) hRange.value = String(Math.max(2400, Math.min(4000, height)));
    if (hNum) hNum.value = String(height);

    const steps = Math.max(10, Math.round(height / 175));
    const riser = Math.round(height / steps);
    const tread = 280;
    const run = steps * tread;

    if (calcText) {
      calcText.textContent = `Ориентир: ${steps} ступеней, подъём ${riser} мм, проступь ${tread} мм, длина марша ${(run / 1000).toFixed(2)} м`;
    }

    if (profile) {
      const padX = 28;
      const padY = 22;
      const w = 380 - padX * 2;
      const h = 208 - padY * 2;
      const dx = w / steps;
      const dy = h / steps;
      let d = `M ${padX} ${208 - padY}`;
      for (let i = 0; i < steps; i++) {
        const x0 = padX + i * dx;
        const y0 = 208 - padY - i * dy;
        d += ` L ${x0.toFixed(1)} ${(y0 - dy).toFixed(1)} L ${(x0 + dx).toFixed(1)} ${(y0 - dy).toFixed(1)}`;
      }
      profile.innerHTML =
        `<title id="profileTitle">Схема подъёма по высоте этажа</title>` +
        `<line x1="${padX}" y1="${208 - padY}" x2="${380 - padX}" y2="${208 - padY}" stroke="rgba(247,246,243,0.22)" stroke-width="1"/>` +
        `<line x1="${380 - padX}" y1="${padY}" x2="${380 - padX}" y2="${208 - padY}" stroke="rgba(247,246,243,0.22)" stroke-width="1"/>` +
        `<path d="${d}" fill="none" stroke="#A9743B" stroke-width="2.5" stroke-linejoin="miter"/>`;
    }
  }

  if (hRange && hNum) {
    updateStairProfile(hNum.value);
    hRange.addEventListener('input', () => updateStairProfile(hRange.value));
    hNum.addEventListener('input', () => updateStairProfile(hNum.value));
  }

  // Quiz
  const quizForm = document.getElementById('quizForm');
  const qCount = document.getElementById('qCount');
  const qBar = document.getElementById('qBar');
  const qBack = document.getElementById('qBack');
  const quizDone = document.getElementById('quizDone');
  const recap = document.getElementById('recap');
  const quizReset = document.getElementById('quizReset');
  const qPhone = document.getElementById('qPhone');
  const qPhoneErr = document.getElementById('qPhoneErr');
  const steps = Array.from(document.querySelectorAll('#quizForm fieldset.q'));
  let current = 1;

  function showStep(n) {
    current = n;
    steps.forEach((fs) => {
      const s = Number(fs.dataset.step);
      fs.hidden = s !== current;
    });
    if (qCount) qCount.textContent = `Шаг ${current} из ${steps.length}`;
    if (qBar) qBar.style.width = `${(current / steps.length) * 100}%`;
    if (qBack) qBack.hidden = current === 1;
  }

  if (quizForm && steps.length) {
    showStep(1);

    quizForm.querySelectorAll('input[type="radio"]').forEach((radio) => {
      radio.addEventListener('change', () => {
        if (current < steps.length) {
          setTimeout(() => showStep(current + 1), 160);
        }
      });
    });

    quizForm.querySelectorAll('[data-next]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (current < steps.length) showStep(current + 1);
      });
    });

    if (qBack) {
      qBack.addEventListener('click', () => {
        if (current > 1) showStep(current - 1);
      });
    }

    quizForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const digits = (qPhone?.value || '').replace(/\D/g, '');
      if (digits.length < 7) {
        if (qPhoneErr) qPhoneErr.textContent = 'Введите номер телефона';
        qPhone?.focus();
        return;
      }
      if (qPhoneErr) qPhoneErr.textContent = '';

      const fd = new FormData(quizForm);
      const rows = [
        ['Тип', fd.get('type') || 'Не выбран'],
        ['Дерево', fd.get('material') || 'Не выбрано'],
        ['Высота этажа', `${hNum?.value || 3000} мм`],
        ['Ограждение', fd.get('rail') || 'Не выбрано'],
        ['Телефон', qPhone?.value.trim() || '']
      ];
      if (recap) {
        recap.innerHTML = rows
          .map(([k, v]) => `<div><dt>${k}</dt><dd>${String(v)}</dd></div>`)
          .join('');
      }
      quizForm.hidden = true;
      if (qBack) qBack.hidden = true;
      if (quizDone) {
        quizDone.hidden = false;
        quizDone.focus();
      }
    });

    if (quizReset && quizDone) {
      quizReset.addEventListener('click', () => {
        quizForm.reset();
        updateStairProfile(3000);
        quizDone.hidden = true;
        quizForm.hidden = false;
        showStep(1);
      });
    }
  }

  // Measure form
  const measureForm = document.getElementById('measureForm');
  const measureDone = document.getElementById('measureDone');
  const measureReset = document.getElementById('measureReset');
  const mPhone = document.getElementById('mPhone');
  const mPhoneErr = document.getElementById('mPhoneErr');

  if (measureForm && measureDone) {
    measureForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const digits = (mPhone?.value || '').replace(/\D/g, '');
      if (digits.length < 7) {
        if (mPhoneErr) mPhoneErr.textContent = 'Введите номер телефона';
        mPhone?.focus();
        return;
      }
      if (mPhoneErr) mPhoneErr.textContent = '';
      measureForm.hidden = true;
      measureDone.hidden = false;
      measureDone.focus();
    });

    if (measureReset) {
      measureReset.addEventListener('click', () => {
        measureForm.reset();
        measureDone.hidden = true;
        measureForm.hidden = false;
        mPhone?.focus();
      });
    }
  }
})();
