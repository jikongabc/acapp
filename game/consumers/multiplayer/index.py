from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.conf import settings
from django.core.cache import cache

from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol

try:
    from match_system.src.match_server.match_service import Match
except ModuleNotFoundError:
    Match = None

from game.models.player.player import Player
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async

class MultiPlayer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = None
        self.uuid = None
        await self.accept()

    async def disconnect(self, close_code):
        if self.room_name:
            await self.channel_layer.group_discard(self.room_name, self.channel_name);


    async def create_player(self, data):
        if Match is None:
            await self.close()
            return

        self.room_name = None
        self.uuid = data['uuid']

        def db_get_player():
            return Player.objects.get(user__username=data['username'])

        player = await database_sync_to_async(db_get_player)()

        def add_player_to_match():
            transport = TSocket.TSocket('127.0.0.1', 9090)
            transport = TTransport.TBufferedTransport(transport)
            protocol = TBinaryProtocol.TBinaryProtocol(transport)
            client = Match.Client(protocol)

            transport.open()
            try:
                client.add_player(player.score, data['uuid'], data['username'], data['photo'], self.channel_name)
            finally:
                transport.close()

        await sync_to_async(add_player_to_match)()

    async def get_room_name(self):
        if self.room_name:
            return self.room_name

        if not self.uuid:
            return None

        keys = await sync_to_async(cache.keys)('*%s*' % (self.uuid))
        if keys:
            self.room_name = keys[0]
        return self.room_name

    async def group_send_to_room(self, payload):
        room_name = await self.get_room_name()
        if not room_name:
            return
        await self.channel_layer.group_send(room_name, payload)


    async def group_send_event(self, data):
        await self.get_room_name()
        await self.send(text_data=json.dumps(data))

    async def move_to(self, data):
        await self.group_send_to_room(
            {
                'type': "group_send_event",
                'event': "move_to",
                'uuid': data['uuid'],
                'tx': data['tx'],
                'ty': data['ty'],
            }
        )

    async def shoot_fireball(self, data):
        await self.group_send_to_room(
            {
                'type': "group_send_event",
                'event': "shoot_fireball",
                'uuid': data['uuid'],
                'tx': data['tx'],
                'ty': data['ty'],
                'ball_uuid': data['ball_uuid'],
            }
        )

    async def attack(self, data):
        room_name = await self.get_room_name()
        if not room_name:
            return
        players = await sync_to_async(cache.get)(room_name)

        if not players:
            return

        attackee = None
        for player in players:
            if player['uuid'] == data['attackee_uuid']:
                attackee = player
                break

        if not attackee or attackee['hp'] <= 0:
            return

        attackee['hp'] -= 25

        remain_cnt = 0
        for player in players:
            if player['hp'] > 0:
                remain_cnt += 1

        await sync_to_async(cache.set)(room_name, players, 3600)

        if remain_cnt <= 1:
            def db_update_player_score(username, score):
                player = Player.objects.get(user__username=username)
                player.score += score
                player.save()

            score_settled = await sync_to_async(cache.add)("%s:score_settled" % room_name, True, 3600)
            if score_settled:
                for player in players:
                    if player['hp'] <= 0:
                        await database_sync_to_async(db_update_player_score)(player['username'], -5)
                    else:
                        await database_sync_to_async(db_update_player_score)(player['username'], 10)

        await self.group_send_to_room(
            {
                'type': "group_send_event",
                'event': "attack",
                'uuid': data['uuid'],
                'attackee_uuid': data['attackee_uuid'],
                'x': data['x'],
                'y': data['y'],
                'angle': data['angle'],
                'damage': data['damage'],
                'ball_uuid': data['ball_uuid'],
            }
        )

    async def blink(self, data):
        await self.group_send_to_room(
            {
                'type': "group_send_event",
                'event': "blink",
                'uuid': data['uuid'],
                'tx': data['tx'],
                'ty': data['ty'],
            }
        )

    async def message(self, data):
        await self.group_send_to_room(
            {
                'type': "group_send_event",
                'event': "message",
                'uuid': data['uuid'],
                'username': data['username'],
                'text': data['text'],
            }
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        event = data['event']
        if event == "create_player":
            await self.create_player(data)
        elif event == "move_to":
            await self.move_to(data)
        elif event == "shoot_fireball":
            await self.shoot_fireball(data)
        elif event == "attack":
            await self.attack(data)
        elif event == "blink":
            await self.blink(data)
        elif event == "message":
            await self.message(data)
