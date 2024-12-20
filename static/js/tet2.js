// テトリミノクラス
class Tetrimino {
	// テトリミノのサイズ取得
	static getSize() {return 4;}

	// テトリミノの種類ごとのブロック位置を指定
	static getTypePointArray() {
		return [
			[[0,1],[1,1],[2,1],[3,1]], // 棒形
			[[1,0],[1,1],[2,0],[2,1]], // 正方形
			[[0,1],[1,0],[1,1],[2,0]], // S字
			[[0,0],[1,0],[1,1],[2,1]], // Z字
			[[0,0],[0,1],[1,1],[2,1]], // J字
			[[0,1],[1,1],[2,0],[2,1]], // L字
			[[0,1],[1,0],[1,1],[2,1]]  // T字
		];
	}

	// テトリミノの種類ごとのブロック位置を取得
	static getTypePoint(type) {
		return this.getTypePointArray()[type - 1];
	}

	// テトリミノの種類をランダムに取得
	static getRandomType() {
		return Math.floor(Math.random() * this.getTypePointArray().length) + 1;
	}

	// 回転時の回転範囲取得
	static getRotationSize(type) {
		if (type === 1) {
			return 3;
		} else if (type === 2) {
			return -1;
		}
		return 2;
	}

	constructor(tetrimino) {
		// クローン用
		if (tetrimino) {
			this.tbl = tetrimino.tbl;
			this.rotationSize = tetrimino.rotationSize;
			return;
		}
		// 配列初期化 0埋め
		this.tbl = new Array(this.constructor.getSize());
		for(let x = 0; x < this.constructor.getSize(); x++) {
			this.tbl[x] = new Array(this.constructor.getSize()).fill(0);
		}
		const type = this.constructor.getRandomType();
		// 配列に初期ブロック位置を指定
		const typePoint = this.constructor.getTypePoint(type);
		for(let i = 0; i < typePoint.length; i++) {
			const point = typePoint[i];
			this.tbl[point[0]][point[1]] = type;
		}
		// 回転時の回転範囲
		this.rotationSize = this.constructor.getRotationSize(type);
	}

	// クローン
	clone() {
		return new this.constructor(this);
	}

	// テトリミノ右回転
	rightRotation() {
		// 正方形の場合は回転しない
		if (this.rotationSize === -1) {
			return;
		}
		// 新規配列初期化 0埋め
		const newtbl = new Array(this.constructor.getSize());
		for(let x = 0; x < this.constructor.getSize(); x++) {
			newtbl[x] = new Array(this.constructor.getSize()).fill(0);
		}
		// 右回転
		for (let i = 0; i <= this.rotationSize; i++) {
			for (let j = 0; j <= this.rotationSize; j++) {
				newtbl[i][j] = this.tbl[j][this.rotationSize-i];
			}
		}
		this.tbl = newtbl;
	}

	// テトリミノ左回転
	leftRotation() {
		// 右回転と同様のため省略
	}

	// 該当ポイントのデータを返す
	getPointBlock(x, y) {
		return this.tbl[x][y];
	}
}

// フィールドクラス
class Field {

	constructor(width, height, nextCount, tetriminoClass) {
		this.width = width; // フィールドの幅
		this.height = height; // フィールドの高さ
		this.nextCount = nextCount; // 次のテトリミノの数
		this.tetriminoClass = tetriminoClass; // テトリミノのクラス
		// フィールド初期化
		this.tbl = new Array(width);
		for(let x = 0; x < width; x++) {
			this.tbl[x] = new Array(height).fill(0);
		}
		// テトリミノ初期化
		this.tetrimino = new this.tetriminoClass();
		this.nextTetrimino = new Array(this.nextCount);
		for(let i = 0; i < this.nextCount; i++) {
			this.nextTetrimino[i] = new this.tetriminoClass();
		}
		// 開始位置設定
		this.initStartPosition();
		this.setStartPosition();
		this.gameOverFlg = false;
	}

	// テトリミノ開始位置初期設定
	initStartPosition() {
		this.startPositionX = Math.floor(this.width / 2) - 2; // テトリミノ開始位置X座標
		this.startPositionY = -1; // テトリミノ開始位置Y座標
	}

	// テトリミノ開始位置設定
	setStartPosition() {
		this.positionX = this.startPositionX;
		this.positionY = this.startPositionY;
	}

