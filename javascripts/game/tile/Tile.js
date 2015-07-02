if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'game/Constants',
	'game/geom/Line',
	'game/geom/Rect',
	'game/geom/Triangle',
	'game/geom/Multi',
	'game/display/SpriteLoader'
], function(
	Constants,
	Line,
	Rect,
	Triangle,
	Multi,
	SpriteLoader
) {
	var T = Constants.TILE_SIZE; //for convenience
	function Tile(col, row, tileType, frame, variant) {
		this.col = col;
		this.row = row;
		this.tileType = tileType;
		this.frame = frame;
		this.variant = variant || 0;
		this.walkSlope = 0;
		this.oneWayPlatform = (tileType && tileType.oneWayPlatform) || false;
		var shapeKey = 'box';
		//select the correct shape to represent the tile
		if(frame === 23) { //upper half brick
			this._shape = new Rect(T * this.col, T * this.row, T, T / 2);
			this._topBorder = new Line(T * this.col, T * this.row, T * (this.col + 1), T * this.row);
		}
		else if(frame === 27) { //lower half brick
			this._shape = new Rect(T * this.col, T * (this.row + 0.5), T, T / 2);
			this._topBorder = new Line(T * this.col, T * (this.row + 0.5), T * this.col + T, T * (this.row + 0.5));
		}
		else if(frame === 16) { //triangle \|
			this._shape = new Triangle(T * this.col, T * this.row, T, T, 'upper-right');
			this._topBorder = new Line(T * this.col, T * this.row, T * (this.col + 1), T * this.row);
		}
		else if(frame === 17) { //triangle |/
			this._shape = new Triangle(T * this.col, T * this.row, T, T, 'upper-left');
			this._topBorder = new Line(T * this.col, T * this.row, T * (this.col + 1), T * this.row);
		}
		else if(frame === 18) { //triangle /|
			this.walkSlope = 1;
			this._shape = new Triangle(T * this.col, T * this.row, T, T, 'lower-right');
			this._topBorder = new Line(T * this.col, T * (this.row + 1), T * (this.col + 1), T * this.row);
		}
		else if(frame === 19) { //triangle |\
			this.walkSlope = -1;
			this._shape = new Triangle(T * this.col, T * this.row, T, T, 'lower-left');
			this._topBorder = new Line(T * this.col, T * this.row, T * (this.col + 1), T * (this.row + 1));
		}
		else if(frame === 20) { //1st part of /| ramp
			this.walkSlope = 1 / 3;
			this._shape = new Triangle(T * this.col, T * (this.row + 2 / 3), T, T / 3, 'lower-right');
			this._topBorder = new Line(T * this.col, T * (this.row + 1), T * (this.col + 1), T * (this.row + 2 / 3));
		}
		else if(frame === 21) { //2nd part of /| ramp
			this.walkSlope = 1 / 3;
			this._shape = new Multi([
				new Triangle(T * this.col, T * (this.row + 1 / 3), T, T / 3, 'lower-right'),
				new Rect(T * this.col, T * (this.row + 2 / 3), T, T / 3)
			]);
			this._topBorder = new Line(T * this.col, T * (this.row + 2 / 3), T * (this.col + 1), T * (this.row + 1 / 3));
		}
		else if(frame === 22) { //3rd part of /| ramp
			this.walkSlope = 1 / 3;
			this._shape = new Multi([
				new Triangle(T * this.col, T * this.row, T, T / 3, 'lower-right'),
				new Rect(T * this.col, T * (this.row + 1 / 3), T, T * 2 / 3, 'lower-right')
			]);
			this._topBorder = new Line(T * this.col, T * (this.row + 1 / 3), T * (this.col + 1), T * this.row);
		}
		else if(frame === 26) { //1st part of |\ ramp
			this.walkSlope = -1 / 3;
			this._shape = new Triangle(T * this.col, T * (this.row + 2 / 3), T, T / 3, 'lower-left');
			this._topBorder = new Line(T * this.col, T * (this.row + 2 / 3), T * (this.col + 1), T * (this.row + 1));
		}
		else if(frame === 25) { //2nd part of |\ ramp
			this.walkSlope = -1 / 3;
			this._shape = new Multi([
				new Triangle(T * this.col, T * (this.row + 1 / 3), T, T / 3, 'lower-left'),
				new Rect(T * this.col, T * (this.row + 2 / 3), T, T / 3)
			]);
			this._topBorder = new Line(T * this.col, T * (this.row + 1 / 3), T * (this.col + 1), T * (this.row + 2 / 3));
		}
		else if(frame === 24) { //3rd part of |\ ramp
			this.walkSlope = -1 / 3;
			this._shape = new Multi([
				new Triangle(T * this.col, T * this.row, T, T / 3, 'lower-left'),
				new Rect(T * this.col, T * (this.row + 1 / 3), T, T * 2 / 3, 'lower-right')
			]);
			this._topBorder = new Line(T * this.col, T * this.row, T * (this.col + 1), T * (this.row + 1 / 3));
		}
		else { //box
			this._shape = new Rect(T * this.col, T * this.row, T, T);
			this._topBorder = new Line(T * this.col, T * this.row, T * (this.col + 1), T * this.row);
		}
		//intialize display vars (spritesheet)
		if(tileType && tileType.sprite) {
			this._sprite = SpriteLoader.loadSpriteSheet(tileType.sprite);
			this._frame = (frame || 0) + 28 * this.variant;
		}
	}
	Tile.prototype.isOverlapping = function(geom) {
		return this._shape.isOverlapping(geom);
	};
	Tile.prototype.isCrossedBy = function(line) {
		if(this.oneWayPlatform) {
			return line.isCrossing(this._topBorder);
		}
		else {
			return line.isCrossing(this._shape);
		}
	};
	Tile.prototype.render = function(ctx, camera) {
		if(Constants.DEBUG || !this._sprite) {
			this._shape.render(ctx, camera, (this.tileType.background || this.oneWayPlatform ? '#88b' : '#006'));
			if(this.oneWayPlatform && this._topBorder) {
				this._topBorder.render(ctx, camera, '#006', 3);
			}
		}
		else {
			this._sprite.render(ctx, T * this.col - Constants.TILE_DISPLAY_PADDING - camera.x,
				T * this.row - Constants.TILE_DISPLAY_PADDING - camera.y, this._frame);
		}
	};
	return Tile;
});