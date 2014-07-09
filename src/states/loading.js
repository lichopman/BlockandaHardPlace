var Baahp = Baahp || {};

Baahp.Loading = new KiwiLoadingScreen('Loading', 'Intro', 'Assets/Images/loading/');

Baahp.Loading.preload = function () {
    KiwiLoadingScreen.prototype.preload.call(this);
    
    this.addJSON('arena1', 'Assets/Arenas/Arena1.json');
    this.addSpriteSheet('arenaTiles', 'Assets/Images/Tilesets/Background.png', 32, 32);
    this.addImage('piece1', 'Assets/Images/Piece1.png');
    this.addImage('piece1s', 'Assets/Images/Piece1s.png');
    this.addImage('piece2', 'Assets/Images/Piece2.png')
    this.addImage('block', 'Assets/Images/Block.png');
};
