// Classes:
class Board {
    constructor() {
        this.board = [
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '']
        ];
        this.pieces = [];
    }

    setupBoard() {
        const boardElement = document.getElementById('board');
        let tileNum = 1;
        for (let row = 0; row < this.board.length; row++) {
            for (let col = 0; col < this.board.length; col++) {

                const tile = document.createElement('div');
                tile.classList.add('Tile');
                tile.setAttribute('id', tileNum);

                const movementShownDiv = document.createElement('div');
                movementShownDiv.setAttribute('id', `${tileNum}-can-move`);
                movementShownDiv.style.fontSize = '15px';

                if ((row + col) % 2 === 0) tile.classList.add('black');
                else tile.classList.add('white');

                tile.appendChild(movementShownDiv);
                boardElement.appendChild(tile);

                tileNum++;
            }
        }
    }

    resetBoard() {
        this.board = [
            ['rook-b', 'knight-b', 'bishop-b', 'queen-b', 'king-b', 'bishop-b', 'knight-b', 'rook-b'],
            ['pawn-b', 'pawn-b', 'pawn-b', 'pawn-b', 'pawn-b', 'pawn-b', 'pawn-b', 'pawn-b'],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['pawn-w', 'pawn-w', 'pawn-w', 'pawn-w', 'pawn-w', 'pawn-w', 'pawn-w', 'pawn-w'],
            ['rook-w', 'knight-w', 'bishop-w', 'queen-w', 'king-w', 'bishop-w', 'knight-w', 'rook-w']
        ];
    }

    renderPieces() {
        for (let piece = 0; piece < this.pieces.length; piece++) {
            this.pieces[piece].Render(this.board);
        }
    }

    updateBoard() {
        this.deletePieces();
        let tileNum = 1;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.board[row][col] !== '') {
                    let piece = new Piece(this.board[row][col], tileNum, [row, col]); // Create a new piece in that position
                    this.pieces.push(piece);
                }
                tileNum++;
            }
        }
        this.renderPieces();
    }

    updateMiscellaneous() {
        const capturedWhites = document.getElementById('captured-whites');
        const capturedBlacks = document.getElementById('captured-blacks');

        capturedWhites.innerHTML = '';
        let whiteHeading = document.createElement('h4');
        whiteHeading.className = 'text-white';
        whiteHeading.innerHTML = 'Whites Captured Pieces';
        capturedWhites.appendChild(whiteHeading);

        capturedBlacks.innerHTML = '';
        let blackHeading = document.createElement('h4');
        blackHeading.className = 'text-white';
        blackHeading.innerHTML = 'Blacks Captured Pieces';
        capturedBlacks.appendChild(blackHeading);

        for (let type of whiteCapturedPieces) {
            let piece = document.createElement('i');
            piece.className = `fa-solid fa-chess-${type.slice(0, -2)} mx-1`;
            capturedWhites.appendChild(piece);
        }

        for (let type of blackCapturedPieces) {
            let piece = document.createElement('i');
            piece.className = `fa-solid fa-chess-${type.slice(0, -2)} mx-1`;
            piece.style.color = 'rgb(200, 200, 200)';
            capturedBlacks.appendChild(piece);
        }

    }

    deletePieces() {
        // Delete all the event listeners from the previous pieces
        this.pieces.forEach((piece) => {
            piece.delete();
        })
        this.pieces = [];

        // Remove previous icon positions
        for (let i = 1; i < 65; i++) {
            const tile = document.getElementById(i);
            const canMoveElement = document.getElementById(`${i}-can-move`);
            if (tile.lastChild !== canMoveElement) {
                tile.removeChild(tile.lastChild);
            }
        }
    }

    isCheck(row, col) {

    }

}

class Piece {
    constructor(type, tileNum, [row, col]) {

        this.type = type.slice(0, -2);
        this.tileNum = tileNum;

        this.row = row;
        this.col = col;

        if (type[type.length - 1] === 'b') this.color = 'black';
        else this.color = 'white';

        this.tile = document.getElementById(tileNum);

        if (this.type === 'king') this.piece = new King(this.color, this.row, this.col);
        if (this.type === 'queen') this.piece = new Queen(this.color, this.row, this.col);
        if (this.type === 'bishop') this.piece = new Bishop(this.color, this.row, this.col);
        if (this.type === 'knight') this.piece = new Knight(this.color, this.row, this.col);
        if (this.type === 'rook') this.piece = new Rook(this.color, this.row, this.col);
        if (this.type === 'pawn') this.piece = new Pawn(this.color, this.row, this.col);

        this.clickHandler;
    }

