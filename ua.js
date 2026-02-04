(function () {
    'use strict';

    console.log('UA PLUGIN: Ініціалізація v106');

    function createUAButton() {
        // Контейнери кнопок у версії 3.1.5
        var container = $('.full-start-new__buttons, .full-start__buttons');
        
        if (container.length && !$('.button--ua-final').length) {
            console.log('UA PLUGIN: Спроба додати кнопку');
            
            var btn = $('<div class="full-start__button selector button--ua-final" style="background: #0057B7 !important; border: 2px solid #FFD700 !important; color: #fff !important; padding: 10px 20px; margin-right: 10px; border-radius: 5px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; font-weight: bold;"><span>🇺🇦 ДАВАЙ UA</span></div>');

            btn.on('click', function (e) {
                e.preventDefault();
                console.log('UA PLUGIN: Кнопку натиснуто');
                
                // Безпечне отримання даних фільму
                var movie = {};
                try {
                    var active = Lampa.Activity.active();
                    movie = active.card || (active.object ? active.object.movie : {});
                } catch(err) {
                    console.log('UA PLUGIN: Помилка отримання картки', err);
                }
                
                if (movie.title || movie.name) {
                    window.runUASearch(movie);
                } else {
                    alert('Не вдалося визначити назву фільму');
                }
            });

            container.prepend(btn);
            
            // Навігація для пульта без виклику .current()
            try {
                if (Lampa.Controller && typeof Lampa.Controller.add === 'function') {
                    Lampa.Controller.add('full_start', {
                        toggle: function () {},
                        render: function () {}
                    });
                }
            } catch(e) {}
        }
    }

    window.runUASearch = function(movie) {
        var title = movie.title || movie.name;
        var year = (movie.release_date || movie.first_air_date || '').slice(0, 4);
        var url = 'https://api.lampa.stream/mod?title=' + encodeURIComponent(title) + '&year=' + year;

        console.log('UA PLUGIN: Шукаю:', title);

        // НЕ використовуємо Lampa.Loading, бо він викликає помилку
        $.ajax({
            url: url,
            method: 'GET',
            dataType: 'json',
            timeout: 7000,
            success: function(data) {
                if (data && data.length) {
                    var items = data.filter(function(i) { 
                        return /(ua|україн|ukr)/i.test(i.title || ''); 
                    });

                    if (items.length) {
                        // Використовуємо Lampa.Select - він стандартний
                        try {
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
                                }
                            });
                        } catch(e) {
                            // Якщо Select зламався, просто запускаємо перше відео
                            Lampa.Player.play({ url: items[0].file, title: items[0].title, movie: movie });
                        }
                    } else alert('UA озвучки не знайдено');
                } else alert('Нічого не знайдено');
            },
            error: function() {
                alert('Помилка запиту до API');
            }
        });
    };

    // Запускаємо перевірку появи кнопок кожну секунду
    setInterval(createUAButton, 1000);
})();
