import {daysRelativeToReferenceDate, daysToAbsoluteDate, daysToMs, msToDays} from './generalFunctions.js'
import { currentChild } from "./Child.js";
import { errorMessages } from "./inputValidation.js";
import {displayBilirubin} from "./displayBilirubin.js";
import {updateBilirubinGraph} from "./graphBilirubin.js";
import {distanceToGraph, displayTransfusionGraph, toggleTransfusionGraph} from "./graph.js"
import {updateTransfusionGraph} from "./graphTransfusionlimit.js"

export {Bilirubin, SerumBilirubin, TranscutanousBilirubin, removeBilirubin, saveBilirubin}

class Bilirubin {

    //List of all labs
    static numberOfBilirubins = 0;
    static allBilirubins = [];

    //Update time of all labs
    static updateAllBilirubinDates(oldDateTime, newDateTime) {
        const changeInDays = (oldDateTime - newDateTime) / (1000 * 60 * 60 * 24);

        //Loop thrugh all labs
        for (let bilirubin of Bilirubin.allBilirubins) {

            //Update relative days
            bilirubin.relativeDays = bilirubin.relativeDays + changeInDays;
        }

        //Delete labs before new birth date
        for (let i = 0; i < Bilirubin.allBilirubins.length; i++) {
            if (Bilirubin.allBilirubins[i].relativeDays < 0) {
                Bilirubin.allBilirubins.splice(i, 1);
                errorMessages("bilirubinBeforeRemoved", false, true)
                i--;
            }
        }

        //Redisplay bilirubins and graph
        updateBilirubinListAndGraph()

        return true;
    }

    static lastBilirubin() {
        return Bilirubin.allBilirubins.slice().reverse()[0]
    }

    static lastBilirubinSlope() {
        let reverseBillibinArray = Bilirubin.allBilirubins.slice().reverse()
        let diffY = reverseBillibinArray[0].bilirubinValue - reverseBillibinArray[1].bilirubinValue
        let diffX = reverseBillibinArray[0].relativeDays - reverseBillibinArray[1].relativeDays
        return diffY / diffX
    }

    //Variables
    #bilirubinValueVal;
    #relativeDaysVal;

    constructor(bilirubinValue, relativeDays) {
        this.#bilirubinValueVal = bilirubinValue;
        this.#relativeDaysVal = relativeDays;

        //Push itself to static array for superclass
        Bilirubin.allBilirubins.push(this);

        //Add total number of bilirubin tests
        Bilirubin.numberOfBilirubins += 1;

        //Sort bilirubin array according to date
        Bilirubin.allBilirubins.sort((a, b) => a.relativeDays - b.relativeDays);

        return true;
    }

    //GETTERS
    get bilirubinValue() {
        return this.#bilirubinValueVal;
    }
    get relativeDays() {
        return this.#relativeDaysVal;
    }

    //SETTERS
    set bilirubinValue(bilirubinValue) {
        this.#bilirubinValueVal = bilirubinValue;
    }
    set relativeDays(relativeDays) {
        this.#relativeDaysVal = relativeDays;
    }

}

class SerumBilirubin extends Bilirubin {

    constructor(bilirubinValue, relativeDays) {
        super(bilirubinValue, relativeDays);
    }
}

class TranscutanousBilirubin extends Bilirubin {
    constructor(bilirubinValue, relativeDays) {
        //Call Bilirubin class constructor
        super(bilirubinValue, relativeDays);
    }
}

function saveBilirubin(validatedInputs) {

    //Convert absolute date to relative days
    let relativeDays = daysRelativeToReferenceDate(currentChild.birthDateTime, validatedInputs.dateTime);

    //Check if the bilirubin dateTime exists from before:
    let exists = false;
    for (let bilirubin of Bilirubin.allBilirubins) {
        if (bilirubin.relativeDays == relativeDays) {
            exists = true;

            //display error msg
            errorMessages("bilirubinExists", false)
            break
        }
    }

    //If lab doesnt exists
    if (!exists) {

        //Create new bilirubin object
        new SerumBilirubin(validatedInputs.bilirubinValue, relativeDays);

        //Remove error message
        errorMessages("bilirubinExists", true)

        //Display bilirubins
        displayBilirubin()

        //Update bilirubin graph
        updateBilirubinGraph()

        //Insert transfusion graph if it doesn't exist, are more then 24h since statrt and over light limit
        if (displayTransfusionGraph == false && relativeDays >= 1 && distanceToGraph("lightLimit", relativeDays, validatedInputs.bilirubinValue) <= 0) {
            console.log(distanceToGraph("lightLimit", relativeDays, validatedInputs.bilirubinValue))

            //Set display transfusion to true
            toggleTransfusionGraph()
            updateTransfusionGraph(currentChild.birthWeight)
        }

        //Remove bilirubin inputs, and focuis back on date to add a new one
        document.getElementById("bilirubinDate").value = "";
        document.getElementById("bilirubinTime").value = "";
        document.getElementById("bilirubinValue").value = "";
        document.getElementById("bilirubinDate").focus()
    }

}

function removeBilirubin(targetButton) {
    console.log("REMOVE BILIRUBIN")

    //Check if it's found
    let bilirubinFound = false;

    //Setup loop for all bilirubin labs
    for (let i = 0; i < Bilirubin.numberOfBilirubins; i++) {

        //Check if current bilirubin lab relative days = parent elements that's pushed
        if (Bilirubin.allBilirubins[i].relativeDays == targetButton.parentElement.parentElement.id) {

            //Remove matching bilirubin object
            Bilirubin.allBilirubins.splice(i, 1);

            //Set to found (to exclude error msg)
            bilirubinFound = true;

            //Display new list of bilirubin values + update graph
            updateBilirubinListAndGraph()

            //Save time, break loop
            break;
        }
    }
    bilirubinFound? console.log("BILIRUBIN FOUND") : errorMessage("bilirubin-list", true)

    //Turn on opacity on advice and journal of bilirubin is less then zero:
    Bilirubin.numberOfBilirubins --;
    if (Bilirubin.numberOfBilirubins == 0) {
        document.getElementById("advice-container").classList.add("opacity-container")
        document.getElementById("journal-container").classList.add("opacity-container")
    }
}

function updateBilirubinListAndGraph() {
    displayBilirubin()
    updateBilirubinGraph()
}