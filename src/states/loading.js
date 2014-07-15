var Baahp = Baahp || {};

Baahp.Loading = new KiwiLoadingScreen('Loading', 'Intro', 'Assets/Images/loading/');

Baahp.Loading.preload = function () {
    KiwiLoadingScreen.prototype.preload.call(this);
    
    this.addJSON('arena1', 'Assets/Arenas/Arena1.json');
    this.addJSON('units1', 'Assets/Arenas/Units1.json');
    this.addJSON('arena2', 'Assets/Arenas/Arena2.json');
    this.addJSON('units2', 'Assets/Arenas/Units2.json');
    this.addSpriteSheet('arenaTiles', 'Assets/Images/Tilesets/Background.png', 32, 32);
    this.addSpriteSheet('piece1', 'Assets/Images/Piece1.png', 32, 32);
    this.addSpriteSheet('piece2', 'Assets/Images/Piece2.png', 32, 32);
    this.addImage('block', 'Assets/Images/Block.png');
    this.addSpriteSheet('blood', 'Assets/Images/Tilesets/bloodtiles.png', 32, 32);
};
