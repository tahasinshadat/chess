
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

                if ((row + col) % 2 == 0) tile.classList.add('black');
                else tile.classList.add('white');

                tile.appendChild(movementShownDiv);
                boardElement.appendChild(tile);

                tileNum++;
            }
        }
    }

    resetBoard() {
        for (let row = 0; row < this.board.length; row++) {
            for (let col = 0; col < this.board.length; col++) {

                if (this.board[row][col] != '') {
                    this.board[row][col] = '';
                }

                // Black pieces
                if (row == 1) this.board[row][col] = 'pawn-b';
                if (row == 0) {
                    if (col == 0 || col == 7) this.board[row][col] = 'rook-b';
                    if (col == 1 || col == 6) this.board[row][col] = 'knight-b';
                    if (col == 2 || col == 5) this.board[row][col] = 'bishop-b';
                    if (col == 3) this.board[row][col] = 'queen-b';
                    if (col == 4) this.board[row][col] = 'king-b';
                }

                // White pieces
                if (row == 6) this.board[row][col] = 'pawn-w';
                if (row == 7) {
                    if (col == 0 || col == 7) this.board[row][col] = 'rook-w';
                    if (col == 1 || col == 6) this.board[row][col] = 'knight-w';
                    if (col == 2 || col == 5) this.board[row][col] = 'bishop-w';
                    if (col == 3) this.board[row][col] = 'queen-w';
                    if (col == 4) this.board[row][col] = 'king-w';
                }

            }
        }
    }

    renderPieces() {
        for (let piece = 0; piece < this.pieces.length; piece++) {
            this.pieces[piece].Render(this.board);
        }
    }

    updateBoard() {
        this.deleteAllPieces();
        let tileNum = 1;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.board[row][col] != '') {
                    let piece = new Piece(this.board[row][col], tileNum); // Create a new piece in that position
                    this.pieces.push(piece);
                }
                tileNum++;
            }
        }
        this.renderPieces(); // Render all the new pieces
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

    deleteAllPieces() {
        // Delete all the event listeners from the previous pieces
        this.pieces.forEach((piece) => {
            piece.delete();
        })
        this.pieces = [];

        // Remove previous icon positions
        for (let i = 1; i < 65; i++) {
            const tile = document.getElementById(i);
            const canMoveElement = document.getElementById(`${i}-can-move`);
            if (tile.lastChild != canMoveElement) {
                tile.removeChild(tile.lastChild);
            }
        }
    }

    isCheck(row, col) {
        for (let piece of this.pieces) {
            
            if (whitesTurn) { // if its whites turn

                if (piece.color == 'black') { // if the piece is black

                    piece.blacksMoves(this.board); // get the pieces possible attacking moves          
                    for (let position of piece.canAttackTiles) {
                        
                        if (piece.type == 'pawn') {
                            // Check for pawn attacks (diagonal)
                            const pawnAttackLeft = position.currentPos[0] + 1 == row && position.currentPos[1] - 1 == col;
                            const pawnAttackRight = position.currentPos[0] + 1 == row && position.currentPos[1] + 1 == col;

                            if (pawnAttackLeft || pawnAttackRight) {
                                return true; // the king will be in check
                            }

                            // Pawn moves one square forward
                            if (position.currentPos[0] + 1 == row && position.currentPos[1] == col) {
                                continue; // not a check
                            }

                            // Pawn is on initial square (Can move up 2)
                            if (position.currentPos[0] == 1 && row == 3 && position.currentPos[1] === col) {
                                continue;
                            } 
                        }
                        

                        if (row == position.canMoveRow && col == position.canMoveCol) { // If the Kings move matches a possible attack
                            return true; // the king will be in check
                        }

                    }
                }

            } else {  // if its blacks turn

                if (piece.color == 'white') { // if the piece is white

                    piece.whitesMoves(this.board); // get the pieces possible attacking moves           
                    for (let position of piece.canAttackTiles) {
        
                        if (piece.type == 'pawn') {
                            // Check for pawn attacks (diagonal)
                            const pawnAttackLeft = position.currentPos[0] - 1 == row && position.currentPos[1] - 1 == col;
                            const pawnAttackRight = position.currentPos[0] - 1 == row && position.currentPos[1] + 1 == col;
                            if (pawnAttackLeft || pawnAttackRight) {
                                return true; // the king will be in check
                            }
                            // Pawn moves one square forward
                            if (position.currentPos[0] - 1 == row && position.currentPos[1] == col) {
                                continue; // not a check
                            }
                            // Pawn is on initial square (Can move up 2)
                            if (position.currentPos[0] == 6 && row == 4 && position.currentPos[1] === col) {
                                continue;
                            } 
                        }
                        

                        if (row == position.canMoveRow && col == position.canMoveCol) { // If the Kings move matches a possible attack
                            return true; // the king will be in check
                        }

                    }
                }

            }

        }
        return false; // the king won't be in check
    }

}

