ig.module(
	'game.entities.floater'
)
.requires(
	'impact.entity',
	'game.entities.particle'
)
.defines(function(){
	
	EntityFloater = ig.Entity.extend({
		size: {x: 15, y: 15},
		offset: {x: 0, y: 4},

		maxVel: {x: 100, y: 100},
		friction: {x: 150, y: 0},
		
		type: ig.Entity.TYPE.B, // Evil enemy group
		checkAgainst: ig.Entity.TYPE.A, // Check against friendly
		collides: ig.Entity.COLLIDES.PASSIVE,
		
		health: 20,
	
		speed: 60,
		flip: false,
		
		seenPlayer: false,

		animSheet: new ig.AnimationSheet( 'media/floater.png', 16, 16 ),
		
		
		init: function( x, y, settings ) {
			this.parent( x, y, settings );
			
			this.addAnim( 'idle', 1, [0] );
			this.addAnim( 'walk', 0.08, [0,1,2,3,4,5,6,7] );
			this.addAnim( 'hit', 0.5, [10] );
			this.addAnim( 'die', 0.1, [8,9,10,11,12,13,14,15] );

			this.attackTimer = new ig.Timer();
		},
		
		update: function() {
			this.parent();
			

			var ydist = Math.abs(ig.game.player.pos.y - this.pos.y);
			var xdist = Math.abs(ig.game.player.pos.x - this.pos.x);
			var xdir = ig.game.player.pos.x - this.pos.x < 0 ? -1 : 1;
			this.flip = xdir < 0 ? true : false;
			this.currentAnim.flip.x = this.flip;

			if(!this.seenPlayer) {
				if(xdist < 120 && ydist < 40) {
					this.seenPlayer = true;
					//this.attackTimer.set(1.5);
				}
			}
			else if(this.standing && this.currentAnim != this.anims.hit && this.currentAnim != this.anims.die) {
				//if(xdist > 160 && this.attackTimer.delta() > 0) {
				if(xdist > 5) {
					this.currentAnim = this.anims.walk;
					this.vel.x = this.speed * xdir;
				}
				else if(this.currentAnim == this.anims.walk) {
					this.currentAnim = this.anims.idle;
					this.vel.x = 0;
				}

				// near an edge? return!
				// if( !ig.game.collisionMap.getTile(
				// 		this.pos.x + (this.flip ? +4 : this.size.x -4),
				// 		this.pos.y + this.size.y+1
				// 	)
				// ) {
				// 	this.flip = !this.flip;
				// }
				// var xdir = this.flip ? -1 : 1;
				// this.vel.x = this.speed * xdir;
			}

			//check if we are hit by a bullet
			if( this.currentAnim == this.anims.hit ) {
				// Has the animation completely run through? -> resume it
				if( this.currentAnim.loopCount ) {
					this.currentAnim = this.anims.walk.rewind();
				}
				return;
			}
			else if( this.currentAnim == this.anims.die ) {
				// Has the animation completely run through? -> kill it
				if( this.currentAnim.loopCount ) {
					this.kill();
				}
				return;
			}
		},
		
		
		handleMovementTrace: function( res ) {
			this.parent( res );
			
			// collision with a wall? return!
			if( res.collision.x ) {
				this.flip = !this.flip;
			}
		},	
		
		check: function( other ) {
			other.receiveDamage( 10, this );
		},

		receiveDamage: function( amount, other ) {
			// Don't call this.kill() here, but instead, just set the 'die' animation if it has no health
			this.health -= amount;
			this.seenPlayer = true;

			if(this.currentAnim != this.anims.die) {
				if(this.health <= 0) {
					this.spawnParticles(8);
					this.currentAnim = this.anims.die.rewind();
				}
				else {
					this.spawnParticles(3);
					this.currentAnim = this.anims.hit.rewind();
				}
			}
		},

		spawnParticles: function(count) {
			for(i = 0; i < count; i++) {
				var x = Math.random().map( 0,1, this.pos.x, this.pos.x+this.size.x );
				var y = Math.random().map( 0,1, this.pos.y, this.pos.y+this.size.y );
				ig.game.spawnEntity( EntityFloaterParticle, x, y);
			}
		}
		
	});

	EntityFloaterParticle = EntityParticle.extend({
		lifetime: 3,
		fadetime: 2,
		bounciness: 0.6,
		vel: {x: 30, y: 20},

		size: {x: 4, y: 4},
		offset: {x: 0, y: 0},
		
		animSheet: new ig.AnimationSheet( 'media/stalker_pieces.png', 4, 4 ),
			
		init: function( x, y, settings ) {
			this.addAnim( 'idle', 5, [0,1,2,3] );
			this.parent( x, y, settings );
		}
	});

});