    // Creates the piece in HTML via icons
    createPiece(type) {
        let piece = document.createElement('i');
        piece.className = `fa-solid fa-chess-${type}`;
        if (this.color === 'white') {
            piece.style.color = 'rgb(200, 200, 200)';
        }
        return piece;
    }

    // Injects the piece into HTML
    Render() {
        this.tile.appendChild(this.createPiece(this.type)); 
        if (this.color == 'white' && whitesTurn) this.setClickEvent();  
        if (this.color == 'black' && !whitesTurn) this.setClickEvent();     
    }

    // Makes it possible for user to move / interact with the board
    setClickEvent() {
        let possibleMoves = this.piece.getMoves(GameBoard.board);
        this.clickHandler = () => {
            clearPossibleMoves();
            if (this.type === 'pawn') { // Pawns have a special case
                for (const move of possibleMoves) {
                    this.showMoves(move.canMoveRow, move.canMoveCol, move.enPassant, move.EPCoords);
                }
            } else {
                for (const move of possibleMoves) {
                    this.showMoves(move.canMoveRow, move.canMoveCol);
                }
            }
        }
        this.tile.addEventListener('click', this.clickHandler);
    }

    // Shows the Moves to the Players
    showMoves(canMoveRow, canMoveCol, enPassant = false, EPCoords = []) {
        let currentTile = 1
        for (let row = 0; row < GameBoard.board.length; row++) {
            for (let col = 0; col < GameBoard.board.length; col++) {

                if (row === canMoveRow && col === canMoveCol) {

                    const tile = document.getElementById(`${currentTile}-can-move`);
                    if (enPassant) tile.innerText = 'En Passant';
                    tile.onclick = () => {
                        this.movePiece(canMoveRow, canMoveCol, enPassant, EPCoords);
                    }
                    tile.classList.add('canMove');

                }

                currentTile++;
            }
        }

    }

    // Makes the shown moves work based on click
    movePiece(canMoveRow, canMoveCol, enPassant, EPCoords) {
        movedUp2 = false;
        enPassantCoords = [];
        let  board = GameBoard.board;

        if (this.type === 'pawn') {

            if (canMoveRow === 0) { // Promotion (FOR WHITE PAWN)
                showPromotionPopup((promotionChoice) => {
                    this.type = `${promotionChoice}-w`;
                    board[canMoveRow][canMoveCol] = `${promotionChoice}-w`;
                    GameBoard.updateBoard();
                });
            }
            if (canMoveRow === 7) { // Promotion (FOR BLACK PAWN)
                showPromotionPopup((promotionChoice) => {
                    this.type = `${promotionChoice}-b`;
                    board[canMoveRow][canMoveCol] = `${promotionChoice}-b`;
                    GameBoard.updateBoard();
                });
            }

            // En Passant Check
            if ((canMoveRow - this.row) === -2 || (canMoveRow - this.row) === 2) { // if moved up 2
                movedUp2 = true;
                enPassantCoords = [canMoveRow, canMoveCol];
            }

            if (enPassant === true) {
                if (isBlack(board[EPCoords[0]][EPCoords[1]], false)) {
                    whiteCapturedPieces.push(board[EPCoords[0]][EPCoords[1]]);
                } else {
                    blackCapturedPieces.push(board[EPCoords[0]][EPCoords[1]]);
                }
                board[EPCoords[0]][EPCoords[1]] = '';
            }

        }

        // Remove words for special cases
        for (let i = 1; i < 65; i++) {
            const canMoveElement = document.getElementById(`${i}-can-move`);
            canMoveElement.innerText = '';
        }

        if (board[canMoveRow][canMoveCol] != '' && isBlack(board[canMoveRow][canMoveCol])) {
            whiteCapturedPieces.push(board[canMoveRow][canMoveCol]);
        }
        if (board[canMoveRow][canMoveCol] != '' && !isBlack(board[canMoveRow][canMoveCol])) {
            blackCapturedPieces.push(board[canMoveRow][canMoveCol]);
        }

        let piece = board[this.row][this.col] // Take piece
        board[canMoveRow][canMoveCol] = piece; // Move it to its new position
        board[this.row][this.col] = ''; // Delete the piece from it's old position
        whitesTurn = !whitesTurn;
        clearPossibleMoves();
        GameBoard.updateBoard();
    }

    // Deletes click events
    delete() {
        if (this.clickHandler) this.tile.removeEventListener('click', this.clickHandler);
    }
}

