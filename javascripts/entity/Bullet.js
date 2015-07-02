define([
	'entity/Entity'
], function(
	SUPERCLASS
) {
	function Bullet(params) {
		SUPERCLASS.call(this, {
			pos: params.pos,
			vel: params.vel,
			collision: { type: 'simple', width: 40, height: 40 },
			renderLayer: 5
		});
	}
	Bullet.prototype = Object.create(SUPERCLASS.prototype);
	Bullet.prototype.update = function(t) {
		SUPERCLASS.prototype.update.call(this, t);
	};
	Bullet.prototype.render = function(draw) {
		SUPERCLASS.prototype.render.call(this, draw);
	};
	return Bullet;
});