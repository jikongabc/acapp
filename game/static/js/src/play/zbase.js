class MyGamePlay{
    constructor(root){
        this.root = root;
        this.$play = $(`<div class="my-game-play"></div>`);
        //this.hide();
        this.root.$my_game.append(this.$play);
        this.width = this.$play.width();
        this.height = this.$play.height();
        this.game_map = new GameMap(this);
        this.players = [];
        this.players.push(new Player(this, this.width / 2, this.height /2, this.height * 0.05, "white", this.height * 0.15, true));
        for(let i = 0; i < 5; i++){
            this.players.push(new Player(this, this.width / 2, this.height /2, this.height * 0.05, this.get_random_color(), this.height * 0.15, false));
        }

        this.start();
    }

    get_random_color(){
        let colors = ["blue", "red", "pink", "yellow", "green"];
        return colors[Math.floor(Math.random() * 5)];
    }   

    start(){
    }
    
    show(){
        this.$play.show();
    }

    hide(){
        this.$play.hide();
    }
}
