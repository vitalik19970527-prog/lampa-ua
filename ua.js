(function () {
    'use strict';

    function createUAButton() {
        // Шукаємо контейнер для кнопок
        var container = $('.full-start-new__buttons, .full-start__buttons');
        
        // Якщо знайшли і нашої кнопки ще немає
        if (container.length && !$('.button--ua-final').length) {
            console.log('UA PLUGIN: Додаю кнопку');
            
            var btn = $('<div class="full-start__button selector button--ua-final" style="background: #0057B7 !important; border: 2px solid #FFD700 !important; border-radius: 5px; cursor: pointer; margin-right: 10px; display: flex; align-items: center; justify-content: center; padding: 0 20px; height: 3.5em;"><span style="font-weight: bold; color: #fff;">🇺🇦 ДАВАЙ UA</span></div>');

            // Обробка натискання
            btn.on('click', function (e) {
                e.preventDefault();
                var active = Lampa.Activity.active();
                var movie = active.card || (active.object ? active.object.movie : {});
                
                console.log('UA PLUGIN: Пошук для', movie.title || movie.name);
                window.runUASearch(movie);
            });

            container.prepend(btn);
            
            // Спроба оновити навігацію пульта без помилок
            try {
                if (window.Lampa && Lampa.Controller && typeof Lampa.Controller.toggle === 'function') {
                    Lampa.Controller.toggle('full_start');
                }
            } catch(err) {}
        }
    }

    window.runUASearch = function(movie) {
        var title = movie.title || movie.name;
        var year = (movie.release_date || movie.first_air_date || '').slice(0, 4);
        var url = 'https://api.lampa.stream/mod?title=' + encodeURIComponent(title) + '&year=' + year;

        console.log('UA PLUGIN: Запит:', url);

        $.ajax({
            url: url,
            method: 'GET',
            dataType: 'json',
            success: function(data) {
                if (data && data.length) {
                    // Фільтруємо UA
                    var items = data.filter(function(i) { 
                        return /(ua|україн|ukr)/i.test(i.title || ''); 
                    });

                    if (items.length) {
                        // Використовуємо Lampa.Select, він зазвичай стабільний
                        Lampa.Select.show({
                            title: 'Оберіть озвучку',
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
                                try { Lampa.Controller.toggle('full_start'); } catch(e) {}
                            }
                        });
                    } else {
                        alert('Української озвучки не знайдено');
                    }
                } else {
                    alert('Результатів не знайдено');
                }
            },
            error: function() {
                alert('Помилка запиту до сервера');
            }
        });
    };

    // Запуск через інтервал
    setInterval(createUAButton, 1000);
})();
