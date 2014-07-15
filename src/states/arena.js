var Baahp = Baahp || {};

Baahp.Arena = new Kiwi.State('Arena');

Baahp.Arena.create = function () {

    this.mouse = this.game.input.mouse;

    this.arena = new Kiwi.GameObjects.Tilemap.TileMap(this, 'arena2', this.textures.arenaTiles);
    this.arenaScale = this.fitArena();
    this.gridMovement = new GridMovement(this, this.arena.widthInPixels, this.arena.heightInPixels, this.arena.tileWidth, this.arena.tileHeight, 32, 32, 32, 32);

    this.player1 = new Player(this, '1'); //contains all the pieces belonging to Player1.
    this.player2 = new Player(this, '2'); //contains all the pieces belonging to Player2.
    this.blocks = new Kiwi.Group(this); //contains all the blocks that players can interact with.
    this.bloodSplatters = new Kiwi.Group(this); //contains all the blood splatters.

    this.currentPlayer = this.player1;

    this.addUnits();

    this.playerName = new Kiwi.HUD.Widget.TextField(this.game, "Player" + this.currentPlayer.name, 400, 0);
    this.playerName.style.fontSize = "32px";
    this.game.huds.defaultHUD.addWidget(this.playerName);

    this.addChild(this.arena.layers[0]);


    this.addChild(this.bloodSplatters);
    this.addChild(this.player1.pieces);
    this.addChild(this.player2.pieces);
    this.addChild(this.blocks);

    this.player1.isTurn = true;
};

Baahp.Arena.update = function () {
    Kiwi.State.prototype.update.call(this);
    this.currentPlayer.update();
};

Baahp.Arena.switchPlayer = function () {
    if (this.currentPlayer === this.player1) {
        this.currentPlayer = this.player2;
        this.player2.isTurn = true;
        this.playerName.text = "Player2";
    } else {
        this.currentPlayer = this.player1;
        this.player1.isTurn = true;
        this.playerName.text = "Player1";
    }
};

Baahp.Arena.fitArena = function () {
    var xScale = this.game.stage.width / this.arena.widthInPixels;
    var yScale = this.game.stage.height / this.arena.heightInPixels;

    if (xScale < yScale) {
        this.transform.scaleX = xScale;
        this.transform.scaleY = xScale;
        return xScale;
    } else {
        this.transform.scaleX = yScale;
        this.transform.scaleY = yScale;
        return yScale;
    }
};

Baahp.Arena.addUnits = function () {
    var units = JSON.parse(this.game.fileStore.getFile("units2").data);
    for (var x = 0; x < units.width; x++) {
        for (y = 0; y < units.height; y++) {
            var curGrid = units.units[(x + y*units.width)];
            console.log(curGrid);
            if (curGrid === 1) {
                this.player1.addPiece(x, y);
            } else if (curGrid === 2) {
                this.player2.addPiece(x, y);
            } else if (curGrid === 3) {
                this.blocks.addChild(new Block(this, x, y));
            };
        }
    }
};

var GridMovement = function (state, width, height, tWidth, tHeight, marginL, marginR, marginT, marginB) {

    this.state = state;
    this.tileWidth = tWidth; //width in pixels of a tile.
    this.tileHeight = tHeight; //height in pixels of a tile.
    this.width = width; //width in pixels of the entire tilemap.
    this.height = height; //height in pixels of the entire tilemap.
    this.marginL = marginL; //margin in pixels around the edge of the arena which is not playable.
    this.marginR = marginR;
    this.marginT = marginT;
    this.marginB = marginB;

    /*Returns a GridSquare corrisponding to the pixel position given to the method.  If either positions are outside the playable area returns null.
    @x 'x' position, in pixels, of the square you want to get.
    @y 'y' position, in pixels, of the square you want to get.
    @return GridSquare at given position or null.
    */
    GridMovement.prototype.getGridSquare = function (x, y) {
        if (x > width - marginR || y > height - marginB || x < marginL || y < marginT) {
            return null;
        } else {
            var xPos = Math.floor((x - marginL) / tWidth);
            var yPos = Math.floor((y - marginT) / tHeight);
            return new GridSquare(xPos, yPos);
        }
    };

    /*Given a 'x' co-ordinate on the grid returns the pixel position of that sqaure.
    @x 'x' position of the grid square.
    @return 'x' pixel position of the top right corner of the square.
    */
    GridMovement.prototype.getPixelX = function (x) {
        return x * tWidth + marginL;
    };

    /*Given a 'y' co-ordinate on the grid returns the pixel position of that sqaure.
    @y 'y' position of the grid square.
    @return 'y' pixel position of the top right corner of the square.
    */
    GridMovement.prototype.getPixelY = function (y) {
        return y * tHeight + marginT;
    };

    /*Given a GridSquare will return the Object that exsists in the square.
    @square The square being checked for objects.
    @return The object in the square or null if nothing there.
     */
    GridMovement.prototype.getObjectAt = function (square) {
        var Player1 = state.player1.pieces;
        for (var i = 0; i < Player1.numChildren(); i++) {
            var piece = Player1.getChildAt(i);
            if (square.equals(piece.gridPosition)) {
                return piece;
            }
        }
        var Player2 = state.player2.pieces;
        for (var i = 0; i < Player2.numChildren(); i++) {
            var piece = Player2.getChildAt(i);

            if (square.equals(piece.gridPosition)) {
                return piece;
            }
        }
        var Blocks = state.blocks;
        for (var i = 0; i < Blocks.numChildren(); i++) {
            var block = Blocks.getChildAt(i)
            var p1x = block.x; //gets the x position of the current block
            var p1y = block.y; //gets the y position of the current block
            if (square.equals(this.getGridSquare(p1x, p1y))) {
                return block;
            }
        }
        return null;
    };

    GridMovement.prototype.validIndex = function (x, y) {
        return x >= 0 && x < (width - (marginL + marginR)) / tWidth && y >= 0 && y < (height - (marginT + marginB)) / tHeight;
    };
};

