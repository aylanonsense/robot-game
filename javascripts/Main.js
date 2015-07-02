define([
	'Constants',
	'Game'
], function(
	Constants,
	Game
) {
	return function() {
		//set up the canvas
		var canvas = document.getElementById("game-canvas");
		canvas.setAttribute("width", Constants.WIDTH);
		canvas.setAttribute("height", Constants.HEIGHT);
		var ctx = canvas.getContext("2d");

		//create new game
		var game = new Game(ctx);
		game.reset();

		//add mouse handler
		canvas.onmousedown = onMouseEvent;
		document.onmouseup = onMouseEvent;
		document.onmousemove = onMouseEvent;
		function onMouseEvent(evt) {
			game.onMouseEvent(evt.type,
				evt.clientX - canvas.offsetLeft + document.body.scrollLeft,
				evt.clientY - canvas.offsetTop + document.body.scrollTop);
		}

		//add keyboard handler
		var keyboard = {};
		for(var key in Constants.KEY_BINDINGS) {
			keyboard[Constants.KEY_BINDINGS[key]] = false;
		}
		document.onkeyup = onKeyboardEvent;
		document.onkeydown = onKeyboardEvent;
		function onKeyboardEvent(evt) {
			var isDown = (evt.type === 'keydown');
			if(Constants.KEY_BINDINGS[evt.which] &&
				keyboard[Constants.KEY_BINDINGS[evt.which]] !== isDown) {
				keyboard[Constants.KEY_BINDINGS[evt.which]] = isDown;
				game.onKeyboardEvent(Constants.KEY_BINDINGS[evt.which], isDown, keyboard);
			}
		}

		//kick off the game loop
		var prevTime = performance.now();
		function loop(time) {
			var t;
			var framesPerSecond = Constants.FRAMES_PER_SECOND || 60;
			if(Constants.CONSTANT_TIME_PER_FRAME) {
				t = 1 / framesPerSecond;
			}
			else {
				t = Math.min((time - prevTime) / 1000, 3 / framesPerSecond);
			}
			t *= Constants.TIME_SCALE;
			game.update(t);
			game.render();
			prevTime = time;
			scheduleLoop();
		}
		function scheduleLoop() {
			if(!Constants.FRAMES_PER_SECOND) {
				requestAnimationFrame(loop);
			}
			else {
				setTimeout(function() {
					loop(performance.now());
				}, 1000 / Constants.FRAMES_PER_SECOND);
			}
		}
		scheduleLoop();
	};
});