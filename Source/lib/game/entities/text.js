ig.module(
	'game.entities.text'
)
.requires(
	'impact.entity',
	'impact.font'
)
.defines(function(){
	
	EntityText = ig.Entity.extend({
		_wmScalable: true,
		_wmDrawBox: true,
		_wmBoxColor: 'rgba(0, 0, 255, 0.7)',

		size: {x: 8, y: 8},
		gravity: 0,
		font: new ig.Font( 'media/04b03.font.png' ),

		inti: function() {
			this.parent( x, y, settings );
		},

		update: function(){
			//this.parent();
		},

		draw: function() {
			this.parent();

			if(true) {			
				//ig.system.clear('#0d0c0b');

				this.font.fillStyle = 'rgb(128,128,128)';

				var x = this.pos.x + this.size.x / 2;
				var x2 = x + 5;
				var y = this.pos.y;
			
				this.font.draw('LevelComplete!', x, y, ig.Font.ALIGN.CENTER);

				y += 30;
				this.font.draw('Time:', x, y, ig.Font.ALIGN.RIGHT);
				this.font.draw(ig.game.levelTimeText + 's', x2, y, ig.Font.ALIGN.LEFT);
				
				y += 10;
				this.font.draw('Items Collected:', x, y, ig.Font.ALIGN.RIGHT);
				this.font.draw(ig.game.collectableCountText + '/5', x2, y, ig.Font.ALIGN.LEFT);
				
				y += 10;
				this.font.draw('Deaths:', x, y, ig.Font.ALIGN.RIGHT);
				this.font.draw(ig.game.deathCountText, x2, y, ig.Font.ALIGN.LEFT);
			

				// y += 50;
				// var story = 'Insert story here';
				// this.font.draw(story, this.pos.x + 20, y, ig.Font.ALIGN.LEFT);
			}
		}
	});

});