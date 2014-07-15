
/**
* The core TemplateGame game file.
* 
* This file is only used to initalise (start-up) the main Kiwi Game 
* and add all of the relevant states to that Game.
*
*/

//Initialise the Kiwi Game. 

var gameOptions = {
	renderer: Kiwi.RENDERER_WEBGL,
	width: 800,
	height: 600,
    scaleType: Kiwi.Stage.SCALE_FIT
};

var game = new Kiwi.Game('content', 'Baahp', null, gameOptions);

//Add all the States we are going to use.
game.states.addState(Baahp.Loading);
game.states.addState(Baahp.Intro);
game.states.addState(Baahp.Arena);

game.states.switchState("Loading");
