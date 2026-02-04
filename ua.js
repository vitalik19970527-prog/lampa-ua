(function () {
    'use strict';

    function createUAButton() {
        // Контейнер для кнопок у картці фільму
        var container = $('.full-start-new__buttons, .full-start__buttons');
        
        if (container.length && !$('.button--ua-final').length) {
            console.log('UA PLUGIN: Малюю кнопку');
            
            var btn = $('<div class="full-start__button selector button--ua-final" style="background: #0057B7 !important; border: 2px solid #FFD700 !important; color: #fff !important; padding: 10px; margin-right: 10px; border-radius: 5px; cursor: pointer; display: flex; align-items: center; justify-content: center;"><span style="font-weight: bold;">🇺🇦 ДАВАЙ UA</span></div>');

            btn.on('click hover:enter', function (e) {
                e.preventDefault();
                var active = Lampa.Activity.active();
                var movie = active.card || (active.object ? active.object.movie : {});
                
                // Безпечний виклик повідомлення
                if (Lampa.Noty) Lampa.Noty.show('Шукаю UA озвучку для: ' + (movie.title || movie.name));
                
                window.runUASearch(movie);
            });

            container.prepend(btn);
            
            // Спроба оновити навігацію (якщо методи існують)
            try {
                if (Lampa.Controller && typeof Lampa.Controller.toggle === 'function') {
                    Lampa.Controller.toggle('full_start');
                }
            } catch(e) { console.log('Navigation update skip'); }
        }
    }

    window.runUASearch = function(movie) {
        var title = movie.title || movie.name;
        var year = (movie.release_date || movie.first_air_date || '').slice(0, 4);
        var url = 'https://api.lampa.stream/mod?title=' + encodeURIComponent(title) + '&year=' + year;

        // Безпечний показ завантаження
        if (Lampa.Loading && typeof Lampa.Loading.show === 'function') Lampa.Loading.show();

        $.ajax({
            url: url,
            method: 'GET',
            dataType: 'json',
            success: function(data) {
                if (Lampa.Loading && typeof Lampa.Loading.hide === 'function') Lampa.Loading.hide();
                
                if (data && data.length) {
                    // Фільтруємо лише українські
                    var items = data.filter(function(i) { 
                        return /(ua|україн|ukr)/i.test(i.title || ''); 
                    });

                    if (items.length) {
                        Lampa.Select.show({
                            title: 'Українська озвучка',
                            items: items.map(function(i) { 
                                return { title: i.title, file: i.file }; 
                            }),
                            onSelect: function(item) {
                                Lampa.Player.play({ 
                                    url: item.file, 
                                    title: item.title, 
                                    movie: movie 
                                });
                            },
                            onBack: function() {
                                if (Lampa.Controller && typeof Lampa.Controller.toggle === 'function') {
                                    Lampa.Controller.toggle('full_start');
                                }
                            }
                        });
                    } else {
                        if (Lampa.Noty) Lampa.Noty.show('UA озвучки не знайдено в цьому джерелі');
                    }
                } else {
                    if (Lampa.Noty) Lampa.Noty.show('Нічого не знайдено');
                }
            },
            error: function() {
                if (Lampa.Loading && typeof Lampa.Loading.hide === 'function') Lampa.Loading.hide();
                if (Lampa.Noty) Lampa.Noty.show('Помилка мережі');
            }
        });
    };

    console.log('UA PLUGIN: Ready');
    setInterval(createUAButton, 1000);
})();
