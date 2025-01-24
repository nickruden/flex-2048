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
            if (tile) {
                rowOrCol.push(tile);
            } else {
                rowOrCol.push({ value: 0 });
            }
        }
        const newRowOrCol = slideAndMerge(rowOrCol);
        for (let j = 0; j < GRID_SIZE; j++) {
            const tile = direction === "left" || direction === "up"
                ? tiles[direction === "up" ? j : i][direction === "left" ? j : i]
                : tiles[direction === "down" ? GRID_SIZE - 1 - j : i][direction === "right" ? GRID_SIZE - 1 - j : i];
            if (tile && tile.value !== newRowOrCol[j].value) {
                tile.value = newRowOrCol[j].value;
                moved = true;
            }
        }
    }
    return moved; // Возвращаем, было ли движение
}

// Слияние плиток
function slideAndMerge(rowOrCol) {
    let filtered = rowOrCol.filter(tile => tile && tile.value !== 0);
    for (let i = 0; i < filtered.length - 1; i++) {
        if (filtered[i].value === filtered[i + 1].value) {
            filtered[i].value *= 2;
            score += filtered[i].value; // Добавляем очки за слияние
            updateScore();
            filtered[i + 1].value = 0;
        }
    }
    filtered = filtered.filter(tile => tile.value !== 0);
    while (filtered.length < GRID_SIZE) {
        filtered.push({ value: 0 });
    }
    return filtered;
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
            if (tiles[row][col].value === 0) return; // Есть пустая клетка — игра продолжается
            if (col < GRID_SIZE - 1 && tiles[row][col].value === tiles[row][col + 1].value) return; // Возможно слияние по горизонтали
            if (row < GRID_SIZE - 1 && tiles[row][col].value === tiles[row + 1][col].value) return; // Возможно слияние по вертикали
        }
    }
    // Если дошли сюда, значит, проигрыш
    showLossModal();
}

// Проверка на лимит
function checkWin() {
    if (score >= 5048) {
        window.location.href = "win-page.html"; 
        return true;
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