(function () {
    'use strict';

    if (window.Lampa && Lampa.Plugins) {
        Lampa.Plugins.add({
            name: 'Давай UA',
            version: '1.2.0',
            description: 'Українська озвучка',
            type: 'video',
            author: 'Vitalik'
        });
    }

    function init() {
        if (window.dvua_loaded) return;
        window.dvua_loaded = true;

        Lampa.Component.add('davay_ua', function (object) {
            var network = new Lampa.Regard();
            var scroll = new Lampa.Scroll({mask: true, over: true});
            var html = $('<div class="directory-layers"></div>');
            
            this.create = function () {
                var _this = this;
                html.append(scroll.render());
                var m = object.movie || {};
                var title = m.title || m.name;
                var year = (m.release_date || m.first_air_date || '').slice(0, 4);
                var url = 'https://api.lampa.stream/mod?title=' + encodeURIComponent(title) + '&year=' + year;
                
                network.silent(url, function (data) {
                    if (data && data.length) {
                        data.forEach(function(item) {
                            var t = (item.title || '').toLowerCase();
                            if (item.file && (t.indexOf('ua') > -1 || t.indexOf('україн') > -1)) {
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

        // ПОВНІСТЮ ОНОВЛЕНА ЛОГІКА КНОПКИ
        Lampa.Listener.follow('full', function (e) {
            if (e.type == 'complite' || e.type == 'ready') {
                var addBtn = function() {
                    var container = e.object.container.find('.full-start__buttons');
                    if (container.length && !container.find('.dvua-btn').length) {
                        var btn = $('<div class="full-start__button selector dvua-btn"><span>Давай UA</span></div>');
                        btn.on('hover:enter', function () { 
                            Lampa.Controller.push('davay_ua', { movie: e.data.movie }); 
                        });
                        container.append(btn);
                        // Оновлюємо контролер, щоб кнопка стала активною для вибору
                        if (Lampa.Controller.current().name == 'full_start') {
                            Lampa.Controller.toggle('full_start');
                        }
                    }
                };
                
                // Пробуємо додати кнопку одразу і ще раз через секунду для гарантії
                addBtn();
                setTimeout(addBtn, 1000);
            }
        });
    }

    if (window.Lampa && Lampa.Component) init();
    else {
        var timer = setInterval(function () {
            if (window.Lampa && Lampa.Component) {
                clearInterval(timer);
                init();
            }
        }, 500);
    }
})();
