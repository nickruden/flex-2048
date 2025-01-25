const GRID_SIZE = 4; // Размер сетки 4x4
const gameBox = document.getElementById("gameBox");
const scoreElement = document.getElementById("score");
const lossModal = document.querySelector(".loss-modal");
const restartButton = document.querySelector(".loss-modal__button");
let tiles = [];
let score = 0;

// Инициализация игры
function init() {
    createGrid();
    addRandomTile();
    addRandomTile();
    updateGrid();
    document.addEventListener("keydown", handleInput);
    setupSwipe();
}

// Создание сетки
function createGrid() {
    for (let row = 0; row < GRID_SIZE; row++) {
        tiles[row] = [];
        for (let col = 0; col < GRID_SIZE; col++) {
            const tile = document.createElement("div");
            tile.classList.add("tile");
            gameBox.appendChild(tile);
            tiles[row][col] = { element: tile, value: 0 };
        }
    }
}

// Добавление случайной плитки (2 или 4)
function addRandomTile() {
    const emptyTiles = [];
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (tiles[row][col].value === 0) {
                emptyTiles.push({ row, col });
            }
        }
    }
    if (emptyTiles.length > 0) {
        const { row, col } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
        tiles[row][col].value = Math.random() < 0.9 ? 2 : 4;
    }
}

// Обновление отображения сетки
function updateGrid() {
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const tile = tiles[row][col];
            tile.element.textContent = tile.value !== 0 ? tile.value : "";
            tile.element.dataset.value = tile.value;
        }
    }
}

// Обработка ввода (движение плиток)
function handleInput(event) {
    let moved = false; // Флаг, указывающий, было ли движение

    switch (event.key) {
        case "ArrowUp":
            moved = moveTiles("up");
            break;
        case "ArrowDown":
            moved = moveTiles("down");
            break;
        case "ArrowLeft":
            moved = moveTiles("left");
            break;
        case "ArrowRight":
            moved = moveTiles("right");
            break;
        default:
            return; // Выходим, если нажата не стрелка
    }

    // Добавляем новую плитку только если было движение
    if (moved) {
        addRandomTile();
        updateGrid();

        // Проверяем победу
        if (checkWin()) {
            return; // Игра завершена, переход на win-page
        }

        checkGameOver();
    }
}

// Движение плиток
function moveTiles(direction) {
    let moved = false;
    for (let i = 0; i < GRID_SIZE; i++) {
        const rowOrCol = [];
        for (let j = 0; j < GRID_SIZE; j++) {
            let tile;
            if (direction === "left" || direction === "up") {
                tile = tiles[direction === "up" ? j : i][direction === "left" ? j : i];
            } else {
                tile = tiles[direction === "down" ? GRID_SIZE - 1 - j : i][direction === "right" ? GRID_SIZE - 1 - j : i];
            }
            rowOrCol.push(tile);
        }
        const newRowOrCol = slideAndMerge(rowOrCol);
        for (let j = 0; j < GRID_SIZE; j++) {
            const tile = direction === "left" || direction === "up"
                ? tiles[direction === "up" ? j : i][direction === "left" ? j : i]
                : tiles[direction === "down" ? GRID_SIZE - 1 - j : i][direction === "right" ? GRID_SIZE - 1 - j : i];
            if (tile.value !== newRowOrCol[j].value) {
                tile.value = newRowOrCol[j].value;
                moved = true;
            }
        }
    }
    return moved; // Возвращаем, было ли движение
}

// Слияние плиток
function slideAndMerge(rowOrCol) {
    // Фильтруем плитки, убирая пустые
    let filtered = rowOrCol.filter(tile => tile.value !== 0);
    let merged = []; // Массив для хранения результата слияния
    let i = 0;

    while (i < filtered.length) {
        if (i < filtered.length - 1 && filtered[i].value === filtered[i + 1].value) {
            // Если текущая плитка равна следующей, объединяем их
            const mergedValue = filtered[i].value * 2;
            merged.push({ value: mergedValue });
            score += mergedValue; // Обновляем счёт только при слиянии
            updateScore();
            i += 2; // Пропускаем следующую плитку, так как она уже объединена
        } else {
            // Если слияния нет, просто добавляем плитку
            merged.push({ value: filtered[i].value });
            i += 1;
        }
    }

    // Заполняем оставшиеся клетки пустыми значениями
    while (merged.length < GRID_SIZE) {
        merged.push({ value: 0 });
    }

    return merged;
}

