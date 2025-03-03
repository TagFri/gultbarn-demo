export { Child }

import { bilirubinOpacity } from "./opacityFilters.js";

class Child {
    #birthWeight;
     #gestationWeek;
     #birthDateTime;

    constructor(validatedInputs) {
        //** CHILD VARIABLES
        this.#birthWeight = validatedInputs.birthWeight;
        this.#gestationWeek = validatedInputs.gestationWeek;
        this.#birthDateTime = validatedInputs.dateTime;
        //Opacity + icon
        this.childSaved()
        this.setUpdateListener()
    };

    //** GETTERS
    get birthWeight() {return parseInt(this.#birthWeight);}
    get gestationWeek() {return parseInt(this.#gestationWeek);}
    get birthDateTime() {return new Date(this.#birthDateTime);}
    get lightLimitCoordinates() {};

    //** Methods
    toString() {
        return `Birth Weight: ${this.#birthWeight} grams, Gestation Weeks: ${this.#gestationWeek}, Birth Date: ${this.#birthDateTime}`;
    }

    childSaved() {

        //Remove opacity on lab
        bilirubinOpacity(false)

        //Show complete icon
        document.getElementById("complete-icon").classList.remove("hidden")
        document.getElementById("incomplete-icon").classList.add("hidden")

    }

    update(validatedInputs) {
        this.birthWeight = parseInt(validatedInputs.birthWeight);
        this.gestationWeek = parseInt(validatedInputs.gestationWeek);
        this.birthDateTime = new Date(validatedInputs.dateTime);
        this.childSaved()
        return true;
    }

    setUpdateListener() {

        function requireSave() {
            //Opacity at lab
            bilirubinOpacity(true)

            //Change icon to incomplete
            document.getElementById("complete-icon").classList.add("hidden")
            document.getElementById("incomplete-icon").classList.remove("hidden")
        }

        //If keydown on child input values -> require a new save
        for (let input of document.querySelector("#child-container").querySelectorAll("input")) {
            input.addEventListener("change", () => {
                requireSave()
            })
        }

        //If change birthWeight -> require new save
        document.querySelector("#birthWeight").addEventListener("change", () => {
            requireSave()
        })

    }

    set birthWeight(value) { parseInt(this.#birthWeight = value); }
    set gestationWeek(value) { parseInt(this.#gestationWeek = value); }
    set birthDateTime(value) { new Date(this.#birthDateTime = value); }
}