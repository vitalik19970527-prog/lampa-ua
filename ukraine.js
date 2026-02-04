(function () {
    'use strict';

    var DavayUA_Project = {
        init: function () {
            this.registerComponent();
            this.startObserver();
        },

        // Створюємо окреме вікно для вибору озвучок
        registerComponent: function () {
            Lampa.Component.add('ua_picker', function (object) {
                var network = new Lampa.Regard();
                var scroll = new Lampa.Scroll({ mask: true, over: true });
                var html = $('<div class="directory-layers"></div>');
                
                this.create = function () {
                    var m = object.movie;
                    var title = m.title || m.name;
                    var year = (m.release_date || m.first_air_date || '').slice(0, 4);
                    
                    Lampa.Loading.show();

                    network.silent('https://api.lampa.stream/mod?title=' + encodeURIComponent(title) + '&year=' + year, function (data) {
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

        // Метод "Хижак" - стежить за появою блоку кнопок незалежно від подій системи
        startObserver: function () {
            var _this = this;
            var observer = new MutationObserver(function (mutations) {
                var container = $('.full-start-new__buttons'); // Ваш специфічний клас
                if (container.length && !container.find('.button--ua-final').length) {
                    _this.injectButton(container);
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });
        },

        injectButton: function (container) {
            var _this = this;
            // Створюємо кнопку, ідентичну вашим за структурою
            var btn = $(`
                <div class="full-start__button selector button--ua-final" style="border: 2px solid #ffd700 !important; background: rgba(0, 87, 183, 0.2) !important;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="24" height="12" fill="#0057B7"/>
                        <rect y="12" width="24" height="12" fill="#FFD700"/>
                    </svg>
                    <span>Давай UA</span>
                </div>
            `);

            btn.on('hover:enter', function () {
                // Беремо дані фільму з поточної активності
                var active = Lampa.Activity.active();
                var movieData = active.card || (active.object ? active.object.movie : null);
                
                if (movieData) {
                    Lampa.Controller.push('ua_picker', { movie: movieData });
                } else {
                    Lampa.Noty.show('Дані фільму ще не завантажені');
                }
            });

            // Ставимо кнопку ПЕРШОЮ
            container.prepend(btn);

            // Оновлюємо навігацію, щоб кнопка була клікабельною
            if (Lampa.Controller.current().name == 'full_start') {
                Lampa.Controller.toggle('full_start');
            }
        }
    };

    // Запуск
    if (window.Lampa) {
        DavayUA_Project.init();
    }
})();
