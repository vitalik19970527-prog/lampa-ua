(function () {
    'use strict';

    // Сховище для логіки плагіна
    var UA_Worker = {
        name: 'Давай UA',
        version: '1.5.0',
        description: 'Пошук української озвучки через API Lampa',
        
        // Функція ініціалізації за вашим зразком
        init: function () {
            this.registerComponent();
            this.listenEvents();
            console.log('UA Plugin: Initialized');
        },

        // Реєстрація вікна зі списком серій/файлів
        registerComponent: function () {
            var _this = this;
            Lampa.Component.add('davay_ua_modal', function (object) {
                var network = new Lampa.Regard();
                var scroll = new Lampa.Scroll({ mask: true, over: true });
                var html = $('<div class="directory-layers"></div>');
                
                this.create = function () {
                    var m = object.movie;
                    var title = m.title || m.name;
                    var year = (m.release_date || m.first_air_date || '').slice(0, 4);
                    var url = 'https://api.lampa.stream/mod?title=' + encodeURIComponent(title) + '&year=' + year;

                    Lampa.Loading.show();

                    network.silent(url, function (data) {
                        Lampa.Loading.hide();
                        html.append(scroll.render());

                        if (data && data.length) {
                            var any_found = false;
                            data.forEach(function (item) {
                                // Фільтр за ключовими словами UA
                                if (item.file && /(ua|україн|ukr)/i.test(item.title || '')) {
                                    any_found = true;
                                    var card = Lampa.Template.get('button', { 
                                        title: '🇺🇦 ' + item.title,
                                        description: item.quality || 'HD' 
                                    });
                                    
                                    card.on('hover:enter', function () {
                                        Lampa.Player.play({
                                            url: item.file,
                                            title: item.title,
                                            movie: m
                                        });
                                    });
                                    scroll.append(card);
                                }
                            });
                            if (!any_found) _this.showEmpty('Озвучок UA не знайдено');
                        } else {
                            _this.showEmpty('Нічого не знайдено');
                        }
                    }, function () {
                        Lampa.Loading.hide();
                        Lampa.Noty.show('Помилка завантаження API');
                    });
                };

                this.render = function () { return html; };
            });
        },

        showEmpty: function (msg) {
            Lampa.Noty.show(msg);
            Lampa.Controller.backward();
        },

        // Слідкуємо за інтерфейсом (як у вашому файлі)
        listenEvents: function () {
            var _this = this;
            Lampa.Listener.follow('full', function (e) {
                if (e.type == 'complite' || e.type == 'ready') {
                    _this.addButton(e);
                }
            });
        },

        // Вставка кнопки у ваш специфічний блок full-start-new__buttons
        addButton: function (e) {
            var container = e.object.container.find('.full-start-new__buttons');
            
            if (container.length && !container.find('.button--davay-ua').length) {
                var btn = $(`
                    <div class="full-start__button selector button--davay-ua">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 16H13V14H11V16ZM11 12H13V8H11V12Z" fill="currentColor"/>
                        </svg>
                        <span>Давай UA</span>
                    </div>
                `);

                btn.on('hover:enter', function () {
                    Lampa.Controller.push('davay_ua_modal', {
                        movie: e.data.movie
                    });
                });

                // Ставимо після кнопки "Дивитись"
                var playBtn = container.find('.button--play');
                if (playBtn.length) playBtn.after(btn);
                else container.prepend(btn);

                // Оновлення навігації (важливо для пульта)
                if (Lampa.Controller.current().name == 'full_start') {
                    Lampa.Controller.toggle('full_start');
                }
            }
        }
    };

    // Запуск плагіна після готовності Lampa
    if (window.Lampa) {
        UA_Worker.init();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') UA_Worker.init();
        });
    }

})();
