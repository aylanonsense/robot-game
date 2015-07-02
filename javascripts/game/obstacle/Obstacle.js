if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'game/Constants',
	'game/geom/Rect',
	'game/display/SpriteLoader'
], function(
	Constants,
	Rect,
	SpriteLoader
) {
	function Obstacle(x, y, obstacleType) {
		this._x = x;
		this._y = y;
		this._frame = obstacleType.frame;
		this._sprite = SpriteLoader.loadSpriteSheet(obstacleType.sprite);
		if(obstacleType.hitbox.type === 'rect') {
			this._collisionShape = new Rect(x + obstacleType.hitbox.x, y + obstacleType.hitbox.y,
				obstacleType.hitbox.width, obstacleType.hitbox.height);
		}
		else {
			throw new Error("Unsure how to parse hitbox of type '" + obstacleType.hitbox.type + "'");
		}
	}
	Obstacle.prototype.isOverlapping = function(geom) {
		return this._collisionShape.isOverlapping(geom);
	};
	Obstacle.prototype.isCrossedBy = function(line) {
		return line.isCrossing(this._collisionShape);
	};
	Obstacle.prototype.render = function(ctx, camera) {
		if(Constants.DEBUG || !this._sprite) {
			this._collisionShape.render(ctx, camera);
		}
		else {
			this._sprite.render(ctx, this._x - camera.x, this._y - camera.y, this._frame);
		}
	};
	return Obstacle;
});