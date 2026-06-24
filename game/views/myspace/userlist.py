from game.models.player.player import Player
from rest_framework.views import APIView
from rest_framework.response import Response


class UserList(APIView):
    def get(self, request):
        players = Player.objects.all().exclude(photo="https://app165.acapp.acwing.com.cn/static/image/playground/photo.png").order_by('id')[:10]
        users = []
        for player in players:
            users.append({
                'id': player.user.id,
                'username': player.user.username,
                'photo': player.photo,
                'followerCount': player.followerCount
            })
        return Response(users)
