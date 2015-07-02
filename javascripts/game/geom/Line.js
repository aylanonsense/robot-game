if (typeof define !== 'function') { var define = require('amdefine')(module); }
define(function() {
	function Line(start, end, color) {
		this._geomType = 'line';
		if(arguments.length >= 4) {
			start = { x: arguments[0], y: arguments[1] };
			end = { x: arguments[2], y: arguments[3] };
			color = (arguments.length > 4 ? arguments[4] : null);
		}
		this._color = color || '#f00';
		this._start = start;
		this._end = end;
		//we pre-calculate a lot of data to make it easier to detect intersections
		var dx = end.x - start.x;
		var dy = end.y - start.y;
		var squareDist = dx * dx + dy * dy;
		//line segments with a length of zero (or close to it) are a special case that is easy to handle
		this._isSinglePoint = (dx === 0 && dy === 0) || squareDist < 0.00001;
		if(!this._isSinglePoint) {
			//vertical lines can't be defined in terms of y=mx+b, so we we do x=my+b instead
			if(dx === 0) {
				this._useReciprocalSlope = true;
				this._reciprocalSlope = 0;
				this._xIntercept = start.x;
			}
			//we choose to set the y intercept manually with horizontal lines for clarity
			else if(dy === 0) {
				this._useReciprocalSlope = false;
				this._slope = 0;
				this._yIntercept = start.y;
			}
			else {
				//for slopes between -1 and 1 (horizontal-ish lines) we use traditional y=mx+b
				if(-dx < dy && dy < dx) {
					this._useReciprocalSlope = false;
					this._slope = dy / dx;
					this._yIntercept = start.y - this._slope * start.x;
				}
				//for slopes less than -1 or greater than 1, we use x=my+b to avoid rounding problems
				else {
					this._useReciprocalSlope = true;
					this._reciprocalSlope = dx / dy;
					this._xIntercept = start.x - this._reciprocalSlope * start.y;
				}
			}
		}
	}
	Line.prototype._getYWhenXIs = function(x) {
		if((this._start.x <= x && x <= this._end.x) ||
			(this._start.x >= x && x >= this._end.x)) {
			if(this._isSinglePoint) {
				return this._start.y;
			}
			else if(this._useReciprocalSlope) {
				return (x - this._xIntercept) / this._reciprocalSlope;
			}
			else {
				return this._slope * x + this._yIntercept;
			}
		}
		return null;
	};
	Line.prototype._getXWhenYIs = function(y) {
		if((this._start.y <= y && y <= this._end.y) ||
			(this._start.y >= y && y >= this._end.y)) {
			if(this._isSinglePoint) {
				return this._start.x;
			}
			else if(this._useReciprocalSlope) {
				return this._reciprocalSlope * y + this._xIntercept;
			}
			else {
				return (y - this._yIntercept) / this._slope;
			}
		}
		return null;
	};
	Line.prototype.isCrossing = function(geom) {
		if(!geom) {
			return false;
		}
		else if(geom._geomType === 'line') {
			return this._isCrossingLine(geom);
		}
		else if(geom._geomType === 'rect') {
			return this._isCrossingRect(geom);
		}
		else if(geom._geomType === 'triangle') {
			return this._isCrossingTriangle(geom);
		}
		else if(geom._geomType === 'multi') {
			return this._isCrossingMulti(geom);
		}
		else {
			throw new Error("Unsure how to test whether line is crossing '" + geom._geomType + "'");
		}
	};
	Line.prototype._isCrossingLine = function(line) {
		var x, y;
		//we pretend single points can't cross anything (this sorta makes sense)
		if(!this._isSinglePoint && !line._isSinglePoint) {
			//if we have y = mx + b and y = nx + c, intersection is at x = (c - b) / (m - n)
			if(!this._useReciprocalSlope && !line._useReciprocalSlope) {
				//we also pretend parallel lines can't cross each other (just makes it simpler)
				if(this._slope !== line._slope) {
					x = (line._yIntercept - this._yIntercept) / (this._slope - line._slope);
					y = this._getYWhenXIs(x);
					if(y !== null && line._getYWhenXIs(x) !== null) {
						return { x: x, y: y };
					}
				}
			}
			//if we have x = my + b and x = ny + c, intersection is at y = (c - b) / (m - n)
			else if(this._useReciprocalSlope && line._useReciprocalSlope) {
				if(this._reciprocalSlope !== line._reciprocalSlope) {
					y = (line._xIntercept - this._xIntercept) / (this._reciprocalSlope - line._reciprocalSlope);
					x = this._getXWhenYIs(y);
					if(x !== null && line._getXWhenYIs(y) !== null) {
						return { x: x, y: y };
					}
				}
			}
			//if we have y = mx + b and x = ny + c, intersection is at x = (nb + c) / (1 - nm)
			else if(this._useReciprocalSlope) {
				if(line._slope === 0 || this._reciprocalSlope !== 1 / line._slope) {
					x = (this._reciprocalSlope * line._yIntercept + this._xIntercept) / (1 - this._reciprocalSlope * line._slope);
					y = line._getYWhenXIs(x);
					if(y !== null && this._getYWhenXIs(x) !== null) {
						return { x: x, y: y };
					}
				}
			}
			else {
				if(this._slope === 0 || line._reciprocalSlope !== 1 / this._slope) {
					x = (line._reciprocalSlope * this._yIntercept + line._xIntercept) / (1 - line._reciprocalSlope * this._slope);
					y = this._getYWhenXIs(x);
					if(y !== null && line._getYWhenXIs(x) !== null) {
						return { x: x, y: y };
					}
				}
			}
		}
		return false;
	};
	Line.prototype._isCrossingRect = function(rect) {
		//find intersections along the top/bottom/left/right
		var intersections = [];
		var xAlongTop = this._getXWhenYIs(rect.y);
		if(xAlongTop !== null && rect.x <= xAlongTop && xAlongTop <= rect.x + rect.width) {
			intersections.push({ x: xAlongTop, y: rect.y });
		}
		var xAlongBottom = this._getXWhenYIs(rect.y + rect.height);
		if(xAlongBottom !== null && rect.x <= xAlongBottom && xAlongBottom <= rect.x + rect.width) {
			intersections.push({ x: xAlongBottom, y: rect.y + rect.height });
		}
		var yAlongLeft = this._getYWhenXIs(rect.x);
		if(yAlongLeft !== null && rect.y <= yAlongLeft && yAlongLeft <= rect.y + rect.height) {
			intersections.push({ x: rect.x, y: yAlongLeft });
		}
		var yAlongRight = this._getYWhenXIs(rect.x + rect.width);
		if(yAlongRight !== null && rect.y <= yAlongRight && yAlongRight <= rect.y + rect.height) {
			intersections.push({ x: rect.x + rect.width, y: yAlongRight });
		}
		//choose the earliest intersection
		var earliestIntersection = null;
		for(var i = 0; i < intersections.length; i++) {
			var dx = intersections[i].x - this._start.x;
			var dy = intersections[i].y - this._start.y;
			intersections[i].squareDist = dx * dx + dy * dy;
			if(earliestIntersection === null || intersections[i].squareDist < earliestIntersection.squareDist) {
				earliestIntersection = intersections[i];
			}
		}
		return earliestIntersection;
	};
	Line.prototype._isCrossingTriangle = function(triangle) {
		if(triangle) {
			//find intersections along the top/bottom/left/right (only 2 will apply for a given triangle)
			var intersections = [];
			var xAlongTop = this._getXWhenYIs(triangle._rect.y);
			if(triangle._isUpper &&
				xAlongTop !== null && triangle._rect.x <= xAlongTop &&
				xAlongTop <= triangle._rect.x + triangle._rect.width) {
				intersections.push({ x: xAlongTop, y: triangle._rect.y });
			}
			var xAlongBottom = this._getXWhenYIs(triangle._rect.y + triangle._rect.height);
			if(!triangle._isUpper &&
				xAlongBottom !== null && triangle._rect.x <= xAlongBottom &&
				xAlongBottom <= triangle._rect.x + triangle._rect.width) {
				intersections.push({ x: xAlongBottom, y: triangle._rect.y + triangle._rect.height });
			}
			var yAlongLeft = this._getYWhenXIs(triangle._rect.x);
			if(triangle._isLeft &&
				yAlongLeft !== null && triangle._rect.y <= yAlongLeft &&
				yAlongLeft <= triangle._rect.y + triangle._rect.height) {
				intersections.push({ x: triangle._rect.x, y: yAlongLeft });
			}
			var yAlongRight = this._getYWhenXIs(triangle._rect.x + triangle._rect.width);
			if(!triangle._isLeft &&
				yAlongRight !== null && triangle._rect.y <= yAlongRight &&
				yAlongRight <= triangle._rect.y + triangle._rect.height) {
				intersections.push({ x: triangle._rect.x + triangle._rect.width, y: yAlongRight });
			}
			//find intersections along the hypotenuse
			var intersection = this._isCrossingLine(triangle._line);
			if(intersection) {
				intersections.push(intersection);
			}
			//choose the earliest intersection
			var earliestIntersection = null;
			for(var i = 0; i < intersections.length; i++) {
				var dx = intersections[i].x - this._start.x;
				var dy = intersections[i].y - this._start.y;
				intersections[i].squareDist = dx * dx + dy * dy;
				if(earliestIntersection === null || intersections[i].squareDist < earliestIntersection.squareDist) {
					earliestIntersection = intersections[i];
				}
			}
			return earliestIntersection;
		}
	};
	Line.prototype._isCrossingMulti = function(multi) {
		var intersections = [];
		for(var i = 0; i < multi._geoms.length; i++) {
			var intersection = this.isCrossing(multi._geoms[i]);
			if(intersection) {
				intersections.push(intersection);
			}
		}
		var earliestIntersection = null;
		for(i = 0; i < intersections.length; i++) {
			var dx = intersections[i].x - this._start.x;
			var dy = intersections[i].y - this._start.y;
			intersections[i].squareDist = dx * dx + dy * dy;
			if(earliestIntersection === null || intersections[i].squareDist < earliestIntersection.squareDist) {
				earliestIntersection = intersections[i];
			}
		}
		return earliestIntersection;
	};
	Line.prototype.render = function(ctx, camera, color, lineWidth) {
		ctx.strokeStyle = color || this._color;
		ctx.lineWidth = lineWidth || 1;
		ctx.beginPath();
		ctx.moveTo(this._start.x - camera.x, this._start.y - camera.y);
		ctx.lineTo(this._end.x - camera.x, this._end.y - camera.y);
		ctx.stroke();
	};
	return Line;
});
//SILVER star status!