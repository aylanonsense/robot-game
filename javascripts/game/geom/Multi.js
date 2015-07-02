if (typeof define !== 'function') { var define = require('amdefine')(module); }
define(function() {
	function Multi(geomArr) {
		this._geomType = 'multi';
		this._geoms = geomArr;
	}
	Multi.prototype.containsPoint = function(x, y) {
		for(var i = 0; i < this._geoms.length; i++) {
			if(this._geoms[i].containsPoint(x, y)) {
				return true;
			}
		}
		return false;
	};
	Multi.prototype.isOverlapping = function(geom) {
		if(!geom) {
			return false;
		}
		else if(geom._geomType === 'triangle' || geom._geomType === 'rect') {
			var widestOverlap = false;
			for(var i = 0; i < this._geoms.length; i++) {
				var overlap = this._geoms[i].isOverlapping(geom);
				if(overlap) {
					if(!widestOverlap) {
						widestOverlap = overlap;
					}
					else {
						if(overlap.left < widestOverlap.left) { widestOverlap.left = overlap.left; }
						if(overlap.right > widestOverlap.right) { widestOverlap.right = overlap.right; }
						if(overlap.top < widestOverlap.top) { widestOverlap.top = overlap.top; }
						if(overlap.bottom > widestOverlap.bottom) { widestOverlap.bottom = overlap.bottom; }
					}
				}
			}
			return widestOverlap;
		}
		else {
			throw new Error("Unsure how to find overlap between multi and '" + geom._geomType + "'");
		}
	};
	Multi.prototype.render = function(ctx, camera, color) {
		for(var i = 0; i < this._geoms.length; i++) {
			this._geoms[i].render(ctx, camera, color);
		}
	};
	return Multi;
});
//SILVER star status!