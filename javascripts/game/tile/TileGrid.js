if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'game/tile/Tile',
	'game/config/tile-config',
	'game/Constants'
], function(
	Tile,
	config,
	Constants
) {
	var T = Constants.TILE_SIZE;
	var TILE_SYMBOL_LOOKUP = {};
	for(var key in config) {
		TILE_SYMBOL_LOOKUP[config[key].symbol] = config[key];
	}

	function TileGrid(tileMap, frameMap, variantMap) {
		this._tiles = { minRow: null, maxRow: null };
		if(tileMap) {
			for(var r = 0; r < tileMap.length; r++) {
				for(var c = 0; c < tileMap[r].length; c++) {
					if(tileMap[r][c] !== ' ') {
						var tile = TILE_SYMBOL_LOOKUP[tileMap[r][c]] || null;
						var frame = charToNum((frameMap && frameMap[r] && frameMap[r][c]) || '0');
						var variant = charToNum((variantMap && variantMap[r] && variantMap[r][c]) || '0');
						this.add(new Tile(c, r, tile, frame, variant));
					}
				}
			}
		}
	}
	TileGrid.prototype.getMinCol = function() {
		var minCol = null;
		for(var r = this._tiles.minRow; r <= this._tiles.maxRow; r++) {
			if(this._tiles[r] && (minCol === null || this._tiles[r].minCol < minCol)) {
				minCol = this._tiles[r].minCol;
			}
		}
		return minCol;
	};
	TileGrid.prototype.getMinRow = function() {
		return this._tiles.minRow;
	};
	TileGrid.prototype.toSymbolMaps = function(startingCol, startingRow) {
		var tileMap = [];
		var frameMap = [];
		var variantMap = [];
		for(r = startingRow; r <= this._tiles.maxRow; r++) {
			var tileMapLine = '';
			var frameMapLine = '';
			var variantMapLine = '';
			if(this._tiles[r]) {
				for(var c = startingCol; c <= this._tiles[r].maxCol; c++) {
					if(this._tiles[r][c]) {
						tileMapLine += this._tiles[r][c].tileType.symbol;
						frameMapLine += numToChar(this._tiles[r][c].frame);
						variantMapLine += numToChar(this._tiles[r][c].variant || 0);
					}
					else {
						tileMapLine += ' ';
						frameMapLine += ' ';
						variantMapLine += ' ';
					}
				}
			}
			tileMap.push(tileMapLine);
			frameMap.push(frameMapLine);
			variantMap.push(variantMapLine);
		}
		return { tiles: tileMap, shapes: frameMap, variants: variantMap };
	};
	TileGrid.prototype.get = function(col, row) {
		return (this._tiles[row] && this._tiles[row][col]) || null;
	};
	TileGrid.prototype.remove = function(col, row) {
		if(this._tiles[row] && this._tiles[row][col]) {
			//we don't clean up the min/max row/col, but that's perfectly fine
			delete this._tiles[row][col];
		}
	};
	TileGrid.prototype.add = function(tile) {
		if(this._tiles.minRow === null || tile.row < this._tiles.minRow) {
			this._tiles.minRow = tile.row;
		}
		if(this._tiles.maxRow === null || tile.row > this._tiles.maxRow) {
			this._tiles.maxRow = tile.row;
		}
		if(!this._tiles[tile.row]) {
			this._tiles[tile.row] = {
				minCol: tile.col,
				maxCol: tile.col
			};
		}
		else {
			if(tile.col < this._tiles[tile.row].minCol) {
				this._tiles[tile.row].minCol = tile.col;
			}
			else if(tile.col > this._tiles[tile.row].maxCol) {
				this._tiles[tile.row].maxCol = tile.col;
			}
		}
		this._tiles[tile.row][tile.col] = tile;
		return tile;
	};
	TileGrid.prototype.forEach = function(callback) {
		if(this._tiles.minRow !== null) {
			for(var r = this._tiles.minRow; r <= this._tiles.maxRow; r++) {
				if(this._tiles[r]) {
					for(var c = this._tiles[r].minCol; c <= this._tiles[r].maxCol; c++) {
						if(this._tiles[r][c]) {
							callback(this._tiles[r][c]);
						}
					}
				}
			}
		}
	};
	TileGrid.prototype.forEachNearby = function(rect, callback) {
		var rowOfRectTop = Math.floor(rect.y / T);
		var rowOfRectBottom = Math.floor((rect.y + rect.height) / T);
		var colOfRectLeft = Math.floor(rect.x / T);
		var colOfRectRight = Math.floor((rect.x + rect.width) / T);
		for(var r = rowOfRectTop; r <= rowOfRectBottom; r++) {
			for(var c = colOfRectLeft; c <= colOfRectRight; c++) {
				if(this._tiles[r] && this._tiles[r][c]) {
					callback(this._tiles[r][c]);
				}
			}
		}
	};
	TileGrid.prototype.render = function(ctx, camera, drawGridLines) {
		if(drawGridLines) {
			ctx.strokeStyle ='#eee';
			ctx.lineWidth = 1;
			for(var x = T * Math.floor(camera.x / T); x <= T * Math.floor((camera.x + Constants.WIDTH) / T); x += T) {
				ctx.beginPath();
				ctx.moveTo(x - camera.x, -1);
				ctx.lineTo(x - camera.x, Constants.HEIGHT + 1);
				ctx.stroke();
			}
			for(var y = T * Math.floor(camera.y / T); y <= T * Math.floor((camera.y + Constants.HEIGHT) / T); y += T) {
				ctx.beginPath();
				ctx.moveTo(-1, y - camera.y);
				ctx.lineTo(Constants.WIDTH + 1, y - camera.y);
				ctx.stroke();
			}
		}
		this.forEach(function(tile) {
			tile.render(ctx, camera);
		});
	};

	//helper functions
	function charToNum(c) {
		var frame = c.charCodeAt(0);
		return (frame > 64 ? frame - 55 : frame - 48);
	}
	function numToChar(frame) {
		return String.fromCharCode((frame > 9 ? frame + 55 : frame + 48));
	}

	return TileGrid;
});