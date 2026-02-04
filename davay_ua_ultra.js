(function () {
    'use strict';

    function startPlugin() {
        // Реєструємо плагін в системі, щоб він мав назву в налаштуваннях
        if (window.Lampa && Lampa.Plugins) {
            Lampa.Plugins.add({
                name: 'Давай Українське',
                version: '1.0.2',
                description: 'Пошук української озвучки через api.lampa.stream',
                type: 'video',
                author: 'Vitalik'
            });
        }

        var DavayUA = function (object) {
            var network = new Lampa.Regard();
            var scroll = new Lampa.Scroll({mask: true, over: true, check_viewport: true});
            var items = [];
            var html = $('<div class="directory-layers"></div>');
            
            var uaKeys = [
                'ashdi', 'uakino', 'eneida', 'uaflix', 'uatut', 'uaserials', 'цікава ідея', 'hurtom', 'dzvin', 'soloway', 
                'cinemaua', 'dniprofilm', 'ukr', 'ua', 'українськ', 'соловїна', 'дубляж', 'багатоголосий', 'двоголосий'
            ];

            this.create = function () {
                var _this = this;
                html.append(scroll.render());
                
                var movie = object.movie || {};
                var titles = [movie.title, movie.original_title, movie.name].filter(Boolean);
                var year = (movie.release_date || movie.first_air_date || '').slice(0, 4);

                if (!titles.length) {
                    Lampa.Noty.show('Не вдалося визначити назву фільму');
                    return;
                }

                var requests = titles.length;
                var allResults = [];

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
                var added = {};

                data.forEach(function(item) {
                    if (!item.file || added[item.file]) return;
                    
                    var t = (item.title || '').toLowerCase();
                    var isUA = false;
                    for (var i = 0; i < uaKeys.length; i++) {
                        if (t.indexOf(uaKeys[i]) > -1) { isUA = true; break; }
                    }

                    if (isUA) {
                        added[item.file] = true;
                        var card = Lampa.Template.get('button', {title: '🇺🇦 ' + item.title});
                        card.on('hover:enter', function () {
                            Lampa.Player.play({ url: item.file, title: item.title });
                        });
                        scroll.append(card);
                        items.push(card);
                    }
                });

                if (items.length === 0) {
                    Lampa.Noty.show('Української озвучки не знайдено');
                }
            };

            this.render = function () { return html; };
            this.destroy = function () { network.clear(); scroll.destroy(); html.remove(); };
        };

        Lampa.Component.add('davay_ua', DavayUA);

        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite' || e.type === 'ready') {
                var button = $('<div class="full-start__button selector"><span>Давай Українське</span></div>');
                
                button.on('hover:enter', function () {
                    Lampa.Controller.push('davay_ua', { movie: e.data.movie });
                });

                // Шукаємо блок кнопок
                var container = e.object.container.find('.full-start__buttons');
                if (container.length) {
                    container.append(button);
                } else {
                    e.object.container.find('.full-start').append(button);
                }
            }
        });
    }

    // Спроба запуску з перевіркою готовності Lampa
    try {
        if (window.Lampa) {
            startPlugin();
        } else {
            var waitLampa = setInterval(function() {
                if (window.Lampa) {
                    clearInterval(waitLampa);
                    startPlugin();
                }
            }, 100);
        }
    } catch (e) {
        console.error('DavayUA Error:', e);
    }
})();
