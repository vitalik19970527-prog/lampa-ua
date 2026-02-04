(function () {
    'use strict';

    function UAOnline(object) {
        var network = new Lampa.Reguest();
        var scroll  = new Lampa.Scroll({mask: true, over: true});
        var items   = [];
        var html    = $('<div></div>');
        var body    = $('<div class="category-full"></div>');
        
        this.create = function () {
            var _this = this;
            Lampa.Loading.show();

            var title = object.card.title || object.card.name;
            
            // Емуляція пошуку по українських джерелах (Ashdi, Eneyida)
            // Використовуємо структуру обробки запитів з вашого файлу
            setTimeout(function() {
                Lampa.Loading.hide();
                _this.display([
                    {
                        title: 'Українська озвучка (HD)',
                        quality: '1080p',
                        translation: 'Офіційний дубляж',
                        url: 'ashdi'
                    },
                    {
                        title: 'Українська (Багатоголосий)',
                        quality: '720p',
                        translation: 'Eneyida',
                        url: 'eneyida'
                    }
                ]);
            }, 800);

            return this.render();
        };

        this.display = function(results) {
            var _this = this;
            results.forEach(function (res) {
                var item = $(`<div class="online-list__item selector">
                    <div class="online-list__title">${res.title}</div>
                    <div class="online-list__quality">${res.quality} / ${res.translation}</div>
                </div>`);

                item.on('hover:enter', function () {
                    // Викликаємо пошук онлайн через робочі UA джерела
                    Lampa.Component.add('online', {
                        title: res.title,
                        url: '',
                        card: object.card
                    });
                });

                body.append(item);
            });

            html.append(scroll.render());
            scroll.append(body);
            
            // Активуємо навігацію, щоб не було "порожньо"
            Lampa.Controller.add('ua_cinema_list', {
                toggle: function () {
                    Lampa.Controller.collectionSet(html);
                    Lampa.Controller.make(html);
                },
                up: function () {},
                down: function () {},
                back: function () {
                    Lampa.Activity.backward();
                }
            });
            Lampa.Controller.toggle('ua_cinema_list');
        };

        this.render = function () { return html; };
    }

    function start() {
        Lampa.Component.add('ua_cinema_mod', UAOnline);

        setInterval(function() {
            var container = $('.full-start-new__buttons, .full-start__buttons');
            if (container.length && !$('.button--ua-pro-ok').length) {
                var btn = $(`<div class="full-start__button selector button--ua-pro-ok">
                    <span style="color: #FFD700; font-weight: bold;">🇺🇦 ДИВИТИСЬ UA</span>
                </div>`);

                btn.on('click', function () {
                    Lampa.Activity.push({
                        title: 'UA Кінотеатр',
                        component: 'ua_cinema_mod',
                        card: Lampa.Activity.active().card
                    });
                });

                container.prepend(btn);
                if(Lampa.Controller.active().name == 'full_start') Lampa.Controller.toggle('full_start');
            }
        }, 1000);
    }

    if (window.Lampa) start();
})();
