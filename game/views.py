from django.http import HttpResponse

def index(request):
    line1 = '<h1 style="text-align: center">My game</h1>'
    line2 = '<hr>'
    line3 = '<a href="/play/">进入游戏界面</a>'
    return HttpResponse(line1 + line3 + line2)


def play(request):
    line1 = '<h1 style="text-align: center">游戏界面</h1>'
    line2 = '<hr>'
    line3 = '<a href="/">回到主界面</a>'
    return HttpResponse(line1 + line3 + line2)
