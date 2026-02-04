(function () {
    var startPlugin = function () {
        // Перевірка, чи не завантажені ми вже
        if (window.dvua_done) return;
        
        // Додаємо компонент пошуку
        Lampa.Component.add('davay_ua', function (object) {
            var network = new Lampa.Regard();
            var scroll = new Lampa.Scroll({mask: true, over: true});
            var html = $('<div class="directory-layers"></div>');
            
            this.create = function () {
                html.append(scroll.render());
                var m = object.movie || {};
                var url = 'https://api.lampa.stream/mod?title=' + encodeURIComponent(m.title || m.name) + '&year=' + (m.release_date || m.first_air_date || '').slice(0, 4);
                
                network.silent(url, function (data) {
                    if (data && data.length) {
                        data.forEach(function(item) {
                            if (item.file && /(ua|україн)/i.test(item.title || '')) {
                                var card = Lampa.Template.get('button', {title: '🇺🇦 ' + item.title});
                                card.on('hover:enter', function () { Lampa.Player.play({ url: item.file, title: item.title }); });
                                scroll.append(card);
                            }
                        });
                    } else { Lampa.Noty.show('Нічого не знайдено'); }
                });
            };
            this.render = function () { return html; };
        });

        // Слухаємо відкриття картки фільму
        Lampa.Listener.follow('full', function (e) {
            if (e.type == 'complite' || e.type == 'ready') {
                var btn = $('<div class="full-start__button selector"><span>Давай Українське</span></div>');
                btn.on('hover:enter', function () { Lampa.Controller.push('davay_ua', { movie: e.data.movie }); });
                e.object.container.find('.full-start__buttons').append(btn);
            }
        });
        
        window.dvua_done = true;
    };

    // Гнучке очікування завантаження Lampa
    if (window.Lampa && Lampa.Component) {
        startPlugin();
    } else {
        document.addEventListener('window:load', startPlugin);
        // Запасний варіант через таймер
        var attempts = 0;
        var timer = setInterval(function () {
            attempts++;
            if (window.Lampa && Lampa.Component) {
                clearInterval(timer);
                startPlugin();
            }
            if (attempts > 50) clearInterval(timer); // Стоп через 15 сек
        }, 300);
    }
})();
