import { Bilirubin } from "./Bilirubin.js";
import { bilirubinOpacity } from "./inputOpacityFilter.js";

export {Child}

//Child class
class Child {

    // STORE SINGLETON INSTANCE
    static instance;

    // DECLARE PRIVATE FIELDS
    #birthWeight;
    #gestationWeek;
    #birthDateTime;

    //CONSTRUCTOR
    constructor(validatedInputs) {

        // Return existing instance
        if (Child.instance) {
            return Child.instance;
        }

        // Child Variables (Private Fields)
        this.#birthWeight = validatedInputs.birthWeight;
        this.#gestationWeek = validatedInputs.gestationWeek;
        this.#birthDateTime = validatedInputs.dateTime;

        Child.instance = this; // Store instance
    };

    // Static method to get or create the instance
    static getInstance() {
        return Child.instance;
    }

    //** GETTERS
    get birthWeight() {return parseInt(this.#birthWeight);}
    get gestationWeek() {return parseInt(this.#gestationWeek);}
    get birthDateTime() {return new Date(this.#birthDateTime);}

    //SETTERS
    set birthWeight(value) { parseInt(this.#birthWeight = value); }
    set gestationWeek(value) { parseInt(this.#gestationWeek = value); }
    set birthDateTime(value) { new Date(this.#birthDateTime = value); }

    //** GETTERS CHILD DERIVED VARIABLES

    //** Methods
    //All light info (coordinates, title, slope)
    childGraphInfo(parameter) {
        let lightinfo;
        if (this.#birthWeight >= 2500 && this.#gestationWeek >= 37) {
            lightinfo = {
                title: 'over 2500g + GA >=37',
                lightLimit: [{x: 1, y: 175}, {x: 3, y: 350}, {x: 10, y: 350}],
                lightSlope: 175 / 2,
                lightBreakDay: 3,
                transfusionLimit: [{x: 0, y: 200}, {x: 3, y: 400}, {x: 10, y: 400}]
            }
        } else if (this.#birthWeight >= 2500 && this.#gestationWeek < 37) {
            lightinfo = {
                lightLimit: [{x: 1, y: 150}, {x: 3, y: 300}, {x: 10, y: 300}],
                title: 'over 2500g + GA <37',
                lightSlope: 150 / 2,
                lightBreakDay: 3,
                transfusionLimit: [{x: 1, y: 250}, {x: 3, y: 350}, {x: 10, y: 350}]
            }
        } else if (this.#birthWeight < 2500 && this.#birthWeight >= 1500) {
            lightinfo = {
                title: 'under 2500g',
                lightLimit: [{x: 1, y: 150}, {x: 4, y: 250}, {x: 10, y: 250}],
                lightSlope: 100 / 3,
                lightBreakDay: 4,
                transfusionLimit: this.gestationWeek>=37?[{x: 0, y: 200}, {x: 3, y: 400}, {x: 10, y: 400}]:[{x: 1, y: 250}, {x: 3, y: 350}, {x: 10, y: 350}]
            }
        } else if (this.#birthWeight < 1500 && this.#birthWeight >= 1000) {
            lightinfo = {
                title: 'under 1500g',
                lightLimit: [{x: 1, y: 125}, {x: 4, y: 200}, {x: 10, y: 200}],
                lightSlope: 75 / 3,
                lightBreakDay: 4,
                transfusionLimit: this.gestationWeek>=37?[{x: 0, y: 200}, {x: 3, y: 400}, {x: 10, y: 400}]:[{x: 1, y: 200}, {x: 3, y: 250}, {x: 10, y: 250}]
            }
        } else if (this.#birthWeight < 1000) {
            lightinfo = {
                title: 'under 1000g',
                lightLimit: [{x: 1, y: 100}, {x: 4, y: 150}, {x: 10, y: 150}],
                lightSlope: 50 / 3,
                lightBreakDay: 4,
                transfusionLimit: this.gestationWeek>=37?[{x: 0, y: 200}, {x: 3, y: 400}, {x: 10, y: 400}]:[{x: 1, y: 175}, {x: 2, y: 200}, {x: 3, y: 250}, {x: 10, y: 250}]
            }
        }

        return lightinfo[parameter];
    }

    toString() {
        return `Birth Weight: ${this.#birthWeight} grams, Gestation Weeks: ${this.#gestationWeek}, Birth Date: ${this.#birthDateTime}`;
    }

    incompleteChild() {

        //TOGLE COMPLETE ICON
        document.getElementById("complete-icon").classList.add("hidden")
        document.getElementById("incomplete-icon").classList.remove("hidden")

        //BILIRUBIN OPACITY
        bilirubinOpacity(true)
    }

    completeChild() {

        console.log("completeChild")

        //TOGLE COMPLETE ICON
        document.getElementById("complete-icon").classList.remove("hidden")
        document.getElementById("incomplete-icon").classList.add("hidden")

        //BILIRUBIN OPACITY
        bilirubinOpacity(false)
    }

    updateChild(newChildParameters) {

        //Update relative days on bilirubinvalues if time changes
        if (Child.getInstance().birthDateTime != new Date(newChildParameters.dateTime)) {

            //Calls on update in Bilirubin class
            Bilirubin.updateAllBilirubinDates(new Date(Child.getInstance().birthDateTime), new Date(newChildParameters.dateTime));
        }

        //Update child values with new values
        Child.getInstance().birthWeight = parseInt(newChildParameters.birthWeight);
        Child.getInstance().gestationWeek = parseInt(newChildParameters.gestationWeek);
        Child.getInstance().birthDateTime = new Date(newChildParameters.dateTime);

        return true;
    }


}