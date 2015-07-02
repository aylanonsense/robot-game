define([
	'Constants',
	'math/Vector',
	'entity/Bullet'
], function(
	Constants,
	Vector,
	Bullet
) {
	function Game(ctx) {
		var self = this;
		this.entities = [];
		this.ctx = ctx;
		this.camera = { x: 0, y: 0, scale: 1.0 };
		this.draw = {
			line: function(color, thickness, x1, y1, x2, y2) {
				ctx.strokeStyle = color;
				ctx.lineWidth = thickness;
				ctx.beginPath();
				ctx.moveTo(x1 * self.camera.scale - self.camera.x,
					y1 * self.camera.scale - self.camera.y);
				ctx.lineTo(x2 * self.camera.scale - self.camera.x,
					y2 * self.camera.scale - self.camera.y);
				ctx.stroke();
			},
			circle: {
				fill: function(color, x, y, radius) {
					ctx.fillStyle = color;
					ctx.beginPath();
					ctx.arc(x * self.camera.scale - self.camera.x,
						y * self.camera.scale - self.camera.y,
						radius * self.camera.scale, 0, 2 * Math.PI);
					ctx.fill();
				}
			},
			rect: {
				stroke: function(color, thickness, x, y, width, height) {
					ctx.strokeStyle = color;
					ctx.lineWidth = thickness;
					ctx.strokeRect(x * self.camera.scale - self.camera.x,
						 y * self.camera.scale - self.camera.y,
						width * self.camera.scale, height * self.camera.scale);
				},
				fill: function(color, x, y, width, height) {
					ctx.fillStyle = color;
					ctx.fillRect(x * self.camera.scale - self.camera.x,
						 y * self.camera.scale - self.camera.y,
						width * self.camera.scale, height * self.camera.scale);
				}
			}
		};
	}
	Game.prototype.reset = function() {
		this.entities = [];
		this.entities.push(new Bullet({
			pos: new Vector(400, 300),
			vel: new Vector(100, 0)
		}));
	};
	Game.prototype.update = function(t) {
		for(var i = 0; i < this.entities.length; i++) {
			this.entities[i].update(t);
		}
	};
	Game.prototype.render = function() {
		//draw background color
		this.ctx.fillStyle = '#fff';
		this.ctx.fillRect(0, 0, Constants.WIDTH, Constants.HEIGHT);

		//render entities
		for(var renderLayer = 0; renderLayer < 7; renderLayer++) {
			for(var i = 0; i < this.entities.length; i++) {
				if(this.entities[i].renderLayer === renderLayer) {
					this.entities[i].render(this.draw);
				}
			}
		}
	};
	Game.prototype.onMouseEvent = function(type, x, y) {};
	Game.prototype.onKeyboardEvent = function(key, isDown, keyboard) {};
	return Game;
});