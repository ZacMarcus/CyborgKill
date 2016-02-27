ig.module(
	'game.entities.checkpoint'
)
.requires(
	'impact.entity'
)
.defines(function(){
	
	EntityCheckpoint = ig.Entity.extend({
		size: {x:18, y:21},
		offset: {x:0, y:0},
		zIndex:-1,
		type:ig.Entity.TYPE.NONE,
		checkAgainst:ig.Entity.TYPE.A,
		collides:ig.Entity.COLLIDES.NEVER,

		animSheet: new ig.AnimationSheet( 'media/checkpoint.png', 18, 21 ),	

		init: function( x, y, settings ) {
			this.parent( x, y, settings );
			this.addAnim( 'idle', 0.2, [1] );
			this.addAnim('activated',0.5,[0]);
			this.addAnim('respawn',0.1,[8,9,10,11,12,13,14,15]);
		},

		update:function(){
			if(this.currentAnim==this.anims.respawn&&this.currentAnim.loopCount>0){
				this.currentAnim=this.anims.activated;
			}
			this.currentAnim.update();
		},

		getSpawnPos:function(){
			return{
				x:(this.pos.x + 5),
				y:this.pos.y
			};
		},

		activate:function(){
			//this.sound.play();
			this.active=true;
			this.currentAnim=this.anims.activated;
			ig.game.lastCheckpoint=this;
		},

		check:function(other){
			if(!this.active){
				this.activate();
			}
		}
	});

});