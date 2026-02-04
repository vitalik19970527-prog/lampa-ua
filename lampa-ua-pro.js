(function () {
    'use strict';

    // Створюємо структуру плагіна за стандартами Lampa
    function UAOnline(object) {
        var network = new Lampa.Reguest();
        var scroll  = new Lampa.Scroll({mask: true, over: true});
        var items   = [];
        var html    = $('<div></div>');
        var body    = $('<div class="category-full"></div>');
        
        this.create = function () {
            var _this = this;
            
            // Відображаємо процес завантаження
            Lampa.Loading.show();

            // Основна логіка: викликаємо вікно онлайн-перегляду
            // Це задіює всі встановлені в системі парсери (Rezka, Ashdi, HDVB)
            setTimeout(function(){
                Lampa.Loading.hide();
                Lampa.Component.add('online', {
                    title: 'UA Онлайн',
                    url: '',
                    card: object.card
                });
                _this.close();
            }, 500);

            return this.render();
        };

        this.close = function(){
            Lampa.Activity.active().handler.close();
        };

        this.render = function () {
            return html;
        };
    }

    // Реєстрація плагіна в системі
    function startPlugin() {
        console.log('UA PRO: Plugin initialized');
        
        // Додаємо кнопку в картку фільму через таймер (найнадійніший метод для ТВ)
        setInterval(function() {
            var container = $('.full-start-new__buttons, .full-start__buttons');
            
            if (container.length && !$('.button--ua-pro').length) {
                var btn = $(`<div class="full-start__button selector button--ua-pro">
                    <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" style="fill: #FFD700; margin-right: 10px; vertical-align: middle;">
                        <path d="M0 0h24v24H0z" fill="none"/><path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                    </svg>
                    <span style="color: #fff; font-weight: bold;">ДИВИТИСЬ UA</span>
                </div>`);

                // Стилізація під інтерфейс Lampa
                btn.css({
                    'background': 'linear-gradient(135deg, #0057B7 0%, #004494 100%)',
                    'border': '2px solid #FFD700',
                    'border-radius': '8px',
                    'display': 'flex',
                    'align-items': 'center',
                    'padding': '0 20px'
                });

                btn.on('hover:enter click', function () {
                    var card = Lampa.Activity.active().card;
                    if (card) {
                        Lampa.Component.add('online', {
                            title: card.title || card.name,
                            card: card
                        });
                    }
                });

                container.prepend(btn);
                
                // Оновлюємо навігацію, щоб кнопка стала доступною для пульта
                if(Lampa.Controller.active().name == 'full_start') {
                    Lampa.Controller.toggle('full_start');
                }
            }
        }, 1000);
    }

    // Запуск
    if (window.Lampa) {
        startPlugin();
    }
})();
