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
export let whiteCapturedPieces = [];
export let blackCapturedPieces = [];

export class Piece {
    constructor(type, tileNum, GameBoard) {
        
        this.type = type.slice(0, -2);
        this.tileNum = tileNum;
        if (type[type.length - 1] == 'b') this.color = 'black';
        else this.color = 'white';
        
        this.tile = document.getElementById(tileNum);
        this.clickHandler;
        this.GameBoard = GameBoard;
        this.canAttackTiles = [];
    }

    Render(board) {
        this.tile.appendChild(this.createPiece(this.type));

        if (this.color == 'white' && whitesTurn) {
            this.setClickEvents_White(board);
        }

        if (this.color == 'black' && !whitesTurn) {
            this.setClickEvents_Black(board);
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

    setClickEvents_White(board) {

        const clickHandler = () => {
            let currentTile = 1
            for (let row = 0; row < board.length; row++) {
                for (let col = 0; col < board.length; col++) {
    
                    if (currentTile == this.tileNum) {
                        let currentRow = row;
                        let currentCol = col;
                        clearPossibleMoves();

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
                                    this.showMoveablePositions(currentRow - 1, currentCol + 1, board, [currentRow, currentCol], true, enPassantCoords); 
                                }

                                // if there is an EnPassant avilable on the left
                                if (enPassantCoords[0] == currentRow && 
                                    enPassantCoords[1] == currentCol - 1 && 
                                    board[enPassantCoords[0]][enPassantCoords[1]] == 'pawn-b'
                                ) { 
                                    this.showMoveablePositions(currentRow - 1, currentCol - 1, board, [currentRow, currentCol], true, enPassantCoords); 
                                }

                            }

                            // If there is ANYTHING in front of me, I cant move forward
                            if (board[currentRow - 1][currentCol] != '') {
                                
                                // but if there are enemies to my diagnols
                                if (board[currentRow - 1][currentCol - 1] && isBlack(board[currentRow - 1][currentCol - 1])) { // left diagnol
                                    this.showMoveablePositions(currentRow - 1, currentCol - 1, board, [currentRow, currentCol]);
                                }

                                if (board[currentRow - 1][currentCol + 1] && isBlack(board[currentRow - 1][currentCol + 1])) { // right diagnol
                                    this.showMoveablePositions(currentRow - 1, currentCol + 1, board, [currentRow, currentCol]);
                                } 

                            } else {
                                // If im in row 6, and theres nothing in front of my movement spaces
                                if (row == 6 && board[currentRow - 1][currentCol] == '' && board[currentRow - 2][currentCol] == '') {
                                    this.showMoveablePositions(currentRow - 1, currentCol, board, [currentRow, currentCol]); // up 1
                                    this.showMoveablePositions(currentRow - 2, currentCol, board, [currentRow, currentCol]); // up 2
                                } else {
                                    this.showMoveablePositions(currentRow - 1, currentCol, board, [currentRow, currentCol]); // up 1
                                }
                                
                                if (board[currentRow - 1][currentCol - 1] && isBlack(board[currentRow - 1][currentCol - 1])) { // left diagnol
                                    this.showMoveablePositions(currentRow - 1, currentCol - 1, board, [currentRow, currentCol]); 
                                }
    
                                if (board[currentRow - 1][currentCol + 1] && isBlack(board[currentRow - 1][currentCol + 1])) { // right diagnol
                                    this.showMoveablePositions(currentRow - 1, currentCol + 1, board, [currentRow, currentCol]);
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
                                    if (board[row][col] === '') {
                                        // The square is empty, so we can move there
                                        this.showMoveablePositions(row, col, board, [currentRow, currentCol]);
                                    } else if (isBlack(board[row][col])) {
                                        // The square is occupied by an opponent's piece, so we can move there and capture it
                                        this.showMoveablePositions(row, col, board, [currentRow, currentCol]);
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
                                    // If the destination is taken / occupied by an enemy, make that position the last position the bishop can go to and move on to the next path
                                    if (board[row][col] != '' && isBlack(board[row][col])) {
                                        this.showMoveablePositions(row, col, board, [currentRow, currentCol]);
                                        break;
                                    }
                                    // If the destination is empty, display it and move on to next square on the path
                                    if (board[row][col] == '') {
                                        this.showMoveablePositions(row, col, board, [currentRow, currentCol]);
                                    }
                                    // If the destination is occupied (it must be occupied by the same color) move to the next path
                                    if (board[row][col] != '') {
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
                                    if (board[move.row][move.col] == '' || isBlack(board[move.row][move.col]) ) {
                                        this.showMoveablePositions(move.row, move.col, board, [currentRow, currentCol]);
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
                                        this.showMoveablePositions(row, col, board, [currentRow, currentCol]);
                                    } else if (isBlack(board[row][col])) {
                                        // The square is occupied by an opponent's piece, so we can move there and capture it
                                        this.showMoveablePositions(row, col, board, [currentRow, currentCol]);
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
                                    if (board[move.row][move.col] == '' || isBlack(board[move.row][move.col]) ) {
                                        this.showMoveablePositions(move.row, move.col, board, [currentRow, currentCol]);
                                    }
                                }
                            }
                        }

                    } 

                    currentTile++;
                }
            }
        }

        this.clickHandler = clickHandler;
        this.tile.addEventListener('click', this.clickHandler);
    }

    setClickEvents_Black(board) {

        const clickHandler = () => {
            let currentTile = 1
            for (let row = 0; row < board.length; row++) {
                for (let col = 0; col < board.length; col++) {

                    if (currentTile == this.tileNum) {
                        let currentRow = row;
                        let currentCol = col;
                        clearPossibleMoves();

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
                                    this.showMoveablePositions(currentRow + 1, currentCol + 1, board, [currentRow, currentCol], true, enPassantCoords); 
                                }

                                // if there is an EnPassant avilable on the left
                                if (enPassantCoords[0] == currentRow && 
                                    enPassantCoords[1] == currentCol - 1 && 
                                    board[enPassantCoords[0]][enPassantCoords[1]] == 'pawn-w'
                                ) { 
                                    this.showMoveablePositions(currentRow + 1, currentCol - 1, board, [currentRow, currentCol], true, enPassantCoords); 
                                }

                            }

                            // If there is ANYTHING in front of me, I cant move forward
                            if (board[currentRow + 1][currentCol] != '') {
                                
                                // but if there are enemies to my diagnols
                                if (board[currentRow + 1][currentCol - 1] && !isBlack(board[currentRow + 1][currentCol - 1])) { // left diagnol
                                    this.showMoveablePositions(currentRow + 1, currentCol - 1, board, [currentRow, currentCol]); 
                                }

                                if (board[currentRow + 1][currentCol + 1] && !isBlack(board[currentRow + 1][currentCol + 1])) { // right diagnol
                                    this.showMoveablePositions(currentRow + 1, currentCol + 1, board, [currentRow, currentCol]);
                                } 

                            } else {
                                // If im in row 1, and theres nothing in front of my movement spaces
                                if (row == 1 && board[currentRow + 1][currentCol] == '' && board[currentRow + 2][currentCol] == '') {
                                    this.showMoveablePositions(currentRow + 1, currentCol, board, [currentRow, currentCol]); // down 1
                                    this.showMoveablePositions(currentRow + 2, currentCol, board, [currentRow, currentCol]); // down 2
                                } else {
                                    this.showMoveablePositions(currentRow + 1, currentCol, board, [currentRow, currentCol]); // down 1
                                }
                                
                                if (board[currentRow + 1][currentCol - 1] && !isBlack(board[currentRow + 1][currentCol - 1])) { // left diagnol
                                    this.showMoveablePositions(currentRow + 1, currentCol - 1, board, [currentRow, currentCol]); 
                                }
    
                                if (board[currentRow + 1][currentCol + 1] && !isBlack(board[currentRow + 1][currentCol + 1])) { // right diagnol
                                    this.showMoveablePositions(currentRow + 1, currentCol + 1, board, [currentRow, currentCol]);
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
                                        this.showMoveablePositions(row, col, board, [currentRow, currentCol]);
                                    } else if (!isBlack(board[row][col])) {
                                        // The square is occupied by an opponent's piece, so we can move there and capture it
                                        this.showMoveablePositions(row, col, board, [currentRow, currentCol]);
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
                                    // If the destination is taken / occupied by an enemy, make that position the last position the bishop can go to and move on to the next path
                                    if (board[row][col] != '' && !isBlack(board[row][col])) {
                                        this.showMoveablePositions(row, col, board, [currentRow, currentCol]);
                                        break;
                                    }
                                    // If the destination is empty, display it and move on to next square on the path
                                    if (board[row][col] == '') {
                                        this.showMoveablePositions(row, col, board, [currentRow, currentCol]);
                                    }
                                    // If the destination is occupied (it must be occupied by the same color) move to the next path
                                    if (board[row][col] != '') {
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
                                    if (board[move.row][move.col] == '' || !isBlack(board[move.row][move.col]) ) {
                                        this.showMoveablePositions(move.row, move.col, board, [currentRow, currentCol]);
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
                                        this.showMoveablePositions(row, col, board, [currentRow, currentCol]);
                                    } else if (!isBlack(board[row][col])) {
                                        // The square is occupied by an opponent's piece, so we can move there and capture it
                                        this.showMoveablePositions(row, col, board, [currentRow, currentCol]);
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
                                    if (board[move.row][move.col] == '' || !isBlack(board[move.row][move.col]) ) {
                                        this.showMoveablePositions(move.row, move.col, board, [currentRow, currentCol]);
                                    }
                                }
                            }
                        }

                    } 

                    currentTile++;
                }
            }
        }

        this.clickHandler = clickHandler;
        this.tile.addEventListener('click', this.clickHandler);
    }

    showMoveablePositions(canMoveRow, canMoveCol, board, [currentRow, currentCol], enPassant = false, EPCoords = []) {
        let currentTile = 1
        for (let row = 0; row < board.length; row++) {
            for (let col = 0; col < board.length; col++) {

                if (row == canMoveRow && col == canMoveCol) {
                    this.canAttackTiles.push([canMoveRow, canMoveCol]);
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
            if ( (canMoveRow - currentRow) == -2 || (canMoveRow - currentRow) == 2) { // if moved up 2
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
        this.GameBoard.updateBoard();
        // console.log(enPassantCoords);
    }

    // Deletes click events
    delete() { 
        if (this.clickHandler) {
            this.tile.removeEventListener('click', this.clickHandler);
        }
    }

}