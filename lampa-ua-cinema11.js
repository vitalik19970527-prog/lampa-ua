(function () {
  'use strict';

  /** ===============================
   *  НАЛАШТУВАННЯ UA-ФІЛЬТРУ
   * =============================== */

  const UA_TRANSLATIONS = [
    'україн',
    'ukrain',
    'ua',
    'дубляж',
    'дубльований',
    'ene',
    'еней',
    'eneida',
    'ashdi',
    'ашді',
    'ukr'
  ];

  function isUATranslation(name) {
    if (!name) return false;
    name = name.toLowerCase();
    return UA_TRANSLATIONS.some(word => name.includes(word));
  }

  /** ===============================
   *  ХУК В ONLINE MOD
   * =============================== */

  function patchOnlineMod() {
    if (!Lampa || !Lampa.Component || !Lampa.Component.get) return;

    const Online = Lampa.Component.get('online');
    if (!Online || Online.__ua_patched) return;

    Online.__ua_patched = true;

    const originalAppend = Online.prototype.append;

    Online.prototype.append = function (items) {
      if (!items || !items.length) {
        this.empty('Немає української озвучки');
        return;
      }

      // ФІЛЬТРУЄМО ТІЛЬКИ UA
      const uaItems = items.filter(item => {
        if (item.translate_voice) {
          return isUATranslation(item.translate_voice);
        }

        if (item.title) {
          return isUATranslation(item.title);
        }

        if (item.info) {
          return isUATranslation(item.info);
        }

        return false;
      });

      if (!uaItems.length) {
        this.empty('Немає української озвучки');
        return;
      }

      originalAppend.call(this, uaItems);
    };
  }

  /** ===============================
   *  КНОПКА 🇺🇦 UA КІНОТЕАТР
   * =============================== */

  function addUAButton() {
    const container = document.querySelector(
      '.full-start-new__buttons, .full-start__buttons'
    );
    if (!container || container.querySelector('.button--ua-only')) return;

    const btn = document.createElement('div');
    btn.className = 'full-start__button selector button--ua-only';
    btn.innerHTML = `
      <span style="color:#ffd700;font-weight:bold">
        🇺🇦 ДИВИТИСЬ УКРАЇНСЬКОЮ
      </span>
    `;

    btn.addEventListener('click', () => {
      const activity = Lampa.Activity.active();
      if (!activity || !activity.card) return;

      activity.card.ua_only = true;

      Lampa.Activity.push({
        title: 'UA Кінотеатр',
        component: 'online',
        card: activity.card
      });
    });

    container.prepend(btn);
  }

  /** ===============================
   *  СТАРТ
   * =============================== */

  function start() {
    patchOnlineMod();
    setInterval(addUAButton, 1000);
  }

  if (window.Lampa) start();
})();
