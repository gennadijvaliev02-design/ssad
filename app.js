'use strict';

(() => {
  const PHONE = '79298078683';
  const PRICES = { '5': 750, '10': 1400, '25': 3200 };
  const money = new Intl.NumberFormat('ru-RU');
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];

  // Photos come from the original public repository. On blocked networks,
  // hide broken-image glyphs so bundled SVG artwork stays visible behind them.
  $$('img[src^="https://raw.githubusercontent.com/"]').forEach(img => {
    const hideBroken = () => { img.style.display = 'none'; };
    img.addEventListener('error', hideBroken, { once: true });
    if (img.complete && img.naturalWidth === 0) hideBroken();
  });

  // Accessible mobile navigation.
  const menuToggle = $('#menuToggle');
  const mobileNav = $('#mobileNav');
  if (menuToggle && mobileNav) {
    const setMenu = (open) => {
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
      mobileNav.hidden = !open;
    };
    menuToggle.addEventListener('click', () => setMenu(mobileNav.hidden));
    $$('#mobileNav a').forEach(link => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
    window.addEventListener('resize', () => { if (innerWidth > 780) setMenu(false); });
  }

  // Product category filters.
  $$('.filter').forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    $$('.filter').forEach(btn => {
      const active = btn === button;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
    $$('.product-card').forEach(card => {
      card.hidden = filter !== 'all' && card.dataset.category !== filter;
    });
  }));

  const fruitSelect = $('#fruitSelect');
  const form = $('#orderForm');
  const orderPrice = $('#orderPrice');
  const orderWhatsapp = $('#orderWhatsapp');
  const copyStatus = $('#copyStatus');
  const getChecked = (name) => form.querySelector(`input[name="${name}"]:checked`);
  const orderMessage = () => {
    const kg = getChecked('weight')?.value || '5';
    const variety = fruitSelect.value;
    const delivery = getChecked('delivery')?.value || 'Доставка по Цхинвалу';
    const cost = PRICES[kg] ? `${money.format(PRICES[kg])} ₽ (ориентировочно)` : 'уточнить стоимость';
    return [
      'Здравствуйте! Хочу уточнить наличие фруктов из семейного сада Валиевых (с. Дменис).',
      '',
      `Сорт: ${variety}`,
      `Объём: ${kg === 'bulk' ? 'от 100 кг, опт' : kg + ' кг'}`,
      `Цена на сайте: ${cost}`,
      `Получение: ${delivery}`,
      '',
      'Подскажите, пожалуйста, есть ли такой сорт, актуальна ли цена и когда можно получить заказ?'
    ].join('\n');
  };
  const updateOrder = () => {
    const kg = getChecked('weight')?.value || '5';
    orderPrice.textContent = PRICES[kg] ? `${money.format(PRICES[kg])} ₽` : 'По запросу';
    orderWhatsapp.href = `https://wa.me/${PHONE}?text=${encodeURIComponent(orderMessage())}`;
    copyStatus.textContent = '';
  };
  if (form) {
    form.addEventListener('change', updateOrder);
    form.addEventListener('submit', e => e.preventDefault());
    updateOrder();
  }

  // Quickly prefill fruit selection from catalogue card.
  $$('.product-card .card-add').forEach(btn => btn.addEventListener('click', () => {
    const card = btn.closest('.product-card');
    const desired = card?.dataset.product;
    if (desired && [...fruitSelect.options].some(o => o.value === desired)) {
      fruitSelect.value = desired;
      updateOrder();
      $('#order').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      window.setTimeout(() => fruitSelect.focus({preventScroll:true}), 400);
    }
  }));

  $('#copyOrder')?.addEventListener('click', async () => {
    const message = orderMessage();
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(message);
      copyStatus.textContent = 'Текст заказа скопирован. Можете отправить его фермеру.';
    } catch (_) {
      // Works even when opened via file:// or clipboard permissions are disabled.
      const helper = document.createElement('textarea');
      helper.value = message;
      helper.style.position = 'fixed';
      helper.style.opacity = '0';
      document.body.appendChild(helper);
      helper.select();
      const ok = document.execCommand('copy');
      helper.remove();
      copyStatus.textContent = ok ? 'Текст заказа скопирован.' : 'Не получилось скопировать. Попробуйте открыть сайт через браузер.';
    }
  });

  // Honor reduced motion for scroll entrance effects.
  const reveals = $$('.reveal');
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    reveals.forEach(el => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px 30px 0px', threshold: 0.08 });
    reveals.forEach(el => observer.observe(el));
  }
  $('#year').textContent = String(new Date().getFullYear());
})();
