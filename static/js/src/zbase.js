export class MyGame{
    constructor(id, os){
        this.id = id;
        this.$my_game = $('#' + id);
        this.os = os;

        this.settings = new Settings(this);
        this.menu = new MyGameMenu(this);
        this.play = new MyGamePlay(this);
        this.start();
    }i
    start(){
    }
}
