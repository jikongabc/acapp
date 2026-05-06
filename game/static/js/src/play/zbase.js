class MyGamePlay{
    constructor(root){
        this.root = root;
        this.$play = $(`<div>游戏界面</div>`);
        this.hide();
        this.root.$my_game.append(this.$play);
        this.start();
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
