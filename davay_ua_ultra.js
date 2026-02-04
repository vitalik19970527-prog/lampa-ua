(function () {
    'use strict';

    function startPlugin() {
        var DavayUA = function (object) {
            // Використовуємо стандартну мережу Lampa
            var network = new Lampa.Regard ? new Lampa.Regard() : new Lampa.Network();
            var html = $('<div class="directory-layers"></div>');
            var scroll = new Lampa.Scroll({mask: true, over: true});
            var items = [];
            
            var uaKeys = [
                'ashdi', 'uakino', 'eneida', 'uaflix', 'uatut', 'uaserials', 'цікава ідея', 'hurtom', 'dzvin', 'soloway', 
                'cinemaua', 'dniprofilm', 'ukr', 'ua', 'українськ', 'соловїна', 'дубляж', 'багатоголосий', 'двоголосий'
            ];

            this.create = function () {
                var _this = this;
                html.append(scroll.render());
                
                var movie = object.movie || {};
                var titles = [movie.title, movie.original_title, movie.name].filter(Boolean);
                // ВИПРАВЛЕНО: додано || для коректної дати
                var year = (movie.release_date || movie.first_air_date || '').slice(0, 4);
                var requests = titles.length;
                var allResults = [];

                if (!requests) return Lampa.Noty.show('Не вдалося визначити назву');

                titles.forEach(function(title) {
                    var url = 'https://api.lampa.stream/mod?title=' + encodeURIComponent(title) + '&year=' + year;
                    network.silent(url, function (data) {
                        if (data && data.length) allResults = allResults.concat(data);
                        requests--;
                        if (requests === 0) _this.process(allResults);
                    }, function() {
                        requests--;
                        if (requests === 0) _this.process(allResults);
                    });
                });
            };

            this.process = function (data) {
                var _this = this;
                var added_urls = {}; // Заміна Set() для старих ТВ

                data.forEach(function(item) {
                    if (!item.file || added_urls[item.file]) return;
                    
                    var t = (item.title || '').toLowerCase();
                    var isUA = false;
                    for (var i = 0; i < uaKeys.length; i++) {
                        if (t.indexOf(uaKeys[i]) > -1) { isUA = true; break; }
                    }

                    if (isUA) {
                        added_urls[item.file] = true;
                        var card = Lampa.Template.get('button', {title: '🇺🇦 ' + item.title});
                        card.on('hover:enter', function () {
                            Lampa.Player.play({ url: item.file, title: item.title });
                        });
                        scroll.append(card);
                        items.push(card);
                    }
                });

                if (!items.length) Lampa.Noty.show('Української озвучки не знайдено');
            };

            this.render = function () { return html; };
        };

        Lampa.Component.add('davay_ua', DavayUA);

        Lampa.Listener.follow('full', function (e) {
            if (e.type == 'complite' || e.type == 'ready') {
                var button = $('<div class="full-start__button selector"><span>Давай Українське</span></div>');
                button.on('hover:enter', function () {
                    Lampa.Controller.push('davay_ua', { movie: e.data.movie });
                });

                var btns = e.object.container.find('.full-start__buttons');
                if (btns.length) btns.append(button);
                else e.object.container.find('.full-start').append(button);
            }
        });
    }

    if (window.Lampa) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') startPlugin(); });
})();
