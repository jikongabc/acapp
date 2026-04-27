class MyGameMenu{
    constructor(root){
        this.root = root;
        this.$menu = $(`
<div class="my-game-menu">
    <div class="my-game-menu-field">
        <div class="my-game-menu-field-item my-game-menu-field-item-single">
            单人模式
        </div>
        <div class="my-game-menu-field-item my-game-menu-field-item-multi">
            多人模式
        </div>
        <div class="my-game-menu-field-item my-game-menu-field-item-setting">
            设置
        </div>

    </div>
</div>
`);
        this.root.$my_game.append(this.$menu);
        this.$single = this.$menu.find('my-game-menu-field-item-single');
        this.$multi = this.$multi.find('my-game-menu-field-item-multi');
        this.$setting = this.$setting.find('my-game-menu-field-item-setting');
    }
}
