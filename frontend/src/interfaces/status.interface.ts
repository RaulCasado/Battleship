export interface Status {
    player1: {
      info: string;
      position: string;
      water: boolean;
    };
    player2: {
      info: string;
      position: string;
      water: boolean;
    };
    whoseGo: string;
    failure?: string; // Agrega la propiedad failure como opcional
  }
  