function clearPossibleMoves() {
    for (let i = 1; i < 65; i++) {
        const tile = document.getElementById(`${i}-can-move`);
        if (tile.classList.contains('canMove')) {
            tile.classList.remove('canMove');
        }
    }
}

function isBlack(piece) {
    if (piece[piece.length - 1] == 'b') return true;
    return false;
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

let whitesTurn = true;
let movedUp2 = false;
let enPassantCoords = [];
let whiteCapturedPieces = [];
let blackCapturedPieces = [];

class Piece {
    constructor(type, tileNum) {

        this.type = type.slice(0, -2);
        this.tileNum = tileNum;
        if (type[type.length - 1] == 'b') this.color = 'black';
        else this.color = 'white';

        this.tile = document.getElementById(tileNum);
        this.clickHandler;
        this.canAttackTiles = [];
    }

    Render(board) {
        this.tile.appendChild(this.createPiece(this.type));

        if (this.color == 'white' && whitesTurn) {
            // Get the moves this piece can perform
            this.whitesMoves(board);

            // Show those moves to the player + make it functional
            this.setClickEvents(board);

        }

        if (this.color == 'black' && !whitesTurn) {

            // Get the moves this piece can perform
            this.blacksMoves(board);

            // Show those moves to the player + make it functional
            this.setClickEvents(board);

        }

    }

    createPiece(type) {
        let piece = document.createElement('i');
        piece.className = `fa-solid fa-chess-${type}`;
        if (this.color == 'white') {
            piece.style.color = 'rgb(200, 200, 200)';
        }
        return piece;
    }

    setClickEvents(board) {
        const clickHandler = () => {
            clearPossibleMoves();
            // Show those moves to the player + make it functional
            this.canAttackTiles.forEach( (position) => {
                this.showMoveablePositions(
                    position.canMoveRow,
                    position.canMoveCol,
                    board,
                    position.currentPos,
                    position.enPassant,
                    position.EPCoords
                )
            });
        }

        this.clickHandler = clickHandler;
        this.tile.addEventListener('click', this.clickHandler);
    }

    whitesMoves(board) {
        let currentTile = 1
        for (let row = 0; row < board.length; row++) {
            for (let col = 0; col < board.length; col++) {

                if (currentTile == this.tileNum) {
                    let currentRow = row;
                    let currentCol = col;

                    /* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    //
                    //                                 PAWN - WHITE
                    //
                    */ /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    if (this.type == 'pawn') {

                        // EN PASSANT LOGIC
                        if (movedUp2) { // If the enemy moved up 2

                            // if there is an EnPassant avilable on the right
                            if (enPassantCoords[0] == currentRow &&
                                enPassantCoords[1] == currentCol + 1 &&
                                board[enPassantCoords[0]][enPassantCoords[1]] == 'pawn-b'
                            ) {
                                this.setMoveablePositions(currentRow - 1, currentCol + 1, [currentRow, currentCol], true, enPassantCoords);
                            }

                            // if there is an EnPassant avilable on the left
                            if (enPassantCoords[0] == currentRow &&
                                enPassantCoords[1] == currentCol - 1 &&
                                board[enPassantCoords[0]][enPassantCoords[1]] == 'pawn-b'
                            ) {
                                this.setMoveablePositions(currentRow - 1, currentCol - 1, [currentRow, currentCol], true, enPassantCoords);
                            }

                        }

                        // If there is ANYTHING in front of me, I cant move forward
                        if (board[currentRow - 1][currentCol] != '') {

                            // but if there are enemies to my diagnols
                            if (board[currentRow - 1][currentCol - 1] && isBlack(board[currentRow - 1][currentCol - 1])) { // left diagnol
                                this.setMoveablePositions(currentRow - 1, currentCol - 1, [currentRow, currentCol]);
                            }

                            if (board[currentRow - 1][currentCol + 1] && isBlack(board[currentRow - 1][currentCol + 1])) { // right diagnol
                                this.setMoveablePositions(currentRow - 1, currentCol + 1, [currentRow, currentCol]);
                            }

                        } else {
                            // If im in row 6, and theres nothing in front of my movement spaces
                            if (row == 6 && board[currentRow - 1][currentCol] == '' && board[currentRow - 2][currentCol] == '') {
                                this.setMoveablePositions(currentRow - 1, currentCol, [currentRow, currentCol]); // up 1
                                this.setMoveablePositions(currentRow - 2, currentCol, [currentRow, currentCol]); // up 2
                            } else {
                                this.setMoveablePositions(currentRow - 1, currentCol, [currentRow, currentCol]); // up 1
                            }

                            if (board[currentRow - 1][currentCol - 1] && isBlack(board[currentRow - 1][currentCol - 1])) { // left diagnol
                                this.setMoveablePositions(currentRow - 1, currentCol - 1, [currentRow, currentCol]);
                            }

                            if (board[currentRow - 1][currentCol + 1] && isBlack(board[currentRow - 1][currentCol + 1])) { // right diagnol
                                this.setMoveablePositions(currentRow - 1, currentCol + 1, [currentRow, currentCol]);
                            }
                        }

                    }

                    /* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    //
                    //                                 ROOK - WHITE
                    //
                    */ /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    if (this.type == 'rook') {
                        const directions = [
                            [-1, 0],  // Up
                            [1, 0],   // Down
                            [0, -1],  // Left
                            [0, 1]   // Right
                        ];

                        for (const direction of directions) {
                            let row = currentRow + direction[0];
                            let col = currentCol + direction[1];

                            // Continue moving in the current direction until we hit the edge of the board or an occupied square
                            while (row >= 0 && row < 8 && col >= 0 && col < 8) {
                                if (board[row][col] == '') {
                                    // The square is empty, so we can move there
                                    this.setMoveablePositions(row, col, [currentRow, currentCol]);

                                } else if (board[row][col] == 'king-b') {
                                    // The square is occupied by the king, aka you put the king in check
                                    this.setMoveablePositions(row, col, [currentRow, currentCol]);
                                    // Dont stop further movement in this direction because then the full range of the rook wouldn't affect the king's movement

                                } else if (isBlack(board[row][col])) {
                                    // The square is occupied by an opponent's piece, so we can move there and capture it
                                    this.setMoveablePositions(row, col, [currentRow, currentCol]);
                                    break; // Stop further movement in this direction

                                } else {
                                    // The square is occupied by our own piece, so we can't move past it
                                    break; // Stop movement in this direction
                                }

                                // Move to the next square in the same direction
                                row += direction[0];
                                col += direction[1];
                            }
                        }
                    }

                    /* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    //
                    //                                 BISHOP - WHITE
                    //
                    */ /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    if (this.type == 'bishop') {
                        const directions = [
                            [-1, -1], // Top Left Corner
                            [-1, 1], // Top Right Corner
                            [1, -1], // Bottom Left Corner
                            [1, 1] // Bottom Right Corner
                        ]

                        for (const direction of directions) {
                            let row = currentRow + direction[0];
                            let col = currentCol + direction[1];

                            // While the rows and columns are within the range of the board
                            while (row >= 0 && row < 8 && col >= 0 && col < 8) {
                                // If the destination is empty, display it and move on to next square on the path
                                if (board[row][col] == '') {
                                    this.setMoveablePositions(row, col, [currentRow, currentCol]);
                                } else if (board[row][col] == 'king-b') {
                                    this.setMoveablePositions(row, col, [currentRow, currentCol]);
                                } else if (board[row][col] != '' && isBlack(board[row][col])) {
                                    // If the destination is taken / occupied by an enemy, make that position the last position the bishop can go to and move on to the next path
                                    this.setMoveablePositions(row, col, [currentRow, currentCol]);
                                    break;
                                } else {
                                    // the destination is occupied (it must be occupied by the same color) move to the next path                        
                                    break;
                                }
                                row += direction[0];
                                col += direction[1];
                            }

                        }
                    }

                    /* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    //
                    //                                 KNIGHT - WHITE
                    //
                    */ /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    if (this.type == 'knight') {
                        const possibleMoves = [
                            // Top Left Corner
                            { row: currentRow - 2, col: currentCol + 1 },
                            { row: currentRow - 1, col: currentCol + 2 },

                            // Top Right Corner
                            { row: currentRow - 2, col: currentCol - 1 },
                            { row: currentRow - 1, col: currentCol - 2 },

                            // Bottom Left Corner
                            { row: currentRow + 2, col: currentCol + 1 },
                            { row: currentRow + 1, col: currentCol + 2 },

                            // Bottom Right Corner
                            { row: currentRow + 2, col: currentCol - 1 },
                            { row: currentRow + 1, col: currentCol - 2 }
                        ];

                        for (const move of possibleMoves) {
                            // Check if the destination tile is within the valid range of the board (0 to 7)
                            if (move.row >= 0 && move.row < 8 && move.col >= 0 && move.col < 8) {
                                // Check if the destination tile is empty or contains an enemy piece
                                if (board[move.row][move.col] == '' || isBlack(board[move.row][move.col])) {
                                    this.setMoveablePositions(move.row, move.col, [currentRow, currentCol]);
                                }
                            }
                        }
                    }

                    /* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    //
                    //                                 QUEEN - WHITE
                    //
                    */ /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    if (this.type == 'queen') {
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
                            let row = currentRow + direction[0];
                            let col = currentCol + direction[1];

                            // Continue moving in the current direction until we hit the edge of the board or an occupied square
                            while (row >= 0 && row < 8 && col >= 0 && col < 8) {
                                if (board[row][col] === '') {
                                    // The square is empty, so we can move there
                                    this.setMoveablePositions(row, col, [currentRow, currentCol]);
                                } else if (board[row][col] == 'king-b') {
                                    this.setMoveablePositions(row, col, [currentRow, currentCol]);
                                } else if (isBlack(board[row][col])) {
                                    // The square is occupied by an opponent's piece, so we can move there and capture it
                                    this.setMoveablePositions(row, col, [currentRow, currentCol]);
                                    break; // Stop further movement in this direction
                                } else {
                                    // The square is occupied by our own piece, so we cannot move beyond it
                                    break; // Stop further movement in this direction
                                }

                                // Move to the next square in the same direction
                                row += direction[0];
                                col += direction[1];
                            }
                        }
                    }

                    /* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    //
                    //                                 KING - WHITE
                    //
                    */ /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    if (whitesTurn) {
                        if (this.type == 'king') {
                            const possibleMoves = [
                                { row: currentRow - 1, col: currentCol }, // Up
                                { row: currentRow + 1, col: currentCol }, // Down
                                { row: currentRow, col: currentCol - 1 }, // Left
                                { row: currentRow, col: currentCol + 1 }, // Right
                                { row: currentRow - 1, col: currentCol + 1 }, // Top Right
                                { row: currentRow - 1, col: currentCol - 1 }, // Top Left
                                { row: currentRow + 1, col: currentCol + 1 }, // Bottom Right
                                { row: currentRow + 1, col: currentCol - 1 } // Bottom Left
                            ];

                            for (const move of possibleMoves) {
                                // Check if the destination tile is within the range of the board
                                if (move.row >= 0 && move.row < 8 && move.col >= 0 && move.col < 8) {
                                    // Check if the destination tile is empty or contains an enemy piece
                                    if ( (board[move.row][move.col] == '' || isBlack(board[move.row][move.col])) && !GameBoard.isCheck(move.row, move.col)) {
                                        this.setMoveablePositions(move.row, move.col, [currentRow, currentCol]);
                                    }
                                }
                            }
                        }
                    }

                }

                currentTile++;
            }
        }
    }

    blacksMoves(board) {
        let currentTile = 1
        for (let row = 0; row < board.length; row++) {
            for (let col = 0; col < board.length; col++) {
                if (currentTile == this.tileNum) {
                    let currentRow = row;
                    let currentCol = col;

                    /* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    //
                    //                                 PAWN - BLACK
                    //
                    */ /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    if (this.type == 'pawn') {
                        
                        // EN PASSANT LOGIC
                        if (movedUp2) { // If the enemy moved up 2

                            // if there is an EnPassant avilable on the right
                            if (enPassantCoords[0] == currentRow &&
                                enPassantCoords[1] == currentCol + 1 &&
                                board[enPassantCoords[0]][enPassantCoords[1]] == 'pawn-w'
                            ) {
                                this.setMoveablePositions(currentRow + 1, currentCol + 1, [currentRow, currentCol], true, enPassantCoords);
                            }

                            // if there is an EnPassant avilable on the left
                            if (enPassantCoords[0] == currentRow &&
                                enPassantCoords[1] == currentCol - 1 &&
                                board[enPassantCoords[0]][enPassantCoords[1]] == 'pawn-w'
                            ) {
                                this.setMoveablePositions(currentRow + 1, currentCol - 1, [currentRow, currentCol], true, enPassantCoords);
                            }

                        }

                        // If there is ANYTHING in front of me, I cant move forward
                        if (board[currentRow + 1][currentCol] != '') {

                            // but if there are enemies to my diagnols
                            if (board[currentRow + 1][currentCol - 1] && !isBlack(board[currentRow + 1][currentCol - 1])) { // left diagnol
                                this.setMoveablePositions(currentRow + 1, currentCol - 1, [currentRow, currentCol]);
                            }

                            if (board[currentRow + 1][currentCol + 1] && !isBlack(board[currentRow + 1][currentCol + 1])) { // right diagnol
                                this.setMoveablePositions(currentRow + 1, currentCol + 1, [currentRow, currentCol]);
                            }

                        } else {
                            // If im in row 1, and theres nothing in front of my movement spaces
                            if (row == 1 && board[currentRow + 1][currentCol] == '' && board[currentRow + 2][currentCol] == '') {
                                this.setMoveablePositions(currentRow + 1, currentCol, [currentRow, currentCol]); // down 1
                                this.setMoveablePositions(currentRow + 2, currentCol, [currentRow, currentCol]); // down 2
                            } else {
                                this.setMoveablePositions(currentRow + 1, currentCol, [currentRow, currentCol]); // down 1
                            }

                            if (board[currentRow + 1][currentCol - 1] && !isBlack(board[currentRow + 1][currentCol - 1])) { // left diagnol
                                this.setMoveablePositions(currentRow + 1, currentCol - 1, [currentRow, currentCol]);
                            }

                            if (board[currentRow + 1][currentCol + 1] && !isBlack(board[currentRow + 1][currentCol + 1])) { // right diagnol
                                this.setMoveablePositions(currentRow + 1, currentCol + 1, [currentRow, currentCol]);
                            }
                        }
                    }

                    /* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    //
                    //                                 ROOK - BLACK
                    //
                    */ /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    if (this.type == 'rook') {
                        const directions = [
                            [-1, 0],  // Up
                            [1, 0],   // Down
                            [0, -1],  // Left
                            [0, 1]   // Right
                        ];

                        for (const direction of directions) {
                            let row = currentRow + direction[0];
                            let col = currentCol + direction[1];

                            // Continue moving in the current direction until we hit the edge of the board or an occupied square
                            while (row >= 0 && row < 8 && col >= 0 && col < 8) {
                                if (board[row][col] === '') {
                                    // The square is empty, so we can move there
                                    this.setMoveablePositions(row, col, [currentRow, currentCol]);
                                } else if (board[row][col] == 'king-w') {
                                    // occupied by king, meaning check
                                    this.setMoveablePositions(row, col, [currentRow, currentCol]);
                                } else if (!isBlack(board[row][col])) {
                                    // The square is occupied by an opponent's piece, so we can move there and capture it
                                    this.setMoveablePositions(row, col, [currentRow, currentCol]);
                                    break; // Stop further movement in this direction
                                } else {
                                    // The square is occupied by our own piece, so we can't move past it
                                    break; // Stop movement in this direction
                                }

                                // Move to the next square in the same direction
                                row += direction[0];
                                col += direction[1];
                            }
                        }
                    }

                    /* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    //
                    //                                 BISHOP - BLACK
                    //
                    */ /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    if (this.type == 'bishop') {
                        const directions = [
                            [-1, -1], // Top Left Corner
                            [-1, 1], // Top Right Corner
                            [1, -1], // Bottom Left Corner
                            [1, 1] // Bottom Right Corner
                        ]

                        for (const direction of directions) {
                            let row = currentRow + direction[0];
                            let col = currentCol + direction[1];

                            // While the rows and columns are within the range of the board
                            while (row >= 0 && row < 8 && col >= 0 && col < 8) {
                                // If the destination is empty, display it and move on to next square on the path
                                if (board[row][col] == '') {
                                    this.setMoveablePositions(row, col, [currentRow, currentCol]);
                                } else if (board[row][col] == 'king-w') {
                                    this.setMoveablePositions(row, col, [currentRow, currentCol]);
                                } else if (!isBlack(board[row][col])) {
                                    // If the destination is taken / occupied by an enemy, make that position the last position the bishop can go to and move on to the next path
                                    this.setMoveablePositions(row, col, [currentRow, currentCol]);
                                    break;
                                } else {
                                    // the destination is occupied (it must be occupied by the same color) move to the next path                        
                                    break;
                                }
                                row += direction[0];
                                col += direction[1];
                            }

                        }
                    }

                    /* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    //
                    //                                 KNIGHT - BLACK
                    //
                    */ /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    if (this.type == 'knight') {
                        const possibleMoves = [
                            // Top Left Corner
                            { row: currentRow - 2, col: currentCol + 1 },
                            { row: currentRow - 1, col: currentCol + 2 },

                            // Top Right Corner
                            { row: currentRow - 2, col: currentCol - 1 },
                            { row: currentRow - 1, col: currentCol - 2 },

                            // Bottom Left Corner
                            { row: currentRow + 2, col: currentCol + 1 },
                            { row: currentRow + 1, col: currentCol + 2 },

                            // Bottom Right Corner
                            { row: currentRow + 2, col: currentCol - 1 },
                            { row: currentRow + 1, col: currentCol - 2 }
                        ];

                        for (const move of possibleMoves) {
                            // Check if the destination tile is within the valid range of the board (0 to 7)
                            if (move.row >= 0 && move.row < 8 && move.col >= 0 && move.col < 8) {
                                // Check if the destination tile is empty or contains an enemy piece
                                if (board[move.row][move.col] == '' || !isBlack(board[move.row][move.col])) {
                                    this.setMoveablePositions(move.row, move.col, [currentRow, currentCol]);
                                }
                            }
                        }
                    }

                    /* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    //
                    //                                 QUEEN - BLACK
                    //
                    */ /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    if (this.type == 'queen') {
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
                            let row = currentRow + direction[0];
                            let col = currentCol + direction[1];

                            // Continue moving in the current direction until we hit the edge of the board or an occupied square
                            while (row >= 0 && row < 8 && col >= 0 && col < 8) {
                                if (board[row][col] === '') {
                                    // The square is empty, so we can move there
                                    this.setMoveablePositions(row, col, [currentRow, currentCol]);
                                } else if (board[row][col] == 'king-w') {
                                    this.setMoveablePositions(row, col, [currentRow, currentCol]);
                                } else if (!isBlack(board[row][col])) {
                                    // The square is occupied by an opponent's piece, so we can move there and capture it
                                    this.setMoveablePositions(row, col, [currentRow, currentCol]);
                                    break; // Stop further movement in this direction
                                } else {
                                    // The square is occupied by our own piece, so we cannot move beyond it
                                    break; // Stop further movement in this direction
                                }

                                // Move to the next square in the same direction
                                row += direction[0];
                                col += direction[1];
                            }
                        }
                    }

                    /* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    //
                    //                                 KING - BLACK
                    //
                    */ /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    if (!whitesTurn) {
                        if (this.type == 'king') {
                            const possibleMoves = [
                                { row: currentRow - 1, col: currentCol }, // Up
                                { row: currentRow + 1, col: currentCol }, // Down
                                { row: currentRow, col: currentCol - 1 }, // Left
                                { row: currentRow, col: currentCol + 1 }, // Right
                                { row: currentRow - 1, col: currentCol + 1 }, // Top Right
                                { row: currentRow - 1, col: currentCol - 1 }, // Top Left
                                { row: currentRow + 1, col: currentCol + 1 }, // Bottom Right
                                { row: currentRow + 1, col: currentCol - 1 } // Bottom Left
                            ];

                            for (const move of possibleMoves) {
                                // Check if the destination tile is within the range of the board
                                if (move.row >= 0 && move.row < 8 && move.col >= 0 && move.col < 8) {
                                    // Check if the destination tile is empty or contains an enemy piece
                                    if ( (board[move.row][move.col] == '' || !isBlack(board[move.row][move.col])) && !GameBoard.isCheck(move.row, move.col)) {
                                        this.setMoveablePositions(move.row, move.col, [currentRow, currentCol]);
                                    }
                                }
                            }
                        }
                    }
                }

                currentTile++;
            }
        }
    }

    showMoveablePositions(canMoveRow, canMoveCol, board, [currentRow, currentCol], enPassant, EPCoords) {
        let currentTile = 1
        for (let row = 0; row < board.length; row++) {
            for (let col = 0; col < board.length; col++) {

                if (row == canMoveRow && col == canMoveCol) {

                    const tile = document.getElementById(`${currentTile}-can-move`);
                    if (enPassant) tile.innerText = 'En Passant';
                    tile.onclick = () => {
                        this.moveToMoveablePositions(canMoveRow, canMoveCol, board, [currentRow, currentCol], enPassant, EPCoords);
                    }
                    tile.classList.add('canMove');

                }

                currentTile++;
            }
        }
    }

    setMoveablePositions(canMoveRow, canMoveCol, [currentRow, currentCol], enPassant = false, EPCoords = []) {
        this.canAttackTiles.push(
            {
                canMoveRow: canMoveRow,
                canMoveCol: canMoveCol,
                currentPos: [currentRow, currentCol],
                enPassant: enPassant,
                EPCoords: EPCoords
            }
        );
    }

    moveToMoveablePositions(canMoveRow, canMoveCol, board, [currentRow, currentCol], enPassant, EPCoords) {
        movedUp2 = false;
        enPassantCoords = [];

        if (this.type == 'pawn') {
            // Promotion (FOR WHITE PAWN)
            if (this.color == 'white' && canMoveRow == 0) {
                showPromotionPopup((promotionChoice) => {
                    this.type = `${promotionChoice}-w`;
                    board[canMoveRow][canMoveCol] = `${promotionChoice}-w`;
                });
            }
            // Promotion (FOR BLACK PAWN)
            if (this.color == 'black' && canMoveRow == 7) {
                showPromotionPopup((promotionChoice) => {
                    this.type = `${promotionChoice}-b`;
                    board[canMoveRow][canMoveCol] = `${promotionChoice}-b`;
                });
            }
            // En Passant Check
            if ((canMoveRow - currentRow) == -2 || (canMoveRow - currentRow) == 2) { // if moved up 2
                movedUp2 = true;
                enPassantCoords = [canMoveRow, canMoveCol];
            }

            if (enPassant == true) {
                if (isBlack(board[EPCoords[0]][EPCoords[1]])) {
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

        let piece = board[currentRow][currentCol] // Take piece
        board[canMoveRow][canMoveCol] = piece; // Move it to its new position
        board[currentRow][currentCol] = ''; // Delete the piece from it's old position
        whitesTurn = !whitesTurn;
        clearPossibleMoves();
    }

    // Deletes click events
    delete() {
        if (this.clickHandler) {
            this.tile.removeEventListener('click', this.clickHandler);
        }
    }

}

const GameBoard = new Board();
function startGame() {
    GameBoard.setupBoard();
    GameBoard.resetBoard();
    GameBoard.updateBoard();
    gameLoop();
}

// Create a game loop function
function gameLoop() {
    // console.log('running');
    GameBoard.updateBoard();
    GameBoard.updateMiscellaneous();
    requestAnimationFrame(gameLoop);
}

startGame();