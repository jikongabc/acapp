class GameMap extends MyGameObject{
    constructor(play){
        super();
        this.play = play;
        this.$canvas = $(`<canvas></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.play.width;
        this.ctx.canvas.height = this.play.height;
        this.play.$play.append(this.$canvas);
    }
    start(){
		$(window).resize(() => {
        	if(this.game_map && this.players){
            	this.resize();
        	}
    	});
    }
    update(){
        this.render();
    }
    render(){
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
	resize(){
    	this.ctx.canvas.width = this.play.width;
    	this.ctx.canvas.height = this.play.height;
	}
}   
