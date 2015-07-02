if (typeof define !== 'function') { var define = require('amdefine')(module); }
define(function() {
	function SpriteSheet(params, spriteKey) {
		var self = this;
		var scale = params.scale || 1;

		//init private vars
		this._canvas = null;
		this._loaded = false;
		this._preLoadedColor = params.loadingColor || '#000';
		this._flipped = params.flip || false;

		//init public vars
		this.width = scale * params.width; //width/height of one frame
		this.height = scale * params.height;
		this.key = spriteKey;

		//load the image
		var img = new Image();
		img.onload = function() {
			//plop the image onto a canvas
			var tempCanvas = document.createElement('canvas');
			tempCanvas.width = img.width;
			tempCanvas.height = img.height;
			var tempCtx = tempCanvas.getContext('2d');
			tempCtx.drawImage(img, 0, 0);
			//create another canvas, scaled as needed
			self._canvas = document.createElement('canvas');
			self._canvas.width = scale * img.width;
			self._canvas.height = scale * img.height * (self._flipped ? 2 : 1);
			var ctx = self._canvas.getContext('2d');
			//transfer image data from the first canvas onto the scaled canvas
			var imageData = tempCtx.getImageData(0, 0, img.width, img.height).data;
			var i = 0;
			for(var y = 0; y < img.height; y++) {
				for(var x = 0; x < img.width; x++) {
					//fill the scaled pixel
					var r = imageData[i++], g = imageData[i++], b = imageData[i++], a = imageData[i++] / 100.0;
					ctx.fillStyle = 'rgba(' + [r, g, b, a].join(',') + ')';
					if(params.replacements) {
						var hex = rgbToHex(r, g, b);
						if(params.replacements[hex]) {
							ctx.fillStyle = params.replacements[hex];
						}
					}
					ctx.fillRect(scale * x, scale * y, scale, scale);
					if(self._flipped) {
						//fill the flipped pixel too
						ctx.fillRect(self._canvas.width - scale * (x + 1),
							self._canvas.height / 2 + scale * y, scale, scale);
					}
				}
			}
			self._loaded = true;
		};
		img.src = params.imagePath;
	}
	SpriteSheet.prototype.render = function(ctx, x, y, frame, flip) {
		if(this._loaded) {
			var numCols = this._canvas.width / this.width;
			var numRows = (this._canvas.height / this.height) / (this._flipped ? 2 : 1);
			//locate the frame on the spritesheet
			frame %= (numCols * numRows);
			var frameX = frame % numCols;
			var frameY = Math.floor(frame / numCols);
			if(flip && this._flipped) {
				frameX = numCols - frameX - 1;
				frameY += numRows;
			}
			//draw the image (camera needs to be taken care of outside of this method)
			ctx.drawImage(this._canvas,
				frameX * this.width, frameY * this.height,
				this.width, this.height, x, y,
				this.width, this.height
			);
		}
		else {
			//if the image hasn't loaded yet, we just show a colored rectangle
			ctx.fillStyle = this._preLoadedColor;
			ctx.fillRect(x, y, this.width, this.height);
		}
	};

	//helper methods
	function rgbToHex(r, g, b) {
		return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
	}
	function componentToHex(c) {
		var hex = c.toString(16);
		return hex.length == 1 ? "0" + hex : hex;
	}

	return SpriteSheet;
});
//SILVER star status!