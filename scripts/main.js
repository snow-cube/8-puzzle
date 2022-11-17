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

function generate(sequence, left, range) {
    if (sequence.length === range - 1) {
        sequence[sequence.length] = left[0];
    } else {
        var rSelect = Math.floor(Math.random() * left.length);
        sequence[sequence.length] = left[rSelect];
        left.splice(rSelect, 1);
        generate(sequence, left, range);
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
        this.pieces.length = 0;
        this.sequence.length = 0;

        this.generateSequence();

        this.getPcsSize();

        for (var i = 0; i < this.size; i++) {
            this.pieces[i] = [];
            for (var j = 0; j < this.size; j++) {
                var idx = this.sequence[i*this.size + j];
                this.pieces[i][j] = new Piece(idx, i, j, this.pcsSize);
            }
        }

        this.setImages(this.currImage);
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
    },

    swapTwo: function(pos1, pos2) {
        var p1 = this.pieces[pos1.x][pos1.y];
        var p2 = this.pieces[pos2.x][pos2.y];
        this.pieces[pos1.x][pos1.y] = p2;
        p2.moveTo(pos1.x, pos1.y, this.pcsSize);
        this.pieces[pos2.x][pos2.y] = p1;
        p1.moveTo(pos2.x, pos2.y, this.pcsSize);
    },

    // To generate a puzzle randomly
    generateSequence: function() {
        var accessible = false;
        var cnt = 0;
        while (!accessible) {
            this.sequence.length = 0;
            var left = Array(this.size * this.size);
            for (var i = 0; i < left.length; i++) {
                left[i] = i;
            }
            generate(this.sequence, left, this.size*this.size);
            var inverse = inverseNum(this.sequence);
            if (this.size % 2) {
                accessible = inverse % 2 === 0;
            } else {
                var dist = this.size-1-locateNum(0, this.sequence, this.size).x;
                accessible = (inverse % 2 === 0) === (dist % 2 === 0);
            }
            cnt++;
        }
        // this.sequence = [1, 2, 3, 4, 5, 6, 7, 8, 0];
        console.log(cnt);
        console.log(this.sequence);
        console.log(inverse);
    },

    isSuccessful: function() {
        for (var i = 0; i < this.size * this.size - 1; i++) {
            if (self.sequence[i] !== i + 1) {
                return false;
            }
        }
        return true;
    }
};

// Piece constructor
function Piece(idx, posX, posY, pcsSize) {
    this.idx = idx;

    this.elem = document.createElement("div");
    this.elem.classList.add("piece");
    this.elem.id = "idx" + idx;

    
    // Set element size and position
    this.elem.style.width = pcsSize + "px";
    this.elem.style.height = pcsSize + "px";
    this.elem.style.top = posX * pcsSize + "px";
    this.elem.style.left = posY * pcsSize + "px";
    var node = document.createTextNode(idx);
    this.elem.appendChild(node);

    this.elem.addEventListener("mousedown", moveHandler, false);

    game.puzzle.appendChild(this.elem);
}

Piece.prototype = {
    constructor : Piece,

    moveTo: function(x, y, pcsSize) {
        this.elem.style.top = x * pcsSize + "px";
        this.elem.style.left = y * pcsSize + "px";
    }
};

var moveHandler = function() {
    var currIdx = parseInt(this.id.slice(3));
    if (currIdx) { // Not blank
        var currPos = locateNum(currIdx, game.sequence, game.size);
        var blankPos = locateNum(0, game.sequence, game.size);
        
        var d = Math.abs(currPos.x-blankPos.x) + Math.abs(currPos.y-blankPos.y);
        if (d === 1) { // Able to move
            game.swapTwo(currPos, blankPos);

            game.sequence[currPos.x*game.size + currPos.y] = 0;
            game.sequence[blankPos.x*game.size + blankPos.y] = currIdx;
        }
    }

};


