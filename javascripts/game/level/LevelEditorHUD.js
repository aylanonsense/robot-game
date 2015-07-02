if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'game/display/SpriteLoader',
	'game/config/tile-config',
	'game/geom/Rect',
	'game/geom/Triangle',
	'game/Constants'
], function(
	SpriteLoader,
	config,
	Rect,
	Triangle,
	Constants
) {
	var HUD_WIDTH = 200;
	var HUD_PADDING = 20;
	var HUD_SPACING = 10;
	var SHAPE_AREA_HEIGHT = 75;
	function LevelEditorHUD() {
		this._selectedTileIndex = 0;
		this._tileSelectables = [];
		for(var key in config) {
			this._tileSelectables.push({ tileKey: key, sprite: SpriteLoader.loadSpriteSheet(config[key].sprite) });
		}
		//place tile sprites in a grid
		var x = Constants.WIDTH - HUD_WIDTH + HUD_PADDING;
		var y = HUD_PADDING + SHAPE_AREA_HEIGHT;
		var rowHeight = 0;
		for(var i = 0; i < this._tileSelectables.length; i++) {
			if(x + this._tileSelectables[i].sprite.width > Constants.WIDTH - HUD_PADDING) {
				x = Constants.WIDTH - HUD_WIDTH + HUD_PADDING;
				y += rowHeight + HUD_SPACING;
				rowHeight = 0;
			}
			rowHeight = Math.max(rowHeight, this._tileSelectables[i].sprite.height);
			this._tileSelectables[i].x = x;
			this._tileSelectables[i].y = y;
			x += this._tileSelectables[i].sprite.width + HUD_SPACING;
		}
		//you can also choose shape
		this._selectedShapeIndex = 0;
		this._shapeSelectables = [
			{ frame: 0, shape: new Rect(Constants.WIDTH - HUD_WIDTH + HUD_PADDING, HUD_PADDING, 24, 24) },
			{ frame: 18, shape: new Triangle(Constants.WIDTH - HUD_WIDTH + HUD_PADDING + 24 + HUD_SPACING, HUD_PADDING, 24, 24, 'lower-right') },
			{ frame: 19, shape: new Triangle(Constants.WIDTH - HUD_WIDTH + HUD_PADDING + 48 + 2 * HUD_SPACING, HUD_PADDING, 24, 24, 'lower-left') },
			{ frame: 16, shape: new Triangle(Constants.WIDTH - HUD_WIDTH + HUD_PADDING + 72 + 3 * HUD_SPACING, HUD_PADDING, 24, 24, 'upper-right') },
			{ frame: 17, shape: new Triangle(Constants.WIDTH - HUD_WIDTH + HUD_PADDING + 96 + 4 * HUD_SPACING, HUD_PADDING, 24, 24, 'upper-left') },
			{ frame: 23, shape: new Rect(Constants.WIDTH - HUD_WIDTH + HUD_PADDING, HUD_PADDING + 24 + HUD_SPACING, 24, 12) },
			{ frame: 27, shape: new Rect(Constants.WIDTH - HUD_WIDTH + HUD_PADDING + 24 + HUD_SPACING, HUD_PADDING + 36 + HUD_SPACING, 24, 12) },
			{ frame: [20,21,22], shape: new Triangle(Constants.WIDTH - HUD_WIDTH + HUD_PADDING + 48 + 2 * HUD_SPACING, HUD_PADDING + 30 + HUD_SPACING, 42, 18, 'lower-right') },
			{ frame: [24,25,26], shape: new Triangle(Constants.WIDTH - HUD_WIDTH + HUD_PADDING + 90 + 3 * HUD_SPACING, HUD_PADDING + 30 + HUD_SPACING, 42, 18, 'lower-left') }
		];
	}
	LevelEditorHUD.prototype.render = function(ctx, camera) {
		var leftX = Constants.WIDTH - HUD_WIDTH;
		//draw white background of the HUD
		ctx.fillStyle = '#fff';
		ctx.fillRect(leftX, 0, Constants.WIDTH, Constants.HEIGHT);
		ctx.strokeStyle = '#000';
		ctx.lineWidth = 0.5;
		ctx.beginPath();
		ctx.moveTo(leftX, 0);
		ctx.lineTo(leftX, Constants.HEIGHT);
		ctx.stroke();
		//draw shapes
		for(var i = 0; i < this._shapeSelectables.length; i++) {
			this._shapeSelectables[i].shape.render(ctx, { x: 0, y: 0 }, (i === this._selectedShapeIndex ? '#f00' : '#000'));
		}
		//draw tile sprites
		for(i = 0; i < this._tileSelectables.length; i++) {
			if(i === this._selectedTileIndex) {
				ctx.fillStyle = '#f00';
				ctx.fillRect(this._tileSelectables[i].x - 1, this._tileSelectables[i].y - 1,
					this._tileSelectables[i].sprite.width + 2, this._tileSelectables[i].sprite.height + 2);
			}
			this._tileSelectables[i].sprite.render(ctx, this._tileSelectables[i].x, this._tileSelectables[i].y, 0);
		}
	};
	LevelEditorHUD.prototype.handleMouseEvent = function(evt, finishDrag) {
		var x = evt.offsetX;
		var y = evt.offsetY;
		if(x > Constants.WIDTH - HUD_WIDTH) {
			for(var i = 0; i < this._shapeSelectables.length; i++) {
				if(this._shapeSelectables[i].shape.containsPoint(x, y)) {
					this._selectedShapeIndex = i;
					break;
				}
			}
			for(i = 0; i < this._tileSelectables.length; i++) {
				if(this._tileSelectables[i].x <= x && x <= this._tileSelectables[i].x + this._tileSelectables[i].sprite.width &&
					this._tileSelectables[i].y <= y && y <= this._tileSelectables[i].y + this._tileSelectables[i].sprite.height) {
					this._selectedTileIndex = i;
					break;
				}
			}
			return true;
		}
		return false;
	};
	LevelEditorHUD.prototype.getTileType = function() {
		return config[this._tileSelectables[this._selectedTileIndex].tileKey];
	};
	LevelEditorHUD.prototype.getFrame = function() {
		return this._shapeSelectables[this._selectedShapeIndex].frame;
	};
	return LevelEditorHUD;
});