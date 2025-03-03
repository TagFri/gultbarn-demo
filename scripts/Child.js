import {msToDays} from "./dateFunctions.js";

export { Child }

class Child {
    #birthWeight;
     #gestationWeek;
     #birthDateTime;

    constructor(validatedInputs) {
        //** CHILD VARIABLES
        this.#birthWeight = validatedInputs.birthWeight;
        this.#gestationWeek = validatedInputs.gestationWeek;
        this.#birthDateTime = validatedInputs.dateTime;
    };

    //** METHODS
    toString() {
        return `Birth Weight: ${this.#birthWeight} grams, Gestation Weeks: ${this.#gestationWeek}, Birth Date: ${this.#birthDateTime}`;
    }

    //** GETTERS
    get birthWeight() {return this.#birthWeight;}
    get gestationWeek() {return this.#gestationWeek;}
    get birthDateTime() {return this.#birthDateTime;}
    get lightLimitCoordinates() {};

    //** Methods
    update(validatedInputs) {
        this.birthWeight = validatedInputs.birthWeight;
        this.gestationWeek = validatedInputs.gestationWeek;
        this.birthDateTime = validatedInputs.dateTime;
    }

    set birthWeight(value) {this.#birthWeight = value;}
    set gestationWeek(value) {this.#gestationWeek = value;}
    set birthDateTime(value) {this.#birthDateTime = value;}
}