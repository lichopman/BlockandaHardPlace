var Baahp = Baahp || {};

Baahp.Play = new Kiwi.State('Play');

Baahp.Play.create = function () {

    this.mouse = this.game.input.mouse;

    this.arena = new Kiwi.GameObjects.Tilemap.TileMap(this, 'arena1', this.textures.arenaTiles);

    this.gridMovement = new GridMovement(this, 288, 224, 32, 32, 32);

    this.player1 = new Player(this, 'Player1'); //contains all the pieces belonging to Player1.
    this.player2 = new Kiwi.Group(this); //contains all the pieces belonging to Player2.
    this.blocks = new Kiwi.Group(this); //contains all the blocks that players can interact with.



    this.blocks.addChild(new Kiwi.GameObjects.StaticImage(this, this.textures.block, 96, 64));
    this.blocks.addChild(new Kiwi.GameObjects.StaticImage(this, this.textures.block, 96, 128));
    this.blocks.addChild(new Kiwi.GameObjects.StaticImage(this, this.textures.block, 160, 64));
    this.blocks.addChild(new Kiwi.GameObjects.StaticImage(this, this.textures.block, 160, 128));

    this.player2.addChild(new Kiwi.GameObjects.StaticImage(this, this.textures.piece2, 224, 64));
    this.player2.addChild(new Kiwi.GameObjects.StaticImage(this, this.textures.piece2, 224, 128));
    this.player2.addChild(new Kiwi.GameObjects.StaticImage(this, this.textures.piece2, 192, 96));

    this.addChild(this.arena.layers[0]);

    this.addChild(this.player1.pieces);
    this.addChild(this.player2);
    this.addChild(this.blocks);
};

Baahp.Play.update = function () {
    this.mouseHandler();
};

Baahp.Play.mouseHandler = function () {
    if (this.mouse.justPressed(20)) {
        var selectedSquare = GridMovement.prototype.getGridSquare(this.mouse.x, this.mouse.y);
        if (selectedSquare !== null) {
            var unit = GridMovement.prototype.getObjectAt(selectedSquare);
            if (unit === null) {
                return;
            }
            if (unit instanceof Piece && this.player1.isTurn) {
                if (unit !== this.player1.selectedPiece) {
                    if (this.player1.selectedPiece !== null) {
                        this.player1.selectedPiece.unselectPiece();
                    }
                    unit.selectPiece();
                    this.player1.selectedPiece = unit;
                }
            }
        }
    }
};



var GridMovement = function (state, width, height, tWidth, tHeight, margin) {

    this.state = state;
    this.tileWidth = tWidth; //width in pixels of a tile.
    this.tileHeight = tHeight; //height in picels of a tile.
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

    /*Given a GridSquare will return the Object that exsists in the square.
     */
    GridMovement.prototype.getObjectAt = function (square) {
        var Player1 = state.player1.pieces;
        for (var i = 0; i < Player1.numChildren(); i++) {
            var piece = Player1.getChildAt(i);
            if (square.equals(piece.gridPosition)) {
                return piece;
            }
        }
        var Player2 = state.player2;
        for (var i = 0; i < Player2.numChildren(); i++) {
            var piece = Player1.getChildAt(i);
            var p1x = piece.x; //gets the x position of the current piece
            var p1y = piece.y; //gets the y position of the current piece

            if (square.equals(this.getGridSquare(p1x, p1y))) {
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
};

var GridSquare = function (x, y) {
    this.x = x;
    this.y = y;

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
};

var Player = function (state, name) {

    this.pieces = new Kiwi.Group(state); //The Pieces that this Player object controll

    this.pieces.addChild(new Piece(state, 32, 64));
    this.pieces.addChild(new Piece(state, 32, 128));
    this.pieces.addChild(new Piece(state, 64, 96));

    this.isTurn = true;

    this.selectedPiece = null; //The currently selected Piece.
};

var Piece = function (state, x, y) {
    Kiwi.GameObjects.Sprite.call(this, state, state.textures.piece1, x, y);

    this.gridPosition = GridMovement.prototype.getGridSquare(x, y);

    this.isSelected = false; //whether or not the Piece is selected.

    Piece.prototype.update = function () {
        Kiwi.GameObjects.Sprite.prototype.update.call(this);
    };

    Piece.prototype.selectPiece = function () {
        this.isSelected = true;
        this.atlas = this.state.textures.piece1s;
    };
    Piece.prototype.unselectPiece = function () {
        this.isSelected = false;
        this.atlas = this.state.textures.piece1;
    };
};

Kiwi.extend(Piece, Kiwi.GameObjects.Sprite);