	// 指定座標のブロックを取得
	getPositionBlock(x, y) {
		// 該当座標にテトリミノがあればテトリミノのブロックを返す
		if (this.positionX <= x && x < this.positionX + this.tetriminoClass.getSize()
				&& this.positionY <= y && y < this.positionY + this.tetriminoClass.getSize()
				&& this.tetrimino.getPointBlock(x - this.positionX, y - this.positionY) > 0) {
			return this.tetrimino.getPointBlock(x - this.positionX, y - this.positionY);
		}
		return this.tbl[x][y];
	}

	// 次のテトリミノを取得
	getNextTetrimino() {
		return this.nextTetrimino;
	}

	// テトリミノ右回転
	rightRotation() {
		const newTetrimino = this.tetrimino.clone();
		newTetrimino.rightRotation();
		if (this.fieldCheck (this.positionX, this.positionY, newTetrimino)) {
			this.tetrimino = newTetrimino;
		}
	}

	// テトリミノ左回転
	leftRotation() {
		// 右回転と同様のため省略
	}

	// テトリミノ右移動
	rightMove() {
		if (this.fieldCheck (this.positionX + 1, this.positionY, this.tetrimino)) {
			this.positionX += 1;
		}
	}

	// テトリミノ左移動
	leftMove() {
		if (this.fieldCheck (this.positionX - 1, this.positionY, this.tetrimino)) {
			this.positionX -= 1;
		}
	}

	// テトリミノ下移動
	down() {
		if (this.fieldCheck (this.positionX, this.positionY + 1, this.tetrimino)) {
			this.positionY += 1;
			return false;
		} else {
			// 移動できなければフィールドに固定
			this.fixation();
			return true;
		}
	}

	// フィールドとテトリミノが被っていないか判定処理
	fieldCheck (x, y, tetrimino) {
		for (let i = 0; i < this.tetriminoClass.getSize(); i++) {
			for (let j = 0; j < this.tetriminoClass.getSize(); j++) {
				if (tetrimino.getPointBlock(i, j) > 0) {
					if (x + i < 0 || x + i >= this.width || y + j >= this.height) {
						return false;
					} else if (this.tbl[x + i][y + j] > 0) {
						return false;
					}
				}
			}
		}
		return true;
	}

	// フィールド固定処理
	fixation() {
		// テトリミノをフィールドに固定
		for (let i = 0; i < this.tetriminoClass.getSize(); i++) {
			for (let j = 0; j < this.tetriminoClass.getSize(); j++) {
				if (this.tetrimino.getPointBlock(i, j) > 0) {
					if (this.positionY + j >= 0) {
						// ブロックをフィールドに設定
						this.tbl[this.positionX + i][this.positionY + j] = this.tetrimino.getPointBlock(i, j);
					}
				}
			}
		}

		// 行チェック処理
		this.lineCount = 0;
		for (let y = 0; y < this.height; y++) {
			let lineFlg = true;
			for (let x = 0; x < this.width; x++) {
				if (this.getPositionBlock(x, y) <= 0) {
					lineFlg = false;
					break;
				}
			}
			if (lineFlg) {
				// 消された行から上を下に移動
				for (let i = y; i >= 0; i--) {
					for (let j = 0; j < this.width; j++) {
						this.tbl[j][i] = this.tbl[j][i-1];
					}
				}
				for (let j = 0; j < this.width; j++) {
					this.tbl[j][0] = 0;
				}
				this.lineCount++;
			}
		}

		// フィールドからはみ出ているブロックを処理
		if (this.positionY < 0) {
			for (let i = 0; i < this.tetriminoClass.getSize(); i++) {
				for (let j = 0; this.positionY + j < 0; j++) {
					if (this.tetrimino.getPointBlock(i, j) > 0) {
						if (this.positionY + j + this.lineCount < 0) {
							// 最終的にはみ出ている場合はゲームオーバー
							this.gameOverFlg = true;
						} else {
							// ブロックをフィールドに設定
							this.tbl[this.positionX + i][this.positionY + j + this.lineCount] = this.tetrimino.getPointBlock(i, j);
						}
					}
				}
			}
		}

		// テトリミノを非表示
		this.positionY = this.height + 1;

		if (!this.gameOverFlg && !this.fieldCheck (this.startPositionX, this.startPositionY, this.nextTetrimino[0])) {
			// 次に出てくるテトリミノと重なる場合はゲームオーバー
			this.gameOverFlg = true;
		}
	}

	// 直前に消された行数を取得
	getLineCount() {
		return this.lineCount;
	}

