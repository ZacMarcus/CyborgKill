ig.module(
	'game.entities.gear'
)
.requires(
	'impact.entity'
)
.defines(function(){
	
	EntityGear = ig.Entity.extend({
		checkAgainst: ig.Entity.TYPE.BOTH, // Check both friendly and enemy units

		size: {x: 8, y: 8},
		damage: 10,
		gravityFactor: 0,
		animSheet: new ig.AnimationSheet( 'media/gear.png', 8, 8 ),	

		init: function( x, y, settings ) {
			this.parent( x, y, settings );
			this.addAnim( 'idle', 0.2, [3,3,3,3,4,5,5,6,7,8,8] );
		},

		// check: function( other ) {
		// 	other.receiveDamage( 10, this );
		// 	//other.kill();
		// },

		update: function(){
			this.parent();
		}
	});

});