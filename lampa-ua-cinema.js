(function () {
    'use strict';

    function UAEngine(object) {
        var network = new Lampa.Reguest();
        var scroll = new Lampa.Scroll({mask: true, over: true});
        var items = [];
        var html = $('<div></div>');
        var body = $('<div class="online-list"></div>');
        
        this.create = function () {
            var _this = this;
            Lampa.Loading.show();
            
            // Формуємо запит на пошук (можна додати конкретні API балансерів)
            var title = object.card.title || object.card.name;
            var year = object.card.release_date || object.card.first_air_date || '';
            year = year.slice(0, 4);

            // Імітація пошуку по UA базах (наприклад, інтеграція з плеєрами)
            // В реальному моді тут іде фетч до API (Rezka, UA-Kino тощо)
            setTimeout(function() {
                Lampa.Loading.hide();
                _this.draw();
            }, 800);

            return this.render();
        };

        this.draw = function() {
            var _this = this;
            // Додаємо тестові варіанти (якщо у вас є прямі посилання на API, їх можна вставити сюди)
            var mockResults = [
                { title: 'Українська озвучка (HD)', quality: '1080p', source: 'UA-Kino' },
                { title: 'Оригінал + UA субтитри', quality: '2160p', source: 'UASerials' }
            ];

            mockResults.forEach(function(res) {
                var item = $(`<div class="online-list__item selector">
                    <div class="online-list__title">${res.title}</div>
                    <div class="online-list__quality">${res.quality} - ${res.source}</div>
                </div>`);

                item.on('hover:enter', function() {
                    Lampa.Noty.show('Запуск плеєра для: ' + res.source);
                    // Тут викликається внутрішній плеєр Lampa
                    Lampa.Player.play({
                        url: 'ПОСИЛАННЯ_НА_ВІДЕО',
                        title: object.card.title
                    });
                });
                body.append(item);
            });

            html.append(scroll.render());
            scroll.append(body);
        };

        this.render = function () { return html; };
    }

    function startPlugin() {
        // Реєструємо новий компонент у системі Lampa
        Lampa.Component.add('ua_cinema', UAEngine);

        setInterval(function() {
            var container = $('.full-start-new__buttons, .full-start__buttons');
            if (container.length && !$('.button--ua-cinema').length) {
                var btn = $(`<div class="full-start__button selector button--ua-cinema">
                    <span style="color: #fff; font-weight: bold;">🇺🇦 UA КІНОТЕАТР</span>
                </div>`);

                btn.css({
                    'background': '#e67e22',
                    'border-radius': '8px',
                    'margin-right': '10px'
                });

                btn.on('click', function () {
                    Lampa.Activity.push({
                        url: '',
                        title: 'UA Кінотеатр',
                        component: 'ua_cinema',
                        card: Lampa.Activity.active().card,
                        page: 1
                    });
                });

                container.prepend(btn);
                if (Lampa.Controller.active().name == 'full_start') Lampa.Controller.toggle('full_start');
            }
        }, 1000);
    }

    if (window.Lampa) startPlugin();
})();
