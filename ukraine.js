(function () {
    'use strict';

    var DavayUA = {
        name: 'Давай UA',
        version: '3.0.0',
        
        init: function () {
            this.registerComponent();
            this.listen();
        },

        registerComponent: function () {
            Lampa.Component.add('davay_ua_modal', function (object) {
                var network = new Lampa.Regard();
                var scroll = new Lampa.Scroll({ mask: true, over: true });
                var html = $('<div class="directory-layers"></div>');
                
                this.create = function () {
                    var m = object.movie || {};
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
                        } else Lampa.Noty.show('Нічого не знайдено');
                    }, function () {
                        Lampa.Loading.hide();
                        Lampa.Noty.show('Помилка API');
                    });
                };
                this.render = function () { return html; };
            });
        },

        listen: function () {
            var _this = this;
            Lampa.Listener.follow('full', function (e) {
                // ПЕРЕВІРКА: додаємо захист від undefined
                if ((e.type == 'complite' || e.type == 'ready') && e.object && e.object.container) {
                    _this.inject(e);
                }
            });
        },

        inject: function (e) {
            var container = e.object.container.find('.full-start-new__buttons');
            
            if (container.length && !container.find('.button--ua-final').length) {
                var btn = $(`
                    <div class="full-start__button selector button--ua-final" style="border: 2px solid #ffd700 !important; background: rgba(0, 87, 183, 0.4) !important;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px; vertical-align: middle;">
                            <rect width="24" height="12" fill="#0057B7"/>
                            <rect y="12" width="24" height="12" fill="#FFD700"/>
                        </svg>
                        <span style="vertical-align: middle;">Давай UA</span>
                    </div>
                `);

                btn.on('hover:enter', function () {
                    Lampa.Controller.push('davay_ua_modal', { movie: e.data.movie });
                });

                // Вставляємо першою
                container.prepend(btn);

                // Оновлюємо навігацію
                if (Lampa.Controller.current().name == 'full_start') {
                    Lampa.Controller.toggle('full_start');
                }
            }
        }
    };

    if (window.Lampa) {
        DavayUA.init();
    }
})();
