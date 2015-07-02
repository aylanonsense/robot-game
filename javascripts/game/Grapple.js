if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'game/geom/Line'
], function(
	Line
) {
	var GRAPPLE_SPEED = 3000;
	var BOOST_SPEED = 3000;
	var MAX_DIST = 350;
	var K = 2000;
	var FLOAT_FRAMES = 15;
	var FRAMES_BEFORE_PULL = 2;
	function Grapple(player, dirX, dirY) {
		var dir = Math.sqrt(dirX * dirX + dirY * dirY);
		this._player = player;
		var x = this._player.pos.x + this._player.grappleOffset.x;
		var y = this._player.pos.y + this._player.grappleOffset.y;
		this.pos = { x: x, y: y };
		this.pos.prev = { x: x, y: y };
		this.vel = { x: GRAPPLE_SPEED * dirX / dir, y: GRAPPLE_SPEED * dirY / dir };
		this.isLatched = false;
		this.isDead = false;
		this._isLatchable = true;
		this._isExtending = true;
		this._latchDist = null;
		this._isRetracting = false;
		this._floatDist = null;
		this._framesSpentFloating = 0;
		this._framesSpentRetracting = 0;
		this._recalculateMovementVectors();
	}
	Grapple.prototype.checkForCollisions = function(tiles) {
		var self = this;
		if(!this.isLatched && !this.isDead && this._isLatchable) {
			tiles.forEach(function(tile) {
				var intersection = tile.isCrossedBy(self._lineOfMovement);
				if(intersection) {
					self._latchTo(intersection.x, intersection.y);
				}
			});
		}
	};
	Grapple.prototype.move = function() {
		if(!this.isDead) {
			if(!this.isLatched) {
				if(this._isExtending) {
					this.pos.prev.x = this.pos.x;
					this.pos.prev.y = this.pos.y;
					this.pos.x += this.vel.x / 60;
					this.pos.y += this.vel.y / 60;
					var dx = this._player.pos.x + this._player.grappleOffset.x - this.pos.x;
					var dy = this._player.pos.y + this._player.grappleOffset.y - this.pos.y;
					var squareDistFromPlayer = dx * dx + dy * dy;
					if(squareDistFromPlayer > MAX_DIST * MAX_DIST) {
						var dist = Math.sqrt(squareDistFromPlayer);
						this._floatDist = { x: -MAX_DIST * dx / dist, y: -MAX_DIST * dy / dist };
						this.pos.x = this._player.pos.x + this._player.grappleOffset.x + this._floatDist.x;
						this.pos.y = this._player.pos.y + this._player.grappleOffset.y + this._floatDist.y;
						this._isExtending = false;
					}
					this._recalculateMovementVectors();
				}
				else if(this._framesSpentFloating < FLOAT_FRAMES) {
					this._isLatchable = false;
					this.pos.x = this._player.pos.x + this._player.grappleOffset.x + this._floatDist.x;
					this.pos.y = this._player.pos.y + this._player.grappleOffset.y + this._floatDist.y;
					this._framesSpentFloating++;
				}
				else {
					this.isDead = true;
				}
			}
			else if(this._isRetracting) {
				this._framesSpentRetracting++;
			}
		}
	};
	Grapple.prototype._latchTo = function(x, y) {
		this.pos.x = x;
		this.pos.y = y;
		this.isLatched = true;
		var dx = this._player.pos.x + this._player.grappleOffset.x - x;
		var dy = this._player.pos.y + this._player.grappleOffset.y - y;
		this._latchDist = Math.sqrt(dx * dx + dy * dy);
		this._recalculateMovementVectors();
	};
	Grapple.prototype._recalculateMovementVectors = function() {
		this._lineOfMovement = new Line(this.pos.prev, this.pos);
	};
	Grapple.prototype.applyForceToPlayer = function() {
		if(this.isLatched) {
			var dx = this._player.pos.x + this._player.grappleOffset.x - this.pos.x;
			var dy = this._player.pos.y + this._player.grappleOffset.y - this.pos.y;
			var dist = Math.sqrt(dx * dx + dy * dy);
			var boostX = (this._framesSpentRetracting > FRAMES_BEFORE_PULL ? BOOST_SPEED * -dx / dist : 0) / 60;
			var boostY = (this._framesSpentRetracting > FRAMES_BEFORE_PULL ? BOOST_SPEED * -dy / dist : 0) / 60;
			if(dist > this._latchDist) {
				var posX = this.pos.x + this._latchDist * dx / dist;
				var posY = this.pos.y + this._latchDist * dy / dist;
				var angle = Math.atan2(dy, dx);
				var cos = Math.cos(angle);
				var sin = Math.sin(angle);
				var velParallel = cos * this._player.vel.x + sin * this._player.vel.y;
				var velPerpendicular = -sin * this._player.vel.x + cos * this._player.vel.y;
				var velX = -sin * velPerpendicular + boostX;
				var velY = cos * velPerpendicular + boostY;
				this._player.restrictViaGrapplesTo(posX - this._player.grappleOffset.x, posY - this._player.grappleOffset.y, velX, velY);
			}
			else {
				this._player.vel.x += boostX;
				this._player.vel.y += boostY;
			}
		}
	};
	Grapple.prototype.render = function(ctx, camera) {
		if(!this.isDead) {
			if(this.isLatched) {
				ctx.lineWidth = 3;
				ctx.strokeStyle = (this._isRetracting ? '#f30' : '#333');
			}
			else {
				ctx.lineWidth = 1.5;
				ctx.strokeStyle = (this._isExtending ? '#666' : '#bbb');
			}
			ctx.beginPath();
			ctx.moveTo(this._player.pos.x + this._player.grappleOffset.x - camera.x,
				this._player.pos.y + this._player.grappleOffset.y - camera.y);
			ctx.lineTo(this.pos.x - camera.x, this.pos.y - camera.y);
			ctx.stroke();
		}
	};
	Grapple.prototype.startRetracting = function() {
		this._isRetracting = true;
	};
	Grapple.prototype.stopRetracting = function() {
		this._isRetracting = false;
	};
	return Grapple;
});