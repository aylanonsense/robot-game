if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'game/config/sprite-config',
	'game/display/SpriteSheet'
], function(
	config,
	SpriteSheet
) {
	var SPRITESHEETS = {};

	//spritesheets will be memoized so it's fine to call loadSpreadSheet twice with the same key
	function loadSpriteSheet(key) {
		if(!config[key]) {
			throw new Error("There does not exist a spritesheet with an id of '" + key + "'");
		}
		if(!SPRITESHEETS[key]) {
			SPRITESHEETS[key] = new SpriteSheet(config[key], key);
		}
		return SPRITESHEETS[key];
	}

	//SpriteLoader is a singleton
	return {
		loadSpriteSheet: loadSpriteSheet
	};
});
//SILVER star status!