	// 次のテトリミノを表示
	next() {
		if (!this.gameOverFlg) {
			// 次のテトリミノを設定
			this.tetrimino = this.nextTetrimino[0];
			for (let i = 0; i < this.nextTetrimino.length - 1; i++) {
				this.nextTetrimino[i] = this.nextTetrimino[i + 1];
			}
			this.nextTetrimino[this.nextTetrimino.length - 1] =  new this.tetriminoClass();
			this.setStartPosition();
		}
	}

	// ゲームオーバーを判定
	checkGameOver() {
		return this.gameOverFlg;
	}

}

// ビュークラス
class View {

	// ブロックの種類ごとの色を指定
	static getTypeColorArray() {
		// 省略
	}

	constructor(width, height, nextCount, tetriminoClass) {
		this.width = width;
		this.height = height;
		this.nextCount = nextCount;
		this.tetriminoClass = tetriminoClass;
		// 画面表示初期化
		this.initFieldView();
		this.initNextTetriminoView();
	}

	// フィールド表示初期化
	initFieldView() {
		// 省略
	}

	// 次テトリミノ表示初期化
	initNextTetriminoView() {
		// 省略
	}

	// フィールド表示更新
	viewField(field) {
		// 省略
	}

	// 次テトリミノ表示更新
	viewNextTetrimino(tetrimino) {
		// 省略
	}

	// スコア、ライン、レベル表示更新
	viewScore (score, line, level) {
		// 省略
	}

	// メッセージ表示
	viewMessage (type) {
		let message = "";
		switch (type) {
		case 1:
			message = "SINGLE!"
			break;
		case 2:
			message = "DOUBLE!"
			break;
		case 3:
			message = "TRIPLE!"
			break;
		case 4:
			message = "TETRIS!"
			break;
		case -1:
			message = "GAME OVER!"
			break;
		}
		$('#message').text(message);
	}
}

// ゲームクラス
class Game {
	// 使用するテトリミノクラスを取得
	static getTetriminoClass() {
		return Tetrimino;
	}

	// 使用するフィールドクラスを取得
	static getFieldClass() {
		return Field;
	}

	// 使用するビュークラスを取得
	static getViewClass() {
		return View;
	}

	static getWidth() {return 10;}
	static getHeight() {return 20;}
	static getNextCount() {return 3;}
	static getScoreTable() {return [0, 10, 30, 60, 100];}

	constructor() {
		const viewClass = this.constructor.getViewClass();
		this.view = new viewClass(this.constructor.getWidth(), this.constructor.getHeight(), this.constructor.getNextCount(), this.constructor.getTetriminoClass());
		this.startSettings();
		this.view.viewScore (this.score, this.line, this.level)
		this.stopFlg = true;
	}

	startSettings() {
		this.score = 0; // 初期スコア
		this.line = 0;
		this.level = 1;
		this.downTime = 2000; // 初期落下時間 2秒
		this.nextTime = 500; // 初期固定後時間 0.5秒
	}

	// startボタン操作
	startButton() {
		clearTimeout(this.timeout); // 落下時間キャンセル
		clearTimeout(this.nextTimeout); // 固定時間キャンセル
		const fieldClass = this.constructor.getFieldClass();
		this.field = new fieldClass(this.constructor.getWidth(), this.constructor.getHeight(), this.constructor.getNextCount(), this.constructor.getTetriminoClass());
		this.startSettings();
		this.stopFlg = false; // 操作停止フラグ
		// 表示更新
		this.view.viewField(this.field)
		this.view.viewNextTetrimino(this.field.getNextTetrimino());
		this.view.viewScore (this.score, this.line, this.level)
		this.view.viewMessage(0);
		const self = this;
		this.timeout = setTimeout(function(){self.down()},this.downTime); // 自動落下処理
	}

	// 落下時間更新
	updateDownTime() {
		this.downTime = 2000 - (this.level - 1) % 20 * 100 - Math.floor((this.level - 1) / 20) * 10;
	}

	// 固定後時間更新
	updateNextTime() {
		this.nextTime = 500 - Math.floor((this.level - 1) / 20) * 50;
	}

	updateScore() {
		this.score += this.constructor.getScoreTable()[this.field.getLineCount()];
	}

	updateLevel() {
		this.level = Math.floor(this.line / 10) + 1;
	}

	// 右回転操作
	rightRotationButton() {
		if (!this.stopFlg) {
			this.field.rightRotation();
			this.view.viewField(this.field);
		}
	}

	// 左回転操作
	leftRotationButton() {
		// 右回転操作と同様のため省略
	}

	// 右移動操作
	rightMoveButton() {
		// 右回転操作と同様のため省略
	}

