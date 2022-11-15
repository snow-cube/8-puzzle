// Basic game object, which store kinds of info of game
var game = {
    size: 3, // size * size puzzle
    pcsSize: 0, // Pixel size of single piece
    pieces: [], // Store objests, which have elem properties
    puzzle: {}, // element

    // Some preparation works, including clean old pieces, create new ones
    // call when creating new game, restarting and change pictures...
    prepareGame: function() {
        // clean old ones
        for (var i = 0; i < this.pieces.length; i++) {
            for (var j = 0; j < this.pieces.length; j++) {
                document.removeChild(this.pieces[i][j]);
                this.pieces[i][j] = null;
            }
        }
        this.pieces = [];

        this.getPcsSize();

        for (var i = 0; i < 8; i++) {
            game.blocks[i] = [];
            for (var j = 0; j < 4; j++) {
                var elem = document.createElement("div");
                game.blocks[i][j] = elem;

                elem.classList.add("block");
                elem.style.left = j * 25 + "vw";
                if (j === 0) {
                    elem.style.borderLeft = "none";
                }
                if (i < 4) {
                    elem.style.bottom = i * 25 + "vh";
                    game.board_1.appendChild(elem);
                } else {
                    elem.style.bottom = (i - 4) * 25 + "vh";
                    game.board_2.appendChild(elem);
                }
            }
        }
    },

    // calculate size of piece by size of whole puzzle
    getPcsSize: function() {

    }
};

// Piece constructor
function Piece(idx, posX, posY, isBlank) {
    this.idx = idx;
    this.isBlank = isBlank;

    this.elem = document.createElement("div");
    this.elem.classList.add("piece");
    if (isBlank) {
        this.elem.id = "blank";
    }

    game.puzzle.appendChild(this.elem);
    
    // set element size and position
    this.elem.style.width = this.pcsSize + "px";
    this.elem.style.height = this.pcsSize + "px";
    this.elem.style.top = posX * this.pcsSize + "px";
    this.elem.style.left = posY * this.pcsSize + "px";
}

Piece.prototype = {
    constructor : Piece,

    // move: function(dir) {
    //     var newPos = Game.tetromino.calculate(dir);
    //     if (Game.check(newPos)) {
    //         for (var i = 0; i < 4; i++) {
    //             Game.tetromino.blocks[i].style.top = newPos[i].top + "px";
    //             Game.tetromino.blocks[i].style.left = newPos[i].left + "px";
    //         }
    //         return true;
    //     } else {
    //         return false;
    //     }
    // }
};

window.addEventListener("load", function() {
    game.puzzle = document.getElementById("puzzle");


    game.prepareGame();
}, false);