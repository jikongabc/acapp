export class MyGame{
    constructor(id){
        this.id = id;
        this.$my_game = $('#' + id);
        this.menu = new MyGameMenu(this);
        this.play = new MyGamePlay(this);
        this.start();
    }

    start(){
    }
}
