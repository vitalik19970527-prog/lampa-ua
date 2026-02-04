(function () {
    'use strict';

    function startPlugin() {
        var DavayUA = function (object) {
            var network = new Lampa.Regard();
            var html = $('<div class="directory-layers"></div>'); // Контейнер для списку
            var scroll = new Lampa.Scroll({mask:true, over:true});
            var items = [];
            
            var uaKeys = [
                'ashdi', 'uakino', 'eneida', 'uaflix', 'uatut', 'uaserials', 'цікава ідея', 'hurtom', 'dzvin', 'soloway', 
                'cinemaua', 'dniprofilm', 'ukr', 'ua', 'українськ', 'соловїна', 'дубляж', 'багатоголосий', 'двоголосий'
            ];

            this.create = function () {
                var _this = this;
                var titles = [object.movie.title, object.movie.original_title].filter(Boolean);
                var year = (object.movie.release_date || object.movie.first_air_date || '').slice(0, 4);

                // Очистка перед завантаженням
                html.append(scroll.render());
                
                titles.forEach(function(title) {
                    var url = 'https://api.lampa.stream/mod?title=' + encodeURIComponent(title) + '&year=' + year;
                    network.silent(url, function (data) {
                        if (data && data.length > 0) _this.process(data);
                    });
                });
            };

            this.process = function (data) {
                var _this = this;
                data.forEach(function(item) {
                    var t = item.title.toLowerCase();
                    var isUA = uaKeys.some(key => t.indexOf(key) > -1);
                    
                    if (isUA) {
                        var card = Lampa.Template.get('button', {title: '🇺🇦 ' + item.title});
                        card.on('hover:enter', function () {
                            Lampa.Player.play({ url: item.file, title: item.title });
                        });
                        scroll.append(card);
                        items.push(card);
                    }
                });
            };

            this.render = function () { return html; };
            this.toggle = function () { Lampa.Controller.add('davay_ua', {toggle: function(){}}); };
            this.destroy = function () { network.clear(); scroll.destroy(); html.remove(); };
        };

        Lampa.Component.add('davay_ua', DavayUA);

        // Додавання кнопки в картку фільму
        Lampa.Listener.follow('full', function (e) {
            if (e.type == 'complite' || e.type == 'ready') {
                console.log('DavayUA: Card ready, adding button'); // Для діагностики
                
                var button = $('<div class="full-start__button selector"><span>Давай Українське</span></div>');
                
                button.on('hover:enter', function () {
                    Lampa.Controller.push('davay_ua', {
                        movie: e.data.movie
                    });
                });

                // Шукаємо куди вставити
                var container = e.object.container.find('.full-start__buttons');
                if (container.length) {
                    container.append(button);
                } else {
                    e.object.container.find('.full-start').append(button);
                }
            }
        });
    }

    if (window.Lampa) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') startPlugin(); });
})();
