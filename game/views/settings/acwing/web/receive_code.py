from django.shortcuts import redirect
from django.core.cache import cache
from django.conf import settings
import requests
from django.contrib.auth.models import User
from game.models.player.player import Player
from django.contrib.auth import login
from random import randint


def receive_code(request):
    data = request.GET
    code = data.get('code')
    state = data.get('state')

    if not code or not state or not cache.has_key(state):
        return redirect("index")
    cache.delete(state)

    if not settings.ACWING_APP_SECRET:
        return redirect("index")

    apply_access_token_url = "https://www.acwing.com/third_party/api/oauth2/access_token/"
    params = {
        'appid': settings.ACWING_APP_ID,
        'secret': settings.ACWING_APP_SECRET,
        'code': code
    }

    try:
        access_token_res = requests.get(apply_access_token_url, params=params).json()
    except (requests.RequestException, ValueError):
        return redirect("index")

    access_token = access_token_res.get('access_token')
    openid = access_token_res.get('openid')
    if not access_token or not openid or "errcode" in access_token_res:
        return redirect("index")

    players = Player.objects.filter(openid=openid)
    if players.exists():  # 如果该用户已存在，则无需重新获取信息，直接登录即可
        login(request, players[0].user)
        return redirect("index")

    get_userinfo_url = "https://www.acwing.com/third_party/api/meta/identity/getinfo/"
    params = {
        "access_token": access_token,
        "openid": openid
    }
    try:
        userinfo_res = requests.get(get_userinfo_url, params=params).json()
    except (requests.RequestException, ValueError):
        return redirect("index")
    username = userinfo_res.get('username')
    photo = userinfo_res.get('photo')
    if not username or not photo or "errcode" in userinfo_res:
        return redirect("index")

    while User.objects.filter(username=username).exists():  # 找到一个新用户名
        username += str(randint(0, 9))

    user = User.objects.create(username=username)
    player = Player.objects.create(user=user, photo=photo, openid=openid)

    login(request, user)

    return redirect("index")
