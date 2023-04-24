const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let maxPercentage = 0;

const canvasOffsetX = canvas.offsetLeft;
const canvasOffsetY = canvas.offsetTop;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;



let lastX;
let lastY;

let isPainting = false;
let lineWidth = 14;
let startX;
let startY;

// радиус который высчитывается при первом нажатии
let perfectRadius;
let i = 0;
ctx.strokeStyle = "#00CE22";

const dot = document.getElementById('dot');
const percentageText = document.querySelector('.percentage');
const bestText = document.querySelector('.best');
const clearButton = document.querySelector('.clear')
const rect = dot.getBoundingClientRect();
const dotX = rect.left;
const dotY = rect.top;

// начальный процент
let percentage = 90.0;


// reset all to start 
stop();

// функция выполняющаяся при успешном рисовании круга
function correctStop() {
    console.log(percentage + " " + perfectRadius);
    if (maxPercentage < percentage && percentage !== 90) {
        maxPercentage = percentage;
    }
    bestText.textContent = `Best ${maxPercentage.toFixed(1) + "%"}`;
    stop();
}


// функция которая останавливает рисование и сбрасывает все параметры
function stop() {
    isPainting = false;
    lastX = 0;
    lastY = 0;
    lineWidth = 15;
    ctx.strokeStyle = "#00CE22";
    percentage = 90;
    i = 0;
    perfectRadius = -1;
    return;
}

// функция которая проверяет зажата ли правая или левая кнопка мыши
function detectLeftButton(evt) {
    evt = evt || window.event;
    if ("buttons" in evt) {
        return evt.buttons == 1;
    }
    var button = evt.which || evt.button;
    return button == 1;
}


// функция в которой высчитывается радиус точки до центра 
function radius(x, y) {
    let curDifX = x - dotX;
    let curDifY = y - dotY;
    let curRadius = Math.sqrt(Math.pow(curDifX, 2) + Math.pow(curDifY, 2));

    // если точка слишком близка (70 пикселей), то завершается и выводится ошибка "too close to dot"
    if (curRadius < 70) {
        percentageText.textContent = "X.XX%";
        bestText.textContent = "too close to dot";
        stop();
        return false;
    }

    // процент высчитывается через разницу между изначальным радиусом и каждой точкой
    // в зависимости от этого уменьшается или увеличивается радиус
    // в зависимости от разницы так же меняется цвет круга

    let ratio = Math.abs(curRadius - perfectRadius);
    percentageText.textContent = percentage.toFixed(1) + "%";
    if (ratio > 60) {
        ctx.strokeStyle = "#FF0000"; // red
        percentage -= 0.4;
    }
    else if (ratio > 40) {
        ctx.strokeStyle = "#F2680C"; // orange
        percentage -= 0.2;

    }
    else if (ratio > 20) {
        ctx.strokeStyle = "#FFBC00"; // slight orange
        percentage -= 0.1;
    }
    else if (ratio > 8) {
        ctx.strokeStyle = "#F3F308"; // yellow
        if (percentage <= 95) {
            percentage -= 0.08;
        }
    }
    else if (ratio > 4) {
        if (percentage <= 94.2) {
            percentage += 0.06;
        }
    }
    else {
        ctx.strokeStyle = "#00CE22"; // green
        if (percentage <= 99.9) {
            percentage += 0.1;
        }
    }

    // данный If создан для дорисовки линии между точками (если быстро рисовать круг то canvas не успевает рисовать и между точками
    // появляется отступы). Этот if создан для решения этой проблемы. Сравнение lastX == 0 и lastY == 0 потому что при новом рисунке 
    // lastX и lastY становятся равны 0

    if (!(lastX == 0 || lastY == 0)) {
        ctx.lineTo(lastX, lastY);
        ctx.stroke();
        ctx.beginPath();
    }

    // данные if else созданы для измены цвета при разном проценте
    if (percentage > 87) {
        percentageText.style.color = "#00CE22";
    }

    else if (percentage > 70) {
        percentageText.style.color = "#F2680C";

    }
    else if (percentage > 1) {
        percentageText.style.color = "#FF0000";
    }
    // если процент уходит за минус то выводит ошибку
    else {
        percentageText.textContent = "X.XX%";
        bestText.textContent = "it doesnt look like a circle";
        stop();
        return false;
    }
    ctx.stroke();
    ctx.beginPath();
    return true;
}

// функция для рисования
const draw = (e) => {
    if (!isPainting) {
        return;
    }
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineTo(e.clientX, e.clientY);
    ctx.stroke();

    if (radius(e.clientX, e.clientY)) {
        lastX = e.clientX;
        lastY = e.clientY;
    }


    // линия постоянно становится уже и когда достигает 5 выходит ошибка
    lineWidth -= 0.02;
    if (lineWidth < 5) {
        percentageText.textContent = "X.XX%";
        bestText.textContent = "too slow";
        stop();
    }

    // если пользователь дорисовывает круг
    i++;
    if (i > 30 && Math.abs(e.clientX - startX) < 30 && Math.abs(e.clientY - startY) < 10) {
        correctStop();
        return;
    }
}
canvas.addEventListener('mousedown', (e) => {
    if (detectLeftButton(e)) {
        bestText.textContent = "";
        isPainting = true;
        ctx.stroke();
        ctx.beginPath();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        startX = e.clientX;
        startY = e.clientY;

        // высчитывает изначальный радиус
        if (perfectRadius == -1) {
            difX = Math.abs(startX - dotX);
            difY = Math.abs(startY - dotY);
            perfectRadius = Math.sqrt(Math.pow(difX, 2) + Math.pow(difY, 2));
        }
    }
});


// если пользователь отжимает левую кнопку мыши
canvas.addEventListener('mouseup', (e) => {
    if (isPainting == true) {
        console.log("draw a full circle");
        percentageText.textContent = "X.XX%";
        bestText.textContent = "Draw a full circle!!!"
        stop();
    }
});

canvas.addEventListener('mousemove', draw);

