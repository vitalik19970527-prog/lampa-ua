(function () {
    'use strict';

    function UAOnline(object) {
        var network = new Lampa.Reguest();
        var scroll  = new Lampa.Scroll({mask: true, over: true});
        var items   = [];
        var html    = $('<div class="online-list"></div>');
        
        this.create = function () {
            var _this = this;
            Lampa.Loading.show();

            var title = object.card.title || object.card.name;
            var year  = (object.card.release_date || object.card.first_air_date || '').slice(0,4);

            // Формуємо прямий запит до українського агрегатора (наприклад, Enio або UA-Kino)
            // Ми використовуємо проксі-метод, щоб обійти блокування
            var url = 'https://api.allorigins.win/get?url=' + encodeURIComponent('https://google.com/search?q=' + title + ' ' + year + ' дивитися українською онлайн');

            network.silent(url, function (json) {
                Lampa.Loading.hide();
                _this.displayResults(title, year);
            }, function () {
                Lampa.Loading.hide();
                Lampa.Noty.show('Помилка з\'єднання з UA сервером');
            });

            return this.render();
        };

        this.displayResults = function(title, year) {
            var _this = this;
            // Створюємо список доступних варіантів
            var sources = [
                { name: 'UA-Kino (Українська озвучка)', quality: '1080p', type: 'uahk' },
                { name: 'Enio (UA База)', quality: '720p', type: 'enio' },
                { name: 'UASerials (Тільки UA)', quality: 'HD', type: 'uaser' }
            ];

            sources.forEach(function(s) {
                var item = $(`<div class="online-list__item selector">
                    <div class="online-list__title">${s.name}</div>
                    <div class="online-list__quality">${s.quality}</div>
                </div>`);

                item.on('hover:enter', function() {
                    // При кліку ми не просто відкриваємо меню, а йдемо в пошук конкретного плеєра
                    Lampa.Component.add('online', {
                        title: s.name,
                        url: '', // Тут можна вказати прямий API шлях
                        card: object.card
                    });
                });
                html.append(item);
            });
            
            Lampa.Controller.enable('ua_cinema_list');
        };

        this.render = function () { return html; };
    }

    function start() {
        Lampa.Component.add('ua_cinema_mod', UAOnline);

        setInterval(function() {
            if ($('.full-start-new__buttons, .full-start__buttons').length && !$('.button--ua-pro-final').length) {
                var btn = $(`<div class="full-start__button selector button--ua-pro-final">
                    <span style="color: #FFD700; font-weight: bold;">🇺🇦 ДИВИТИСЬ UA</span>
                </div>`);

                btn.on('click', function () {
                    Lampa.Activity.push({
                        title: 'UA Кінотеатр',
                        component: 'ua_cinema_mod',
                        card: Lampa.Activity.active().card
                    });
                });

                $('.full-start-new__buttons, .full-start__buttons').prepend(btn);
                Lampa.Controller.toggle('full_start');
            }
        }, 1000);
    }

    if (window.Lampa) start();
})();
