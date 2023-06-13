
import { GameService } from "./services/game.service";
import { PrincipalView } from "./views/principal.view";
import { GameController } from "./controllers/game.controller";

const gameService = new GameService();
const principalView = new PrincipalView();
const gameController = new GameController(gameService, principalView);
