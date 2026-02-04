(function () {
  'use strict';

  /* ===============================
   *  НАЛАШТУВАННЯ
   * =============================== */

  const UA_TRANSLATIONS = [
    'україн',
    'украин',
    'ukrain',
    'ukr',
    'ua',
    'дубляж',
    'дубль',
    'офіцій',
    'official',
    'ene',
    'еней',
    'eneida',
    'ashdi',
    'ашді'
  ];

  const RU_FALLBACK_TRANSLATIONS = [
    'lostfilm',
    'newstudio'
  ];

  /* ===============================
   *  ХЕЛПЕРИ
   * =============================== */

  function normalize(val) {
    return String(val || '').toLowerCase();
  }

  function containsAny(text, list) {
    text = normalize(text);
    return list.some(w => text.includes(w));
  }

  function isUA(item) {
    return [
      item.translate_voice,
      item.title,
      item.info,
      item.translate,
      item.voice,
      item.translation
    ].some(v => containsAny(v, UA_TRANSLATIONS));
  }

  function isRUFallback(item) {
    return [
      item.translate_voice,
      item.title,
      item.info
    ].some(v => containsAny(v, RU_FALLBACK_TRANSLATIONS));
  }

  /* ===============================
   *  PATCH ONLINE MOD
   * =============================== */

  function patchOnline() {
    if (!window.Lampa || !Lampa.Component || !Lampa.Component.get) return;

    const Online = Lampa.Component.get('online');
    if (!Online || Online.__ua_fallback_ready) return;

    Online.__ua_fallback_ready = true;

    const originalAppend = Online.prototype.append;

    Online.prototype.append = function (items) {
      console.group('[UA-FILMIX]');
      console.log('RAW ITEMS:', items);

      if (!items || !items.length) {
        console.warn('NO ITEMS FROM BALANCER');
        this.empty('Немає доступних перекладів');
        console.groupEnd();
        return;
      }

      const uaItems = items.filter(isUA);
      if (uaItems.length) {
        console.log('UA ITEMS:', uaItems);
        console.groupEnd();
        originalAppend.call(this, uaItems);
        return;
      }

      const ruFallback = items.filter(isRUFallback);
      if (ruFallback.length) {
        console.warn('UA NOT FOUND — USING RU FALLBACK');
        console.log('RU FALLBACK ITEMS:', ruFallback);

        ruFallback.forEach(i => {
          i.info = (i.info || '') + ' ⚠️ альтернативна озвучка';
        });

        console.groupEnd();
        originalAppend.call(this, ruFallback);
        return;
      }

      console.warn('NO UA / NO FALLBACK');
      console.groupEnd();
      this.empty('Української озвучки немає');
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
    btn.innerHTML = `
      <span style="color:#ffd700;font-weight:bold">
        🇺🇦 UA Кінотеатр
      </span>
    `;

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
   *  СТАРТ
   * =============================== */

  function start() {
    patchOnline();
    setInterval(addButton, 1000);
  }

  if (window.Lampa) start();
})();
