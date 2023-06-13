//to import sweet alert
import Swal from 'sweetalert2';
import { Status } from '../interfaces/status.interface';

export class PrincipalView {
    private userGrid = document.querySelector('.grid-user');
    private computerGrid = document.querySelector('.grid-computer');
    private displayGrid = document.querySelector('.grid-display');
    private ships  = document.querySelectorAll('.ship');
    private destroyer = document.querySelector('.destroyer-container');
    private submarine = document.querySelector('.submarine-container');
    private cruiser = document.querySelector('.cruiser-container');
    private battleship = document.querySelector('.battleship-container');
    private carrier = document.querySelector('.carrier-container');
    private startButton = document.querySelector('#start');
    private rotateButton = document.querySelector('#rotate');
    private turnDisplay = document.querySelector('#whoseGo');
    private infoDisplay = document.querySelector('#info');
    private player1Connected = document.querySelector('#player1Connected');
    private player2Connected = document.querySelector('#player2Connected');
    private player1Ready = document.querySelector('#player1Ready');
    private player2Ready = document.querySelector('#player2Ready');
    private isHorizontal = true;
    private draggedShip: HTMLElement;
    private selectedShipNameWithIndex: string;
    private player1Text : HTMLElement = document.querySelector('#player1Text');
    private player2Text : HTMLElement = document.querySelector('#player2Text');

    public constructor() {
        this.createBoard(this.userGrid, []);
        this.createBoard(this.computerGrid, []);
        this.rotateBind();
        
        this.dragStart();
        this.bindClickOnBoat();
        this.userGrid.addEventListener('dragover', this.dragOver);
        this.userGrid.addEventListener('dragenter', this.dragEnter);
    }

    public renderConnectedPlayers(connectedPlayers : string[]){
        if (connectedPlayers.includes("full")){
            if (!this.player1Connected.classList.contains("green") || !this.player2Connected.classList.contains("green")){
                this.renderError("The game is full");
            }
            return false;
        }
        if (connectedPlayers.length === 1){
            this.player1Connected.classList.add("green");
            this.player1Text.style.fontWeight = "bold";
            return true;
        }else{
            this.player1Connected.classList.add("green");
            this.player2Connected.classList.add("green");
            if (this.player1Text.style.fontWeight !== "bold"){
                this.player2Text.style.fontWeight = "bold";
            }
            return true;
        }
    }

    public bindClickOnBoat(){
      this.ships.forEach(ship => ship.addEventListener('mousedown', (e) => {
        const elementTarget = e.target as HTMLElement;
        this.selectedShipNameWithIndex = elementTarget.id;
      }))
    }


    public dragOver(e) {
        e.preventDefault();
    }

    public dragStart() {
        for (const ship of this.ships) {
            ship.addEventListener('dragstart', (e: DragEvent) => {
              e.dataTransfer.setData('text/plain', ship.id);
              this.draggedShip = ship as HTMLElement;
            });
          }
    }

    
    public dragEnter(e) {
        e.preventDefault();
    }

