ig.module(
	'game.entities.collectable'
)
.requires(
	'impact.entity'
)
.defines(function(){
	EntityCollectable = ig.Entity.extend({
		size: {x: 7, y: 12},

		checkAgainst: ig.Entity.TYPE.A,
		animSheet: new ig.AnimationSheet('media/collectable.png', 7, 12),

		init: function (x, y, settings) {
			this.parent(x, y, settings);
			this.addAnim('idle', 0.1, [0]);
			this.currentAnim.gotoRandomFrame();
		},

		check: function (other) {
			this.kill();
			ig.game.collectableCount++;
		},

		update: function () {
			this.currentAnim.update();
		}
	});
});