(function () {
    'use strict';

    function init() {
        if (window.dvua_loaded) return;
        window.dvua_loaded = true;

        // Реєстрація компонента пошуку
        Lampa.Component.add('davay_ua', function (object) {
            var network = new Lampa.Regard();
            var scroll = new Lampa.Scroll({mask: true, over: true});
            var html = $('<div class="directory-layers"></div>');
            this.create = function () {
                html.append(scroll.render());
                var m = object.movie || {};
                var url = 'https://api.lampa.stream/mod?title=' + encodeURIComponent(m.title || m.name) + '&year=' + (m.release_date || m.first_air_date || '').slice(0, 4);
                network.silent(url, function (data) {
                    if (data && data.length) {
                        data.forEach(function(item) {
                            if (item.file && /(ua|україн)/i.test(item.title || '')) {
                                var card = Lampa.Template.get('button', {title: '🇺🇦 ' + item.title});
                                card.on('hover:enter', function () { Lampa.Player.play({ url: item.file, title: item.title }); });
                                scroll.append(card);
                            }
                        });
                    } else { Lampa.Noty.show('Нічого не знайдено'); }
                });
            };
            this.render = function () { return html; };
        });

        // Функція вставки кнопки, яка працює незалежно
        setInterval(function() {
            // Шукаємо саме ваш контейнер
            var container = $('.full-start-new__buttons');
            
            if (container.length && !container.find('.dvua-btn').length) {
                var btn = $(`
                    <div class="full-start__button selector dvua-btn" style="display: flex !important;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 10px;">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                            <path d="M12 8V16M8 12H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        <span>Давай UA</span>
                    </div>
                `);

                btn.on('hover:enter', function () {
                    // Знаходимо дані фільму через об'єкт Lampa, якщо вони доступні
                    var movieData = Lampa.Activity.active().card || Lampa.Activity.active().object.movie;
                    Lampa.Controller.push('davay_ua', { movie: movieData });
                });

                // Вставляємо після кнопки "Дивитись"
                var playBtn = container.find('.button--play');
                if (playBtn.length) playBtn.after(btn);
                else container.prepend(btn);

                // Оновлюємо навігацію пульта
                Lampa.Controller.add('full_start', {
                    toggle: function () {
                        Lampa.Controller.collectionSet(container);
                        Lampa.Controller.move('right');
                    }
                });
            }
        }, 1000); // Перевіряємо кожну секунду
    }

    if (window.Lampa) init();
    else {
        var timer = setInterval(function () {
            if (window.Lampa) { clearInterval(timer); init(); }
        }, 500);
    }
})();
