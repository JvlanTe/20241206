// テトリスの設定
const COLS = 10;
const ROWS = 20;
const blockSize = 30;
const colors = ['#00FFFF', '#FF6347', '#FFFF00', '#008000', '#800080', '#FF4500', '#0000FF']; // 各色

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0)); // ゲームボード
let currentShape, heldShape = null, upcomingShapes = [];
let gameOver = false;

// テトリミノの形状
const tetrominoes = [
    [[1, 1, 1, 1]], // I
    [[1, 1], [1, 1]], // O
    [[1, 1, 0], [0, 1, 1]], // S
    [[0, 1, 1], [1, 1, 0]], // Z
    [[1, 0, 0], [1, 1, 1]], // L
    [[0, 0, 1], [1, 1, 1]], // J
    [[0, 1, 0], [1, 1, 1]]  // T
];

// ゲームボード描画
function drawBoard() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 画面をクリア

    // ゲームボードの背景を描画
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 既に置かれたブロックの描画
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (board[r][c] !== 0) {
                ctx.fillStyle = colors[board[r][c] - 1]; // 色を設定
                ctx.fillRect(c * blockSize, r * blockSize, blockSize, blockSize);
            }
        }
    }

    // 現在のミノを描画
    if (currentShape) {
        currentShape.shape.forEach((row, r) => {
            row.forEach((cell, c) => {
                if (cell) {
                    ctx.fillStyle = colors[currentShape.color]; // ミノの色
                    ctx.fillRect((currentShape.x + c) * blockSize, (currentShape.y + r) * blockSize, blockSize, blockSize);
                }
            });
        });
    }
}

// HOLDエリアに描画
function drawHold() {
    const holdCanvas = document.getElementById("holdCanvas");
    const holdCtx = holdCanvas.getContext("2d");
    holdCtx.clearRect(0, 0, holdCanvas.width, holdCanvas.height); // 画面をクリア

    if (heldShape !== null) {
        heldShape.shape.forEach((row, r) => {
            row.forEach((cell, c) => {
                if (cell) {
                    holdCtx.fillStyle = colors[heldShape.color];
                    holdCtx.fillRect(c * blockSize, r * blockSize, blockSize, blockSize);
                }
            });
        });
    } else {
        holdCtx.fillStyle = '#888'; // 空のHOLDエリアは灰色
        holdCtx.fillRect(0, 0, holdCanvas.width, holdCanvas.height);
    }
}

// NEXTエリアに描画
function drawNext() {
    const nextCanvas = document.getElementById("nextCanvas");
    const nextCtx = nextCanvas.getContext("2d");
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height); // 画面をクリア

    if (upcomingShapes.length > 0) {
        upcomingShapes[0].shape.forEach((row, r) => {
            row.forEach((cell, c) => {
                if (cell) {
                    nextCtx.fillStyle = colors[upcomingShapes[0].color];
                    nextCtx.fillRect(c * blockSize, r * blockSize, blockSize, blockSize);
                }
            });
        });
    }
}

// ミノをランダムに生成
function randomTetromino() {
    const randomIndex = Math.floor(Math.random() * tetrominoes.length);
    const shape = tetrominoes[randomIndex];
    return {
        shape: shape,
        color: randomIndex,
        x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
        y: 0
    };
}

// 次のミノをセットする
function getNextTetromino() {
    if (upcomingShapes.length === 0) {
        upcomingShapes = [randomTetromino()];
    }
    const next = upcomingShapes.shift();
    upcomingShapes.push(randomTetromino());
    return next;
}

// ミノが配置可能かを確認
function isValidMove(shape, xOffset, yOffset) {
    for (let r = 0; r < shape.shape.length; r++) {
        for (let c = 0; c < shape.shape[r].length; c++) {
            if (shape.shape[r][c]) {
                const x = shape.x + c + xOffset;
                const y = shape.y + r + yOffset;

                if (x < 0 || x >= COLS || y >= ROWS || (y >= 0 && board[y][x] !== 0)) {
                    return false;
                }
            }
        }
    }
    return true;
}

// ミノをボードに固定
function placeTetromino() {
    for (let r = 0; r < currentShape.shape.length; r++) {
        for (let c = 0; c < currentShape.shape[r].length; c++) {
            if (currentShape.shape[r][c]) {
                board[currentShape.y + r][currentShape.x + c] = currentShape.color + 1;
            }
        }
    }
}

// ラインを削除
function removeFullLines() {
    for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r].every(cell => cell !== 0)) {
            board.splice(r, 1);
            board.unshift(Array(COLS).fill(0)); // 新しい行を追加
        }
    }
}

// ゲームを開始する
function startGame() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    currentShape = getNextTetromino();
    heldShape = null;
    upcomingShapes = [];
    gameOver = false;
    drawBoard();
    drawHold();
    drawNext();
}

// 移動
function moveTetromino(direction) {
    if (isValidMove(currentShape, direction.x, direction.y)) {
        currentShape.x += direction.x;
        currentShape.y += direction.y;
        drawBoard();
    }
}

// 回転
function rotateTetromino() {
    const rotatedShape = {
        shape: currentShape.shape[0].map((_, i) => currentShape.shape.map(row => row[i])).reverse(),
        color: currentShape.color,
        x: currentShape.x,
        y: currentShape.y
    };
    if (isValidMove(rotatedShape, 0, 0)) {
        currentShape = rotatedShape;
        drawBoard();
    }
}

// ハードドロップ
function hardDrop() {
    while (isValidMove(currentShape, 0, 1)) {
        currentShape.y++;
    }
    placeTetromino();
    removeFullLines();
    currentShape = getNextTetromino();
    drawBoard();
    drawHold();
    drawNext();
}

// HOLD機能
function holdTetromino() {
    if (heldShape === null) {
        heldShape = currentShape;
        currentShape = getNextTetromino();
    } else {
        const temp = currentShape;
        currentShape = heldShape;
        heldShape = temp;
    }
    drawBoard();
    drawHold();
}

// イベントリスナー（ユーザー操作）
document.addEventListener("keydown", (e) => {
    if (gameOver) return;

    if (e.key === "ArrowLeft") {
        moveTetromino({ x: -1, y: 0 });
    } else if (e.key === "ArrowRight") {
        moveTetromino({ x: 1, y: 0 });
    } else if (e.key === "ArrowDown") {
        moveTetromino({ x: 0, y: 1 });
    } else if (e.key === "ArrowUp") {
        rotateTetromino();
    } else if (e.key === " ") {
        hardDrop();
    } else if (e.key === "Shift") {
        holdTetromino();
    }
});

// ゲーム開始
startGame();
