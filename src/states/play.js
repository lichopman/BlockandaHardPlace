var Baahp = Baahp || {};

Baahp.Play = new Kiwi.State('Play');

Baahp.Play.create = function () {

    this.mouse = this.game.input.mouse;

    this.arena = new Kiwi.GameObjects.Tilemap.TileMap(this, 'arena1', this.textures.arenaTiles);

    this.gridMovement = new GridMovement(this, 288, 224, 32, 32, 32);

    this.player1 = new Player(this, '1'); //contains all the pieces belonging to Player1.
    this.player2 = new Player(this, '2'); //contains all the pieces belonging to Player2.
    this.blocks = new Kiwi.Group(this); //contains all the blocks that players can interact with.
    this.bloodSplatters = new Kiwi.Group(this); //contains all the blood splatters.

    this.currentPlayer = this.player1;

    this.blocks.addChild(new Block(this, 2, 1));
    this.blocks.addChild(new Block(this, 2, 3));
    this.blocks.addChild(new Block(this, 4, 1));
    this.blocks.addChild(new Block(this, 4, 3));

    this.player1.addPiece(0, 1);
    this.player1.addPiece(0, 3);
    this.player1.addPiece(1, 2);

    this.player2.addPiece(6, 1);
    this.player2.addPiece(6, 3);
    this.player2.addPiece(5, 2);

    this.addChild(this.arena.layers[0]);

    this.addChild(this.bloodSplatters);
    this.addChild(this.player1.pieces);
    this.addChild(this.player2.pieces);
    this.addChild(this.blocks);

    this.player1.isTurn = true;
};

Baahp.Play.update = function () {
    Kiwi.State.prototype.update.call(this);
    this.currentPlayer.update();
};

Baahp.Play.switchPlayer = function () {
    if (this.currentPlayer === this.player1) {
        this.currentPlayer = this.player2;
        this.player2.isTurn = true;
    } else {
        this.currentPlayer = this.player1;
        this.player1.isTurn = true;
    }
};

var GridMovement = function (state, width, height, tWidth, tHeight, margin) {

    this.state = state;
    this.tileWidth = tWidth; //width in pixels of a tile.
    this.tileHeight = tHeight; //height in pixels of a tile.
    this.width = width; //width in pixels of the entire tilemap.
    this.height = height; //height in pixels of the entire tilemap.
    this.margin = margin; //margin in pixels around the edge of the arena which is not playable.

    /*Returns a GridSquare corrisponding to the pixel position given to the method.  If either positions are outside the playable area returns null.
    @x 'x' position, in pixels, of the square you want to get.
    @y 'y' position, in pixels, of the square you want to get.
    @return GridSquare at given position or null.
    */
    GridMovement.prototype.getGridSquare = function (x, y) {
        if (x > width - margin || y > height - margin || x < margin || y < margin) {
            return null;
        } else {
            var xPos = Math.floor((x - margin) / tWidth);
            var yPos = Math.floor((y - margin) / tHeight);
            return new GridSquare(xPos, yPos);
        }
    };

    /*Given a 'x' co-ordinate on the grid returns the pixel position of that sqaure.
    @x 'x' position of the grid square.
    @return 'x' pixel position of the top right corner of the square.
    */
    GridMovement.prototype.getPixelX = function (x) {
        return x * tWidth + margin;
    };

    /*Given a 'y' co-ordinate on the grid returns the pixel position of that sqaure.
    @y 'y' position of the grid square.
    @return 'y' pixel position of the top right corner of the square.
    */
    GridMovement.prototype.getPixelY = function (y) {
        return y * tHeight + margin;
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
        return x >= 0 && x < (width - margin * 2) / tWidth && y >= 0 && y < (height - margin * 2) / tHeight;
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

    Player.prototype.update = function () {
        this.pieces.update();
        if (this.actionPoints === 0) {
            this.endTurn();
        } else if (this.isTurn) {
            this.mouseHandler();
        }
    };

    Player.prototype.mouseHandler = function () {
        if (state.mouse.justPressed(20)) {
            var selectedSquare = GridMovement.prototype.getGridSquare(state.mouse.x, state.mouse.y);

            console.log(selectedSquare.x + ' : ' + selectedSquare.y);
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
                } else if (unit instanceof Block) {
                    if (this.selectedPiece.gridPosition.inRange(unit.gridPosition, 1)) { //if the currently selected piec is next to the block
                        if (unit.pushBlock(this.selectedPiece.gridPosition.getDirection(unit.gridPosition))) { //find the direction of the block in relation to the piece and move the block in that direction
                            if (this.selectedPiece.moveToSquare(selectedSquare)) this.actionPoints = this.actionPoints - 1; //move the piece into the vacated square.
                        }
                    }

                }
                console.log(this.actionPoints)
            }
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

    Kiwi.GameObjects.Sprite.call(this, state, state.textures['piece' + this.player.name], this.gridPosition.pixelX, this.gridPosition.pixelY);

    this.isSelected = false; //whether or not the Piece is selected.

    Piece.prototype.update = function () {
        Kiwi.GameObjects.Sprite.prototype.update.call(this);
    };

    /*Sets the Piece to selected updating its texture.*/
    Piece.prototype.selectPiece = function () {
        this.isSelected = true;
        this.atlas = this.state.textures['piece' + this.player.name + 's'];
    };
    /*Sets the Piece to unselected updating its texture.*/
    Piece.prototype.unselectPiece = function () {
        this.isSelected = false;
        this.atlas = this.state.textures['piece' + this.player.name];
    };

    /*Given a GridSquare moves the Piece to that grid position.
    @square The GridSquare the piece is moving to.
    */
    Piece.prototype.moveToSquare = function (square) {
        if (this.gridPosition.inRange(square, 1)) {
            this.x = square.pixelX;
            this.y = square.pixelY;
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