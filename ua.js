(function () {
    'use strict';
    
    // Функція спробує вивести інформацію прямо в меню Lampa
    function diagnostic() {
        var info = [];
        if (typeof Lampa !== 'undefined') {
            info.push('Об\'єкт Lampa: ЗНАЙДЕНО');
            info.push('Версія: ' + (Lampa.version || 'невідома'));
            info.push('Методи: ' + Object.keys(Lampa).slice(0, 10).join(', '));
            if (Lampa.Loading) info.push('Loading: Є'); else info.push('Loading: НЕМАЄ');
            if (Lampa.Select) info.push('Select: Є'); else info.push('Select: НЕМАЄ');
        } else {
            info.push('Об\'єкт Lampa: НЕ ЗНАЙДЕНО (Undefined)');
        }
        
        // Виводимо це в консоль і в alert, щоб точно побачити
        console.log('DIAGNOSTIC:', info.join(' | '));
        
        // Спробуємо "силоміць" показати це користувачу
        if ($('.full-start-new__buttons').length && !$('.ua-info').length) {
            $('.full-start-new__buttons').prepend('<div class="ua-info" style="color:yellow; font-size:12px; border:1px solid red; padding:5px;">' + info.join('<br>') + '</div>');
        }
    }

    setInterval(diagnostic, 2000);
})();
