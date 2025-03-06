import { Bilirubin } from "./Bilirubin.js";
import { bilirubinOpacity } from "./inpustOpacityFilter.js";
import { updateLightLimit } from "./graphLightLimit.js";
import { updateTransfusionGraph} from "./graphTransfusionlimit.js";

export { Child, saveChild, currentChild }

let currentChild;

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
            input.addEventListener("keydown", () => {
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

function saveChild(validatedInputs) {
    console.log(validatedInputs)

    //If child is created for the first time
    if(currentChild === undefined) {
        currentChild = new Child(validatedInputs);
        console.log(currentChild)
        console.log(currentChild.birthWeight)
        updateLightLimit()
    }

    //Update child, if already created
    else {

        //Save previpus child state
        let previousChild = {
            birthWeight: currentChild.birthWeight,
            gestationWeek: currentChild.gestationWeek,
            birthDateTime: currentChild.birthDateTime
        }

        //Update current child
        currentChild.update(validatedInputs)

        //If change in birth time -> update all labs
        if (previousChild.birthDateTime != currentChild.birthDateTime) {

            //Update bilirubins relative days
            Bilirubin.updateAllBilirubinDates(previousChild.birthDateTime, currentChild.birthDateTime)
        }

        //If change in weight or gestational week -> update child light limit
        if ((previousChild.gestationWeek != currentChild.gestationWeek) || (previousChild.birthWeight != currentChild.birthWeight)) {
            updateLightLimit()
        }

        //If change in birthWeight, update transfusion graph
        if (previousChild.birthWeight != currentChild.birthWeight) {
            updateTransfusionGraph(currentChild.birthWeight)
        }
        }
}