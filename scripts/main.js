function inverseNum(array) {
    var tempArr = array.concat();
    tempArr.splice(tempArr.indexOf(0), 1);
    return inverseFunc(tempArr).inverse;
}

function inverseFunc(array) {
    var n = array.length;
    if (n <= 1) {
        array.inverse = 0;
        return array;
    }

    var mid = parseInt(n / 2);
    var arrL = inverseFunc(array.slice(0, mid));
    var arrR = inverseFunc(array.slice(mid));

    var nl = arrL.length;
    var nr = arrR.length;

    arrL[nl] = 100000000;
    arrR[nr] = 100000000;

    var i = 0, j = 0;
    var newArr = [];
    newArr.inverse = arrL.inverse + arrR.inverse;

    while (i < nl || j < nr) {
        if (arrL[i] <= arrR[j]) {
            newArr.inverse += j;
            newArr[newArr.length] = arrL[i];
            i++;
        } else {
            newArr[newArr.length] = arrR[j];
            j++;
        }
    }

    return newArr;
}

// Transform idx in sequence to position in matrix
function calculatePos(idx, size) {
    var pos = {};
    pos.x = parseInt(idx / size);
    pos.y = idx % size;
    return pos;
}

// Find position of certain num
function locateNum(num, sequence, size) {
    var idx = sequence.indexOf(num);
    return calculatePos(idx, size);
}

function generate(sequence, left, size) {
    var range = size * size;
    if (sequence.length === range - 2) { // 2 nums left, so need to decide order
        sequence[sequence.length] = left[0];
        sequence[sequence.length] = left[1];
        var inverse = inverseNum(sequence);
        var accessible = false;
        if (size % 2) {
            accessible = inverse % 2 === 0;
        } else {
            var distance = size - 1 - locateNum(0, sequence, size).x;
            accessible = (inverse % 2 === 0) === (distance % 2 === 0);
        }
        
        if (!accessible) {
            var len = sequence.length;
            sequence[len-2] = left[1];
            sequence[len-1] = left[0];
        }
    } else {
        var rSelect = Math.floor(Math.random() * left.length);
        sequence[sequence.length] = left[rSelect];
        left.splice(rSelect, 1);
        generate(sequence, left, size);
    }
}

// Basic game object, which store kinds of info of game
var game = {
    size: 3, // size * size puzzle
    pcsSize: 0, // Pixel size of single piece

    imageList: ["default.png"],
    imageDir: "./imgs/images/",
    currImage: 0,

    puzzle: {}, // element
    pieces: [], // Store objests, which have elem properties
    sequence: [],

    // Some preparation works, including clean old pieces, create new ones
    // Called when creating new game, restarting and change pictures...
    prepareGame: function() {
        // Clean old ones
        for (var i = 0; i < this.pieces.length; i++) {
            for (var j = 0; j < this.pieces.length; j++) {
                document.removeChild(this.pieces[i][j]);
                this.pieces[i][j] = null;
            }
        }
        this.pieces = [];

        // Logic part: generate new game
        // var left = Array(this.size * this.size);
        // for (var i = 0; i < left.length; i++) {
        //     left[i] = i;
        // }
        // generate(this.sequence, left, this.size);
        this.sequence = [1, 2, 3, 4, 5, 6, 7, 8, 0];
        // window.alert(this.sequence);

        this.getPcsSize();

        for (var i = 0; i < this.size; i++) {
            this.pieces[i] = [];
            for (var j = 0; j < this.size; j++) {
                var idx = this.sequence[i*this.size + j];
                this.pieces[i][j] = new Piece(idx, i, j, this.pcsSize);
            }
        }

        this.setImages(this.currImage);

        // for (var i = 0; i < 8; i++) {
        //     game.blocks[i] = [];
        //     for (var j = 0; j < 4; j++) {
        //         var elem = document.createElement("div");
        //         game.blocks[i][j] = elem;

        //         elem.classList.add("block");
        //         elem.style.left = j * 25 + "vw";
        //         if (j === 0) {
        //             elem.style.borderLeft = "none";
        //         }
        //         if (i < 4) {
        //             elem.style.bottom = i * 25 + "vh";
        //             game.board_1.appendChild(elem);
        //         } else {
        //             elem.style.bottom = (i - 4) * 25 + "vh";
        //             game.board_2.appendChild(elem);
        //         }
        //     }
        // }
    },

    // Calculate size of piece by size of whole puzzle
    getPcsSize: function() {
        this.pcsSize = parseInt(this.puzzle.offsetWidth / this.size);
    },

    // Set or Update all the background images
    setImages: function(code) {
        this.currImage = code;
        var url = `url(${this.imageDir}${this.imageList[code]})`;
        for (var i = 0; i < this.size; i++) {
            for (var j = 0; j < this.size; j++) {
                var piece = this.pieces[i][j];
                var elem = piece.elem;
                // To get position when 0 is the last
                var n = this.size * this.size;
                var idxB0 = (piece.idx - 1 + n) % n;
                var pos = calculatePos(idxB0, this.size);
                elem.style.backgroundImage = url;
                elem.style.backgroundPositionX = -pos.y*this.pcsSize + "px";
                elem.style.backgroundPositionY = -pos.x*this.pcsSize + "px";

                if (piece.idx === 0) {
                    elem.style.backgroundImage = "none";
                }
            }
        }
    }

    // To generate a puzzle randomly
    // generateSequence: function() {
        
    // }
};

// Piece constructor
function Piece(idx, posX, posY, pcsSize) {
    this.idx = idx;

    this.elem = document.createElement("div");
    this.elem.classList.add("piece");
    if (idx === 0) {
        this.elem.id = "blank";
    }

    
    // Set element size and position
    this.elem.style.width = pcsSize + "px";
    this.elem.style.height = pcsSize + "px";
    this.elem.style.top = posX * pcsSize + "px";
    this.elem.style.left = posY * pcsSize + "px";
    var node = document.createTextNode(idx);
    this.elem.appendChild(node);

    game.puzzle.appendChild(this.elem);
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
    // game.puzzle.parentNode.style.top = game.puzzle.parentNode.offsetTop + "px";
    // game.puzzle.parentNode.style.left = game.puzzle.parentNode.offsetLeft + "px";

    game.prepareGame();
}, false);