(function () {
    'use strict';

    function init() {
        var btnTimer = setInterval(function() {
            var container = $('.full-start-new__buttons, .full-start__buttons');
            
            if (container.length && !$('.button--ua-final').length) {
                var btn = $('<div class="full-start__button selector button--ua-final" style="background: #0057B7 !important; border: 2px solid #FFD700 !important; color: #fff !important; font-weight: bold;"><span>🇺🇦 ДИВИТИСЬ UA</span></div>');

                btn.on('click', function () {
                    var movie = {};
                    try {
                        var active = Lampa.Activity.active();
                        movie = active.card || (active.object ? active.object.movie : {});
                    } catch(e) {
                        console.log('UA Plugin Error:', e);
                    }
                    
                    if (movie.title || movie.name) {
                        // Викликаємо вікно пошуку по онлайн-джерелах
                        // Якщо у вас стоять плагіни Rezka або HDVB, цей виклик відкриє їх
                        Lampa.Component.add('online', {
                            title: 'Онлайн UA',
                            url: '',
                            card: movie
                        });
                        
                        // Додаткова перевірка: якщо вікно не відкрилося автоматично, 
                        // пробуємо через глобальний пошук
                        if (!$('.online-v2').length && !$('.online').length) {
                            Lampa.Noty.show('Шукаю доступні плеєри...');
                        }
                    }
                });

                container.prepend(btn);
            }
        }, 1000);
    }

    if (window.Lampa) {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();
