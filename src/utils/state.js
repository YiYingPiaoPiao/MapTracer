
import { STAGE, STATUS } from "./enum.js";

export class state {

    #currentState = {
        status: "",
        stage : ""
    }

    constructor () {
        this.#currentState.status = STATUS.INIT;
        this.#currentState.stage  = STAGE.INIT ;
    }

    getCurrentState () {
        return this.#currentState;
    }

    setCurrentState (
        status,
        stage
    ) {
        this.#currentState.status = status;
        this.#currentState.stage  = stage ;
    }
}