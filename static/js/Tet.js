const BLOCK_SIZE = 30;
// 1ブロックの大きさ

const PLAY_SCREEN_WIDTH = 10;
const PLAY_SCREEN_HEIGHT = 20;
// フィールドのサイズ

const CANVAS = document.getElementById('canvas');
// const -> ブロックスコープのローカル変数（定数）を宣言します。定数の値は代入演算子を使用して再代入することができませんが、定数がオブジェクトであった場合、そのプロパティを追加したり、更新したり、削除したりすることができます。
// document -> Webページそのものを表すオブジェクト。
// document.getElementById -> 引数として指定されたID属性を持つHTML要素をDOMツリーから検索
// -> この場合キャンバスIDの取得

// この作業によりHTMLを取得している

const CANVAS_2D = CANVAS.getContext('2d');
// 2Dコンテキストの取得
// 2次元図形を扱うことを宣言

const CANVAS_WIDTH = BLOCK_SIZE * PLAY_SCREEN_WIDTH;
const CANVAS_HEIGHT = BLOCK_SIZE * PLAY_SCREEN_HEIGHT;
CANVAS.width = CANVAS_WIDTH;
CANVAS.height = CANVAS_HEIGHT;
// CANVASのサイズ（プレイ画面のサイズ）
// 例: https://qiita-user-contents.imgix.net/https%3A%2F%2Fqiita-image-store.s3.ap-northeast-1.amazonaws.com%2F0%2F3128477%2Fea877e16-40d6-e1f4-df7a-e53b691bb567.png?ixlib=rb-4.0.0&auto=format&gif-q=60&q=75&s=83274f9b1bb3dd9540e7171bce2335c8

const TET_SIZE = 4;
// テトリミノ1辺の最長

let TETRO_TYPES = [
[
  // Z
  [0, 0, 0, 0],
  [1, 1, 0, 0],
  [0, 1, 1, 0],
  [0, 0, 0, 0],
],
[
  // S
  [0, 0, 0, 0],
  [0, 0, 1, 1],
  [0, 1, 1, 0],
  [0, 0, 0, 0],
],
[
  // I
  [0, 1, 0, 0],
  [0, 1, 0, 0],
  [0, 1, 0, 0],
  [0, 1, 0, 0],
],
[
  // J
  [0, 1, 0, 0],
  [0, 1, 0, 0],
  [0, 1, 1, 0],
  [0, 0, 0, 0],
],
[
  // L
  [0, 0, 1, 0],
  [0, 0, 1, 0],
  [0, 1, 1, 0],
  [0, 0, 0, 0],
],
[
  // T
  [0, 0, 0, 0],
  [1, 1, 1, 0],
  [0, 1, 0, 0],
  [0, 0, 0, 0],
],
[
  // O
  [0, 0, 0, 0],
  [0, 1, 1, 0],
  [0, 1, 1, 0],
  [0, 0, 0, 0],
],
];
// letはJavaScriptで宣言できるローカル変数

let tetroTypesIndex = Math.floor(Math.random() * 7);
// TETRO_TYPESのインデックス番号をランダム取得


let tetroMino = TETRO_TYPES[tetroTypesIndex];
// テトロミノを取得する
// 中身の数字でミノが変わる

let tetroMinoDistanceX = 0;
let tetroMinoDistanceY = 0;
// テトリミノの移動距離
// テトリミノの移動距離を変数に定義します。
// 生成時は移動していないので初期値は 0 となります。

const SCREEN =[];
// 画面本体
// 画面本体の描画をするうえで使う空の配列「SCREEN」を用意

