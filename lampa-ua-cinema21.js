(function () {
  'use strict';

  /* ===============================
   *  НАЛАШТУВАННЯ
   * =============================== */

  const UA_KEYS = [
    '[ukr',
    '[ua',
    'україн',
    'ukrain',
    'дубляж [ukr',
    'le doyen',
    'ledoyen',
    'ene',
    'ashdi'
  ];

  const RU_FALLBACK = [
    'lostfilm',
    'newstudio'
  ];

  function norm(v) {
    return String(v || '').toLowerCase();
  }

  function isUA(name) {
    name = norm(name);
    return UA_KEYS.some(k => name.includes(k));
  }

  function isRUFallback(name) {
    name = norm(name);
    return RU_FALLBACK.some(k => name.includes(k));
  }

  /* ===============================
   *  ХУК FILMIX ПРОВАЙДЕРА
   * =============================== */

  function patchFilmix() {
    if (!window.Lampa || !Lampa.Component || !Lampa.Component.get) return;

    const Online = Lampa.Component.get('online');
    if (!Online || Online.__ua_filmix_fixed) return;

    Online.__ua_filmix_fixed = true;

    const providers = Online.prototype.providers || [];
    const filmix = providers.find(p => p.name && p.name.toLowerCase().includes('filmix'));

    if (!filmix || !filmix.success) {
      console.warn('[UA] Filmix provider not found');
      return;
    }

    const originalSuccess = filmix.success;

    filmix.success = function (json) {
      if (json && json.folder && Array.isArray(json.folder)) {
        console.group('[UA FILMIX]');
        console.log('RAW:', json.folder.map(v => v.title));

        const ua = json.folder.filter(v => isUA(v.title));
        if (ua.length) {
          console.log('UA:', ua.map(v => v.title));
          json.folder = ua;
        } else {
          const ru = json.folder.filter(v => isRUFallback(v.title));
          if (ru.length) {
            console.warn('UA NOT FOUND → RU FALLBACK');
            json.folder = ru;
          } else {
            console.warn('NO UA / NO FALLBACK');
            json.folder = [];
          }
        }

        console.groupEnd();
      }

      return originalSuccess.call(this, json);
    };
  }

  /* ===============================
   *  КНОПКА 🇺🇦
   * =============================== */

  function addButton() {
    const container = document.querySelector(
      '.full-start-new__buttons, .full-start__buttons'
    );
    if (!container || container.querySelector('.button--ua-filmix')) return;

    const btn = document.createElement('div');
    btn.className = 'full-start__button selector button--ua-filmix';
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
    patchFilmix();
    setInterval(addButton, 1000);
  }

  if (window.Lampa) start();
})();
