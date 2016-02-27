ig.module( 
	'game.main' 
)
.requires(
	'impact.game',
	'impact.font',
	'plugins.impact-splash-loader',

	//'impact.debug.debug', // turn on debug info bottom panel

	'game.camera',

	'game.levels.1',
	'game.levels.1end',
	'game.levels.2',
	'game.levels.2end',
	'game.levels.3',
	'game.levels.3end',

	// for the title screem
	'impact.image',
	'impact.font',
	'impact.sound'
)
.defines(function(){

	MyGame = ig.Game.extend({
		
		gravity: 300, // All entities are affected by this

		// Load a font
		font: new ig.Font( 'media/04b03.font.png' ),
		

		levelTimer: new ig.Timer(),	
		collectableCount: 0,
		deathCount: 0,
		levelTimeText: '0',
		collectableCount: '0',
		deathCountText: '0',
		

		init: function() {
			// Initialize your game here; bind keys etc.
			ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
			ig.input.bind(ig.KEY.A, 'left');
			ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
			ig.input.bind(ig.KEY.D, 'right');
			ig.input.bind(ig.KEY.UP_ARROW, 'jump');
			ig.input.bind(ig.KEY.W, 'jump');
			ig.input.bind(ig.KEY.X, 'jump');
			ig.input.bind(ig.KEY.N, 'jump');
			ig.input.bind(ig.KEY.C, 'shoot');
			ig.input.bind(ig.KEY.M, 'shoot');

			this.camera = new Camera( ig.system.width/4, ig.system.height/3, 5 );
			this.camera.trap.size.x = ig.system.width/10;
			this.camera.trap.size.y = ig.system.height/3;
			this.camera.lookAhead.x = ig.ua.mobile ? ig.system.width/6 : 0;
			
			//start level
			this.loadLevel(Level1);

			this.levelTimer.set();

			// turn on debug info
			var debug = false;
			this.camera.debug = debug;
			ig.Entity._debugShowBoxes = debug; 
		},
		
		update: function() {
			this.camera.follow( this.player );

			// Update all entities and backgroundMaps
			this.parent();
			
			// Add your own, additional update code here
		},
		
		loadLevel: function( level ) {        
			this.parent( level );

			this.player = this.getEntitiesByType( EntityPlayer )[0];

			//set the starting pos of the player for if he dies before the first checkpoint
			this.playerSpawnPos = this.player.pos;


			// Set camera max and reposition trap
			this.camera.max.x = this.collisionMap.width * this.collisionMap.tilesize - ig.system.width;
			this.camera.max.y = this.collisionMap.height * this.collisionMap.tilesize - ig.system.height;

			this.camera.set( this.player );
		},

		respawnPlayerAtLastCheckpoint: function (x, y) {
			var pos = this.playerSpawnPos;
			if (this.lastCheckpoint) {
				pos = this.lastCheckpoint.getSpawnPos()
				this.lastCheckpoint.currentAnim = this.lastCheckpoint.anims.respawn.rewind();
			}
			this.player = this.spawnEntity(EntityPlayer, pos.x, pos.y);
			this.player.currentAnim = this.player.anims.spawn;
			this.deathCount++;
		},


		draw: function() {
			// Draw all entities and backgroundMaps
			this.parent();
			
			this.camera.draw();

			//this.font.draw( 'It Works!', ig.system.width/2, y = ig.system.height/2, ig.Font.ALIGN.CENTER );
		}
	});

	TitleScreen = ig.Class.extend({
		font: new ig.Font( 'media/04b03.font.png' ),
		init: function () {
			ig.input.bind(ig.KEY.X, 'start');
			ig.input.bind(ig.KEY.C, 'start');
		},

		run: function() {
			ig.system.clear('#0d0c0b');
			this.font.fillStyle = 'rgb(128,128,128)';

			var w = ig.system.width;
			var h = ig.system.height;

			this.font.draw('Press X or C to Play', w / 2, h / 2, ig.Font.ALIGN.CENTER);

			var drawControlsX = 40;
			var drawControlsX2 = drawControlsX + 5;
			var drawControlsY = h - 30;

			this.font.draw('Move:', drawControlsX, drawControlsY, ig.Font.ALIGN.RIGHT);
			this.font.draw('WAD, Arrow Keys', drawControlsX2, drawControlsY, ig.Font.ALIGN.LEFT);

			drawControlsY += 10;
			this.font.draw('Jump:', drawControlsX, drawControlsY, ig.Font.ALIGN.RIGHT);
			this.font.draw('N, X', drawControlsX2, drawControlsY, ig.Font.ALIGN.LEFT);

			drawControlsY += 10;
			this.font.draw('Shoot:', drawControlsX, drawControlsY, ig.Font.ALIGN.RIGHT);
			this.font.draw('M, C', drawControlsX2, drawControlsY, ig.Font.ALIGN.LEFT);
			
			if (ig.input.pressed('start')) {
				ig.system.setGame(MyGame);
				return;
			}

			//this.parent();
		}
});

// Start the Game with 60fps, a resolution of 320x240, scaled
// up by a factor of 2
ig.main( '#canvas', TitleScreen, 60, 320, 240, 2, ig.ImpactSplashLoader);

});
