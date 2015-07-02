define([
	'math/Vector',
	'math/geom/Rect'
], function(
	Vector,
	Rect
) {
	var nextId = 0;
	function Entity(params) {
		this.id = nextId++;
		this.pos = params.pos;
		this.vel = params.vel;
		this.renderLayer = params.renderLayer;
		if(params.collision && params.collision.type === 'simple') {
			this.collisionType = 'simple';
			this.collisionGeom = new Rect(this,
				new Vector(-params.collision.width / 2, -params.collision.height / 2),
				params.collision.width,
				params.collision.height);
		}
		else if(params.collision && params.collision.type === 'full') {
			this.collisionType = 'full';
			var horizontalInset = Math.max(2, Math.min(Math.floor(0.10 * params.collision.width), 15));
			var verticalInset = Math.max(2, Math.min(Math.floor(0.10 * params.collision.height), 15));
			this.collisionGeom = {
				top: new Rect(this,
					new Vector(-params.collision.width / 2 + horizontalInset,
						-params.collision.height / 2),
					params.collision.width - 2 * horizontalInset,
					params.collision.height / 2),
				bottom: new Rect(this,
					new Vector(-params.collision.width / 2 + horizontalInset, 0),
					params.collision.width - 2 * horizontalInset,
					params.collision.height / 2),
				left: new Rect(this,
					new Vector(-params.collision.width / 2,
						-params.collision.height / 2 + verticalInset),
					params.collision.width / 2,
					params.collision.height - 2 * verticalInset),
				right: new Rect(this,
					new Vector(0, -params.collision.height / 2 + verticalInset),
					params.collision.width / 2,
					params.collision.height - 2 * verticalInset)
			};
		}
		else {
			this.collisionType = 'none';
			this.collisionGeom = null;
		}
	}
	Entity.prototype.update = function(t) {
		this.pos.addMult(this.vel, t);
	};
	Entity.prototype.render = function(draw) {
		//draw yellow collision box
		if(this.collisionType === 'simple') {
			this.collisionGeom.render(draw, { mode: 'stroke', color: '#fa0', thickness: 2 });
		}
		else if(this.collisionType === 'full') {
			this.collisionGeom.top.render(draw, { mode: 'stroke', color: '#fa0', thickness: 2 });
			this.collisionGeom.bottom.render(draw, { mode: 'stroke', color: '#fa0', thickness: 2 });
			this.collisionGeom.left.render(draw, { mode: 'stroke', color: '#fa0', thickness: 2 });
			this.collisionGeom.right.render(draw, { mode: 'stroke', color: '#fa0', thickness: 2 });
		}

		//draw black crosshair at center of entity
		draw.line('#000', 1, this.pos.x - 10, this.pos.y, this.pos.x + 10, this.pos.y);
		draw.line('#000', 1, this.pos.x, this.pos.y - 10, this.pos.x, this.pos.y + 10);
	};
	return Entity;
});