	// 左移動操作
	leftMoveButton() {
		// 右回転操作と同様のため省略
	}

	// 下移動操作
	downButton() {
		if (!this.stopFlg) {
			this.down();
		}
	}

	// 下移動処理
	down() {
		// 他の自動落下処理をキャンセル
		clearTimeout(this.timeout);
		const self = this;
		// 下移動処理
		if(this.field.down()) {
			// ブロックが固定された場合
			// 操作受付を停止
			this.stopFlg = true;
			// スコア更新
			this.line += this.field.getLineCount();
			this.updateScore();
			this.updateLevel();
			// 表示更新
			this.view.viewField(this.field);
			this.view.viewScore (this.score, this.line, this.level)
			this.view.viewMessage(this.field.getLineCount());
			// 落下時間、固定後時間更新
			this.updateDownTime();
			this.updateNextTime();
			// ゲームオーバーの場合はゲームオーバー表示して終了
			if (this.field.checkGameOver()) {
				this.view.viewMessage(-1);
				return;
			}
			// 指定時間後に次処理呼出
			this.nextTimeout = setTimeout(function(){self.next()}, this.nextTime);
		} else {
			// 下移動できた場合
			// 表示更新
			this.view.viewField(this.field);
			// 自動落下処理
			this.timeout = setTimeout(function(){self.down()},this.downTime);
		}
	}

	// 次処理
	next() {
		// 他の次処理をキャンセル
		clearTimeout(this.nextTimeout);
		// 操作受付を再開
		this.stopFlg = false;
		// フィールドの次処理呼出
		this.field.next();
		// 表示更新
		this.view.viewField(this.field);
		this.view.viewNextTetrimino(this.field.getNextTetrimino());
		// 自動落下処理
		const self = this;
		this.timeout = setTimeout(function(){self.down()},this.downTime);
	}

}

// コントローラー
$(function () {
	var game = new Game();

    $(document).on('keydown', function(e) {
    	// Xボタン
        if(e.keyCode === 88) {
        	game.rightRotationButton();
        }
        // Zボタン
        if(e.keyCode === 38) {
        	game.leftRotationButton();
        }
        // ←ボタン
        if(e.keyCode === 37) {
        	game.leftMoveButton();
        }
        // →ボタン
        if(e.keyCode === 39) {
        	game.rightMoveButton();
        }
        // ↓ボタン
        if(e.keyCode === 40) {
        	game.downButton();
        }
        // Shiftボタン
        if(e.keyCode === 16) {
        	game.holdeButton();
        }
    });

    // スタートボタン
    $("#start").on('click', function() {
    	game.startButton();
    });
});

// フィールド拡張クラス
class HoldableField extends Field {
	constructor(width, height, nextCount, tetriminoClass) {
		super(width, height, nextCount, tetriminoClass);
		this.holdTetrimino = null;
		this.holdFlg = false;
		this.tmpTetrimino = this.tetrimino.clone(); // ホールド用の初期状態テトリミノ
	}

	// 保持テトリミノを取得
	getHoldTetrimino() {
		return this.holdTetrimino;
	}

	// テトリミノ保持
	hold() {
		if (this.holdFlg) {
			return false;
		}
		this.holdFlg = true;
		if (this.holdTetrimino !== null) {
			// 保持テトリミノを設定
			this.tetrimino = this.holdTetrimino;
			this.positionX = this.startPositionX;
			this.positionY = this.startPositionY;
		} else {
			super.next();
		}
		this.holdTetrimino = this.tmpTetrimino;
		return true;
	}

	// 次のテトリミノを表示
	next() {
		super.next();
		this.holdFlg = false;
		this.tmpTetrimino = this.tetrimino.clone();
	}
}

// ビュー拡張クラス
class HoldableView extends View {

	constructor(width, height, nextCount, tetriminoClass) {
		super(width, height, nextCount, tetriminoClass);
		this.initHoldTetriminoView();
	}

	// 保持テトリミノ表示初期化
	initHoldTetriminoView() {
		// 省略
	}

	// 保持テトリミノ表示更新
	viewHoldTetrimino(tetrimino) {
		// 省略
	}
}

// ゲーム拡張クラス
class HoldableGame extends Game {

	static getFieldClass() {
		return HoldableField;
	}

	static getViewClass() {
		return HoldableView;
	}

	// 保持操作
	holdeButton() {
		if (!this.stopFlg) {
			if (this.field.hold()) {
				this.view.viewField(this.field);
				this.view.viewHoldTetrimino(this.field.getHoldTetrimino());
			}
		}
	}
}