class King {

    constructor(color, row, col) {

        this.color = color;

        // Will help me change the logic for the based off color
        if (this.color === "white") this.reverse = false;
        else this.reverse = true;

        this.row = row;
        this.col = col;
        this.possibleMoves = [];
    }

    getMoves(board) {
        const kingMoves = [
            { row: this.row - 1, col: this.col }, // Up
            { row: this.row + 1, col: this.col }, // Down
            { row: this.row, col: this.col - 1 }, // Left
            { row: this.row, col: this.col + 1 }, // Right
            { row: this.row - 1, col: this.col + 1 }, // Top Right
            { row: this.row - 1, col: this.col - 1 }, // Top Left
            { row: this.row + 1, col: this.col + 1 }, // Bottom Right
            { row: this.row + 1, col: this.col - 1 } // Bottom Left
        ];

        for (const move of kingMoves) {
            // Check if the destination tile is within the range of the board
            if (move.row >= 0 && move.row < 8 && move.col >= 0 && move.col < 8) {
                // Check if the destination tile is empty or contains an enemy piece
                if (board[move.row][move.col] === '' || isBlack(board[move.row][move.col], this.reverse)) {
                    this.setMove(move.row, move.col);
                }
            }
        }

        return this.possibleMoves;
    }

    setMove(canMoveRow, canMoveCol) {
        this.possibleMoves.push(
            {
                canMoveRow: canMoveRow,
                canMoveCol: canMoveCol,
                currentPos: [this.row, this.col]
            }
        );   
    }

}

class Queen {

    constructor(color, row, col) {

        this.color = color;

        // Will help me change the logic for the based off color
        if (this.color === "white") {
            this.enemyKing = 'king-b';
            this.reverse = false;
        } else {
            this.enemyKing = 'king-w';
            this.reverse = true;
        }

        this.row = row;
        this.col = col;
        this.possibleMoves = [];
    }

    getMoves(board) {
        // Basically a Bishop + Rook                      
        const directions = [
            [-1, 0],  // Up
            [1, 0],   // Down
            [0, -1],  // Left
            [0, 1],   // Right
            [-1, -1], // Top-left
            [-1, 1],  // Top-right
            [1, -1],  // Bottom-left
            [1, 1]    // Bottom-right
        ];

        for (const direction of directions) {
            let row = this.row + direction[0];
            let col = this.col + direction[1];

            // Continue moving in the current direction until we hit the edge of the board or an occupied square
            while (row >= 0 && row < 8 && col >= 0 && col < 8) {

                if (board[row][col] === '') { // The square is empty, so we can move there
                    this.setMove(row, col);

                } else if (board[row][col] === this.enemyKing) {
                    this.setMove(row, col);

                } else if (isBlack(board[row][col], this.reverse)) { // The square is occupied by an opponent's piece, so we can move there and capture it
                    this.setMove(row, col);
                    break; // Stop further movement in this direction

                } else { // The square is occupied by our own piece, so we cannot move beyond it
                    break; // Stop further movement in this direction
                }

                // Move to the next square in the same direction
                row += direction[0];
                col += direction[1];
            }
        }

        return this.possibleMoves;
    }

    setMove(canMoveRow, canMoveCol) {
        this.possibleMoves.push(
            {
                canMoveRow: canMoveRow,
                canMoveCol: canMoveCol,
                currentPos: [this.row, this.col]
            }
        );   
    }
}

class Bishop {

    constructor(color, row, col) {

        this.color = color;

        // Will help me change the logic for the based off color
        if (this.color === "white") {
            this.enemyKing = 'king-b';
            this.reverse = false;
        } else {
            this.enemyKing = 'king-w';
            this.reverse = true;
        }

        this.row = row;
        this.col = col;
        this.possibleMoves = [];
    }

    getMoves(board) {
        const directions = [
            [-1, -1], // Top Left Corner
            [-1, 1], // Top Right Corner
            [1, -1], // Bottom Left Corner
            [1, 1] // Bottom Right Corner
        ]

        for (const direction of directions) {
            let row = this.row + direction[0];
            let col = this.col + direction[1];

            // While the rows and columns are within the range of the board
            while (row >= 0 && row < 8 && col >= 0 && col < 8) {
                // If the destination is empty, display it and move on to next square on the path
                if (board[row][col] === '') {
                    this.setMove(row, col);
                } else if (board[row][col] === this.enemyKing) {
                    this.setMove(row, col);
                } else if (isBlack(board[row][col], this.reverse)) {
                    // If the destination is taken / occupied by an enemy, make that position the last position the bishop can go to and move on to the next path
                    this.setMove(row, col);
                    break;
                } else {
                    // the destination is occupied (it must be occupied by the same color) move to the next path                        
                    break;
                }
                row += direction[0];
                col += direction[1];
            }

        }

        return this.possibleMoves;
    }

