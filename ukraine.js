(function () {
    'use strict';

    if (window.Lampa && Lampa.Plugins) {
        Lampa.Plugins.add({
            name: 'Давай UA',
            version: '1.3.0',
            description: 'Пошук української озвучки',
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
                        var count = 0;
                        data.forEach(function(item) {
                            var t = (item.title || '').toLowerCase();
                            if (item.file && (t.indexOf('ua') > -1 || t.indexOf('україн') > -1)) {
                                var card = Lampa.Template.get('button', {title: '🇺🇦 ' + item.title});
                                card.on('hover:enter', function () { 
                                    Lampa.Player.play({ url: item.file, title: item.title }); 
                                });
                                scroll.append(card);
                                count++;
                            }
                        });
                        if (count === 0) Lampa.Noty.show('Української озвучки не знайдено');
                    } else { Lampa.Noty.show('Нічого не знайдено'); }
                });
            };
            this.render = function () { return html; };
        });

        // ПРИМУСОВА ВСТАВКА КНОПКИ
        Lampa.Listener.follow('full', function (e) {
            if (e.type == 'complite' || e.type == 'ready') {
                var render = function() {
                    // Шукаємо будь-яке місце для кнопки: блок кнопок або просто під опис
                    var parent = e.object.container.find('.full-start__buttons, .full-start, .full-info__content');
                    
                    if (parent.length && !e.object.container.find('.dvua-btn').length) {
                        var btn = $('<div class="full-start__button selector dvua-btn" style="background: #243b55; border: 1px solid #00c6ff; margin-top: 10px;"><span>🇺🇦 Давай UA</span></div>');
                        
                        btn.on('hover:enter', function () { 
                            Lampa.Controller.push('davay_ua', { movie: e.data.movie }); 
                        });

                        // Вставляємо в початок блоку кнопок або в кінець контенту
                        if (parent.hasClass('full-start__buttons')) parent.prepend(btn);
                        else parent.append(btn);
                        
                        // Оновлення навігації
                        Lampa.Controller.toggle('full_start');
                    }
                };

                // Пробуємо кілька разів, бо інтерфейс може довантажуватись
                setTimeout(render, 500);
                setTimeout(render, 1500);
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
