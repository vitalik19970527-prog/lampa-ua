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
            // Формуємо запит суто для українських джерел
            var search_query = encodeURIComponent(title);

            // Використовуємо універсальний метод відображення результатів
            // Цей метод звертається до встановлених в системі UA-балансерів
            setTimeout(function() {
                Lampa.Loading.hide();
                Lampa.Component.add('online', {
                    title: 'UA: ' + title,
                    url: '', 
                    card: object.card,
                    filter: function(item) {
                        // Фільтруємо контент, залишаючи лише українську озвучку, якщо балансер це підтримує
                        return item.translation && item.translation.toLowerCase().includes('укр');
                    }
                });
                _this.close();
            }, 500);

            return this.render();
        };

        this.close = function() {
            Lampa.Activity.extract();
        };

        this.render = function () {
            return html;
        };
    }

    function startPlugin() {
        // Реєструємо компонент
        Lampa.Component.add('ua_online_mod', UAOnline);

        setInterval(function() {
            var container = $('.full-start-new__buttons, .full-start__buttons');
            
            if (container.length && !$('.button--ua-cinema').length) {
                var btn = $(`<div class="full-start__button selector button--ua-cinema">
                    <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" style="fill: #FFD700; margin-right: 10px; vertical-align: middle;">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                    </svg>
                    <span style="color: #fff; font-weight: bold;">🇺🇦 КІНО UA</span>
                </div>`);

                btn.css({
                    'background': 'linear-gradient(135deg, #0057B7 0%, #004494 100%)',
                    'border': '2px solid #FFD700',
                    'border-radius': '8px',
                    'padding': '0 20px',
                    'margin-right': '10px',
                    'display': 'flex',
                    'align-items': 'center'
                });

                btn.on('click', function () {
                    Lampa.Component.add('ua_online_mod', {
                        card: Lampa.Activity.active().card
                    });
                });

                container.prepend(btn);
                
                // Виправляємо навігацію для пультів (як у вашому файлі)
                try {
                    if (Lampa.Controller.active().name == 'full_start') {
                        Lampa.Controller.toggle('full_start');
                    }
                } catch(e) {}
            }
        }, 1000);
    }

    if (window.Lampa) startPlugin();
})();
