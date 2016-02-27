ig.module(
	'game.entities.player'
)
.requires(
	'impact.entity',
	'impact.sound',
	'game.entities.particle'
)
.defines(function(){
	EntityPlayer = ig.Entity.extend({
		// The players (collision) size is a bit smaller than the animation
		// frames, so we have to move the collision box a bit (offset)
		size: {x: 7, y:16},
		offset: {x: 3, y: 2},
				
		maxVel: {x: 100, y: 200},
		friction: {x: 600, y: 0},
		
		type: ig.Entity.TYPE.A, // Player friendly group
		checkAgainst: ig.Entity.TYPE.B,
		collides: ig.Entity.COLLIDES.PASSIVE,


		animSheet: new ig.AnimationSheet( 'media/player.png', 17, 19 ),	


		// These are our own properties. They are not defined in the base
		// ig.Entity class. We just use them internally for the Player
		flip: false,
		accelGround: 400,
		accelAir: 200,
		health: 10,

		spawnPosition: {x: 0, y:0},

		sfxShoot: new ig.Sound('media/sounds/player_shoot.ogg'),

		init: function( x, y, settings ) {
			this.parent( x, y, settings );

			this.addAnim( 'idle', 1, [0] );
			this.addAnim( 'run', 0.07, [18,19,20,21,22,23,24,25,26] );
			this.addAnim( 'jump', 1, [9] );
			this.addAnim( 'fall', 0.4, [10] );
			this.addAnim( 'die', 0.2, [4,4,4,4,4,4] );
			this.addAnim( 'hit', 0.5, [1] );
			this.addAnim( 'spawn', 0.2, [4,4,11,12,13] );

			this.jumpTimer = new ig.Timer();
			//this.jumpAttackVel = 19;
			this.jump = 170;

			//set the initial spawn position to the starting position
			spawnPosition = {x: x, y: y};
		},

		update: function() {
			if (this.currentAnim == this.anims.spawn) {
				this.currentAnim.update();
				if (this.currentAnim.loopCount) {
					this.currentAnim = this.anims.idle.rewind();
				} 
				else {
					return;
				}
			}
			if( this.currentAnim == this.anims.die ) {
				this.currentAnim.update();
				// Has the animation completely run through? -> kill it
				if( this.currentAnim.loopCount ) {
					this.kill();
				}
				return;
			}

			// move left or right
			var accel = this.standing ? this.accelGround : this.accelAir;
			if(ig.input.state('left')) {
				this.accel.x = -accel;
				this.flip = true;

			}
			else if( ig.input.state('right')) {
				this.accel.x = accel;
				this.flip = false;
			}
			else {
				this.accel.x = 0;
			}

			// shoot
			if( ig.input.pressed('shoot')) {
				//add 8 to the projectiles y so it comes the middle of the body
				ig.game.spawnEntity( EntityProjectile, this.pos.x, this.pos.y+8, {flip:this.flip} );
				this.sfxShoot.play();
			}


			// jump
			if( ig.input.pressed('jump') && this.standing) {
				this.jumpTimer.set(0);
			} 
			if ( ig.input.state('jump') && this.jumpTimer.delta() < 0.14 ) {
				this.vel.y -= this.jump * ig.system.tick * 6.5;
			} 
			else {
				this.accel.y = 0;
			}


			// set the current animation, based on the player's speed
			if(!this.standing) {
				if(this.vel.y < 0 ) {
					this.currentAnim = this.anims.jump;
				}
				else if(this.vel.y > 0 ) {
					this.currentAnim = this.anims.fall;
				}
			}
			else if(this.vel.x != 0 ) {
				this.currentAnim = this.anims.run;
			}
			else {
				this.currentAnim = this.anims.idle;
			}
			
			this.currentAnim.flip.x = this.flip;

			this.offset.x = this.flip ? 8 : 3; //move the players animation to make sure they are in the hitbox
			// move!
			this.parent();
		},

		receiveDamage: function( amount, other ) {
			this.health -= amount;
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

		kill: function () {
			this.parent();
			ig.game.respawnPlayerAtLastCheckpoint(this.pos.x, this.pos.y);
		},

		spawnParticles: function(count) {
			for(i = 0; i < count; i++) {
				var x = Math.random().map( 0,1, this.pos.x, this.pos.x+this.size.x );
				var y = Math.random().map( 0,1, this.pos.y, this.pos.y+this.size.y );
				ig.game.spawnEntity( EntityPlayerParticle, x, y);
			}
		}
	});


	// The projectile a player can shoot are NOT in a separate file, because
	// we don't need to be able to place them in Weltmeister. They are just used
	// here in the code.

	// Only entities that should be usable in Weltmeister need to be in their own
	// file.
	EntityProjectile = ig.Entity.extend({
		size: {x: 5, y: 3},
		offset: {x: 0, y: 1},
		maxVel: {x: 200, y: 0},
		
		type: ig.Entity.TYPE.NONE,
		checkAgainst: ig.Entity.TYPE.B, // Check Against B - our evil enemy group
		collides: ig.Entity.COLLIDES.NEVER,
		//collides: ig.Entity.COLLIDES.,
		
		gravityFactor:0,

		flip: false,
		hasHit:false,

		animSheet: new ig.AnimationSheet( 'media/player_projectile.png', 5, 5 ),
		
		
		init: function( x, y, settings ) {
			this.parent( x, y, settings );

			this.vel.x = (settings.flip ? -this.maxVel.x : this.maxVel.x);
			this.addAnim( 'idle', 1, [0] );
			this.addAnim( 'hit', 0.1, [0,1,2,3,4] );
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

	EntityPlayerParticle = EntityParticle.extend({
		lifetime: 3,
		fadetime: 2,
		bounciness: 0.6,
		vel: {x: 30, y: 20},

		size: {x: 4, y: 4},
		offset: {x: 0, y: 0},
		
		animSheet: new ig.AnimationSheet( 'media/player_pieces.png', 4, 4 ),
			
		init: function( x, y, settings ) {
			this.addAnim( 'idle', 5, [0,1,2,3] );
			this.parent( x, y, settings );
		}
	});
});
