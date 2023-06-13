//to import the socket.io-client
import { io } from "socket.io-client";
import { Boat } from "../interfaces/boat.interface";


export class GameService {
    //to store the socket
    private socket: any;
    private sid : string;
    private player : string;
    private placedBoats : Boat[] = [];
    public constructor() {
        //to connect to the server
        this.socket = io('http://localhost:3000');
    }
    

    public validPositions(draggedShipLength : number, targetDivId : number,isHorizontal : boolean,clickedBoatId : number,selectedShipNameWithIndex) : number[] {
        let validPositions : number[] = [];

        if(isHorizontal){
            for(let i = 0; i < draggedShipLength; i++){
                validPositions.push(targetDivId + i);
            }
        }
        else{
            for(let i = 0; i < draggedShipLength; i++){
                validPositions.push(targetDivId + (i * 10));
            }
        }
        
        // if there is a number under 0 or over 99, it means that the boat is out of the grid
        if(validPositions.some(position => position < 0 || position > 99)){
            return [];
        }

        if (isHorizontal) {
            // if the boat is horizontal, we need to check if the boat is in the same row
            if (validPositions.some(position => Math.floor(position / 10) !== Math.floor(validPositions[0] / 10))) {
                return [];
            }
        } else {
            // if the boat is vertical, we need to check if the boat is in the same column
            if (validPositions.some(position => position % 10 !== validPositions[0] % 10)) {
                return [];
            }
        }
        
        const boatToAdd = {
            length: draggedShipLength,
            position: validPositions,
            isHorizontal,
            typeOfBoat : selectedShipNameWithIndex.substring(0,selectedShipNameWithIndex.length - 1),
        }
        this.placedBoats.push(boatToAdd);
        //to check if the boat overlaps the position of another boat
        if (this.placedBoats.some(boat => boat.position.some(position => validPositions.includes(position) && boat !== boatToAdd))) {
            this.placedBoats.pop();
            return [];
        }
        return validPositions;
    }

    public checkIfAllBoatsArePlaced() : void {
        if(this.placedBoats.length == 5){
            this.socket.emit('addBoats', this.placedBoats,this.player);
        }
    }

    public playerConnected(callback){
            this.socket.on('playerConnected', (data) => {
                if (!this.sid && !this.player && data.length == 1) {
                    this.sid = data[0];
                    this.player = "player1";
                }
                if (!this.sid && !this.player && data.length == 2) {
                    this.sid = data[1];
                    this.player = "player2";
                }
                callback(data);
            });
    }

    public playerDisconnected(callback){
        return new Promise((resolve, reject) => {
            this.socket.on('playerDisconnected', (data) => {
                resolve(data);
                this.placedBoats = [];
                this.sid = "";
                this.player = "player1";
                callback();
            });
        });
    }

    public shoot(position : number){
        return new Promise((resolve, reject) => {
            this.socket.emit('waterHitSink', position, this.player);
            this.socket.on('waterHitSink', (data) => {
                resolve(data);
            });
        });
    }

    public playerReady() {
            return new Promise((resolve, reject) => {
                this.socket.emit('ready', this.player);
                this.socket.on('ready', (data) => {
                    resolve(data);
                });
            });
    }

    public anotherPlayerShoot(callback){
        this.socket.on('waterHitSink', (data) => {
            if (data.whoseGo != this.player) {
                callback(data);
            }
        });
    }

    public anotherPlayerReady(callback){
        this.socket.on('ready', (data) => {
            if (data == 2) {
                callback(data);
            }
        });
    }

    public getPlayerName() : string{
        return this.player;
    }
}