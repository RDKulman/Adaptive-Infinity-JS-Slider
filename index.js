const slider = document.querySelector('.slider');
const sliderLine = document.querySelector('.slider-line');

const sliderBtns = document.querySelectorAll('.slider-btn');
const sliderBtnPrev = document.querySelector('.btn-prev');
const sliderBtnNext = document.querySelector('.btn-next');
const dots = document.querySelectorAll('.dot');

let oneSliderWidth;
let dotCounter = 0;
let counter = 1;

// запуск ф-я автопрокрутки слайдера
let autoScrollTimer = setInterval(initTimer, 15000);

// ф-я клонирует первый и последний слайды и вставляет их в контейнер sliderine
// и возвращает на выход коллекцию слайдов, которая содержит клонированные объекты
function addCloneSlides() {
    const slideFirst = document.querySelector('.slide-1');
    const slideLast = document.querySelector('.slide-4');
    const slideFirstClone = slideFirst.cloneNode(true);
    const slideLastClone = slideLast.cloneNode(true);

    sliderLine.prepend(slideLastClone);
    sliderLine.append(slideFirstClone);

    let images = document.querySelectorAll('.slider .slider-line .slide');

    return images;
}

let imageSlides = addCloneSlides(); // коллекция всех слайдов

// ф-я инициализации слайдера и всех вспомогательных ф-й
function initSlider() {
    oneSliderWidth = slider.offsetWidth;

    imageSlides.forEach(item => {
        item.style.width = `${oneSliderWidth}px`;
        item.style.height = 'auto';
    })

    sliderLine.style.width = `${oneSliderWidth * imageSlides.length}px`;

    checkTransition();
    rollSlider();
    setActiveDot();
    switchByDots();
    addTimerDot();
}

// ф-я проверяет наличие класса transition, который отвечает за плавное перелистывание слайдера
// нужна, т.к. после перелистывания класс удаляется 
// (чтобы можно было в нужный момент передвинуть слайды незаметно)
function checkTransition() {
    if (!sliderLine.classList.contains('transition')) {
        sliderLine.classList += ' transition';
    }
}

// ф-я устанавливает нужному доту активный класс
// перед этим во избежание косяков все активные классы удаляются у дотов 
function setActiveDot() {
    dots.forEach(item => item.classList.remove('active'));
    dots[dotCounter].classList.add('active');
}

// при перелистывании вперед слайда запускается эта ф-я и изменяет "активный" дот
// при достижении последнего дота счетчик обнуляется и активный класс присваивается  1му доту
function moveActiveDoteNext() {
    dots.forEach(item => item.classList.remove('active'));
    dotCounter++;

    if (dotCounter == dots.length) {
        dotCounter = 0;
    }

    dots[dotCounter].classList.add('active');
}

// при перелистывании назад слайда запускается эта ф-я и изменяет "активный" дот
// при достижении первого дота счетчик обнуляется и активный класс присваивается последнему доту
function moveActiveDotePrev() {
    dots.forEach(item => item.classList.remove('active'));
    dotCounter--;

    if (dotCounter < 0) {
        dotCounter = dots.length - 1;
    }

    dots[dotCounter].classList.add('active');
}

// ф-я перелистывания сладов по клику на дот
// обработчик кликов висит на родительском контейнере дотов
function switchByDots() {
    let dotsBlock = document.querySelector('.dots');
    dotsBlock.addEventListener('click', function (elem) {
        let target = elem.target.closest('.dot');

        // если клик не принадлежит доту или дот не принадлежит род. контейнеру
        // не запускаем дальнейшие действия
        if (!target) return;
        if (!dotsBlock.contains(target)) return;

        dots.forEach(item => item.classList.remove('active'));
        target.classList.add('active');

        // после задания "активного" класса доту после нажатия на него
        // forEach'ем проходимся про массиву дотов и обновляем счетчики дотов и слайдера,
        // чтобы между ними не терялась связь и при дальнейшем клике по кнопкам все листалось хорошо
        dots.forEach((item, index) => {
            if (item.classList.contains('active')) {
                let dotClicked = 1;
                counter = dotClicked + index;
                dotCounter = index;

                checkTransition();
                addTimerDot();
                rollSlider();
            }
        });

        clearInterval(autoScrollTimer);
        autoScrollTimer = setInterval(initTimer, 15000);
    });
}

// ф-я отвечает за перелистывание слайдера
// т.к. счетчик в глобальной области видимости, при изменении размеров экрана
// слайдер будет оставаться на том же слайде, до которого дошел пользователь
function rollSlider() {
    sliderLine.style.transform = `translateX(-${counter * oneSliderWidth}px)`;
}

// ф-я добавляет текущему активному доту класс с анимацией изменения заливки
function addTimerDot() {
    let counterFill;
    dots.forEach(item => item.classList.remove('next-slide'));

    if (dotCounter == 3) {
        counterFill = - dotCounter;
    }
    else {
        counterFill = 1;
    }
    // dots[(counterFill + dotCounter)].classList.add('next-slide');
    dots[(dotCounter)].classList.add('next-slide');
}

// ф-я отвечает за автопролистывание слайдера
function initTimer() {
    checkTransition();
    switchByDots();
    (counter >= imageSlides.length - 1) ? counter = 1 : counter;
    counter++;

    moveActiveDoteNext();
    addTimerDot();
    rollSlider();
}

// после окончания перемещения контейнера со слайдами, запускаем проверку
// достиг ли счетчик слайдов крайних значений
// если достиг - его значения обновляются и сдвигается контейнер со слайдами
// чтобы можно было продолжить прокрутку слайдера (реализация "бесконечности" слайдера)
sliderLine.addEventListener('transitionend', () => {
    sliderLine.classList.remove('transition');

    if (counter == imageSlides.length - 1) {
        counter = 1;
        rollSlider();
    }
    if (counter == 0) {
        counter = imageSlides.length - 2;
        rollSlider();
    }
});

sliderBtnPrev.addEventListener('click', function () {
    this.style.pointerEvents = 'none';
    setTimeout(() => {
        this.style.pointerEvents = 'auto';
    }, 500);
})
sliderBtnPrev.addEventListener('click', () => {
    checkTransition();
    counter--;
    rollSlider();
    moveActiveDotePrev();
    addTimerDot();

    clearInterval(autoScrollTimer);
    autoScrollTimer = setInterval(initTimer, 15000);
})

sliderBtnNext.addEventListener('click', function () {
    this.style.pointerEvents = 'none';
    setTimeout(() => {
        this.style.pointerEvents = 'auto';
    }, 500);
})
sliderBtnNext.addEventListener('click', () => {
    checkTransition();
    counter++;
    rollSlider();
    setActiveDot();
    moveActiveDoteNext();
    addTimerDot();

    clearInterval(autoScrollTimer);
    autoScrollTimer = setInterval(initTimer, 15000);
})

// запускаем ф-ю инициализации слайдера и переинициализацию
// при изменении размеров экрана (реализация адаптивности слайдера под любой размер экрана)
initSlider();
window.addEventListener('resize', initSlider);