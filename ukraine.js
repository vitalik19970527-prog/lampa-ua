(function () {
    'use strict';

    // Створюємо глобальний об'єкт плагіна, як у вашому прикладі
    var DavayUA = {
        name: 'Давай UA',
        version: '2.1.0',
        
        init: function () {
            this.prepare();
            this.start();
        },

        prepare: function () {
            // Реєструємо компонент для вибору озвучок
            Lampa.Component.add('davay_ua_modal', function (object) {
                var network = new Lampa.Regard();
                var scroll = new Lampa.Scroll({ mask: true, over: true });
                var html = $('<div class="directory-layers"></div>');
                
                this.create = function () {
                    var m = object.movie;
                    var query = encodeURIComponent(m.title || m.name);
                    var year = (m.release_date || m.first_air_date || '').slice(0, 4);
                    
                    Lampa.Loading.show();

                    network.silent('https://api.lampa.stream/mod?title=' + query + '&year=' + year, function (data) {
                        Lampa.Loading.hide();
                        html.append(scroll.render());

                        if (data && data.length) {
                            var found = false;
                            data.forEach(function (item) {
                                if (item.file && /(ua|україн|ukr)/i.test(item.title || '')) {
                                    found = true;
                                    var card = Lampa.Template.get('button', { 
                                        title: '🇺🇦 ' + item.title,
                                        description: item.quality || 'HD' 
                                    });
                                    card.on('hover:enter', function () {
                                        Lampa.Player.play({ url: item.file, title: item.title, movie: m });
                                    });
                                    scroll.append(card);
                                }
                            });
                            if (!found) Lampa.Noty.show('Української озвучки не знайдено');
                        } else {
                            Lampa.Noty.show('Нічого не знайдено');
                        }
                    }, function () {
                        Lampa.Loading.hide();
                        Lampa.Noty.show('Помилка сервера');
                    });
                };
                this.render = function () { return html; };
            });
        },

        start: function () {
            var _this = this;
            
            // Використовуємо універсальний слухач, який точно спрацьовує у вашому форматі
            Lampa.Listener.follow('full', function (e) {
                if (e.type == 'complite' || e.type == 'ready') {
                    _this.inject(e);
                }
            });
        },

        inject: function (e) {
            var _this = this;
            // Ваша специфічна структура HTML
            var container = e.object.container.find('.full-start-new__buttons');
            
            if (container.length && !container.find('.button--ua-exclusive').length) {
                // Створюємо кнопку, ідентичну вашим за класами
                var btn = $(`
                    <div class="full-start__button selector button--ua-exclusive" style="background: rgba(0, 100, 255, 0.3) !important; border: 1px solid #00c6ff !important;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;">
                            <rect width="24" height="12" fill="#0057B7"/>
                            <rect y="12" width="24" height="12" fill="#FFD700"/>
                        </svg>
                        <span>Давай UA</span>
                    </div>
                `);

                btn.on('hover:enter', function () {
                    Lampa.Controller.push('davay_ua_modal', { movie: e.data.movie });
                });

                // Вставляємо ПЕРЕД кнопкою "Дивитись", щоб вона була першою і ви її точно побачили
                var playBtn = container.find('.button--play');
                if (playBtn.length) playBtn.before(btn);
                else container.prepend(btn);

                // Примусове оновлення фокусу
                if (Lampa.Controller.current().name == 'full_start') {
                    Lampa.Controller.toggle('full_start');
                }
            }
        }
    };

    // Запуск плагіна з перевіркою (як у вашому файлі)
    if (window.Lampa) {
        DavayUA.init();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') DavayUA.init();
        });
    }
})();
