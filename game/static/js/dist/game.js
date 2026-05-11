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
let MY_GAME_OBJECTS = []

class MyGameObject{
    constructor(){
        MY_GAME_OBJECTS.push(this);
        this.has_called_start = false; // 是否执行过start函数
        this.timedelta = 0; // 当前帧距离上一帧的时间间隔
    }

    start(){ // 只会在第一帧执行一次
    
    }
    
    update(){ // 每一帧均会执行一次
    
    }
    
    on_destroy(){ // 在被销毁前执行一次
        
    }

    destroy(){ // 删除该物体
        this.on_destroy();
        for(let i = 0; i < MY_GAME_OBJECTS.length; i++){
            if(MY_GAME_OBJECTS[i] === this){
                MY_GAME_OBJECTS.splice(i, 1);
                break;
            }
        }
    }
}

let last_timestamp;

let MY_GAME_ANIMATION = function(timestamp){
    for(let i = 0; i < MY_GAME_OBJECTS.length; i++){
        let obj = MY_GAME_OBJECTS[i];
        if(!obj.has_called_start){
            obj.start();
            obj.has_called_start = true;
        }
        else{
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }
    last_timestamp = timestamp;
    requestAnimationFrame(MY_GAME_ANIMATION);
}

requestAnimationFrame(MY_GAME_ANIMATION);
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
    }
    update(){
        this.render();
    }
    render(){
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}   
class Player extends MyGameObject{
    constructor(play, x, y, radius, color, speed, is_me){
        super();
        this.play = play;
        this.ctx = this.play.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.damage_x = 0;
        this.damage_y = 0;
        this.damage_speed = 0;
        this.move_length = 0;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.is_me = is_me;
        this.eps = 0.1;
        this.friction = 0.9;
        this.spent_time = 0;
        this.cur_skill = null;
    }

    start(){
        if(this.is_me){
            this.add_listening_events();
        }
        else{
            let tx = Math.random() * this.play.width;
            let ty = Math.random() * this.play.height;
            this.move_to(tx, ty);
        }
    }

    shoot_fireball(tx, ty){
        let x = this.x, y = this.y;
        let radius = this.play.height * 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "orange";
        let speed = this.play.height * 0.5;
        let move_length = this.play.height * 1;
        new Fireball(this.play, this, x, y, radius, vx, vy, color, speed, move_length, this.play.height * 0.01);
    }

    is_attacked(angle, damage){
        for(let i = 0; i < 20 + Math.random() * 5; i++){
            let x = this.x, y = this.y;
            let radius = this.radius * Math.random() * 0.1;
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle), vy = Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 10;
            let move_length = this.radius * Math.random() * 5;
            new Particle(this.play, x, y, radius, vx, vy, color, speed, move_length);
        }

        this.radius -= damage;
        if(this.radius < 10){
            this.destroy();
            return false;
        }
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage * 100;
        this.speed *= 1.5;
    }

    add_listening_events(){
        let outer = this;
        this.play.game_map.$canvas.on("contextmenu", function(){
            return false;
        });
        this.play.game_map.$canvas.mousedown(function(e){
            if(e.which === 3){
                outer.move_to(e.clientX, e.clientY);
            }
            else if(e.which === 1){
                if(outer.cur_skill === "fireball"){
                    outer.shoot_fireball(e.clientX, e.clientY);
                }
                outer.cur_skill = null;
            }
        });
        $(window).keydown(function(e){
            if(e.which === 81){
                outer.cur_skill = "fireball";
                return false;
            }
        });
    }

    get_dist(x1, y1, x2, y2){
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    move_to(tx, ty){
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        let angle = Math.atan2(ty -this.y, tx - this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    update(){
        this.spent_time += this.timedelta / 1000;
        if(!this.is_me && this.spent_time > 4 && Math.random() < 1 / 300.0){
            let players = this.play.players.filter(p => p !== this);
            if(players.length === 0) return;
            let player = players[Math.floor(Math.random() * players.length)];
            let tx = player.x + player.speed * this.vx * this.timedelta / 1000 * 0.3;
            let ty = player.y + player.speed * this.vy * this.timedelta / 1000 * 0.2;
            this.shoot_fireball(tx, ty);
       }
        if(this.damage_speed > 10){
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        }
        else{
            if(this.move_length < this.eps){
                this.move_length = 0;
                this.vx = this.vy = 0;
                if(!this.is_me){
                    let tx = Math.random() * this.play.width;
                    let ty = Math.random() * this.play.height;
                    this.move_to(tx, ty);
                }
            }
            else{
                let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }
        }
        this.render();
    }
    render(){
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    on_destroy(){
        for(let i = 0; i < this.play.players.length; i++){
            if(this.play.players[i] === this){
                this.play.players.splice(i, 1);
            }
        }
    }
}
class Particle extends MyGameObject{
    constructor(play, x, y, radius, vx, vy, color, speed, move_length){
        super();
        this.play = play;
        this.ctx = this.play.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.friction = 0.9;
        this.eps = 1;
    }

    start(){
    }

    update(){
        if(this.speed < this.eps || this.move_length < this.eps){
            this.destroy();
            return false;
        }
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.speed *= this.friction;
        this.move_length -= moved;
        this.render();
    }

    render(){
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
    
}
class Fireball extends MyGameObject{
    constructor(play, player, x, y, radius, vx, vy, color, speed, move_length, damage){
        super();
        this.play = play;
        this.ctx = this.play.game_map.ctx;
        this.player = player;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.damage = damage;
        this.eps = 0.1;
    }

    start(){
    }
    
    get_dist(x1, y1, x2, y2){
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    is_collision(player){
        let distanse = this.get_dist(this.x, this.y, player.x, player.y);
        if(distanse < this.radius + player.radius)
            return true;
        return false;
    }

    attack(player){
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        player.is_attacked(angle, this.damage);
        this.destroy();
    }

    update(){
        for(let i = 0; i < this.play.players.length; i++){
            let player = this.play.players[i];
            if(this.player !== player && this.is_collision(player)){
                this.attack(player)
            }
        }
        if(this.move_length < this.eps){
            this.destroy();
            return false;
        }
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;
        this.render();
    }

    render(){
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

}
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
export class MyGame{
    constructor(id){
        this.id = id;
        this.$my_game = $('#' + id);
       // this.menu = new MyGameMenu(this);
        this.play = new MyGamePlay(this);
        this.start();
    }

    start(){
    }
}