const drawPlayScreen = () => {
// テトリスプレイ画面描画処理 = () =>{}; とは何？
// 解 -> Pythonでいう def drawPlayscreen():
  CANVAS_2D.fillStyle = '#000';
  // 背景色を黒に指定
  CANVAS_2D.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  // キャンバスを塗りつぶす（？）
  // CANVAS_2D.fillRect(100, 100, BLOCK_SIZE, BLOCK_SIZE);
  // x,y =100の場所に30×30のブロックを描画

  for (let y = 0; y < PLAY_SCREEN_HEIGHT; y++) {
    for (let x = 0; x < PLAY_SCREEN_WIDTH; x++) {
      if (SCREEN[y][x]) {
        drawBlock(x, y);
      }
    }
  }
  // 画面本体で動かせなくなったテトリミノを描画する



  for (let y = 0; y < TET_SIZE; y++) {
  // TET_SIZEが y より大きかったら yに+1
    for (let x = 0; x < TET_SIZE; x++) {
    // TET_SIZEが x より大きかったら xに+1
      if (tetroMino[y][x]) {
        drawBlock(tetroMinoDistanceX + x, tetroMinoDistanceY + y);
      // 該当するマスに 1 がある時に内部処理が走るようになっている
      }
    }
  }
  // テトリミノを描画する
  // 1度目の for ループ処理 for (let y = 0; y < TET_SIZE; y++) では16 マス正方形の Y 軸方向、
  // 2度目の for ループ for (let x = 0; x < TET_SIZE; x++) では X 軸方向を見ています。
  //  if (tet[y][x]) では該当するマスに 1 がある時に内部処理が走るようになっています。
  // Zミノでいうと、 (0-0) = tet[0][2] の値は 0 なので色付けはしない。（2－1）＝ tet[2][1]の値は 1 なので色付けが行われます。
};

const drawBlock = (x, y) => {
  let drawX = x * BLOCK_SIZE;
  let drawY = y * BLOCK_SIZE;

  // 塗りに赤を設定
  CANVAS_2D.fillStyle = '#E33';
  CANVAS_2D.fillRect(drawX, drawY, BLOCK_SIZE, BLOCK_SIZE);
  // 線の色を黒に設定
  CANVAS_2D.strokeStyle = 'black';
  CANVAS_2D.strokeRect(drawX, drawY, BLOCK_SIZE, BLOCK_SIZE);
};

const canMove = (moveX, moveY) => {
  for (let y = 0; y < TET_SIZE; y++) {
    for (let x = 0; x < TET_SIZE; x++) {
      if (tetroMino[y][x]) {
        // 現在のテトリミノの位置（tetroMinoDistanceX + x）に移動分を加える（＝移動後の座標）
        let nextX = tetroMinoDistanceX + x + moveX;
        let nextY = tetroMinoDistanceY + y + moveY;

        // 移動先にブロックがあるか判定
        if (
          nextY < 0 ||
          nextX < 0 ||
          nextY >= PLAY_SCREEN_HEIGHT ||
          nextX >= PLAY_SCREEN_WIDTH ||
          SCREEN[nextY][nextX]) {
          return false;
          // 移動後の座標にブロックまたは範囲外の場合falseを返す
        }
      }
    }
  }
  return true;
};

document.onkeydown = (e) => {
// 引数「e」には押されたキーの情報が格納されます。
  switch (e.code) {
  // プロパティ「e.code」には押されたキーの ID 値のようなモノが入っている
    case 'ArrowLeft':
      if (canMove(-1, 0)) tetroMinoDistanceX--;
      break;
    case 'ArrowUp':
      if (canMove(0, -1)) tetroMinoDistanceY--;
      break;
    case 'ArrowRight':
      if (canMove(1, 0)) tetroMinoDistanceX++;
      break;
    case 'ArrowDown':
      if (canMove(0, 1)) tetroMinoDistanceY++;
      break;
  }
  drawPlayScreen();
};

const CONTAINER = document.getElementById('container');
CONTAINER.style.width = CANVAS_WIDTH + 'px';
// 画面を真ん中にする

const init = () => {
  for (let y = 0; y < PLAY_SCREEN_HEIGHT; y++) {
    SCREEN[y] = [];
    for (let x = 0; x < PLAY_SCREEN_WIDTH; x++) {
      SCREEN[y][x] = 0;
    }
  }
// 初期化処理

  SCREEN[4][6] = 1;
  drawPlayScreen();
};

