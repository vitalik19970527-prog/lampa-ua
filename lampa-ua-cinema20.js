(function () {
  'use strict';

  /* ===============================
   *  UA / RU НАСТРОЙКИ
   * =============================== */

  const RU_FALLBACK = [
    'lostfilm',
    'newstudio'
  ];

  function normalize(v) {
    return String(v || '').toLowerCase();
  }

  function isUATranslationName(name) {
    name = normalize(name);
    return (
      name.includes('[ukr') ||
      name.includes('[ua') ||
      name.includes('україн') ||
      name.includes('ukrain') ||
      name.includes('дубляж') && name.includes('ukr') ||
      name.includes('ene') ||
      name.includes('ashdi') ||
      name.includes('ledoyen')
    );
  }

  function isRUFallback(name) {
    name = normalize(name);
    return RU_FALLBACK.some(w => name.includes(w));
  }

  /* ===============================
   *  PATCH ONLINE MOD (РАННІЙ)
   * =============================== */

  function patchOnline() {
    const Online = Lampa.Component.get('online');
    if (!Online || Online.__ua_fixed) return;

    Online.__ua_fixed = true;

    const originalFilter = Online.prototype.filter;

    Online.prototype.filter = function (type, a, b) {
      if (type === 'voice') {
        const voices = this.filter_items.voice || [];

        const uaVoices = voices.filter(isUATranslationName);
        if (uaVoices.length) {
          this.filter_items.voice = uaVoices;
        } else {
          const ruFallback = voices.filter(isRUFallback);
          if (ruFallback.length) {
            this.filter_items.voice = ruFallback;
          }
        }
      }

      return originalFilter.call(this, type, a, b);
    };
  }

  /* ===============================
   *  КНОПКА 🇺🇦
   * =============================== */

  function addButton() {
    const container = document.querySelector(
      '.full-start-new__buttons, .full-start__buttons'
    );
    if (!container || container.querySelector('.button--ua-fixed')) return;

    const btn = document.createElement('div');
    btn.className = 'full-start__button selector button--ua-fixed';
    btn.innerHTML = `<span style="color:#ffd700;font-weight:bold">🇺🇦 UA Кінотеатр</span>`;

    btn.onclick = () => {
      const a = Lampa.Activity.active();
      if (!a || !a.card) return;

      Lampa.Activity.push({
        title: 'UA Кінотеатр',
        component: 'online',
        card: a.card
      });
    };

    container.prepend(btn);
  }

  /* ===============================
   *  START
   * =============================== */

  function start() {
    patchOnline();
    setInterval(addButton, 1000);
  }

  if (window.Lampa) start();
})();
