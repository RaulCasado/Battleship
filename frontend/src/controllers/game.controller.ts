import { GameService } from "../services/game.service";
import { PrincipalView } from "../views/principal.view";

export class GameController {
    private gameService: GameService;
    private principalView: PrincipalView;

    public constructor(gameService: GameService, principalView: PrincipalView) {
        this.gameService = gameService;
        this.principalView = principalView;
        this.principalView.dragDrop(this.handlerCheckPosition, this.handlerAllBoatsPlaced);
        this.principalView.bindReadyButton(this.handlerPlayerReady,this.handlerGetPlayerName);
        this.principalView.bindEnemyGrid(this.handlerShoot, this.handlerGetPlayerName);
        this.gameService.playerConnected(this.handlerRenderConnectedPlayers);
        this.gameService.anotherPlayerReady(this.handlerAnotherPlayerConnected);
        this.gameService.playerDisconnected(this.handlerRemoveReadyAndStart);
        this.gameService.anotherPlayerShoot(this.handlerAnotherPlayerShoot);
    }

    handlerPlayerReady = () => {
        return this.gameService.playerReady();
    }

    handlerAllBoatsPlaced = () => {
        this.gameService.checkIfAllBoatsArePlaced();
    }

    handlerCheckPosition = (draggedShipLength : number, targetDivId : number,isHorizontal : boolean,clickedBoatId : number, selectedShipNameWithIndex : string) : number[] => {
        return this.gameService.validPositions(draggedShipLength, targetDivId, isHorizontal,clickedBoatId,selectedShipNameWithIndex);
    }   

    handlerShoot = (position : number) => {
        return this.gameService.shoot(position);
    }

    handlerGetPlayerName = () => {
        return this.gameService.getPlayerName();
    }

    handlerRenderConnectedPlayers = (data : any) => {
        this.principalView.renderConnectedPlayers(data);
    }

    handlerAnotherPlayerConnected = (data : any) => {
        this.principalView.renderNewReadyPlayer();
    }

    handlerRemoveReadyAndStart = () => {
        this.principalView.removeReadyAndConnectedPlayer2();
    }

    handlerAnotherPlayerShoot = (data : any) => {
        this.principalView.renderGameInformation(data);
        this.principalView.changeWhoseGo(data);
        this.principalView.renderEnemyShoot(data);
    }

}