var GridSquare = function (x, y) {
    //The grid position of the square.
    this.x = x;
    this.y = y;

    //The pixel postion of the top right corner of the GridSquare.
    this.pixelX = GridMovement.prototype.getPixelX(x);
    this.pixelY = GridMovement.prototype.getPixelY(y);

    /*Checks if the given GridSquare is equal to this GridSquare.
    @other The other GridSquare object being checked.
    @return Boolean of whether or not the GridSquare are equal.
    */
    GridSquare.prototype.equals = function (other) {
        if (other === null) {
            return false;
        }
        if (this.x === other.x && this.y === other.y) {
            return true;
        } else {
            return false;
        }
    };

    /*Moves the grid square by the number of squares given, and updates its pixel position.
    @x Number of squares to move in the 'x' axis.
    @y Number of squares to move in the 'y' axis.
    */
    GridSquare.prototype.moveSquare = function (x, y) {
        var tempX = this.x + x;
        var tempY = this.y + y;

        if (GridMovement.prototype.validIndex(tempX, tempY)) {
            return new GridSquare(tempX, tempY);
        }
        return null;
    };

    /*Given another GridSquare and a range, will try to find if that square is in that range of this square.
    @square GridSquare to find.
    @range Range to find sqaure in.
    @return Whether or not square is in range.
    */
    GridSquare.prototype.inRange = function (square, range) {
        if (square.x >= this.x - 1 && square.x <= this.x + 1 && square.y === this.y) {
            return true;
        } else if (square.y >= this.y - 1 && square.y <= this.y + 1 && square.x === this.x) {
            return true;
        }
        return false;
    };

    /*Returns the direction of a given square from this one as a compass direction e.g. 'n','e','w','s'.  If not on one of these axis' returns null.
    @square The GridSquare to find the direction to.
    @return The compass direction of the square.
    */
    GridSquare.prototype.getDirection = function (square) {
        if (square.y === this.y) {
            if (square.x > this.x) {
                return 'e';
            } else if (square.x < this.x) {
                return 'w';
            }
        }
        if (square.x === this.x) {
            if (square.y > this.y) {
                return 's';
            } else if (square.y < this.y) {
                return 'n';
            }
        }
        return null;
    };

    GridSquare.prototype.getSquareFromDirection = function (direction) {
        var x, y;
        if (direction === 'n') {
            x = 0;
            y = -1;
        } else if (direction === 's') {
            x = 0;
            y = 1;
        } else if (direction === 'e') {
            x = 1;
            y = 0;
        } else if (direction === 'w') {
            x = -1;
            y = 0;
        }

        return this.moveSquare(x, y);
    };
};

