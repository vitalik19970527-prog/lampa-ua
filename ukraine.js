(function () {
    'use strict';

    // Допоміжні функції як у вашому файлі для сумісності
    function startsWith(str, searchString) {
      return str.lastIndexOf(searchString, 0) === 0;
    }

    function salt(input) {
      var str = (input || '') + '';
      var hash = 0;
      for (var i = 0; i < str.length; i++) {
        var c = str.charCodeAt(i);
        hash = (hash << 5) - hash + c;
        hash = hash & hash;
      }
      return Math.abs(hash).toString(16);
    }

    // Головна логіка плагіна
    var DavayUA_Engine = function () {
        this.network = new Lampa.Regard();
        
        this.init = function () {
            var _this = this;
            // Реєструємо плагін у меню (як у вашому файлі)
            Lampa.Plugins.add({
                name: 'Давай UA',
                version: '2.0.0',
                description: 'Пошук української озвучки',
                type: 'video',
                author: 'Vitalik'
            });

            this.listen();
        };

        this.listen = function () {
            var _this = this;
            Lampa.Listener.follow('full', function (e) {
                if (e.type == 'complite' || e.type == 'ready') {
                    _this.insertButton(e);
                }
            });
        };

        this.insertButton = function (e) {
            var _this = this;
            // Використовуємо ваш специфічний клас
            var container = e.object.container.find('.full-start-new__buttons');
            
            if (container.length && !container.find('.button--davay-ua-ultra').length) {
                var btn = $(`
                    <div class="full-start__button selector button--davay-ua-ultra">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="gold" stroke="currentColor" stroke-width="1"/>
                        </svg>
                        <span>Давай UA</span>
                    </div>
                `);

                btn.on('hover:enter', function () {
                    _this.startSearch(e.data);
                });

                // Вставляємо строго після "Дивитись"
                var playBtn = container.find('.button--play');
                if (playBtn.length) playBtn.after(btn);
                else container.prepend(btn);

                // Примусове оновлення навігації (як у професійних модах)
                Lampa.Controller.add('full_start', {
                    toggle: function () {
                        Lampa.Controller.collectionSet(container);
                        Lampa.Controller.move('right');
                    }
                });
            }
        };

        this.startSearch = function (data) {
            var _this = this;
            var m = data.movie;
            var title = m.title || m.name;
            var year = (m.release_date || m.first_air_date || '').slice(0, 4);
            var query = encodeURIComponent(title);
            
            Lampa.Loading.show();

            this.network.silent('https://api.lampa.stream/mod?title=' + query + '&year=' + year, function (results) {
                Lampa.Loading.hide();
                if (results && results.length) {
                    var ua_files = results.filter(function(f) {
                        return /(ua|україн|ukr)/i.test(f.title || '');
                    });

                    if (ua_files.length) {
                        _this.showModal(ua_files, m);
                    } else {
                        Lampa.Noty.show('Української озвучки не знайдено');
                    }
                } else {
                    Lampa.Noty.show('Нічого не знайдено');
                }
            }, function () {
                Lampa.Loading.hide();
                Lampa.Noty.show('Помилка API');
            });
        };

        this.showModal = function (items, movie) {
            Lampa.Component.add('ua_list_view', function (object) {
                var scroll = new Lampa.Scroll({ mask: true, over: true });
                var html = $('<div class="directory-layers"></div>');
                this.create = function () {
                    html.append(scroll.render());
                    items.forEach(function (item) {
                        var card = Lampa.Template.get('button', {
                            title: item.title,
                            description: item.quality || 'HD'
                        });
                        card.on('hover:enter', function () {
                            Lampa.Player.play({ url: item.file, title: item.title, movie: movie });
                        });
                        scroll.append(card);
                    });
                };
                this.render = function () { return html; };
            });
            Lampa.Controller.push('ua_list_view', { movie: movie });
        };
    };

    // Офіційний запуск через ядро
    if (window.Lampa) {
        var engine = new DavayUA_Engine();
        engine.init();
    }
})();
