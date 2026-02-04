(function () {
    'use strict';

    if (window.Lampa && Lampa.Plugins) {
        Lampa.Plugins.add({
            name: 'Давай UA',
            version: '1.4.0',
            description: 'Українська озвучка',
            type: 'video',
            author: 'Vitalik'
        });
    }

    function init() {
        if (window.dvua_loaded) return;
        window.dvua_loaded = true;

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
                            var t = (item.title || '').toLowerCase();
                            if (item.file && (t.indexOf('ua') > -1 || t.indexOf('україн') > -1)) {
                                var card = Lampa.Template.get('button', {title: '🇺🇦 ' + item.title});
                                card.on('hover:enter', function () { 
                                    Lampa.Player.play({ url: item.file, title: item.title }); 
                                });
                                scroll.append(card);
                            }
                        });
                    } else { Lampa.Noty.show('Нічого не знайдено'); }
                });
            };
            this.render = function () { return html; };
        });

        Lampa.Listener.follow('full', function (e) {
            if (e.type == 'complite' || e.type == 'ready') {
                var render = function() {
                    // Використовуємо ваш новий клас full-start-new__buttons
                    var container = e.object.container.find('.full-start-new__buttons');
                    
                    if (container.length && !container.find('.dvua-btn').length) {
                        var btn = $(`
                            <div class="full-start__button selector dvua-btn">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                                    <path d="M12 8V16M8 12H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                </svg>
                                <span>Давай UA</span>
                            </div>
                        `);
                        
                        btn.on('hover:enter', function () { 
                            Lampa.Controller.push('davay_ua', { movie: e.data.movie }); 
                        });

                        // Вставляємо після кнопки "Дивитись"
                        var playBtn = container.find('.button--play');
                        if (playBtn.length) playBtn.after(btn);
                        else container.prepend(btn);
                        
                        // Оновлення фокусу
                        Lampa.Controller.toggle('full_start');
                    }
                };

                setTimeout(render, 500);
            }
        });
    }

    if (window.Lampa && Lampa.Component) init();
    else {
        var timer = setInterval(function () {
            if (window.Lampa && Lampa.Component) { clearInterval(timer); init(); }
        }, 500);
    }
})();
