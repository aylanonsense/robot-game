if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'game/geom/Line',
	'game/geom/Rect'
], function(
	Line,
	Rect
) {
	function Triangle(x, y, width, height, rightAngleSide, color) {
		this._geomType = 'triangle';
		this._rect = new Rect(x, y, width, height);
		if(rightAngleSide === 'upper-left') {
			this._line = new Line(x, y + height, x + width, y);
			this._renderPoints = [ { x: x, y: y }, { x: x + width, y: y }, { x: x, y: y + height } ];
		}
		else if(rightAngleSide === 'lower-right') {
			this._line = new Line(x, y + height, x + width, y);
			this._renderPoints = [ { x: x + width, y: y + height }, { x: x + width, y: y }, { x: x, y: y + height } ];
		}
		else if(rightAngleSide === 'lower-left') {
			this._line = new Line(x, y, x + width, y + height);
			this._renderPoints = [ { x: x, y: y + height }, { x: x + width, y: y + height }, { x: x, y: y } ];
		}
		else if(rightAngleSide === 'upper-right') {
			this._line = new Line(x, y, x + width, y + height);
			this._renderPoints = [ { x: x + width, y: y }, { x: x + width, y: y + height }, { x: x, y: y } ];
		}
		this._isUpper = (rightAngleSide === 'upper-left' || rightAngleSide === 'upper-right');
		this._isLeft = (rightAngleSide === 'upper-left' || rightAngleSide === 'lower-left');
		this._color = color || '#f44';
	}
	Triangle.prototype.containsPoint = function(x, y) {
		var yMin = (this._isUpper ? this._rect.y : this._line._getYWhenXIs(x));
		var yMax = (this._isUpper ? this._line._getYWhenXIs(x) : this._rect.y + this._rect.height);
		return (this._rect.x <= x && x <= this._rect.x + this._rect.width && yMin <= y && y <= yMax);
	};
	Triangle.prototype.isOverlapping = function(geom) {
		if(!geom) {
			return false;
		}
		else if(geom._geomType === 'rect') {
			return this._isOverlappingRect(geom);
		}
		else {
			throw new Error("Unsure how to find overlap between triangle and '" + geom._geomType + "'");
		}
	};
	Triangle.prototype._isOverlappingRect = function(rect) {
		if(this._rect._isOverlappingRect(rect)) {
			//find the point on the rectangle closest to the triangle
			var xRect = rect.x + (this._isLeft ? 0 : rect.width);
			var yRect = rect.y + (this._isUpper ? 0 : rect.height);
			//find the point on the line underneath the point on the rectangle
			var yLine = this._line._getYWhenXIs(xRect);
			//if the rectangle is balanced on the point of the rectangle, the line no longer matters
			if((this._isLeft && xRect <= this._rect.x) || (!this._isLeft && xRect >= this._rect.x + this._rect.width)) {
				yLine = (this._isUpper ? this._rect.y + this._rect.height : this._rect.y);
			}
			//there's only aoverlap if the point on thre rectangle is "below" the point on the line
			if((this._isUpper && yRect <= yLine) || (!this._isUpper && yRect >= yLine)) {
				var xLine = this._line._getXWhenYIs(yRect);
				return {
					left: (!this._isLeft && xLine !== null ? xLine : this._rect.x),
					right: (this._isLeft && xLine !== null ? xLine : this._rect.x + this._rect.width),
					top: (this._isUpper ? this._rect.y : yLine),
					bottom: (this._isUpper ? yLine : this._rect.y + this._rect.height)
				};
			}
		}
	};
	Triangle.prototype.render = function(ctx, camera, color) {
		ctx.beginPath();
		ctx.fillStyle = color || this._color;
		ctx.moveTo(this._renderPoints[2].x - camera.x, this._renderPoints[2].y - camera.y);
		for(var i = 0; i < this._renderPoints.length; i++) {
			ctx.lineTo(this._renderPoints[i].x - camera.x, this._renderPoints[i].y - camera.y);
		}
		ctx.fill();
	};
	return Triangle;
});
//SILVER star status!