(function () {
    'use strict';

    function init() {
        // Реєструємо компонент вибору озвучок
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

        // Використовуємо інтервал, щоб обійти помилку "undefined" у Listener
        setInterval(function() {
            // Шукаємо блок кнопок прямо в DOM
            var container = $('.full-start-new__buttons');
            
            if (container.length && !container.find('.button--ua-ultra').length) {
                var btn = $(`
                    <div class="full-start__button selector button--ua-ultra" style="background: #0057B7 !important; color: #fff !important; border-bottom: 3px solid #FFD700 !important;">
                        <span style="font-weight: bold;">🇺🇦 ДАВАЙ UA</span>
                    </div>
                `);

                btn.on('hover:enter', function () {
                    var active = Lampa.Activity.active();
                    var movieData = active.card || (active.object ? active.object.movie : null);
                    if (movieData) {
                        Lampa.Controller.push('davay_ua_modal', { movie: movieData });
                    }
                });

                // Вставляємо на самий початок
                container.prepend(btn);

                // Оновлюємо навігацію
                if (Lampa.Controller.current().name == 'full_start') {
                    Lampa.Controller.toggle('full_start');
                }
            }
        }, 1000);
    }

    // Запуск тільки коли Lampa готова
    if (window.Lampa) init();
    else {
        var timer = setInterval(function(){
            if (window.Lampa) {
                clearInterval(timer);
                init();
            }
        }, 500);
    }
})();