    public bindReadyButton(playerReady: Function, getPlayerName: Function) {
      const clickHandler = () => {
        playerReady()
          .then((result) => {
            const playerName = getPlayerName();
            if (result === 0) {
              // sweet alert
              Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'You must place all your boats before starting the game!',
              });
            }
            if (result === 1) {
              const spanToChange = document.querySelector(`#${playerName}Ready`);
              spanToChange.classList.add("green");
              // remove the event listener
              this.startButton?.removeEventListener('click', clickHandler);
            }
            if (result === 2) {
              this.player1Ready.classList.add("green");
              this.player2Ready.classList.add("green");
              // remove the event listener
              this.startButton?.removeEventListener('click', clickHandler);
            }
          });
      };
    
      this.startButton?.addEventListener('click', clickHandler);
    }
    

    public renderNewReadyPlayer(){
      this.player1Ready.classList.add("green");
      this.player2Ready.classList.add("green");
    }

    public rotateBind(){
        this.rotateButton?.addEventListener('click', () => {
            this.rotate();
        });
    }

    public bindEnemyGrid(attackEnemy : Function,getPlayerName : Function){
        this.computerGrid?.addEventListener('click', (e : Event) => {
            const elementTarget = e.target as HTMLElement;
            const targetDivId = parseInt(elementTarget.dataset.id);
            attackEnemy(targetDivId)
            .then((result) => {
              this.changeWhoseGo(result);
              const playerName = getPlayerName();
              this.renderHitOrMiss(result, targetDivId,playerName);
              this.renderGameInformation(result);
            })
        });
    }

    public renderEnemyShoot(data : Status) : boolean{
      if (data.failure){
        return false;
      }

      const whoseGo = data.whoseGo;
      const targetDivId = data[whoseGo].position;
      const square = this.userGrid?.querySelector(`div[data-id='${targetDivId}']`);
      if (data[whoseGo].water){
        square.classList.add('miss');
        return true;
      }
      square.classList.add('boom');
      return true;
    }

    public renderGameInformation(information : Status) : boolean{
      if (information.failure){
        return false;
      }
      if (!information.player2.info){
        this.infoDisplay.innerHTML = `
        <div> Player 1 : ${information.player1.info} en la posicion ${information.player1.position} </div>
        <div> Player 2 : El jugador 2 no ha disparado todavia</div>`;
       return true;
      }
      this.infoDisplay.innerHTML = `
       <div> Player 1 : ${information.player1.info} en la posicion ${information.player1.position}  </div>
       <div> Player 2 : ${information.player2.info} en la posicion ${information.player2.position} </div>
      `;
      return true;
    }

    private renderHitOrMiss(information : Status, targetDivId : number,playerName : string){
      //to get the square where the user clicked
      const square = this.computerGrid?.querySelector(`div[data-id='${targetDivId}']`);
      if (information.failure){
        this.renderError(information.failure);
        return false;
      }
      if (information[playerName].water){
        square.classList.add('miss');
        return true;
      }
      square.classList.add('boom');
    }

    public changeWhoseGo(information : Status){
      if (information.failure){
        return false;
      }
      this.turnDisplay.innerHTML = `Ha sido el turno de ${information.whoseGo}`;
      return true;
    }

    public removeReadyAndConnectedPlayer2(){
      this.player2Connected.classList.remove("green");
      this.player2Ready.classList.remove("green");
      this.player1Text.style.fontWeight = "bold";
      if (this.player2Text.style.fontWeight === "bold"){
        this.player2Text.style.fontWeight = "normal";
      }
    }

    public renderError(message : string){
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: message,
      })
    }

    public dragDrop(isValidPlace: Function,checkIfAllBoatsArePlaced : Function) {
        this.userGrid.addEventListener('drop', (e: DragEvent) => {
            e.preventDefault();
            const elementTarget = e.target as HTMLElement;
            //to take the length of the ship
            const shipNameWithLastId = this.draggedShip.lastChild.id;
            const draggedShipLength = parseInt(shipNameWithLastId.substr(-1)) + 1;
            //to take the div where the ship is dropped
            const targetDivId = parseInt(elementTarget.dataset.id);
            const clickedShipId = parseInt(this.selectedShipNameWithIndex.substr(-1)) +1;
            const validPostions = isValidPlace(draggedShipLength, targetDivId, this.isHorizontal, clickedShipId, this.selectedShipNameWithIndex);
            if (validPostions.length > 0) {
              this.displayBoatOnGrid(validPostions,this.selectedShipNameWithIndex);
              this.removeBoatFromGrid(this.selectedShipNameWithIndex);
            }
            checkIfAllBoatsArePlaced();
          });
      }

      private displayBoatOnGrid(validPositions: number[],boat){
        const typeOfBoat = boat.substr(0, boat.length - 1);
        for (let i = 0; i < validPositions.length; i++) {
          const square = document.querySelector(`[data-id='${validPositions[i]}']`) as HTMLElement;
          square.classList.add(typeOfBoat);
        }
      }

      private removeBoatFromGrid(boat : string){
        const typeOfBoat = boat.substr(0, boat.length - 1);
        const classToDestroy = `${typeOfBoat}-container`;
        const boatToDestroy = document.querySelector(`.${classToDestroy}`);
        boatToDestroy?.remove();
      }


    public rotate() : boolean{
        if (this.isHorizontal) {
          this.destroyer?.classList.toggle('destroyer-container-vertical')
          this.submarine?.classList.toggle('submarine-container-vertical')
          this.cruiser?.classList.toggle('cruiser-container-vertical')
          this.battleship?.classList.toggle('battleship-container-vertical')
          this.carrier?.classList.toggle('carrier-container-vertical')
          this.isHorizontal = false
          return this.isHorizontal;
        }
        
          this.destroyer?.classList.toggle('destroyer-container-vertical')
          this.submarine?.classList.toggle('submarine-container-vertical')
          this.cruiser?.classList.toggle('cruiser-container-vertical')
          this.battleship?.classList.toggle('battleship-container-vertical')
          this.carrier?.classList.toggle('carrier-container-vertical')
          this.isHorizontal = true
          return this.isHorizontal;
      }
     
      public createBoard(grid, squares) {
        for (let i = 0; i < 100; i++) {
          const square = document.createElement('div')
          square.dataset.id = i.toString();
          square.classList.add('section');
          grid.appendChild(square)
          squares.push(square)
        }
      }
}