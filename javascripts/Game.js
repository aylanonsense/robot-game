define([
	'jquery',
	'game/Player',
	'game/Constants',
	'game/level/Level1'
], function(
	$,
	Player,
	Constants,
	Level
) {
	var player = new Player(0, 0);
	var grapples = [];
	var camera = { x: 0, y: 0 };
	var level = new Level();
	var keyboard = {};
	player.pos.x = level.playerStartPoint.x;
	player.pos.y = level.playerStartPoint.y;

	return {
		reset: function() {},
		update: function(t) {
			//everything moves before the player
			for(var i = 0; i < grapples.length; i++) {
				if(!grapples[i].isDead) {
					grapples[i].move();
					grapples[i].checkForCollisions(level.tileGrid);
				}
			}

			//then the player moves
			var moveDirX = keyboard.MOVE_LEFT ? -1 : (keyboard.MOVE_RIGHT ? 1 : 0);
			var moveDirY = keyboard.MOVE_UP ? -1 : (keyboard.MOVE_DOWN ? 1 : 0);
			player.planMovement(moveDirX, moveDirY);
			while(player.hasMovementRemaining()) {
				//move the player forward a bit
				player.move();
				player.checkForCollisions(level.tileGrid);
			}

			//then the grapples may affect the player -- outside the loop above for simplicity
			for(i = 0; i < grapples.length; i++) {
				if(!grapples[i].isDead) {
					grapples[i].applyForceToPlayer();
				}
			}
			player.checkForCollisions(level.tileGrid);
			player.tick();

			//the camera adjusts to follow the player
			camera.x = Math.round(player.pos.x - Constants.WIDTH / 2);
			camera.y = Math.round(player.pos.y - Constants.HEIGHT / 2 - 0.12 * Constants.HEIGHT);
		},
		render: function(ctx) {
			ctx.fillStyle = '#fff';
			ctx.fillRect(0, 0, Constants.WIDTH, Constants.HEIGHT);
			level.backgroundTileGrid.render(ctx, camera);
			level.tileGrid.render(ctx, camera);
			for(var i = 0; i < level.obstacles.length; i++) {
				level.obstacles[i].render(ctx, camera);
			}
			for(i = 0; i < grapples.length; i++) {
				if(!grapples[i].isDead) {
					grapples[i].render(ctx, camera);
				}
			}
			player.render(ctx, camera);
		},
		onMouseEvent: function(type, x, y) {
			if(type === 'mousedown') {
				var numMissedGrapples = 0;
				for(var i = 0; i < grapples.length; i++) {
					if(!grapples[i].isDead && !grapples[i].isLatched) {
						numMissedGrapples++;
					}
				}
				if(numMissedGrapples === 0) {
					grapples = [];
					var grapple = player.shootGrapple(x + camera.x, y + camera.y);
					if(keyboard.PULL_GRAPPLES) {
						grapple.startRetracting();
					}
					grapples.push(grapple);
				}
			}
		},
		onKeyboardEvent: function(key, isDown, kb) {
			keyboard = kb;
			if(isDown) {
				if(key === 'JUMP') {
					player.jump();
				}
				else if(key === 'PULL_GRAPPLES') {
					for(var i = 0; i < grapples.length; i++) {
						if(!grapples[i].isDead) {
							grapples[i].startRetracting();
						}
					}
				}
			}
			else {
				if(key === 'JUMP') {
					player.stopJumping();
				}
				else if(key === 'PULL_GRAPPLES') {
					grapples = [];
				}
			}
		}
	};
});