var Player = function (state, name) {

    this.name = name;
    this.pieces = new Kiwi.Group(state); //The Pieces that this Player object control

    this.isTurn = false; //whether or not it is currently the players turn.

    this.selectedPiece = null; //The currently selected Piece.

    this.actionPoints = 5;

    this.mouseDown = false;

    Player.prototype.update = function () {
        this.pieces.update();
        if (this.actionPoints === 0) {
            this.endTurn();
        } else if (this.isTurn) {
            this.mouseHandler();
        }
    };

    Player.prototype.mouseHandler = function () {
        if (state.mouse.isDown && !this.mouseDown) {
            var selectedSquare = GridMovement.prototype.getGridSquare(state.mouse.x / state.arenaScale, state.mouse.y / state.arenaScale);

            if (selectedSquare !== null) {
                var unit = GridMovement.prototype.getObjectAt(selectedSquare);
                console.log(unit);
                if (unit instanceof Piece) {
                    if (unit !== this.selectedPiece && unit.player === this) { //if the Piece clicked on is not currently selected and belongs to this player.
                        if (this.selectedPiece !== null) { //If there is currently a piece selected
                            this.selectedPiece.unselectPiece(); //unselect the piece.
                            this.selectedPiece = null;
                        }
                        unit.selectPiece(); //select the piece as the current active piece.
                        this.selectedPiece = unit;
                    }
                } else if (unit === null && this.selectedPiece !== null) { //if the square is empty and a piece is currently selected.
                    if (this.selectedPiece.moveToSquare(selectedSquare)) this.actionPoints = this.actionPoints - 1; //move the piece to that square.
                } else if (unit instanceof Block && this.selectedPiece !== null) {
                    if (this.selectedPiece.gridPosition.inRange(unit.gridPosition, 1)) { //if the currently selected piec is next to the block
                        if (unit.pushBlock(this.selectedPiece.gridPosition.getDirection(unit.gridPosition))) { //find the direction of the block in relation to the piece and move the block in that direction
                            if (this.selectedPiece.moveToSquare(selectedSquare)) this.actionPoints = this.actionPoints - 1; //move the piece into the vacated square.
                        }
                    }

                }
                console.log(this.actionPoints);
            }
            this.mouseDown = true;
        } else if (state.mouse.isUp && this.mouseDown) {
            this.mouseDown = false;
        }
    };

    Player.prototype.addPiece = function (x, y) {
        var piece = new Piece(state, this, x, y);
        this.pieces.addChild(piece);
    };

    Player.prototype.endTurn = function () {
        this.isTurn = false;
        this.actionPoints = 5;
        this.selectedPiece.unselectPiece();
        this.selectedPiece = null;
        state.switchPlayer();
    };
};

var Piece = function (state, player, x, y) {
    this.gridPosition = new GridSquare(x, y);

    this.player = player;

    Kiwi.GameObjects.Sprite.call(this, state, state.textures['piece' + player.name], this.gridPosition.pixelX, this.gridPosition.pixelY);

    this.animation.add("n", [3], 0.1, false);
    this.animation.add("e", [1], 0.1, false);
    this.animation.add("w", [7], 0.1, false);
    this.animation.add("s", [5], 0.1, false);
    this.animation.add("n s", [2], 0.1, false);
    this.animation.add("e s", [0], 0.1, false);
    this.animation.add("w s", [6], 0.1, false);
    this.animation.add("s s", [4], 0.1, false);

    this.facing = 'n';

    if (this.player.name === '1') {
        this.facing = 'e';
        this.animation.play('e');
    } else {
        this.facing = 'w';
        this.animation.play('w');
    }

    this.isSelected = false; //whether or not the Piece is selected.

    Piece.prototype.update = function () {
        Kiwi.GameObjects.Sprite.prototype.update.call(this);
    };

    /*Sets the Piece to selected updating its texture.*/
    Piece.prototype.selectPiece = function () {
        this.isSelected = true;
        this.animation.play(this.facing + ' s');
    };
    /*Sets the Piece to unselected updating its texture.*/
    Piece.prototype.unselectPiece = function () {
        this.isSelected = false;
        this.animation.play(this.facing);
    };

    /*Given a GridSquare moves the Piece to that grid position.
    @square The GridSquare the piece is moving to.
    */
    Piece.prototype.moveToSquare = function (square) {
        if (this.gridPosition.inRange(square, 1)) {
            this.x = square.pixelX;
            this.y = square.pixelY;
            this.facing = this.gridPosition.getDirection(square);
            this.animation.play(this.facing + ' s');
            this.gridPosition = square;
            return true;
        }
        return false;
    };

    /*Attempts to kill the Piece with a block, returns true if space can be taken by block
     */
    Piece.prototype.attemptKill = function (direction) {
        var pushSquare = this.gridPosition.getSquareFromDirection(direction);
        if (pushSquare === null) {
            this.kill(direction, 'wall');
            return true
        }
        var unit = GridMovement.prototype.getObjectAt(pushSquare);
        if (unit === null) {
            this.moveToSquare(pushSquare);
            return true;
        }
        if (unit instanceof Block) {
            this.kill(direction, 'block');
            return true
        } else {
            return false;
        }
    };

    Piece.prototype.kill = function (direction, unit) {
        if (direction === 'e') {
            this.state.bloodSplatters.addChild(new Blood(this.state, this.gridPosition.x, this.gridPosition.y - 1, 'e', 'up'));
            this.state.bloodSplatters.addChild(new Blood(this.state, this.gridPosition.x, this.gridPosition.y + 1, 'e', 'down'));
            if (unit === 'block') {
                this.state.bloodSplatters.addChild(new Blood(this.state, this.gridPosition.x + 1, this.gridPosition.y - 1, 'w', 'up'));
                this.state.bloodSplatters.addChild(new Blood(this.state, this.gridPosition.x + 1, this.gridPosition.y + 1, 'w', 'down'));
            }
        } else if (direction === 'w') {
            this.state.bloodSplatters.addChild(new Blood(this.state, this.gridPosition.x, this.gridPosition.y - 1, 'w', 'up'));
            this.state.bloodSplatters.addChild(new Blood(this.state, this.gridPosition.x, this.gridPosition.y + 1, 'w', 'down'));
            if (unit === 'block') {
                this.state.bloodSplatters.addChild(new Blood(this.state, this.gridPosition.x - 1, this.gridPosition.y - 1, 'e', 'up'));
                this.state.bloodSplatters.addChild(new Blood(this.state, this.gridPosition.x - 1, this.gridPosition.y + 1, 'e', 'down'));
            }
        } else if (direction === 'n') {
            this.state.bloodSplatters.addChild(new Blood(this.state, this.gridPosition.x - 1, this.gridPosition.y, 'n', 'left'));
            this.state.bloodSplatters.addChild(new Blood(this.state, this.gridPosition.x + 1, this.gridPosition.y, 'n', 'right'));
            if (unit === 'block') {
                this.state.bloodSplatters.addChild(new Blood(this.state, this.gridPosition.x - 1, this.gridPosition.y + 1, 's', 'left'));
                this.state.bloodSplatters.addChild(new Blood(this.state, this.gridPosition.x + 1, this.gridPosition.y + 1, 's', 'right'));
            }
        } else if (direction === 's') {
            this.state.bloodSplatters.addChild(new Blood(this.state, this.gridPosition.x - 1, this.gridPosition.y, 's', 'left'));
            this.state.bloodSplatters.addChild(new Blood(this.state, this.gridPosition.x + 1, this.gridPosition.y, 's', 'right'));
            if (unit === 'block') {
                this.state.bloodSplatters.addChild(new Blood(this.state, this.gridPosition.x - 1, this.gridPosition.y + 1, 'n', 'left'));
                this.state.bloodSplatters.addChild(new Blood(this.state, this.gridPosition.x + 1, this.gridPosition.y + 1, 'n', 'right'));
            }
        }
        this.destroy();
    };
};
Kiwi.extend(Piece, Kiwi.GameObjects.Sprite);