    setMove(canMoveRow, canMoveCol) {
        this.possibleMoves.push(
            {
                canMoveRow: canMoveRow,
                canMoveCol: canMoveCol,
                currentPos: [this.row, this.col]
            }
        );   
    }
}

class Knight {

    constructor(color, row, col) {

        this.color = color;

        // Will help me change the logic for the based off color
        if (this.color === "white") this.reverse = false;
        else this.reverse = true;

        this.row = row;
        this.col = col;
        this.possibleMoves = [];
    }

    getMoves(board) {
        const knightMoves = [
            // Top Left Corner
            { row: this.row - 2, col: this.col + 1 },
            { row: this.row - 1, col: this.col + 2 },

            // Top Right Corner
            { row: this.row - 2, col: this.col - 1 },
            { row: this.row - 1, col: this.col - 2 },

            // Bottom Left Corner
            { row: this.row + 2, col: this.col + 1 },
            { row: this.row + 1, col: this.col + 2 },

            // Bottom Right Corner
            { row: this.row + 2, col: this.col - 1 },
            { row: this.row + 1, col: this.col - 2 }
        ];

        for (const move of knightMoves) {
            // Check if the destination tile is within the valid range of the board (0 to 7)
            if (move.row >= 0 && move.row < 8 && move.col >= 0 && move.col < 8) {
                // Check if the destination tile is empty or contains an enemy piece
                if (board[move.row][move.col] === '' || isBlack(board[move.row][move.col], this.reverse)) {
                    this.setMove(move.row, move.col);
                }
            }
        }

        return this.possibleMoves;
    }

    setMove(canMoveRow, canMoveCol) {
        this.possibleMoves.push(
            {
                canMoveRow: canMoveRow,
                canMoveCol: canMoveCol,
                currentPos: [this.row, this.col]
            }
        );   
    }
}

class Rook {

    constructor(color, row, col) {

        this.color = color;

        // Will help me change the logic for the based off color
        if (this.color === "white") {
            this.enemyKing = 'king-b';
            this.reverse = false;
        } else {
            this.enemyKing = 'king-w';
            this.reverse = true;
        }

        this.row = row;
        this.col = col;
        this.possibleMoves = [];
    }

    getMoves(board) {
        const directions = [
            [-1, 0],  // Up
            [1, 0],   // Down
            [0, -1],  // Left
            [0, 1]   // Right
        ];

        for (const direction of directions) {
            let row = this.row + direction[0];
            let col = this.col + direction[1];

            // Continue moving in the current direction until we hit the edge of the board or an occupied square
            while (row >= 0 && row < 8 && col >= 0 && col < 8) {
                if (board[row][col] === '') { // The square is empty, so we can move there
                    this.setMove(row, col);

                } else if (board[row][col] === this.enemyKing) { // The square is occupied by the king, aka you put the king in check
                    this.setMove(row, col); // Dont stop further movement in this direction because then the full range of the rook wouldn't affect the king's movement

                } else if (isBlack(board[row][col], this.reverse)) { // The square is occupied by an opponent's piece, so we can move there and capture it
                    this.setMove(row, col);
                    break; // Stop further movement in this direction

                } else { // The square is occupied by our own piece, so we can't move past it
                    break; // Stop movement in this direction
                }

                // Move to the next square in the same direction
                row += direction[0];
                col += direction[1];
            }
        }

        return this.possibleMoves;
    }

    setMove(canMoveRow, canMoveCol) {
        this.possibleMoves.push(
            {
                canMoveRow: canMoveRow,
                canMoveCol: canMoveCol,
                currentPos: [this.row, this.col]
            }
        );   
    }
}

class Pawn {

    constructor(color, row, col) {
        this.color = color;

        // Will help me change the logic for the pawns relatively simplely based off of color
        if (this.color === "white") {
            this.direction = 1;
            this.enemy = 'pawn-b';
            this.initialRow = 6;
            this.reverse = false;
        } else {
            this.direction = -1;
            this.enemy = 'pawn-w';
            this.initialRow = 1;
            this.reverse = true;
        }

        this.row = row;
        this.col = col;
        this.possibleMoves = [];
    }

