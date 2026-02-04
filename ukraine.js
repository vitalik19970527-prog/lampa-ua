(function () {
    'use strict';

    // Функція, яка малює кнопку
    function createUAButton() {
        var container = $('.full-start-new__buttons');
        
        // Якщо контейнер є, а нашої кнопки ще немає
        if (container.length && !$('.button--ua-final').length) {
            console.log('DAVAY UA: Вставляю кнопку...');
            
            var btn = $(`
                <div class="full-start__button selector button--ua-final" style="background: #0057B7 !important; border: 2px solid #FFD700 !important; border-radius: 5px;">
                    <span style="font-weight: bold; color: #fff;">🇺🇦 ДАВАЙ UA</span>
                </div>
            `);

            btn.on('hover:enter', function () {
                var active = Lampa.Activity.active();
                var movie = active.card || (active.object ? active.object.movie : {});
                
                // Викликаємо пошук (простий алерт для тесту)
                Lampa.Noty.show('Пошук української озвучки для: ' + (movie.title || movie.name));
                
                // Тут логіка відкриття списку
                window.runUASearch(movie);
            });

            container.prepend(btn);
            
            // Примусово оновлюємо навігацію пульта
            if (Lampa.Controller.current().name == 'full_start') {
                Lampa.Controller.toggle('full_start');
            }
        }
    }

    // Глобальна функція пошуку
    window.runUASearch = function(movie) {
        var title = movie.title || movie.name;
        var year = (movie.release_date || movie.first_air_date || '').slice(0, 4);
        var url = 'https://api.lampa.stream/mod?title=' + encodeURIComponent(title) + '&year=' + year;

        Lampa.Loading.show();
        $.getJSON(url, function(data) {
            Lampa.Loading.hide();
            if (data && data.length) {
                var items = data.filter(i => /(ua|україн|ukr)/i.test(i.title || ''));
                if (items.length) {
                    Lampa.Select.show({
                        title: 'Оберіть озвучку',
                        items: items.map(i => ({ title: i.title, file: i.file })),
                        onSelect: function(item) {
                            Lampa.Player.play({ url: item.file, title: item.title, movie: movie });
                        },
                        onBack: function() { Lampa.Controller.toggle('full_start'); }
                    });
                } else Lampa.Noty.show('Озвучок UA не знайдено');
            } else Lampa.Noty.show('Нічого не знайдено');
        }).fail(function() {
            Lampa.Loading.hide();
            Lampa.Noty.show('Помилка запиту');
        });
    };

    // Запуск через інтервал (найнадійніший спосіб)
    console.log('DAVAY UA: Плагін ініціалізовано');
    setInterval(createUAButton, 1000);

})();