var Block = function (state, x, y) {
    this.gridPosition = new GridSquare(x, y);

    Kiwi.GameObjects.Sprite.call(this, state, state.textures.block, this.gridPosition.pixelX, this.gridPosition.pixelY);

    Block.prototype.update = function () {
        Kiwi.GameObjects.Sprite.prototype.update.call(this);
    };

    /*Push the block in the given direction.  Returns true if push successful.
     */
    Block.prototype.pushBlock = function (direction) {

        var newSquare = this.gridPosition.getSquareFromDirection(direction);
        if (newSquare === null) {
            return false;
        }
        var unit = GridMovement.prototype.getObjectAt(newSquare);
        if (unit !== null) {
            if (unit instanceof Block) {
                return false;
            } else if (unit instanceof Piece) {
                if (unit.player === this.state.currentPlayer) {
                    return false;
                } else {
                    if (!unit.attemptKill(direction)) {
                        return false;
                    }
                }
            }
        }
        this.gridPosition = newSquare;
        this.x = this.gridPosition.pixelX;
        this.y = this.gridPosition.pixelY;
        return true;
    };
};
Kiwi.extend(Block, Kiwi.GameObjects.Sprite);

var Blood = function (state, x, y, direction, vector) {
    this.gridPosition = new GridSquare(x, y);

    Kiwi.GameObjects.Sprite.call(this, state, state.textures.blood, this.gridPosition.pixelX, this.gridPosition.pixelY);

    this.animation.add('e up', [0], 0.1, false);
    this.animation.add('w up', [1], 0.1, false);
    this.animation.add('e down', [2], 0.1, false);
    this.animation.add('w down', [3], 0.1, false);
    this.animation.add('s left', [4], 0.1, false);
    this.animation.add('s right', [5], 0.1, false);
    this.animation.add('n left', [6], 0.1, false);
    this.animation.add('n right', [7], 0.1, false);

    this.animation.play(direction + " " + vector);

    Blood.prototype.update = function () {
        Kiwi.GameObjects.Sprite.prototype.update.call(this);
    };
};
Kiwi.extend(Blood, Kiwi.GameObjects.Sprite);