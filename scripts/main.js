var game = {
    size: 3,
    piecesSize: 0,
    pieces: [],

    prepareGame: function() {
        for (var i = 0; i < this.pieces.length; i++) {
            for (var j = 0; j < this.pieces.length; j++) {
                document.removeChild(this.pieces[i][j]);
                this.pieces[i][j] = null;
            }
        }
        this.pieces = [];

        

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
            if (i === 0) {
                for (var a = 0; a < 4; a++) {
                    game.blocks[i][a].classList.add("info-block");
                    game.blocks[i][a].addEventListener("click", game.selectHandler, false);

                    var text = document.createTextNode(game.blocksNumIndex[a]);
                    game.blocks[i][a].appendChild(text);
                }
            } else {
                game.addBlackBlock(game.blocks[i]);
            }
        }
        var firstBlackBlock = game.board_1.getElementsByClassName("blackBlock")[0];
        firstBlackBlock.appendChild(document.createTextNode("开始"));
        firstBlackBlock.addEventListener("click", game.startHandler, false);

        game.addEventListenerForLine(game.blocks[1]);

        game.timer.reset();
        game.blocksCount = 0;
        document.getElementById("progress-bar").style.width = "0";
        game.infoBoard.style.display = "none";
    },


};

window.addEventListener("load", function() {
    game.puzzle = document.getElementById("puzzle");


    game.prepareGame();
}, false);