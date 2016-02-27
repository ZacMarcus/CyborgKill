ig.module(
	'game.entities.stalker'
)
.requires(
	'impact.entity',
	'game.entities.particle'
)
.defines(function(){
	
	EntityStalker = ig.Entity.extend({
		size: {x: 15, y: 15},
		offset: {x: 0, y: 4},

		maxVel: {x: 100, y: 100},
		friction: {x: 150, y: 0},
		
		type: ig.Entity.TYPE.B, // Evil enemy group
		checkAgainst: ig.Entity.TYPE.A, // Check against friendly
		collides: ig.Entity.COLLIDES.PASSIVE,
		
		health: 30,
	
		speed: 20,
		flip: false,
		
		seenPlayer: false,

		animSheet: new ig.AnimationSheet( 'media/stalker.png', 17, 19 ),
		
		
		init: function( x, y, settings ) {
			this.parent( x, y, settings );
			
			this.addAnim( 'idle', 1, [0] );
			this.addAnim( 'walk', 0.08, [8,9,10,11,12,13,14,15] );
			this.addAnim( 'hit', 0.5, [16] );
			this.addAnim( 'attack', 0.1, [24,25,26,27] );
			this.addAnim( 'die', 0.1, [16,16,16,17,18,19,20,20,20,20] );

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
				if(xdist < 160 && ydist < 32) {
					this.seenPlayer = true;
					this.attackTimer.set(1.5);
				}
			}
			else if(this.standing && this.currentAnim != this.anims.hit && this.currentAnim != this.anims.die) {
				if(xdist > 160 && this.attackTimer.delta() > 0) {
					this.currentAnim = this.anims.walk;
					this.vel.x = this.speed * xdir;
				}
				else if(this.currentAnim == this.anims.walk) {
					this.currentAnim = this.anims.idle;
					this.vel.x = 0;
					this.attackTimer.set(1);
				}
				else if(this.attackTimer.delta() > 0 && ydist < 64) {
					this.attackTimer.set(2);
					this.currentAnim = this.anims.attack.rewind();
				}
				if(this.currentAnim == this.anims.attack) {
					if( this.currentAnim.loopCount ) {
						var projectileSpawnX = this.flip ? this.pos.x : this.pos.x + this.size.x;
						ig.game.spawnEntity(EntityStalkerProjectile, projectileSpawnX, this.pos.y+5, {flip:this.flip});
						this.currentAnim = this.anims.idle.rewind();
						
					}
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
				ig.game.spawnEntity( EntityStalkerParticle, x, y);
			}
		}
		
	});

	EntityStalkerProjectile = ig.Entity.extend ({
		size: {x: 5, y: 8},
		offset: {x: 0, y: 0},
		maxVel: {x: 100, y: 0},
		
		type: ig.Entity.TYPE.NONE,
		checkAgainst: ig.Entity.TYPE.A, // Check Against A - our player friendly group
		collides: ig.Entity.COLLIDES.NEVER,
		//collides: ig.Entity.COLLIDES.,
		
		gravityFactor:0,

		flip: false,
		hasHit:false,

		animSheet: new ig.AnimationSheet( 'media/stalker_projectile.png', 5, 8 ),

		init: function( x, y, settings ) {
			this.parent( x, y, settings );

			this.vel.x = (settings.flip ? -this.maxVel.x : this.maxVel.x);
			this.addAnim( 'idle', 1, [0] );
			this.addAnim( 'hit', 0.2, [0,1,2,3,4] );
		},
		
		update:function(){
			this.parent();

			if(this.hasHit&&this.currentAnim.loopCount>0){
				this.kill();
			}
			this.currentAnim.flip.x=this.flip;
			this.currentAnim.update();
			
		},

		handleMovementTrace:function(res){
			this.parent(res);
			if(res.collision.x || res.collision.y){
				this.currentAnim = this.anims.hit;
				this.hasHit = true;
			}
		},

		// This function is called when this entity overlaps anonther entity of the
		// checkAgainst group. I.e. for this entity, all entities in the B group.
		check: function( other ) {
			if(!this.hasHit){
				other.receiveDamage(10,this);
				this.hasHit = true;
				this.currentAnim = this.anims.hit;
				this.vel.x = 0;
			}
		}
	});

	EntityStalkerParticle = EntityParticle.extend({
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