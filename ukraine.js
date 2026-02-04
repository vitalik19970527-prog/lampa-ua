(function () {
    'use strict';

    var DavayUA = function () {
        var _this = this;
        var network = new Lampa.Regard();
        
        // Функція ініціалізації (як у вашому файлі)
        this.init = function () {
            this.listen();
        };

        // Головний метод пошуку (самостійний парсер)
        this.search = function (object) {
            var title = object.movie.title || object.movie.name;
            var year = (object.movie.release_date || object.movie.first_air_date || '').slice(0, 4);
            var url = 'https://api.lampa.stream/mod?title=' + encodeURIComponent(title) + '&year=' + year;

            Lampa.Loading.show();

            network.silent(url, function (data) {
                Lampa.Loading.hide();
                if (data && data.length) {
                    var items = [];
                    data.forEach(function (item) {
                        // Фільтрація виключно української озвучки
                        if (item.file && /(ua|україн|ukr)/i.test(item.title || '')) {
                            items.push({
                                title: '🇺🇦 ' + item.title,
                                file: item.file,
                                quality: item.quality || 'HD'
                            });
                        }
                    });

                    if (items.length) {
                        _this.showFiles(items, object.movie);
                    } else {
                        Lampa.Noty.show('Української озвучки не знайдено');
                    }
                } else {
                    Lampa.Noty.show('Нічого не знайдено для цього фільму');
                }
            }, function () {
                Lampa.Loading.hide();
                Lampa.Noty.show('Помилка запиту до сервера');
            });
        };

        // Створення вікна вибору файлів (як у великих плагінах)
        this.showFiles = function (items, movie) {
            Lampa.Component.add('davay_ua_list', function (object) {
                var scroll = new Lampa.Scroll({ mask: true, over: true });
                var html = $('<div class="directory-layers"></div>');
                
                this.create = function () {
                    var _comp = this;
                    html.append(scroll.render());

                    items.forEach(function (item) {
                        var card = Lampa.Template.get('button', {
                            title: item.title,
                            description: item.quality
                        });

                        card.on('hover:enter', function () {
                            Lampa.Player.play({
                                url: item.file,
                                title: item.title,
                                movie: movie
                            });
                        });

                        scroll.append(card);
                    });
                };

                this.render = function () { return html; };
            });

            Lampa.Controller.push('davay_ua_list', { movie: movie });
        };

        // Метод вставки кнопки (адаптований під ваш full-start-new__buttons)
        this.listen = function () {
            Lampa.Listener.follow('full', function (e) {
                if (e.type == 'complite' || e.type == 'ready') {
                    var container = e.object.container.find('.full-start-new__buttons');
                    
                    if (container.length && !container.find('.button--davay-ua').length) {
                        var button = $(`
                            <div class="full-start__button selector button--davay-ua">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                                    <path d="M12 8V16M8 12H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                </svg>
                                <span>Давай UA</span>
                            </div>
                        `);

                        button.on('hover:enter', function () {
                            _this.search(e.data);
                        });

                        // Вставляємо строго після "Дивитись"
                        var play_btn = container.find('.button--play');
                        if (play_btn.length) play_btn.after(button);
                        else container.prepend(button);

                        // Оновлюємо навігацію, щоб пульт бачив кнопку
                        if (Lampa.Controller.current().name == 'full_start') {
                            Lampa.Controller.toggle('full_start');
                        }
                    }
                }
            });
        };
    };

    // Глобальний запуск
    if (window.Lampa) {
        var plugin = new DavayUA();
        plugin.init();
    }
})();
