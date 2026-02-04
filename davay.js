(function () {
    'use strict';

    console.log('DAVAY PLUGIN: Спроба запуску');

    function init() {
        var btnTimer = setInterval(function() {
            var container = $('.full-start-new__buttons, .full-start__buttons');
            
            if (container.length && !$('.button--ua-work').length) {
                console.log('DAVAY PLUGIN: Кнопка додана');
                
                var btn = $('<div class="full-start__button selector button--ua-work" style="background: #0057B7 !important; border: 2px solid #FFD700 !important; color: #fff !important; padding: 10px; margin-right: 10px; border-radius: 5px; cursor: pointer;"><span>🇺🇦 ДАВАЙ UA</span></div>');

                btn.on('click', function () {
                    console.log('DAVAY PLUGIN: Натиснуто');
                    var movie = {};
                    try {
                        var active = Lampa.Activity.active();
                        movie = active.card || (active.object ? active.object.movie : {});
                    } catch(e) {}
                    
                    var title = movie.title || movie.name;
                    if (title) {
                        // Використовуємо звичайний alert для тесту, щоб уникнути помилок Lampa.Loading
                        console.log('DAVAY PLUGIN: Пошук для', title);
                        window.location.href = 'https://www.google.com/search?q=' + encodeURIComponent(title + ' ' + (movie.release_date || '').slice(0,4) + ' дивитись українською');
                    }
                });

                container.prepend(btn);
            }
        }, 1000);
    }

    // Чекаємо повної готовності Lampa
    if (window.Lampa) {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();