// Обновление счёта
function updateScore() {
    scoreElement.textContent = score;
}

// Показ модального окна при проигрыше
function showLossModal() {
    lossModal.style.display = "flex";
}

// Скрытие модального окна и перезапуск игры
restartButton.addEventListener("click", () => {
    lossModal.style.display = "none";
    resetGame();
});


function resetGame() {
        // Очищаем поле
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                tiles[row][col].value = 0;
            }
        }
    
    // Сбрасываем счёт
    score = 0;
    updateScore();

    // Добавляем две начальные плитки
    addRandomTile();
    addRandomTile();

    // Обновляем отображение сетки
    updateGrid();
}

// Проверка на проигрыш
function checkGameOver() {
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (tiles[row][col].value === 0) return { isGameOver: false, shouldShowModal: false }; // Есть пустая клетка — игра продолжается
            if (col < GRID_SIZE - 1 && tiles[row][col].value === tiles[row][col + 1].value) return { isGameOver: false, shouldShowModal: false }; // Возможно слияние по горизонтали
            if (row < GRID_SIZE - 1 && tiles[row][col].value === tiles[row + 1][col].value) return { isGameOver: false, shouldShowModal: false }; // Возможно слияние по вертикали
        }
    }
    // Если дошли сюда, значит, проигрыш
    const currentScore = scoreElement.textContent;
    if (currentScore >= 1024) {
        return { isGameOver: true, shouldShowModal: false }; // Переход на страницу победы
    } else {
        return { isGameOver: true, shouldShowModal: true }; // Показ модального окна проигрыша
    }
}

// Проверка на лимит
function checkWin() {
    console.log(scoreElement.textContent); // Для отладки
    const currentScore = scoreElement.textContent; // Получаем текущий счёт как число

    // Проверяем, достиг ли игрок 5048 очков
    if (currentScore >= 5048) {
        sessionStorage.removeItem("score");
        sessionStorage.setItem("score", currentScore.toString()); // Сохраняем счёт в sessionStorage
        window.location.href = "win-page.html"; // Переход на страницу победы
        return true;
    }

    // Проверяем, закончились ли ходы
    const gameOverResult = checkGameOver();
    console.log(gameOverResult)
    if (gameOverResult.isGameOver) {
        if (currentScore >= 1024) {
            // Переход на страницу победы
            sessionStorage.removeItem("score");
            sessionStorage.setItem("score", currentScore.toString()); // Сохраняем счёт в sessionStorage
            window.location.href = "win-page.html"; // Переход на страницу победы
            return true;
        } else {
            // Показ модального окна проигрыша
            if (gameOverResult.shouldShowModal) {
                showLossModal();
            }
            return false;
        }
    }

    return false; // Игра продолжается
}

// Настройка свайпов
function setupSwipe() {
    const hammer = new Hammer(gameBox);
    hammer.get('swipe').set({ direction: Hammer.DIRECTION_ALL });

    hammer.on("swipeleft", () => {
        moveTiles("left");
        addRandomTile();
        updateGrid();
        checkGameOver();
    });

    hammer.on("swiperight", () => {
        moveTiles("right");
        addRandomTile();
        updateGrid();
        checkGameOver();
    });

    hammer.on("swipeup", () => {
        moveTiles("up");
        addRandomTile();
        updateGrid();
        checkGameOver();
    });

    hammer.on("swipedown", () => {
        moveTiles("down");
        addRandomTile();
        updateGrid();
        checkGameOver();
    });
}

// Запуск игры
init();