    getMoves(board) {

        // EN PASSANT LOGIC
        if (movedUp2) { // If the enemy moved up 2

            // if there is an EnPassant avilable on the right
            if (enPassantCoords[0] === this.row &&
                enPassantCoords[1] === this.col + 1 &&
                board[enPassantCoords[0]][enPassantCoords[1]] === this.enemy
            ) {
                this.setMove(this.row - (1 * this.direction), this.col + 1, true, enPassantCoords);
            }

            // if there is an EnPassant avilable on the left
            if (enPassantCoords[0] === this.row &&
                enPassantCoords[1] === this.col - 1 &&
                board[enPassantCoords[0]][enPassantCoords[1]] === this.enemy
            ) {
                this.setMove(this.row - (1 * this.direction), this.col - 1, true, enPassantCoords);
            }

        }

        // If there is ANYTHING in front of me, I cant move forward
        if (board[this.row - (1 * this.direction)][this.col] != '') {

            // but if there are enemies to my diagnols
            if (board[this.row - (1 * this.direction)][this.col - 1] && isBlack(board[this.row - (1 * this.direction)][this.col - 1], this.reverse)) { // left diagnol
                this.setMove(this.row - (1 * this.direction), this.col - 1);
            }

            if (board[this.row - (1 * this.direction)][this.col + 1] && isBlack(board[this.row - (1 * this.direction)][this.col + 1], this.reverse)) { // right diagnol
                this.setMove(this.row - (1 * this.direction), this.col + 1);
            }

        } else {
            // If im in row 6, and theres nothing in front of my movement spaces
            if (this.row === this.initialRow && board[this.row - (1 * this.direction)][this.col] === '' && board[this.row - (2 * this.direction)][this.col] === '') {
                this.setMove(this.row - (1 * this.direction), this.col); // up 1
                this.setMove(this.row - (2 * this.direction), this.col); // up 2
            } else {
                this.setMove(this.row - (1 * this.direction), this.col); // up 1
            }

            if (board[this.row - (1 * this.direction)][this.col - 1] && isBlack(board[this.row - (1 * this.direction)][this.col - 1], this.reverse)) { // left diagnol
                this.setMove(this.row - (1 * this.direction), this.col - 1);
            }

            if (board[this.row - (1 * this.direction)][this.col + 1] && isBlack(board[this.row - (1 * this.direction)][this.col + 1], this.reverse)) { // right diagnol
                this.setMove(this.row - (1 * this.direction), this.col + 1);
            }
        }

        return this.possibleMoves;
    }

    setMove(canMoveRow, canMoveCol, enPassant = false, EPCoords = []) {
        this.possibleMoves.push(
            {
                canMoveRow: canMoveRow,
                canMoveCol: canMoveCol,
                currentPos: [this.row, this.col],
                enPassant: enPassant,
                EPCoords: EPCoords
            }
        );   
    }

}

// Helper Functions:
function clearPossibleMoves() {
    for (let i = 1; i < 65; i++) {
        const tile = document.getElementById(`${i}-can-move`);
        if (tile.classList.contains('canMove')) {
            tile.classList.remove('canMove');
        }
    }
}

function isBlack(piece, reverse) {
    if (piece[piece.length - 1] === 'b') { // if black
        if (reverse) return false; // !
        return true; // say true
    } else { // if white
        if (reverse) return true; // !
        return false;
    }
}

function showPromotionPopup(promotionCallback) {
    const popup = document.createElement('div');
    popup.className = 'promotion-popup';

    const options = ['queen', 'knight', 'rook', 'bishop'];

    options.forEach((option) => {
        const button = document.createElement('button');

        // Create an icon element
        const icon = document.createElement('i');
        icon.className = `fa-solid fa-chess-${option}`;
        icon.classList.add('piece-icon');

        // Add the icon and text to the button
        button.appendChild(icon);
        button.appendChild(document.createTextNode(option));

        button.addEventListener('click', () => {
            promotionCallback(option);
            popup.remove();
        });
        popup.appendChild(button);
    });

    document.body.appendChild(popup);
}

// Game Variables:
let whitesTurn = true;
let movedUp2 = false;
let enPassantCoords = [];
let whiteCapturedPieces = [];
let blackCapturedPieces = [];

const GameBoard = new Board();

// Game Functions
function startGame() {
    GameBoard.setupBoard();
    GameBoard.resetBoard();
    // console.log(GameBoard.board);
    GameBoard.updateBoard();
}

startGame();