(function () {
    'use strict';

    // Функція запуску
    function initDavayUA() {
        if (window.davay_ua_installed) return; // Захист від подвійного запуску
        window.davay_ua_installed = true;

        var DavayUA = function (object) {
            var network = new Lampa.Regard();
            var scroll = new Lampa.Scroll({mask: true, over: true});
            var html = $('<div class="directory-layers"></div>');
            
            this.create = function () {
                var _this = this;
                html.append(scroll.render());
                var movie = object.movie || {};
                var title = movie.title || movie.name || movie.original_title;
                var year = (movie.release_date || movie.first_air_date || '').slice(0, 4);
                var url = 'https://api.lampa.stream/mod?title=' + encodeURIComponent(title) + '&year=' + year;
                
                network.silent(url, function (data) {
                    if (data && data.length) {
                        data.forEach(function(item) {
                            var t = (item.title || '').toLowerCase();
                            // Фільтр на UA озвучку
                            if (item.file && (t.indexOf('ua') > -1 || t.indexOf('україн') > -1)) {
                                var card = Lampa.Template.get('button', {title: '🇺🇦 ' + item.title});
                                card.on('hover:enter', function () {
                                    Lampa.Player.play({ url: item.file, title: item.title });
                                });
                                scroll.append(card);
                            }
                        });
                    } else {
                        Lampa.Noty.show('Нічого не знайдено');
                    }
                });
            };
            this.render = function () { return html; };
        };

        // Реєстрація компонента
        Lampa.Component.add('davay_ua', DavayUA);

        // Додавання кнопки в картку фільму
        Lampa.Listener.follow('full', function (e) {
            if (e.type == 'complite' || e.type == 'ready') {
                var button = $('<div class="full-start__button selector"><span>Давай Українське</span></div>');
                button.on('hover:enter', function () {
                    Lampa.Controller.push('davay_ua', { movie: e.data.movie });
                });
                var container = e.object.container.find('.full-start__buttons');
                if (container.length) container.append(button);
            }
        });
    }

    // Чекаємо на повне завантаження Lampa
    var interval = setInterval(function () {
        if (window.Lampa && Lampa.Component) {
            clearInterval(interval);
            initDavayUA();
        }
    }, 500);
})();
