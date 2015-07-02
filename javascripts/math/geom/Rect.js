define(function() {
	function Rect(parent, offset, width, height) {
		this.type = 'rect';
		this.parent = parent;
		this.offset = offset;
		this.width = width;
		this.height = height;
	}
	Rect.prototype.containsPoint = function(x, y) {
		if(arguments.length === 1) { y = x.y; x = x.x; }
		return this.left <= x && x <= this.right && this.top <= y && y <= this.bottom;
	};
	Rect.prototype.isOverlapping = function(geom) {
		if(geom.type === 'rect') {
			return this._isOverlappingRect(geom);
		}
		else {
			throw new Error("Unsure how to find overlap between rect and '" + geom.type + "'");
		}
	};
	Rect.prototype._isOverlappingRect = function(rect) {
		//two rects are intersecting if their horizontal and vertical "shadows" are both intersecting
		if(this.right < rect.left || rect.right < this.left ||
			this.bottom < rect.top || rect.bottom < this.top) {
			return false;
		}
		else {
			return { left: this.left, right: this.right, top: this.top, bottom: this.bottom };
		}
	};
	Rect.prototype.render = function(draw, renderParams) {
		if(renderParams.mode === 'stroke') {
			draw.rect.stroke(renderParams.color, renderParams.thickness, this.left, this.top,
				this.width, this.height);
		}
		else {
			draw.rect.fill(renderParams.color, this.left, this.top, this.width, this.height);
		}
	};
	Object.defineProperties(Rect.prototype, {
		left: {
			get: function() { return this.parent.pos.x + this.offset.x; }
		},
		right: {
			get: function() { return this.parent.pos.x + this.offset.x + this.width; }
		},
		top: {
			get: function() { return this.parent.pos.y + this.offset.y; }
		},
		bottom: {
			get: function() { return this.parent.pos.y + this.offset.y + this.height; }
		}
	});
	return Rect;
});