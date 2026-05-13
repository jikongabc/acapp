class Settings{
    constructor(root){
        this.root = root;
        this.platform = "WEB";
        if(this.root.os) this.platform = "ACAPP";
        this.username = "";
        this.photo = "";
        this.$settings = $(`
            <div class="my-game-settings">
                <div class="my-game-settings-login">
                    <div class="my-game-settings-title">
                        登录
                    </div>
                    <div class="my-game-settings-username">
                        <div class="my-game-settings-item">
                            <input type="text" placeholder="用户名">
                        </div>
                    </div>
                    <div class="my-game-settings-password">
                        <div class="my-game-settings-item">
                            <input type="password" placeholder="密码">
                        </div>
                    </div>
                    <div class="my-game-settings-submit">
                        <div class="my-game-settings-item">
                            <button>登录</button>
                        </div>
                    </div>
                    <div class="my-game-settings-error-messages">
                    </div>
                    <div class="my-game-settings-option">
                        注册
                    </div>
					<br>					
					<div class="my-game-settings-acwing">
            			<img width="30" src="https://app165.acapp.acwing.com.cn/static/image/settings/acwing_logo.png">
            			<br>
            			<div>
                			AcWing一键登录
            			</div>
              		</div>

                </div>
                <div class="my-game-settings-register">
					<div class="my-game-settings-title">
                        注册
                    </div>
                    <div class="my-game-settings-username">
                        <div class="my-game-settings-item">
                            <input type="text" placeholder="用户名">
                        </div>
                    </div>
                    <div class="my-game-settings-password-first">
                        <div class="my-game-settings-item">
                            <input type="password" placeholder="密码">
                        </div>
                    </div>
				    <div class="my-game-settings-password-second">
                        <div class="my-game-settings-item">
                            <input type="password" placeholder="确认密码">
                        </div>
                    </div>
                    <div class="my-game-settings-submit">
                        <div class="my-game-settings-item">
                            <button>注册</button>
                        </div>
                    </div>
                    <div class="my-game-settings-error-messages">
                    </div>
                    <div class="my-game-settings-option">
                        登录
                    </div>
					<br>					
					<div class="my-game-settings-acwing">
            			<img width="30" src="https://app165.acapp.acwing.com.cn/static/image/settings/acwing_logo.png">
            			<br>
            			<div>
                			AcWing一键登录
            			</div>
              		</div>
                </div>
            </div>
        `);
        this.$login = this.$settings.find(".my-game-settings-login");
		this.$login_username = this.$login.find(".my-game-settings-username input");
        this.$login_password = this.$login.find(".my-game-settings-password input");
        this.$login_submit = this.$login.find(".my-game-settings-submit button");
        this.$login_error_message = this.$login.find(".my-game-settings-error-message");
        this.$login_register = this.$login.find(".my-game-settings-option");

        this.$login.hide();

        this.$register = this.$settings.find(".my-game-settings-register");
		this.$register_username = this.$register.find(".my-game-settings-username input");
        this.$register_password = this.$register.find(".my-game-settings-password-first input");
        this.$register_password_confirm = this.$register.find(".my-game-settings-password-second input");
        this.$register_submit = this.$register.find(".my-game-settings-submit button");
        this.$register_error_message = this.$register.find(".my-game-settings-error-message");
        this.$register_login = this.$register.find(".my-game-settings-option");

        this.$register.hide();

        this.root.$my_game.append(this.$settings);
        this.start();
    }

    start(){
        this.getinfo();
    }

    register(){
        this.$login.hide();
        this.$register.show();
    }

    login(){
        this.$register.hide();
        this.$login.show();
    }

    getinfo(){
        let outer = this;
        $.ajax({
            url: "https://app8040.acapp.acwing.com.cn/settings/getinfo/",
            type: "GET",
            data:{
                platform: outer.platform,
            },
            success: function(resp){
                if(resp.result === "success"){
                    outer.username = resp.username;
                    outer.photo = resp.photo;
                    outer.hide();
                    outer.root.menu.show();
                }
                else{
                    outer.login();
                }
            }
        });
    }

    hide(){
        this.$settings.hide();
    }
       
    show(){
        this.$settings.show();
    }
}
