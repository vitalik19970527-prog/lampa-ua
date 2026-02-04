(function () {
    'use strict';

    function DavayUA(object) {
        var network = new Lampa.Regard();
        var html = $('<div class="category-full"></div>');
        
        var uaKeys = [
            'ashdi', 'uakino', 'eneida', 'uaflix', 'uatut', 'uaserials', 'цікава ідея', 'hurtom', 'dzvin', 'soloway', 
            'cinemaua', 'dniprofilm', 'ukr', 'ua', 'українськ', 'соловїна', 'дубляж', 'багатоголосий', 'двоголосий',
            '1+1', 'один плюс один', 'новий канал', 'ictv', 'стб', 'інтер', 'трка україна', '2+2', 'тет', 'плюсплюс',
            'postmodern', 'ledoyen', 'так треба продакшн', 'незупиняй', 'fanvoxua', 'клоунів', 'в одне рило', 
            'падлюки', 'ua team', 'adrianZP', 'lifecycle', 'didko', 'склянка', 'варава', 'omlet', 'uafilm'
        ];

        this.create = function () {
            var _this = this;
            Lampa.Background.immediately('');
            
            var titles = [
                object.movie.title,
                object.movie.original_title,
                object.movie.name
            ].filter(Boolean);

            var allResults = [];
            var requests = titles.length;

            titles.forEach(function(title) {
                // ВИПРАВЛЕНО: додано || між датами та перевірку наявності дати
                var year = (object.movie.release_date || object.movie.first_air_date || '').slice(0, 4);
                var url = 'https://api.lampa.stream/mod?title=' + encodeURIComponent(title) + '&year=' + year;
                
                network.silent(url, function (data) {
                    if (data && data.length > 0) allResults = allResults.concat(data);
                    requests--;
                    if (requests === 0) _this.process(allResults);
                }, function() {
                    requests--;
                    if (requests === 0) _this.process(allResults);
                });
            });

            return this.render();
        };

        this.process = function (data) {
            var _this = this;
            var uaItems = [];
            var filmixAlt = [];
            var uniqueUrls = new Set();

            data.forEach(function(item) {
                if (!item.file || uniqueUrls.has(item.file)) return;
                uniqueUrls.add(item.file);

                var t = (item.title || '').toLowerCase();
                var isUA = uaKeys.some(function(key) { return t.includes(key.toLowerCase()); });

                if (isUA) {
                    uaItems.push(item);
                } else if (t.includes('filmix') && filmixAlt.length < 2) {
                    filmixAlt.push(item);
                }
            });

            // Сортування
            uaItems.sort(function(a, b) {
                var prio = ['ashdi', 'uakino', 'eneida'];
                for (var i = 0; i < prio.length; i++) {
                    var p = prio[i];
                    if (a.title.toLowerCase().includes(p) && !b.title.toLowerCase().includes(p)) return -1;
                    if (!a.title.toLowerCase().includes(p) && b.title.toLowerCase().includes(p)) return 1;
                }
                return 0;
            });

            var finalItems = uaItems.concat(filmixAlt);

            if (finalItems.length > 0) {
                finalItems.forEach(function (item) {
                    var isItemUA = uaKeys.some(function(key) { return item.title.toLowerCase().includes(key.toLowerCase()); });
                    var icon = isItemUA ? '🇺🇦 ' : '⚪ ';
                    var card = Lampa.Template.get('button', {title: icon + item.title});
                    
                    card.on('hover:enter', function () {
                        Lampa.Player.play({ url: item.file, title: item.title });
                    });
                    html.append(card);
                });
            } else {
                html.append('<div class="empty">Української озвучки не знайдено</div>');
            }
        };

        this.render = function () { return html; };
    }

    // Реєстрація компонента в системі Lampa
    Lampa.Component.add('davay_ua', DavayUA);

    Lampa.Listener.follow('full', function (e) {
        if (e.type == 'complite') {
            var button = $('<div class="full-start__button selector"><span>Давай Українське</span></div>');
            button.on('hover:enter', function () {
                Lampa.Component.add('davay_ua', DavayUA, {movie: e.data.movie});
                Lampa.Controller.push('davay_ua');
            });
            $('.full-start__buttons', e.object.container).append(button);
        }
    });
})();