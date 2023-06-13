import eventlet
import socketio
# to import boat class
from models.boat import Boat
from models.cruiser import Cruiser
from models.destroyer import Destroyer
from models.submarine import Submarine
from models.battleship import Battleship
from models.carrier import Carrier


class Game:
    def __init__(self):
        self.sio = socketio.Server(cors_allowed_origins='http://localhost:5173')
        self.app = socketio.WSGIApp(self.sio)
        self.__ready_players = 0
        self.__whos_turn = "player1"
        self.__connections = []
        self.__player1Boats = []
        self.__player2Boats = []
        self.__player1Shots = []
        self.__player2Shots = []
        self.__isGameOver = False
        self.__sunkedPlayer1Boats = 0
        self.__sunkedPlayer2Boats = 0
        self.__game_control = {"player1": {
                                "info" : "",
                                "position" : "",
                                "water" : True,
                                },
                                "player2": {
                                "info" : "",
                                "position" : "",
                                "water" : True,
                                },
                                "whoseGo" : self.__whos_turn
                            }

        self.sio.on('connect', self.connect)
        self.sio.on('disconnect', self.disconnect)
        self.sio.on('addBoats', self.add_boats)
        self.sio.on('waterHitSink', self.water_hit_sink)
        self.sio.on('ready', self.ready)

    def run(self):
        eventlet.wsgi.server(eventlet.listen(('localhost', 3000)), self.app)

    def connect(self, sid, environ):
        # to only allow two players
        if len(self.__connections) < 2:
            self.__connections.append(sid)
            self.sio.emit('playerConnected', self.__connections)
        else:
            self.sio.emit('playerConnected', ["full"])

    def disconnect(self, sid):
        if sid in self.__connections:
            self.__connections.remove(sid)
        # to reset boats and shots if one of the players disconnected
            self.__player1Boats = []
            self.__player2Boats = []
            self.__player1Shots = []
            self.__player2Shots = []
            self.__sunkedPlayer1Boats = 0
            self.__sunkedPlayer2Boats = 0
            self.__isGameOver = False
            self.__whos_turn = "player1"
            self.__game_control = {
                                    "player1": {
                                        "info" : "",
                                        "position" : "",
                                        "water" : True,
                                    },
                                    "player2": {
                                        "info" : "",
                                        "position" : "",
                                        "water" : True,
                                    },
                                    "whoseGo" : self.__whos_turn
                                   }
            # to -1 the ready players if one of them disconnected
            if self.__ready_players > 0:
                self.__ready_players -= 1
            self.sio.emit('playerDisconnected', len(self.__connections))

    def add_boats(self,sid, boats,player):
        if sid not in self.__connections:
            return []
        transformedBoats = []
        # to transform the boats from json to objects
        for boat in boats:
            if boat["typeOfBoat"] == "carrier":
                transformedBoats.append(Carrier(boat["length"], boat["isHorizontal"], boat["position"]))
            elif boat["typeOfBoat"] == "battleship":
                transformedBoats.append(Battleship(boat["length"], boat["isHorizontal"], boat["position"]))
            elif boat["typeOfBoat"] == "submarine":
                transformedBoats.append(Submarine(boat["length"], boat["isHorizontal"], boat["position"]))
            elif boat["typeOfBoat"] == "destroyer":
                transformedBoats.append(Destroyer(boat["length"], boat["isHorizontal"], boat["position"]))
            elif boat["typeOfBoat"] == "cruiser":
                transformedBoats.append(Cruiser(boat["length"], boat["isHorizontal"], boat["position"]))
            
            # to assign the boats to the right player
            if player == "player1":
                self.__player1Boats = transformedBoats
            else:
                self.__player2Boats = transformedBoats
    

    def ready(self,sid,player):
        # to check that the player has placed all his boats
        if sid not in self.__connections:
            return False
        
        if player == "player1":
            if len(self.__player1Boats) != 5:
                self.sio.emit('ready', self.__ready_players)
                return False
        else:
            if len(self.__player2Boats) != 5:
                self.sio.emit('ready', self.__ready_players)
                return False
        self.__ready_players += 1
        self.sio.emit('ready', self.__ready_players)

    def is_game_over(self):
     return self.__sunkedPlayer1Boats == 5 or self.__sunkedPlayer2Boats == 5


    
    def water_hit_sink(self, sid, position, player):
        failure = {
            "failure" : "",
            "whoseGo" : self.__whos_turn
        }
        if sid not in self.__connections:   
            failure["failure"] = "not connected"
            self.sio.emit('waterHitSink', failure)
            return False
        
        if self.__ready_players != 2:
            failure["failure"] = "not enough players"
            self.sio.emit('waterHitSink', failure)
            return False

        if self.is_game_over():
            failure["failure"] = "game over"
            self.sio.emit('waterHitSink', failure)
            return False

        if player != self.__whos_turn:
            failure["failure"] = "not your turn"
            self.sio.emit('waterHitSink', failure)
            return False

        if player == "player1":
            for shot in self.__player1Shots:
                if shot == position:
                    failure["failure"] = "you already shot there"
                    self.sio.emit('waterHitSink', failure)
                    return False
            self.__player1Shots.append(position)
        else:
            for shot in self.__player2Shots:
                if shot == position:
                    failure["failure"] = "you already shot there"
                    self.sio.emit('waterHitSink', failure)
                    return False
            self.__player2Shots.append(position)

        # to control that all the boats are placed
        if len(self.__player1Boats) != 5 or len(self.__player2Boats) != 5:
            failure["failure"] = "not all boats are placed"
            self.sio.emit('waterHitSink', failure)
            return False
        

        if player == "player1":
            for boat in self.__player2Boats:
                if boat.hit(position):
                    if boat.check_if_sink():
                        self.__game_control["player1"]["info"] = f"Has hundido the {type(boat).__name__}"
                        self.__game_control["player1"]["position"] = position
                        self.__game_control["player1"]["water"] = False
                        self.__game_control["whoseGo"] = self.__whos_turn
                        self.__whos_turn = "player2"
                        self.__sunkedPlayer2Boats += 1
                        if self.is_game_over():
                            self.__game_control["player1"]["info"] = "Has ganado"
                            self.__game_control["player1"]["position"] = position
                            self.__game_control["player1"]["water"] = False
                            self.__game_control["whoseGo"] = "player1"
                            self.sio.emit('waterHitSink', self.__game_control)
                            return True
                        self.sio.emit('waterHitSink', self.__game_control)
                        return True
                    else:
                        self.__game_control["player1"]["info"] = f"Le ha dado a {type(boat).__name__}"
                        self.__game_control["player1"]["position"] = position
                        self.__game_control["player1"]["water"] = False
                        self.__game_control["whoseGo"] = self.__whos_turn
                        self.__whos_turn = "player2"
                        self.sio.emit('waterHitSink', self.__game_control)
                        return True
            
            self.__game_control["player1"]["info"] = "Agua"
            self.__game_control["player1"]["position"] = position
            self.__game_control["player1"]["water"] = True
            self.__game_control["whoseGo"] = self.__whos_turn
            self.__whos_turn = "player2"
            self.sio.emit('waterHitSink', self.__game_control)
            return True
            

        for boat in self.__player1Boats:
            if boat.hit(position):
                if boat.check_if_sink():
                    self.__game_control["player2"]["info"] = f"Has hundido the {type(boat).__name__}"
                    self.__game_control["player2"]["position"] = position
                    self.__game_control["player2"]["water"] = False
                    self.__game_control["whoseGo"] = self.__whos_turn
                    self.__whos_turn = "player1"
                    self.__sunkedPlayer1Boats += 1
                    if self.is_game_over():
                        self.__game_control["player2"]["info"] = "Has ganado"
                        self.__game_control["player2"]["position"] = position
                        self.__game_control["player2"]["water"] = False
                        self.__game_control["whoseGo"] = "player2"
                        self.sio.emit('waterHitSink', self.__game_control)
                        return True
                    self.sio.emit('waterHitSink', self.__game_control)
                    return True
                else:
                    self.__game_control["player2"]["info"] = f"Le has dado a {type(boat).__name__}"
                    self.__game_control["player2"]["position"] = position
                    self.__game_control["player2"]["water"] = False
                    self.__game_control["whoseGo"] = self.__whos_turn
                    self.__whos_turn = "player1"
                    self.sio.emit('waterHitSink', self.__game_control)
                    return True
            


        self.__game_control["player2"]["info"] = "Agua"
        self.__game_control["player2"]["position"] = position
        self.__game_control["player2"]["water"] = True
        self.__game_control["whoseGo"] = self.__whos_turn
        self.__whos_turn = "player1"
        self.sio.emit('waterHitSink', self.__game_control)


                       
if __name__ == '__main__':
    game = Game()
    game.run()
