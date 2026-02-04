(function () {
    'use strict';
    // Функція ініціалізації
    function start() {
        if (window.dvua_loaded) return;
        window.dvua_loaded = true;

        // Реєстрація компонента
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
                                card.on('hover:enter', function () { 
                                    Lampa.Player.play({ url: item.file, title: item.title }); 
                                });
                                scroll.append(card);
                            }
                        });
                    } else { Lampa.Noty.show('Нічого не знайдено'); }
                });
            };
            this.render = function () { return html; };
        });

        // Додавання кнопки
        Lampa.Listener.follow('full', function (e) {
            if (e.type == 'complite' || e.type == 'ready') {
                var btn = $('<div class="full-start__button selector"><span>Давай Українське</span></div>');
                btn.on('hover:enter', function () { 
                    Lampa.Controller.push('davay_ua', { movie: e.data.movie }); 
                });
                var target = e.object.container.find('.full-start__buttons');
                if (target.length && !target.find('.davay-ua-btn').length) {
                    btn.addClass('davay-ua-btn');
                    target.append(btn);
                }
            }
        });
    }

    // Чекаємо завантаження системи
    if (window.Lampa && Lampa.Component) start();
    else {
        var timer = setInterval(function () {
            if (window.Lampa && Lampa.Component) {
                clearInterval(timer);
                start();
            }
        }, 200);
    }
})();
