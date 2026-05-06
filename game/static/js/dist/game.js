class MyGameMenu{
    constructor(root){
        this.root = root;
        this.$menu = $(`
<div class="my-game-menu">
    <div class="my-game-menu-field">
        <div class="my-game-menu-field-item my-game-menu-field-item-single-mode">
            单人模式
        </div>
        <div class="my-game-menu-field-item my-game-menu-field-item-multi-mode">
            多人模式
        </div>
        <div class="my-game-menu-field-item my-game-menu-field-item-settings">
            设置
        </div>

    </div>
</div>
`);
        this.root.$my_game.append(this.$menu);
        this.$single_mode = this.$menu.find('.my-game-menu-field-item-single-mode');
        this.$multi_mode = this.$menu.find('.my-game-menu-field-item-multi-mode');
        this.$settings = this.$menu.find('.my-game-menu-field-item-settings');
        
        this.start();
    }

    start(){
        this.add_listening_events();
    }
    
    add_listening_events(){
        let outer = this;
        this.$single_mode.click(function(){
            outer.hide();
            outer.root.play.show();
        });
        this.$multi_mode.click(function(){
        
        });
        this.$settings.click(function(){
        
        });
    }

    show(){
        this.$menu.show();
    }

    hide(){ 
        this.$menu.hide();   
    }
}
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
class MyGame{
    constructor(id){
        this.id = id;
        this.$my_game = $('#' + id);
        this.menu = new MyGameMenu(this);
        this.play = new MyGamePlay(this);
    }
}
