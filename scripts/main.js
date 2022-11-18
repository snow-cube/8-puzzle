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
    size: 4, // size * size puzzle
    pcsSize: 0, // Pixel size of single piece

    imageList: ["1.jpg"],
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
        console.log(`Trial(s): ${cnt}`);
        console.log(`Result sequence: ${this.sequence}`);
        console.log(`Inverse: ${inverse}`);
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
    // var node = document.createTextNode(idx);
    // this.elem.appendChild(node);

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

var ai = {
    dir: [[1, 0], [0, -1], [0, 1], [-1, 0]],
    size: 0,
    r: 0, // size * size
    tab: [], // current position
    tPos: [], // target position of each number
    his: [], // history
    ans: 1000,
    max: 60,
    getTab: function() {
        for (var i = 0; i < this.size; i++) {
            this.tab[i] = [];
            for (var j = 0; j < this.size; j++) {
                this.tab[i][j] = game.sequence[i*this.size + j];
            }
        }
    },
    getTPos: function() {
        this.tPos.length = 0;
        for (var i = 0; i < this.r; i++) {
            var ib0 = (i+this.r-1) % this.r;
            this.tPos[i] = {};
            this.tPos[i].x = parseInt(ib0 / this.size);
            this.tPos[i].y = ib0 % this.size;
        }
    },

    dfs: function(x, y, s, l, limit, last) {
        if (l + s > limit) return;
        if (s === 0) {
            this.ans = l;
            return;
        }
        
        for (var i = 0; i < 4; i++) {
            if (last + i === 3) continue; // back to last position
            var nx = x + this.dir[i][0];
            var ny = y + this.dir[i][1];
            if (nx < 0 || nx >= this.size || ny < 0 || ny >= this.size) {
                continue;
            }

            var ns = s, k = this.tab[nx][ny]; // the number that will exchange
            ns += Math.abs(this.tPos[k].x - x);
            ns += Math.abs(this.tPos[k].y - y);

            ns -= Math.abs(this.tPos[k].x - nx);
            ns -= Math.abs(this.tPos[k].y - ny);

            this.his[l] = i;
            var t = this.tab[nx][ny];
            this.tab[nx][ny] = this.tab[x][y];
            this.tab[x][y] = t;
            this.dfs(nx, ny, ns, l+1, limit, i);
            if (this.ans !== 1000) return;
            t = this.tab[nx][ny];
            this.tab[nx][ny] = this.tab[x][y];
            this.tab[x][y] = t;
        }
    },

    sovle: function(size) {
        this.size = size;
        this.r = size * size;
        this.ans = 1000;
        this.his.length = 0;

        this.getTab();
        this.getTPos();

        var sum = 0, x0, y0;
        for (var i = 0; i < this.size; i++) {
            for (var j = 0; j < this.size; j++) {
                var tN = (i * this.size + j + 1) % this.r;
                if (this.tab[i][j] === tN || this.tab[i][j] === 0) {
                    if (this.tab[i][j] === 0) {
                        x0 = i;
                        y0 = j;
                    }
                    continue;
                }
                var k = this.tab[i][j];
                sum += Math.abs(this.tPos[k].x - i);
                sum += Math.abs(this.tPos[k].y - j);
            }
        }

        for (var i = sum; i <= this.max; i++) {
            // console.log(i);
            this.dfs(x0, y0, sum, 0, i, 4);
            if (this.ans !== 1000) break;
        }
    }
};

var AISovleHandler = function() {
    var start = new Date();
    ai.sovle(game.size);
    var end = new Date();
    console.log("---- AI Solving ----");
    console.log(`Steps: ${ai.his}`);
    console.log(`Start time: ${start.toLocaleTimeString()}`);
    console.log(`End time: ${end.toLocaleTimeString()}`);
    console.log(`${end - start}ms used`);
    console.log("--------------------");

    if (ai.ans === 0) {
        console.log("Already Finished!");
    } else if (ai.ans === 1000) {
        console.log(`More than ${ai.max} steps!`);
    } else {
        // console.log(ai.his);
        var callCnt = 0, times = ai.ans;
        var callStep = () => {
            if (callCnt < times) {
                var pos1 = locateNum(0, game.sequence, game.size);
                var pos2 = {};
                pos2.x = pos1.x + ai.dir[ai.his[callCnt]][0];
                pos2.y = pos1.y + ai.dir[ai.his[callCnt]][1];
                game.swapTwo(pos1, pos2);
                var t = game.sequence[pos2.x*game.size + pos2.y];
                game.sequence[pos1.x*game.size + pos1.y] = t;
                game.sequence[pos2.x*game.size + pos2.y] = 0;
                callCnt++;
                setTimeout(callStep, 500);
            }
        };
        setTimeout(callStep, 500);
    }
};

window.addEventListener("load", function() {
    game.puzzle = document.getElementById("puzzle");

    game.prepareGame();

    var btnAI = this.document.getElementById("ai");
    btnAI.addEventListener("click", AISovleHandler, false);
}, false);