// Store state of every step
function State(seq, step, history, size) {
    this.seq = seq;
    this.step = step;
    this.history = history;
    this.size = size;
}

State.prototype = {
    constructor : State,

    // Amount of differences, meanwhile update cost
    cntDiff: function() {
        var cnt = 0;
        for (var i = 0; i < this.size * this.size; i++) {
            if (this.seq[i] !== (i+1) % (this.size*this.size)) {
                cnt++;
            }
        }
        this.diff = cnt;
        this.cost = this.step + cnt;
        return cnt;
    },

    // toStr: function() {
    //     var str = "";
    //     for (var i = 0; i < this.size * this.size; i++) {
    //         str += ;
    //     }
    //     return num.
    // }
};

function bfs(dir) {
    
    var q = new PriorityQueue(function(a, b) {
        return a.cost - b.cost;
    });
    var tried = new Map();

    var history = [];
    var start = new State(game.sequence.concat(), 0, history, game.size);
    if (start.cntDiff() === 0) {
        return start;
    }
    q.push(start);
    tried.set(start.seq.toString(), true);
    var c = 0;
    while (q.data.length) {
        console.log(c++);
        var top = q.front();
        pos = locateNum(0, top.seq, top.size);
        for (var i = 0; i < 4; i++) {
            var newPos = {};
            newPos.x = pos.x + dir[i][0];
            newPos.y = pos.y + dir[i][1];
            if (newPos.x >= 0 && newPos.x < top.size &&
                newPos.y >= 0 && newPos.y < top.size) {
                idx = pos.x * top.size + pos.y;
                newIdx = newPos.x * top.size + newPos.y;
                var newSeq = top.seq.concat();
                newSeq[idx] = top.seq[newIdx];
                newSeq[newIdx] = top.seq[idx];
                var newHis = top.history.concat();
                newHis[newHis.length] = i;
                var newSta = new State(newSeq, top.step+1, newHis, top.size);
                
                if (newSta.cntDiff() === 0) {
                    return newSta;
                }
                
                if (tried.get(newSta.seq.toString()) !== true) {
                    q.push(newSta);
                    tried.set(newSta.seq.toString(), true);
                }
            }
        }
    }
}


var AISovleHandler = function() {
    var dir = [[0, -1], [0, 1], [1, 0], [-1, 0]]; // 4 directions
    solution = bfs(dir);
    
    if (solution.step) {
        console.log(solution.seq);
        console.log(solution.step);
        console.log(solution.history);
        // console.log(game.sequence);
        var num = 0, max = solution.step;
        // var num = 0, max, solution;
        var callStep = () => {
            if (num < max) {
                var blankPos = locateNum(0, game.sequence, game.size);
                var targetPos = {};
                targetPos.x = blankPos.x + dir[solution.history[num]][0];
                targetPos.y = blankPos.y + dir[solution.history[num]][1];
                // targetPos.x = blankPos.x;
                // targetPos.y = blankPos.y;
                game.swapTwo(blankPos, targetPos);
                var t = game.sequence[targetPos.x*game.size + targetPos.y];
                game.sequence[blankPos.x*game.size + blankPos.y] = t;
                game.sequence[targetPos.x*game.size + targetPos.y] = 0;
                num++;
                setTimeout(callStep, 500);
            }
        };

        
        setTimeout(callStep, 500);

        // game.sequence = solution.seq.concat();
    }
};

window.addEventListener("load", function() {
    game.puzzle = document.getElementById("puzzle");

    game.prepareGame();

    var btnAI = this.document.getElementById("ai");
    btnAI.addEventListener("click", AISovleHandler, false);

    var q1 = new PriorityQueue(function(a, b) {
        return a - b;
    });
    // q1.push(3);
    // q1.push(1);
    // q1.push(2);
    // q1.push(2);
    // q1.push(4);
    // console.log(q1.data);
    // console.log(q1.front());
    // console.log(q1.data);
}, false);