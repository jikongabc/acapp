from django.http import JsonResponse
from django.core.cache import cache
from django.conf import settings
import requests
from django.contrib.auth.models import User
from game.models.player.player import Player
from random import randint


def receive_code(request):
    data = request.GET

    if "errcode" in data:
        return JsonResponse({
            'result': "apply failed",
            'errcode': data['errcode'],
            'errmsg': data['errmsg'],
        })

    code = data.get('code')
    state = data.get('state')

    if not code or not state or not cache.has_key(state):
        return JsonResponse({
            'result': "state not exist"
        })
    cache.delete(state)

    if not settings.ACWING_APP_SECRET:
        return JsonResponse({
            'result': "acwing secret not configured"
        })

    apply_access_token_url = "https://www.acwing.com/third_party/api/oauth2/access_token/"
    params = {
        'appid': settings.ACWING_APP_ID,
        'secret': settings.ACWING_APP_SECRET,
        'code': code
    }

    try:
        access_token_res = requests.get(apply_access_token_url, params=params).json()
    except (requests.RequestException, ValueError):
        return JsonResponse({
            'result': "access token failed",
        })

    access_token = access_token_res.get('access_token')
    openid = access_token_res.get('openid')
    if not access_token or not openid or "errcode" in access_token_res:
        return JsonResponse({
            'result': "access token failed",
            'errcode': access_token_res.get('errcode'),
            'errmsg': access_token_res.get('errmsg'),
        })

    players = Player.objects.filter(openid=openid)
    if players.exists():  # 如果该用户已存在，则无需重新获取信息，直接登录即可
        player = players[0]
        return JsonResponse({
            'result': "success",
            'username': player.user.username,
            'photo': player.photo,
        })


    get_userinfo_url = "https://www.acwing.com/third_party/api/meta/identity/getinfo/"
    params = {
        "access_token": access_token,
        "openid": openid
    }
    try:
        userinfo_res = requests.get(get_userinfo_url, params=params).json()
    except (requests.RequestException, ValueError):
        return JsonResponse({
            'result': "get userinfo failed",
        })
    username = userinfo_res.get('username')
    photo = userinfo_res.get('photo')
    if not username or not photo or "errcode" in userinfo_res:
        return JsonResponse({
            'result': "get userinfo failed",
            'errcode': userinfo_res.get('errcode'),
            'errmsg': userinfo_res.get('errmsg'),
        })

    while User.objects.filter(username=username).exists():  # 找到一个新用户名
        username += str(randint(0, 9))

    user = User.objects.create(username=username)
    player = Player.objects.create(user=user, photo=photo, openid=openid)

    return JsonResponse({
        'result': "success",
        'username': player.user.username,
        'photo': player.photo,
    })
