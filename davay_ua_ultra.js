(function () {
    'use strict';

    function startPlugin() {
        // Компонент вікна з результатами
        var DavayUA = function (object) {
            var network = new Lampa.Regard();
            var html = $('<div></div>');
            
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
                    var url = 'https://api.lampa.stream/mod?title=' + encodeURIComponent(title) + '&year=' + (object.movie.release_date  object.movie.first_air_date  '').slice(0, 4);
                    
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

                    var t = item.title.toLowerCase();
                    var isUA = false;
                    for (var i = 0; i < uaKeys.length; i++) {
                        if (t.indexOf(uaKeys[i].toLowerCase()) > -1) {
                            isUA = true;
                            break;
                        }
                    }

                    if (isUA) {
                        uaItems.push(item);
                    } else if (t.indexOf('filmix') > -1 && filmixAlt.length < 2) {
                        filmixAlt.push(item);
                    }
                });

                uaItems.sort(function(a, b) {
                    var prio = ['ashdi', 'uakino', 'eneida'];
                    for(var j = 0; j < prio.length; j++) {
                        if (a.title.toLowerCase().indexOf(prio[j]) > -1 && b.title.toLowerCase().indexOf(prio[j]) == -1) return -1;
                        if (a.title.toLowerCase().indexOf(prio[j]) == -1 && b.title.toLowerCase().indexOf(prio[j]) > -1) return 1;
                    }
                    return 0;
                });

                var finalItems = uaItems.concat(filmixAlt);

                if (finalItems.length > 0) {
                    finalItems.forEach(function (item) {
                        var isItemUA = false;
                        for (var k = 0; k < uaKeys.length; k++) {
                            if (item.title.toLowerCase().indexOf(uaKeys[k].toLowerCase()) > -1) {
                                isItemUA = true;
                                break;
                            }
                        }
                        var icon = isItemUA ? '🇺🇦 ' : '⚪️ ';
                        var card = Lampa.Template.get('button', {title: icon + item.title});
                        
                        card.on('hover:enter', function () {
                            Lampa.Player.play({ url: item.file, title: item.title });
                        });
                        html.append(card);
                    });
                } else {
                    Lampa.Noty.show('Української озвучки не знайдено');
                }
            };

            this.render = function () {
                return html;
            };
        };

        // Реєстрація в системі Lampa
        Lampa.Component.add('davay_ua', DavayUA);

        // Додавання кнопки
        Lampa.Listener.follow('full', function (e) {
            if (e.type == 'complite') {
                var button = $('<div class="full-start__button selector"><span>Давай Українське</span></div>');
                
                button.on('hover:enter', function () {
                    Lampa.Component.add('davay_ua', DavayUA);
                    Lampa.Controller.push('davay_ua', {
                        movie: e.data.movie
                    });
                });

                // Вставка кнопки
                var btns = e.object.container.find('.full-start__buttons');
                if (btns.length) {
                    btns.append(button);
                } else {
                    // Якщо стандартний блок не знайдено, пробуємо вставити в початок картки
                    e.object.container.find('.full-start').append(button);
                }
            }
        });
    }

    // Запуск після готовності системи
    if (window.Lampa) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') startPlugin();
        });
    }
})();
